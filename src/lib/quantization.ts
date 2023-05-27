import { RGBA, RGBAImage } from './images/interfaces';

function distance(c1: RGBA, c2: RGBA): number {
    const [r1, g1, b1] = c1;
    const [r2, g2, b2] = c2;

    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

export function kmeans(image: RGBAImage, count: number): RGBAImage {


    return image;
}