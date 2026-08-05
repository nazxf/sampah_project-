import BrandMark from '@/Components/BrandMark';
import { Head, Link } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

function Icon({ name, className = 'h-6 w-6' }) {
    const props = {
        className,
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    };

    const paths = {
        arrowLeft: (<><path d="m15 18-6-6 6-6" /></>),
        camera: (<><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>),
        alert: (<><path d="M10.3 4.4 2.7 18a2 2 0 0 0 1.8 3h15a2 2 0 0 0 1.8-3L13.7 4.4a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>),
    };

    return <svg {...props}>{paths[name]}</svg>;
}

export default function Scanner() {
    const [error, setError] = useState(null);
    const [scanning, setScanning] = useState(false); // Default false to prevent auto-start
    const [hasCameras, setHasCameras] = useState(true);
    const scannerRef = useRef(null);
    const html5QrCode = useRef(null);

    // Clean up scanner on unmount
    useEffect(() => {
        return () => {
            if (html5QrCode.current && html5QrCode.current.isScanning) {
                html5QrCode.current.stop().catch(err => console.error("Failed to stop scanner", err));
            }
        };
    }, []);

    const startCamera = async () => {
        setError(null);
        setScanning(true);
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                setHasCameras(true);
                html5QrCode.current = new Html5Qrcode("reader", { verbose: false });

                await html5QrCode.current.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        if (decodedText) handleScan(decodedText);
                    },
                    () => {
                        // Silently ignore scan-miss errors from html5-qrcode
                    }
                );
            } else {
                setHasCameras(false);
                setError("Kamera tidak ditemukan pada perangkat ini.");
                setScanning(false);
            }
        } catch (err) {
            setScanning(false);
            const msg = (err && err.message) ? err.message : String(err);
            if (err?.name === 'NotAllowedError' || msg.includes('Permission denied')) {
                setError("Akses kamera ditolak. Pastikan Anda memberikan izin kamera pada browser. Catatan: Akses kamera mewajibkan HTTPS.");
            } else {
                setError("Gagal mengakses kamera: " + msg);
            }
            console.error("Camera access error:", err);
        }
    };

    const handleScan = (decodedText) => {
        // Guard against null/undefined from library callbacks
        if (!decodedText || typeof decodedText !== 'string') return;

        // Stop scanning once a QR is found to prevent multiple redirects
        setScanning(false);
        if (html5QrCode.current && html5QrCode.current.isScanning) {
             html5QrCode.current.stop().catch(e => console.error(e));
        }

        // If it's a full URL, redirect directly
        if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
            window.location.href = decodedText;
        } else {
            // Assume it's just the 'kode'
            window.location.href = `/lapor/${decodedText}`;
        }
    };

    const [processing, setProcessing] = useState(false);

    const preprocessImage = (file, maxDim, options = {}) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                let width = img.width;
                let height = img.height;
                
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                ctx.drawImage(img, 0, 0, width, height);
                
                if (options.grayscale || options.contrast) {
                    try {
                        const imgData = ctx.getImageData(0, 0, width, height);
                        const data = imgData.data;
                        for (let i = 0; i < data.length; i += 4) {
                            const r = data[i];
                            const g = data[i+1];
                            const b = data[i+2];
                            let v = 0.299 * r + 0.587 * g + 0.114 * b;
                            
                            if (options.contrast) {
                                v = v > 120 ? 255 : 0;
                            }
                            
                            data[i] = v;
                            data[i+1] = v;
                            data[i+2] = v;
                        }
                        ctx.putImageData(imgData, 0, 0);
                    } catch (e) {
                        console.error("Canvas context manipulation failed", e);
                    }
                }
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas toBlob failed'));
                    }
                }, 'image/jpeg', 0.9);
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(img.src);
                reject(err);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileUpload = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setProcessing(true);
            setError(null);
            
            try {
                const html5QrCodeFile = new Html5Qrcode("reader-fallback", { verbose: false });
                
                const attempts = [
                    { desc: "Original file", file: file },
                    { desc: "Downscale 1000px", getBlob: () => preprocessImage(file, 1000) },
                    { desc: "Downscale 800px + Grayscale", getBlob: () => preprocessImage(file, 800, { grayscale: true }) },
                    { desc: "Downscale 1200px", getBlob: () => preprocessImage(file, 1200) },
                    { desc: "Downscale 800px + Grayscale + Contrast", getBlob: () => preprocessImage(file, 800, { grayscale: true, contrast: true }) }
                ];
                
                let decodedText = null;
                let lastError = null;
                
                for (const attempt of attempts) {
                    try {
                        let targetFile = attempt.file;
                        if (!targetFile && attempt.getBlob) {
                            targetFile = await attempt.getBlob();
                        }
                        decodedText = await html5QrCodeFile.scanFile(targetFile, false);
                        if (decodedText) {
                            break;
                        }
                    } catch (err) {
                        lastError = err;
                    }
                }
                
                if (decodedText) {
                    handleScan(decodedText);
                } else {
                    throw lastError || new Error("QR code tidak terdeteksi");
                }
            } catch (err) {
                alert("QR code tidak terdeteksi pada gambar. Pastikan Anda memfoto QR code dari jarak dekat dan gambar tidak buram.");
                console.error("Scan file error:", err);
            } finally {
                setProcessing(false);
            }
        }
    };

    return (
        <>
            <Head title="Scan QR Code - SiPeSa" />
            <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-950">
                {/* Minimal Header */}
                <header className="sticky top-0 z-50 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                    <div className="mx-auto flex max-w-lg items-center justify-between">
                        <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition">
                            <Icon name="arrowLeft" className="h-6 w-6" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <BrandMark className="h-7 w-7" tone="green" />
                            <span className="text-base font-extrabold text-slate-900">SiPeSa</span>
                        </div>
                        <div className="h-10 w-10" /> {/* Spacer for centering */}
                    </div>
                </header>

                <main className="flex flex-1 flex-col items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
                        <div className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <Icon name="camera" className="h-8 w-8" />
                            </div>
                            <h1 className="mt-4 text-2xl font-black text-slate-900">Scan QR Code Tong</h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Arahkan kamera ke QR code yang tertera pada tong sampah untuk membuat laporan.
                            </p>
                        </div>

                        <div className="mt-8 overflow-hidden rounded-2xl bg-slate-900 relative">
                            {processing ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300" style={{ minHeight: '300px' }}>
                                    <svg className="animate-spin h-10 w-10 text-green-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-sm font-semibold">Memproses & memindai gambar...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300" style={{ minHeight: '300px' }}>
                                    <Icon name="alert" className="mb-3 h-10 w-10 text-red-500" />
                                    <p className="text-sm">{error}</p>
                                    <div className="mt-6 flex flex-col gap-3 w-full max-w-[240px]">
                                        <button 
                                            onClick={startCamera}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold hover:bg-slate-700 transition"
                                        >
                                            Coba Lagi Kamera
                                        </button>
                                        <div className="relative w-full">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={handleFileUpload}
                                            />
                                            <button className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-600/30 transition hover:bg-green-500 relative z-0">
                                                Ambil dari Galeri
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : !scanning ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300" style={{ minHeight: '300px' }}>
                                    <Icon name="camera" className="mb-3 h-12 w-12 text-slate-500" />
                                    <p className="text-sm">Siap untuk memindai?</p>
                                    <div className="mt-6 flex flex-col gap-3 w-full max-w-[240px]">
                                        <button 
                                            onClick={startCamera}
                                            className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-600/30 transition hover:bg-green-500"
                                        >
                                            Buka Kamera
                                        </button>
                                        <div className="relative w-full">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={handleFileUpload}
                                            />
                                            <button className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold hover:bg-slate-700 transition relative z-0">
                                                Atau Ambil dari Galeri
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div id="reader" className="w-full" style={{ minHeight: '300px' }}></div>
                            )}
                            <div id="reader-fallback" className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none w-64 h-64"></div>
                        </div>

                        <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                            <strong>Tip:</strong> Pastikan pencahayaan cukup agar QR code dapat terbaca dengan cepat.
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
