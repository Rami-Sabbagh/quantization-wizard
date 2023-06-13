// @ts-check

// @ts-ignore
import { GIFEncoder, applyPalette } from 'gifenc';
// @ts-ignore
import { rgb888_to } from 'gifenc/src/rgb-packing';
import { blobToDataURL } from 'lib/dataurl-utils';

/**
 * @param {ImageData} imageData 
 * @param {import('../interfaces').RGBA[]} palette 
 * @returns {Promise<string>}
 */
export function toDataURLIndexed(imageData, palette) {
    /**
     * @type {[r: number, g: number, b: number][]}
     */
    // const paletteEncoded = [];

    // palette.forEach((color, id) => {
    //     // const base = id * 4;
    //     const [r, g, b, _a] = color;
    //     paletteEncoded[id] = [
    //         r & 0b11111,
    //         g & 0b111111,
    //         b & 0b11111,
    //     ];
        
    //     // paletteEncoded[base] = r;
    //     // paletteEncoded[base + 1] = g;
    //     // paletteEncoded[base + 2] = b;
    //     // paletteEncoded[base + 3] = a;
    // });

    const index = applyPalette(imageData.data, palette);

    const gif = GIFEncoder();
    gif.writeFrame(index, imageData.width, imageData.height, { palette: palette });
    gif.finish();

    const blob = new Blob([gif.buffer], { type: 'image/gif' });
    return blobToDataURL(blob);
}