import { useMemo } from 'react';
import { generateQrMatrix } from '@/utils/qrCode';

export default function QRCode({ value, size = 240, className = '', title = 'QR Code' }) {
    const matrix = useMemo(() => generateQrMatrix(value), [value]);
    const quietZone = 4;
    const moduleCount = matrix.length + quietZone * 2;
    const cells = [];

    matrix.forEach((row, rowIndex) => {
        row.forEach((dark, colIndex) => {
            if (!dark) return;

            cells.push(
                <rect
                    key={`${rowIndex}-${colIndex}`}
                    x={colIndex + quietZone}
                    y={rowIndex + quietZone}
                    width="1"
                    height="1"
                />,
            );
        });
    });

    return (
        <svg
            viewBox={`0 0 ${moduleCount} ${moduleCount}`}
            width={size}
            height={size}
            role="img"
            aria-label={title}
            className={className}
            shapeRendering="crispEdges"
        >
            <title>{title}</title>
            <rect width={moduleCount} height={moduleCount} fill="#fff" />
            <g fill="#111827">{cells}</g>
        </svg>
    );
}
