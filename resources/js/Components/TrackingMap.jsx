import { useEffect, useMemo, useRef } from 'react';
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

function makeBinIcon(status, selected) {
    const color = statusColors[status] || '#4b5563';
    const ring = selected ? '0 0 0 5px rgba(22, 163, 74, 0.25)' : '0 2px 8px rgba(15, 23, 42, 0.25)';

    return L.divIcon({
        className: 'tracking-map-bin-icon',
        html: `<span style="display:block;width:${selected ? 20 : 16}px;height:${selected ? 20 : 16}px;border-radius:999px;background:${color};border:3px solid white;box-shadow:${ring};"></span>`,
        iconSize: [selected ? 26 : 22, selected ? 26 : 22],
        iconAnchor: [selected ? 13 : 11, selected ? 13 : 11],
    });
}

const userIcon = L.divIcon({
    className: 'tracking-map-user-icon',
    html: '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#0ea5e9;border:3px solid white;box-shadow:0 0 0 6px rgba(14, 165, 233, 0.22), 0 2px 10px rgba(15, 23, 42, 0.28);"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

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
    const layerRef = useRef(null);
    // onSelectBin biasanya arrow inline (identitas baru tiap render); simpan di ref
    // agar tidak jadi dependency effect yang memicu fitBounds berulang.
    const onSelectBinRef = useRef(onSelectBin);
    onSelectBinRef.current = onSelectBin;
    const lastBoundsKey = useRef(null);

    const mappedBins = useMemo(() => bins.filter(hasCoordinates), [bins]);

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

        layerRef.current = L.layerGroup().addTo(mapRef.current);

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
            layerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current || !layerRef.current) return;

        layerRef.current.clearLayers();
        const bounds = [];

        mappedBins.forEach((bin) => {
            const latLng = [Number(bin.latitude), Number(bin.longitude)];
            bounds.push(latLng);

            const marker = L.marker(latLng, {
                icon: makeBinIcon(bin.status, String(bin.id) === String(selectedBinId)),
                title: `${bin.kode || ''} ${bin.nama || ''}`.trim(),
            });

            marker.bindPopup(`
                <strong>${esc(bin.kode || '-')} - ${esc(bin.nama || '-')}</strong><br>
                ${esc(bin.unit_nama || bin.unit?.nama || '-')}<br>
                ${esc(bin.lokasi || 'Lokasi tidak tersedia')}<br>
                Status: ${esc(statusLabels[bin.status] || bin.status || '-')}
            `);

            marker.on('click', () => onSelectBinRef.current?.(bin));
            marker.addTo(layerRef.current);
        });

        if (hasCoordinates(userLocation)) {
            const latLng = [Number(userLocation.latitude), Number(userLocation.longitude)];
            bounds.push(latLng);
            L.marker(latLng, {
                icon: userIcon,
                title: 'Lokasi petugas saat ini',
            })
                .bindPopup('<strong>Lokasi petugas</strong><br>Posisi dari browser saat ini.')
                .addTo(layerRef.current);
        }

        // fitBounds hanya saat kumpulan titik berubah, bukan tiap render/seleksi/tick GPS,
        // supaya pan/zoom pengguna tidak ter-reset terus-menerus.
        const boundsKey = bounds.map((p) => p.join(',')).join('|');
        if (bounds.length > 0 && boundsKey !== lastBoundsKey.current) {
            lastBoundsKey.current = boundsKey;
            mapRef.current.fitBounds(bounds, { padding: [28, 28], maxZoom: selectedBinId ? 18 : 16 });
        }
    }, [mappedBins, selectedBinId, userLocation]);

    return (
        <section className="overflow-hidden rounded-lg border border-[#d1d5db] bg-white">
            <div className="flex flex-col gap-2 border-b border-[#e5e7eb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
                    <p className="mt-0.5 text-xs text-[#6b7280]">{subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[#6b7280]">
                    <span>{mappedBins.length} titik tong</span>
                    {hasCoordinates(userLocation) && <span>Lokasi petugas aktif</span>}
                </div>
            </div>
            <div ref={mapElementRef} className="h-[360px] w-full sm:h-[430px]" />
            {mappedBins.length === 0 && (
                <div className="border-t border-[#e5e7eb] px-4 py-3 text-xs text-[#6b7280]">
                    Belum ada tong dengan koordinat valid untuk ditampilkan di peta.
                </div>
            )}
        </section>
    );
}
