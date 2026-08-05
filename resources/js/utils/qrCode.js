const QR_CONFIG = {
    1: { size: 21, dataCodewords: 19, eccCodewords: 7, alignment: [] },
    2: { size: 25, dataCodewords: 34, eccCodewords: 10, alignment: [6, 18] },
    3: { size: 29, dataCodewords: 55, eccCodewords: 15, alignment: [6, 22] },
    4: { size: 33, dataCodewords: 80, eccCodewords: 20, alignment: [6, 26] },
    5: { size: 37, dataCodewords: 108, eccCodewords: 26, alignment: [6, 30] },
};

const textEncoder = new TextEncoder();

function appendBits(target, value, length) {
    for (let i = length - 1; i >= 0; i -= 1) {
        target.push((value >>> i) & 1);
    }
}

function chooseVersion(byteLength) {
    for (const [version, config] of Object.entries(QR_CONFIG)) {
        const neededBits = 4 + 8 + byteLength * 8;

        if (neededBits <= config.dataCodewords * 8) {
            return Number(version);
        }
    }

    throw new Error('URL terlalu panjang untuk QR lokal.');
}

function createDataCodewords(text, version) {
    const bytes = [...textEncoder.encode(text)];
    const config = QR_CONFIG[version];
    const bits = [];

    appendBits(bits, 0b0100, 4);
    appendBits(bits, bytes.length, 8);
    bytes.forEach((byte) => appendBits(bits, byte, 8));

    appendBits(bits, 0, Math.min(4, config.dataCodewords * 8 - bits.length));

    while (bits.length % 8 !== 0) {
        bits.push(0);
    }

    const codewords = [];

    for (let i = 0; i < bits.length; i += 8) {
        codewords.push(bits.slice(i, i + 8).reduce((acc, bit) => (acc << 1) | bit, 0));
    }

    for (let pad = 0; codewords.length < config.dataCodewords; pad += 1) {
        codewords.push(pad % 2 === 0 ? 0xec : 0x11);
    }

    return codewords;
}

const gfExp = new Array(512);
const gfLog = new Array(256);
let fieldValue = 1;

for (let i = 0; i < 255; i += 1) {
    gfExp[i] = fieldValue;
    gfLog[fieldValue] = i;
    fieldValue <<= 1;

    if (fieldValue & 0x100) {
        fieldValue ^= 0x11d;
    }
}

for (let i = 255; i < 512; i += 1) {
    gfExp[i] = gfExp[i - 255];
}

function gfMultiply(a, b) {
    if (a === 0 || b === 0) return 0;

    return gfExp[gfLog[a] + gfLog[b]];
}

function generatorPolynomial(degree) {
    let polynomial = [1];

    for (let i = 0; i < degree; i += 1) {
        const next = new Array(polynomial.length + 1).fill(0);

        polynomial.forEach((coefficient, index) => {
            next[index] ^= gfMultiply(coefficient, 1);
            next[index + 1] ^= gfMultiply(coefficient, gfExp[i]);
        });

        polynomial = next;
    }

    return polynomial;
}

function reedSolomonRemainder(data, eccLength) {
    const generator = generatorPolynomial(eccLength);
    const result = new Array(eccLength).fill(0);

    data.forEach((byte) => {
        const factor = byte ^ result.shift();
        result.push(0);

        for (let i = 0; i < eccLength; i += 1) {
            result[i] ^= gfMultiply(generator[i + 1], factor);
        }
    });

    return result;
}

function createGrid(size, value = false) {
    return Array.from({ length: size }, () => Array(size).fill(value));
}

function setModule(matrix, reserved, row, col, dark, isFunction = true) {
    if (row < 0 || col < 0 || row >= matrix.length || col >= matrix.length) return;

    matrix[row][col] = dark;

    if (isFunction) {
        reserved[row][col] = true;
    }
}

function drawFinder(matrix, reserved, row, col) {
    for (let r = -1; r <= 7; r += 1) {
        for (let c = -1; c <= 7; c += 1) {
            const inFinder = r >= 0 && r <= 6 && c >= 0 && c <= 6;
            const dark = inFinder && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));

            setModule(matrix, reserved, row + r, col + c, dark);
        }
    }
}

function drawAlignment(matrix, reserved, centerRow, centerCol) {
    for (let r = -2; r <= 2; r += 1) {
        for (let c = -2; c <= 2; c += 1) {
            setModule(matrix, reserved, centerRow + r, centerCol + c, Math.max(Math.abs(r), Math.abs(c)) !== 1);
        }
    }
}

function drawFunctionPatterns(matrix, reserved, version) {
    const size = matrix.length;

    drawFinder(matrix, reserved, 0, 0);
    drawFinder(matrix, reserved, 0, size - 7);
    drawFinder(matrix, reserved, size - 7, 0);

    for (let i = 8; i < size - 8; i += 1) {
        setModule(matrix, reserved, 6, i, i % 2 === 0);
        setModule(matrix, reserved, i, 6, i % 2 === 0);
    }

    QR_CONFIG[version].alignment.forEach((row) => {
        QR_CONFIG[version].alignment.forEach((col) => {
            const overlapsFinder = (row === 6 && col === 6) || (row === 6 && col === size - 7) || (row === size - 7 && col === 6);

            if (!overlapsFinder) {
                drawAlignment(matrix, reserved, row, col);
            }
        });
    });

    for (let i = 0; i < 8; i += 1) {
        if (i !== 6) {
            setModule(matrix, reserved, 8, i, false);
            setModule(matrix, reserved, i, 8, false);
        }

        setModule(matrix, reserved, 8, size - 1 - i, false);
        setModule(matrix, reserved, size - 1 - i, 8, false);
    }

    setModule(matrix, reserved, size - 8, 8, true);
}

function formatBits(mask) {
    const data = (0b01 << 3) | mask;
    let bits = data << 10;

    for (let i = 14; i >= 10; i -= 1) {
        if (((bits >>> i) & 1) !== 0) {
            bits ^= 0x537 << (i - 10);
        }
    }

    return (((data << 10) | bits) ^ 0x5412) & 0x7fff;
}

function drawFormatBits(matrix, reserved, mask) {
    const size = matrix.length;
    const bits = formatBits(mask);
    const first = [
        [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
        [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    ];
    const second = [
        [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
        [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
    ];

    first.forEach(([row, col], index) => setModule(matrix, reserved, row, col, ((bits >>> index) & 1) !== 0));
    second.forEach(([row, col], index) => setModule(matrix, reserved, row, col, ((bits >>> index) & 1) !== 0));
}

function shouldMask(row, col) {
    return (row + col) % 2 === 0;
}

function drawData(matrix, reserved, codewords) {
    const size = matrix.length;
    const bits = codewords.flatMap((byte) => Array.from({ length: 8 }, (_, index) => (byte >>> (7 - index)) & 1));
    let bitIndex = 0;
    let upward = true;

    for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col -= 1;

        for (let step = 0; step < size; step += 1) {
            const row = upward ? size - 1 - step : step;

            for (let offset = 0; offset < 2; offset += 1) {
                const currentCol = col - offset;

                if (reserved[row][currentCol]) continue;

                const bit = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
                matrix[row][currentCol] = bit !== shouldMask(row, currentCol);
                bitIndex += 1;
            }
        }

        upward = !upward;
    }
}

export function generateQrMatrix(text) {
    const version = chooseVersion(textEncoder.encode(text).length);
    const config = QR_CONFIG[version];
    const data = createDataCodewords(text, version);
    const ecc = reedSolomonRemainder(data, config.eccCodewords);
    const matrix = createGrid(config.size);
    const reserved = createGrid(config.size);

    drawFunctionPatterns(matrix, reserved, version);
    drawData(matrix, reserved, [...data, ...ecc]);
    drawFormatBits(matrix, reserved, 0);

    return matrix;
}
