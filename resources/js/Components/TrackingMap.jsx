import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const hasCoordinates = (item) =>
    item?.latitude !== null &&
    item?.latitude !== undefined &&
    item?.longitude !== null &&
    item?.longitude !== undefined &&
    !Number.isNaN(Number(item.latitude)) &&
    !Number.isNaN(Number(item.longitude));

// Escape teks user (kode/nama/lokasi tong) sebelum masuk innerHTML popup.
const esc = (v) =>
    String(v).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]),
    );

const statusColors = {
    kosong: '#16a34a',
    setengah_penuh: '#ca8a04',
    penuh: '#dc2626',
    sudah_diangkut: '#2563eb',
};

const statusLabels = {
    kosong: 'Kosong',
    setengah_penuh: 'Setengah penuh',
    penuh: 'Penuh',
    sudah_diangkut: 'Sudah diangkut',
};

function makeBinIcon(status) {
    const color = statusColors[status] || '#4b5563';

    return L.divIcon({
        className: 'tracking-map-bin-icon',
        html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(15, 23, 42, 0.25);"></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });
}

// Marker petugas: panah navigasi (penunjuk arah) yang berputar mengikuti heading
// GPS + ring pulse, dan bergerak halus mengikuti posisi petugas.
function makeUserIcon(heading = 0) {
    const deg = Number.isFinite(heading) ? heading : 0;
    return L.divIcon({
        className: 'tracking-map-user-icon',
        html: `<div class="tm-user">
                 <span class="tm-user-arrow">
                   <svg class="tm-user-svg" style="transform: rotate(${deg}deg);" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                     <path d="M12 2.25 19.25 21.5 12 17.75 4.75 21.5Z"/>
                   </svg>
                 </span>
                 <span class="tm-pulse"></span>
               </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
    });
}

// Ikon target angkut: tong terpilih ditandai lingkaran oranye + glyph + pulse.
function makeTargetIcon() {
    return L.divIcon({
        className: 'tracking-map-target-icon',
        html: `<div class="tm-target">
                 <span class="tm-target-core">
                   <svg class="tm-target-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                     <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z"/>
                   </svg>
                 </span>
                 <span class="tm-pulse"></span>
               </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
    });
}

const distanceMeters = (a, b) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);
    const la1 = toRad(a[0]);
    const la2 = toRad(b[0]);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
};

// Ambil rute mengikuti jalan dengan profil PEJALAN KAKI (foot) dari FOSSGIS
// routing (routing.openstreetmap.de, CORS diizinkan). Format OSRM-compatible;
// geometri dikembalikan [lon,lat] dan dikonversi ke [lat,lng] untuk Leaflet.
// Lempar error agar caller bisa fallback ke garis lurus.
const fetchDrivingRoute = async (origin, dest, signal) => {
    const a = `${origin[1]},${origin[0]}`;
    const b = `${dest[1]},${dest[0]}`;
    const url = `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${a};${b}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('route request failed');
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (data.code !== 'Ok' || !coords || !coords.length) {
        throw new Error('no route found');
    }
    return coords.map(([lon, lat]) => [lat, lon]);
};

export default function TrackingMap({
    bins = [],
    userLocation = null,
    selectedBinId = null,
    onSelectBin,
    title = 'Peta Tracking',
    subtitle = 'Pantau titik tong dan posisi petugas.',
}) {
    const mapElementRef = useRef(null);
    const mapRef = useRef(null);
    const binsLayerRef = useRef(null);
    const userMarkerRef = useRef(null);
    const trailRef = useRef([]);
    const trailPolylineRef = useRef(null);
    const routeLineRef = useRef(null);
    const routeAbortRef = useRef(null);
    const lastRouteOriginRef = useRef(null);
    const lastRouteDestIdRef = useRef(null);
    const animationFrameRef = useRef(null);
    const lastBinBoundsKey = useRef(null);
    // Koordinat petugas terakhir yang benar-benar di-commit (bukan posisi animasi
    // antara). Dipakai sebagai acuan dead-band agar noise GPS saat diam tidak
    // menggeser marker/peta.
    const lastUserPosRef = useRef(null);

    // Nilai "terbaru" agar effect bins tidak bergantung pada userLocation/bins
    // langsung sehingga render ulang tiap tick GPS tidak memicu rebuild marker.
    const binsRef = useRef(bins);
    binsRef.current = bins;
    const userLocationRef = useRef(userLocation);
    userLocationRef.current = userLocation;
    const onSelectBinRef = useRef(onSelectBin);
    onSelectBinRef.current = onSelectBin;

    const [following, setFollowing] = useState(true);
    const [trailLength, setTrailLength] = useState(0);

    const mappedBins = useMemo(() => bins.filter(hasCoordinates), [bins]);

    // Tanda tangan stabil tong (id+status+lat+lng). Di-sort() dulu supaya TIDAK
    // tergantung urutan array. Prop bins di halaman petugas disusun ulang (ordered
    // by jarak) setiap tick GPS, jadi key berurut akan berubah tiap tick (memicu
    // rebuild marker + fitBounds berulang). Sorting membuat key tetap selama set
    // tong tidak berubah → mencegah kedip & reset pan/zoom.
    const binsKey = useMemo(
        () => mappedBins.map((b) => `${b.id}:${b.status}:${Number(b.latitude)}:${Number(b.longitude)}`).sort().join('|'),
        [mappedBins],
    );

    // Himpunan titik tong (id+koordinat saja) → gerbang fitBounds. Berubahnya
    // status/urutan TIDAK mengubah pointsKey, sehingga viewport user tidak di-reset.
    const pointsKey = useMemo(
        () => mappedBins.map((b) => `${b.id}:${Number(b.latitude)}:${Number(b.longitude)}`).sort().join('|'),
        [mappedBins],
    );

    // Tong terdekat dari posisi petugas (jarak udara). Dipakai sebagai target
    // garis otomatis saat petugas belum memilih tong tertentu.
    const nearestBinId = useMemo(() => {
        if (!hasCoordinates(userLocation)) return null;
        let best = null;
        let bestDist = Infinity;
        mappedBins.forEach((b) => {
            if (!hasCoordinates(b)) return;
            const d = distanceMeters(
                [Number(userLocation.latitude), Number(userLocation.longitude)],
                [Number(b.latitude), Number(b.longitude)],
            );
            if (d < bestDist) {
                bestDist = d;
                best = b;
            }
        });
        return best ? String(best.id) : null;
    }, [mappedBins, userLocation]);

    // Tong target = pilihan manual jika ada, jika tidak → otomatis tong terdekat.
    const targetBinId =
        selectedBinId != null ? String(selectedBinId) : nearestBinId;

    useEffect(() => {
        if (!mapElementRef.current || mapRef.current) return;

        mapRef.current = L.map(mapElementRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
        }).setView([-6.374672, 106.924831], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(mapRef.current);

        binsLayerRef.current = L.layerGroup().addTo(mapRef.current);

        trailPolylineRef.current = L.polyline([], {
            color: '#0ea5e9',
            weight: 3,
            opacity: 0.75,
            dashArray: '1 8',
            lineCap: 'round',
            lineJoin: 'round',
        }).addTo(mapRef.current);

        routeLineRef.current = L.polyline([], {
            color: '#f59e0b',
            weight: 3,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
        }).addTo(mapRef.current);

        // Leaflet membaca ukuran kontainer saat init. Di HP, ukuran kadang belum
        // valid saat mount (layout/browser-chrome belum settle) sehingga peta tampil
        // kosong/terpotong dan baru "muncul" setelah ada reflow (mis. saat sidebar
        // dibuka). invalidateSize + ResizeObserver memastikan peta selalu memakai
        // ukuran yang benar.
        const invalidateSize = () => {
            mapRef.current?.invalidateSize();
        };
        const settleFrame = requestAnimationFrame(invalidateSize);
        const settleTimer = setTimeout(invalidateSize, 250);
        const resizeObserver = new ResizeObserver(invalidateSize);
        resizeObserver.observe(mapElementRef.current);
        window.addEventListener('resize', invalidateSize);

        return () => {
            cancelAnimationFrame(settleFrame);
            clearTimeout(settleTimer);
            resizeObserver.disconnect();
            window.removeEventListener('resize', invalidateSize);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            mapRef.current?.remove();
            mapRef.current = null;
            binsLayerRef.current = null;
            trailPolylineRef.current = null;
            routeAbortRef.current?.abort();
            routeLineRef.current = null;
        };
    }, []);

    // Rebuild marker tong hanya saat data tong (signature) atau pilihan berubah.
    useEffect(() => {
        if (!mapRef.current || !binsLayerRef.current) return;

        const currentBins = binsRef.current.filter(hasCoordinates);
        binsLayerRef.current.clearLayers();
        const bounds = [];

        currentBins.forEach((bin) => {
            const latLng = [Number(bin.latitude), Number(bin.longitude)];
            bounds.push(latLng);
            const isSelected = String(bin.id) === targetBinId;

            const marker = L.marker(latLng, {
                icon: isSelected ? makeTargetIcon() : makeBinIcon(bin.status),
                title: `${bin.kode || ''} ${bin.nama || ''}`.trim(),
                zIndexOffset: isSelected ? 500 : 0,
            });

            marker.bindPopup(`
                <strong>${esc(bin.kode || '-')} - ${esc(bin.nama || '-')}</strong><br>
                ${esc(bin.unit_nama || bin.unit?.nama || '-')}<br>
                ${esc(bin.lokasi || 'Lokasi tidak tersedia')}<br>
                Status: ${esc(statusLabels[bin.status] || bin.status || '-')}
            `);

            marker.on('click', () => onSelectBinRef.current?.(bin));
            marker.addTo(binsLayerRef.current);
        });

        // fitBounds hanya dari koordinat tong (bukan posisi petugas) supaya tick GPS
        // tidak terus-menerus me-reset pan/zoom pengguna. Refit hanya saat himpunan
        // titik tong benar-benar berubah (ditambah/dihapus) — bukan saat urutan/status
        // berubah — sehingga zoom-in user tidak tersentak turun.
        if (bounds.length === 0) {
            const loc = userLocationRef.current;
            if (hasCoordinates(loc)) {
                mapRef.current.setView([Number(loc.latitude), Number(loc.longitude)], 16, { animate: true });
            }
        } else if (pointsKey !== lastBinBoundsKey.current) {
            lastBinBoundsKey.current = pointsKey;
            mapRef.current.fitBounds(bounds, {
                padding: [28, 28],
                maxZoom: targetBinId ? 18 : 16,
                animate: true,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [binsKey, pointsKey, targetBinId]);

    // Ikut petugas: animasikan marker petugas + gambar jejak + pan mengikuti.
    useEffect(() => {
        if (!mapRef.current || !hasCoordinates(userLocation)) return;

        const newLatLng = [Number(userLocation.latitude), Number(userLocation.longitude)];
        const heading = Number(userLocation.heading);
        const accuracy = Number(userLocation.accuracy);

        // Dead-band adaptif: gerakkan marker/peta hanya bila berpindah melebihi
        // ambang (disesuaikan akurasi) → tolak drift GPS saat user diam.
        const threshold = Math.max(5, Math.min(Number.isFinite(accuracy) ? accuracy : 0, 12));
        const lastPos = lastUserPosRef.current;
        const moved = !lastPos || distanceMeters(lastPos, newLatLng) > threshold;

        if (moved) {
            lastUserPosRef.current = newLatLng;

            // Trail: hanya tambah poin bila benar-benar berpindah (kurangi noise GPS).
            const last = trailRef.current[trailRef.current.length - 1];
            if (!last || distanceMeters(last, newLatLng) > threshold) {
                trailRef.current = [...trailRef.current, newLatLng];
                trailPolylineRef.current?.setLatLngs(trailRef.current);
                setTrailLength(trailRef.current.length);
            }

            // Buat marker petugas saat lokasi pertama, lalu geser halus.
            if (!userMarkerRef.current) {
                userMarkerRef.current = L.marker(newLatLng, {
                    icon: makeUserIcon(heading),
                    title: 'Lokasi petugas saat ini',
                    zIndexOffset: 1000,
                })
                    .bindPopup('<strong>Lokasi petugas</strong><br>Posisi real-time dari browser.')
                    .addTo(mapRef.current);
            } else {
                animateMarker(userMarkerRef.current.getLatLng(), newLatLng);
            }

            if (following) {
                mapRef.current.panTo(newLatLng, { animate: true, duration: 0.6 });
            }
        }

        // Rotasi panah tetap diperbarui tanpa syarat (berputar saat berbelok di
        // tempat); saat diam heading biasanya null → panah mengarah ke atas.
        updateUserHeading(heading);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLocation, following]);

    // Garis rute posisi petugas → tong terdekat (atau tong pilihan), mengikuti
    // arah jalan via OSRM, solid (bukan putus-putus). Di-throttle: hanya fetch
    // rute saat tujuan berubah atau petugas bergerak >20m. Garis lurus dipakai
    // hanya sebagai placeholder ketika rute belum tersedia / permintaan gagal.
    useEffect(() => {
        const line = routeLineRef.current;
        const loc = userLocationRef.current;
        const bin = binsRef.current.find((b) => String(b.id) === targetBinId);

        if (!line || !hasCoordinates(loc) || !bin || !hasCoordinates(bin)) {
            routeAbortRef.current?.abort();
            lastRouteOriginRef.current = null;
            lastRouteDestIdRef.current = null;
            line?.setLatLngs([]);
            return;
        }

        const origin = [Number(loc.latitude), Number(loc.longitude)];
        const dest = [Number(bin.latitude), Number(bin.longitude)];

        const lastOrigin = lastRouteOriginRef.current;
        const destChanged = lastRouteDestIdRef.current !== targetBinId;
        const movedEnough = !lastOrigin || distanceMeters(lastOrigin, origin) > 20;

        // Tujuan baru → garis lurus sementara sampai rute jalan tiba.
        if (destChanged) {
            line.setLatLngs([origin, dest]);
        }

        // Throttle: hindari request OSRM setiap tick GPS.
        if (!destChanged && !movedEnough) return;

        routeAbortRef.current?.abort();
        const controller = new AbortController();
        routeAbortRef.current = controller;
        lastRouteOriginRef.current = origin;
        lastRouteDestIdRef.current = targetBinId;

        fetchDrivingRoute(origin, dest, controller.signal)
            .then((coords) => {
                if (!controller.signal.aborted) line.setLatLngs(coords);
            })
            .catch(() => {
                // Gagal (offline/CORS) → biarkan garis lurus solid sebagai fallback.
                if (!controller.signal.aborted) line.setLatLngs([origin, dest]);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetBinId, userLocation]);

    const animateMarker = (from, to) => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        const startTime = performance.now();
        const duration = 700;

        const step = (now) => {
            const t = Math.min(1, (now - startTime) / duration);
            const lat = from.lat + (to[0] - from.lat) * t;
            const lng = from.lng + (to[1] - from.lng) * t;
            userMarkerRef.current?.setLatLng([lat, lng]);
            if (t < 1) {
                animationFrameRef.current = requestAnimationFrame(step);
            } else {
                animationFrameRef.current = null;
                userMarkerRef.current?.setLatLng(to);
            }
        };

        animationFrameRef.current = requestAnimationFrame(step);
    };

    // Putar panah petugas mengikuti heading GPS (derajat, 0 = utara).
    const updateUserHeading = (heading) => {
        if (!userMarkerRef.current) return;
        const deg = Number.isFinite(heading) ? heading : 0;
        const svg = userMarkerRef.current.getElement()?.querySelector('.tm-user-svg');
        if (svg) svg.style.transform = `rotate(${deg}deg)`;
    };

    const resetTrail = () => {
        trailRef.current = [];
        trailPolylineRef.current?.setLatLngs([]);
        setTrailLength(0);
    };

    return (
        <section className="overflow-hidden rounded-lg border border-[#d1d5db] bg-white">
            <div className="flex flex-col gap-2 border-b border-[#e5e7eb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
                    <p className="mt-0.5 text-xs text-[#6b7280]">{subtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                    <span>{mappedBins.length} titik tong</span>
                    {hasCoordinates(userLocation) && <span className="font-medium text-[#0ea5e9]">Lokasi petugas aktif</span>}
                    {trailLength > 1 && <span>Jejak {trailLength} titik</span>}
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => setFollowing((v) => !v)}
                            className={`rounded-full border px-2.5 py-1 transition ${
                                following
                                    ? 'border-[#0ea5e9] bg-[#0ea5e9] text-white'
                                    : 'border-[#d1d5db] text-[#6b7280] hover:bg-[#f3f4f6]'
                            }`}
                            title="Peta otomatis mengikuti posisi petugas"
                        >
                            {following ? 'Ikuti: ON' : 'Ikuti: OFF'}
                        </button>
                        {trailLength > 1 && (
                            <button
                                type="button"
                                onClick={resetTrail}
                                className="rounded-full border border-[#d1d5db] px-2.5 py-1 text-[#6b7280] transition hover:bg-[#f3f4f6]"
                                title="Hapus jejak perjalanan petugas"
                            >
                                Reset jejak
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div ref={mapElementRef} className="relative z-0 h-[360px] w-full sm:h-[430px]" />
            {mappedBins.length === 0 && (
                <div className="border-t border-[#e5e7eb] px-4 py-3 text-xs text-[#6b7280]">
                    Belum ada tong dengan koordinat valid untuk ditampilkan di peta.
                </div>
            )}
        </section>
    );
}
