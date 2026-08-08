import QRCode from 'qrcode';

export function generateQrMatrix(text) {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const flat = qr.modules.data;
    const matrix = [];

    for (let row = 0; row < size; row += 1) {
        const cells = [];

        for (let col = 0; col < size; col += 1) {
            cells.push(!!flat[row * size + col]);
        }

        matrix.push(cells);
    }

    return matrix;
}
