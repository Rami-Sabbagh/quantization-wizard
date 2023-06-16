
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
    |   |  3 bytes: memory alignment  |         29 -> 31
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

import { QuantizationReport } from './interfaces';

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

    for (let i = 0; i < colorsCount; i++) {
        const [r, g, b, a] = report.palette[i];
        colorsArray[i] = (r << 0) | (g << 8) | (b << 16) | (a << 24);
    }

    histogramArray.set(report.histogram);

    const paletteLookup: Record<number, number> = {};
    for (let i = 0; i < colorsCount; i++)
        paletteLookup[colorsArray[i]] = i;

    const rgbaData = new Uint32Array(imageData.data.buffer);
    for (let i = 0; i < rgbaData.length; i++)
        indexesArray[i] = paletteLookup[rgbaData[i]] ?? 0;

    return new Blob([fileBuffer], { type: 'application/octet-stream' });
}

export function decodeIndexedBinImage() {
    throw new Error('Not implemented!');
}
