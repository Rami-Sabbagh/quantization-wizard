
/*
O==------------------:  Variables  :------------------==O

    * N: The number of colors in the palette.
    * W: The width of the image.
    * H: The height of the image.

O==------------------:   Diagram   :------------------==O

    #---+-----------------------------#
    |   |  27 bytes: Magic Tag        |          0 --> 26
    |   +-----------------------------+     
    |   |  1 byte: escape character   |         27
    |   +-----------------------------+     
    |   |  1 byte: colors count       |         28
    | H +-----------------------------+
    |   |  3 bytes: memory alignment  |         29 --> 31
    |   +-----------------------------+     
    |   |  4 bytes: image width       |         32 --> 35
    |   +-----------------------------+     
    |   |  4 bytes: image height      |         36 --> 39
    |---+-----------------------------+     
    |   |  4N bytes: palette colors   |         40 --> 39 + 4N
    | P +-----------------------------+
    |   |  4N bytes: histogram        |    40 + 4N --> 39 + 8N
    |---+-----------------------------+
    | I |  W.H bytes: pixels indexes  |    40 + 8N --> 39 + 8N + W.H
    #---+-----------------------------#

O==------------------:   Section   :------------------==O

    * H: Header: 40 bytes.
    * P: Palette & Histogram: 8N bytes.
    * I: Image indexes: W.H bytes.
    
    Total file size: 40 + 8N + W.H

O==------------------:   Details   :------------------==O

    * The magic tag is "RAMI'S INDEXED IMAGE FORMAT".
    * The escape character is 0x1B in hexadecimal.
    * The colors in the palette are coded as RGBA 4-bytes integer,
        with A being the most significant and R the least significant.

*/

import { QuantizationReport, RGBA } from './interfaces';

const MAGIC_TAG = new Uint8Array([0x52, 0x41, 0x4D, 0x49, 0x27, 0x53, 0x20, 0x49, 0x4E, 0x44, 0x45, 0x58, 0x45, 0x44, 0x20, 0x49, 0x4D, 0x41, 0x47, 0x45, 0x20, 0x46, 0x4F, 0x52, 0x4D, 0x41, 0x54]);

export function encodeIndexedBinImage(imageData: ImageData, report: QuantizationReport): Blob {
    const colorsCount = report.palette.length;
    const { width, height } = imageData;

    const headerLength = 40;
    const colorsLength = 4 * colorsCount;
    const histogramLength = 4 * colorsCount;
    const indexesLength = width * height;
    const fileLength = headerLength + colorsLength + histogramLength + indexesLength;

    const fileBuffer = new ArrayBuffer(fileLength);
    const headerArray = new Uint8Array(fileBuffer, 0, headerLength);
    const dimensionsArray = new Uint32Array(fileBuffer, 32, 2);
    const colorsArray = new Uint32Array(fileBuffer, 40, colorsLength);
    const histogramArray = new Uint32Array(fileBuffer, 40 + colorsLength, histogramLength);
    const indexesArray = new Uint8Array(fileBuffer, 40 + colorsLength + histogramLength, indexesLength);

    headerArray.set(MAGIC_TAG);
    headerArray[27] = 0x1B;
    headerArray[28] = colorsCount;

    dimensionsArray[0] = width;
    dimensionsArray[1] = height;

    const paletteLookup: Record<number, Record<number, number>> = {};

    for (let i = 0; i < colorsCount; i++) {
        for (let j = 0; j < 3; j++) report.palette[i][j] = Math.floor(report.palette[i][j]);
        report.histogram[i] = Math.floor(report.histogram[i]);
    }

    for (let i = 0; i < colorsCount; i++) {
        const [r, g, b, a] = report.palette[i];
        colorsArray[i] = (r << 0) | (g << 8) | (b << 16) | (a << 24);

        const alphaArray = paletteLookup[a] ?? {};
        alphaArray[(r << 0) | (g << 8) | (b << 16)] = i;
        paletteLookup[a] = alphaArray;
    }

    histogramArray.set(report.histogram);

    for (let i = 0; i < width * height; i++) {
        const r = imageData.data[i * 4 + 0];
        const g = imageData.data[i * 4 + 1];
        const b = imageData.data[i * 4 + 2];
        const a = imageData.data[i * 4 + 3];

        const colorId: number | undefined = paletteLookup[a]?.[(r << 0) | (g << 8) | (b << 16)];
        if (colorId === undefined) throw new Error('Color out of palette!');
        indexesArray[i] = colorId;
    }

    return new Blob([fileBuffer], { type: 'application/octet-stream' });
}

interface IndexedImage {
    data: ImageData;
    palette: RGBA[];
    histogram: number[];
}

export async function decodeIndexedBinImage(blob: Blob): Promise<IndexedImage> {
    const fileBuffer = await blob.arrayBuffer();
    if (fileBuffer.byteLength < 40) throw new Error('File too small!');

    const headerLength = 40;
    const headerBuffer = new Uint8Array(fileBuffer, 0, headerLength);

    for (let i = 0; i < MAGIC_TAG.length; i++)
        if (headerBuffer[i] !== MAGIC_TAG[i])
            throw new Error('Invalid magic tag.');

    if (headerBuffer[27] !== 0x1B) throw new Error('Invalid escape character!');
    const colorsCount = headerBuffer[28];

    const dimensionsArray = new Uint32Array(fileBuffer, 32, 2);
    const width = dimensionsArray[0], height = dimensionsArray[1];

    const colorsLength = colorsCount * 4;
    const histogramLength = 4 * colorsCount;
    const indexesLength = width * height;
    const fileLength = headerLength + colorsLength + histogramLength + indexesLength;

    if (fileBuffer.byteLength !== fileLength) throw new Error('Invalid file size!');

    const colorsArray = new Uint8Array(fileBuffer, headerLength, colorsLength * 4);
    const histogramArray = new Uint32Array(fileBuffer, headerLength + colorsLength, histogramLength);
    const indexesArray = new Uint8Array(fileBuffer, headerLength + colorsLength + histogramLength, indexesLength);

    const palette: RGBA[] = [];
    for (let i = 0; i < colorsCount; i++) {
        palette[i] = [
            colorsArray[i * 4 + 0],
            colorsArray[i * 4 + 1],
            colorsArray[i * 4 + 2],
            colorsArray[i * 4 + 3],
        ];
    }

    const histogram = Array.from(histogramArray);
    const data = new ImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const [r, g, b, a] = palette[indexesArray[i]];

            data.data[i * 4 + 0] = r;
            data.data[i * 4 + 1] = g;
            data.data[i * 4 + 2] = b;
            data.data[i * 4 + 3] = a;
        }
    }

    return {
        palette,
        histogram,
        data,
    };
}
