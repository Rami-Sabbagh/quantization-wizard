
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
    | H |  1 byte: colors count       |         28
    |   +-----------------------------+     
    |   |  4 bytes: image width       |         29 --> 32
    |   +-----------------------------+     
    |   |  4 bytes: image height      |         33 --> 36
    |---+-----------------------------+     
    |   |  4N bytes: palette colors   |         37 --> 36 + 4N
    | P +-----------------------------+
    |   |  4N bytes: histogram        |    37 + 4N --> 36 + 8N
    |---+-----------------------------+
    | I |  W.H bytes: pixels indexes  |    37 + 8N --> 36 + 8N + W.H
    #---+-----------------------------#

O==------------------:   Section   :------------------==O

    * H: Header: 37 bytes.
    * P: Palette & Histogram: 8N bytes.
    * I: Image indexes: W.H bytes.
    
    Total file size: 37 + 8N + W.H

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

    const headerLength = 37;
    const colorsLength = 4 * colorsCount;
    const histogramLength = 4 * colorsCount;
    const indexesLength = width * height;
    const fileLength = headerLength + colorsLength + histogramLength + indexesLength;

    const fileBuffer = new ArrayBuffer(fileLength);
    const headerArray = new Uint8Array(fileBuffer, 0, 29);
    const dimensionsArray = new Uint32Array(fileBuffer, 29, 2);
    const colorsArray = new Uint32Array(fileBuffer, 37, colorsLength);
    const histogramArray = new Uint32Array(fileBuffer, 37 + colorsLength, histogramLength);
    const indexesArray = new Uint8Array(fileBuffer, 37 + colorsLength + histogramLength, indexesLength);

    headerArray.set(MAGIC_TAG);
    headerArray[27] = 0x1B;
    headerArray[28] = colorsCount;

    dimensionsArray[0] = width;
    dimensionsArray[1] = height;

    const paletteEncoded = report.palette.map(([r, g, b, a]) =>
        (r << 0) | (g << 8) | (b << 16) | (a << 24));
    const paletteLookup = Object.fromEntries(paletteEncoded.entries());

    colorsArray.set(paletteEncoded);
    histogramArray.set(report.histogram);

    const rgbaData = new Uint32Array(imageData.data.buffer);

    for (let i = 0; i < rgbaData.length; i++)
        indexesArray[i] = paletteLookup[rgbaData[i]];

    return new Blob([fileBuffer], { type: 'application/octet-stream' });
}

export function decodeIndexedBinImage() {
    throw new Error('Not implemented!');
}
