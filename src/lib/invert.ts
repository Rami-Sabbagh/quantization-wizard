import { RGBA, RGBAImage } from './images/interfaces';

export function invertImage(image: RGBAImage): RGBAImage {
    const rgba: RGBA = [0, 0, 0, 0];

    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
            image.getPixel(x, y, rgba);
            for (let i = 0; i < 3; i++) rgba[i] = 255 - rgba[i];
            image.setPixel(x, y, rgba);
        }
    }

    return image;
}