import { RGBA, RGBAImage } from '../interfaces';

class BrowserRGBAImage implements RGBAImage {
    public readonly width = this.imageData.width;
    public readonly height = this.imageData.height;

    constructor(
        private readonly imageData: ImageData,
    ) { }

    getPixel(x: number, y: number): RGBA;
    getPixel(x: number, y: number, rgba: RGBA): void;
    getPixel(x: number, y: number, rgba?: RGBA): void | RGBA {
        const baseIndex = (this.width * y + x) * 4;

        const r = this.imageData.data[baseIndex];
        const g = this.imageData.data[baseIndex + 1];
        const b = this.imageData.data[baseIndex + 2];
        const a = this.imageData.data[baseIndex + 3];

        if (!rgba) return [r, g, b, a];
        else {
            rgba[0] = r;
            rgba[1] = g;
            rgba[2] = b;
            rgba[3] = a;
        }
    }

    setPixel(x: number, y: number, r: number, g: number, b: number, a: number): void;
    setPixel(x: number, y: number, rgba: RGBA): void;
    setPixel(x: number, y: number, r: number | RGBA, g?: number, b?: number, a?: number): void {
        const baseIndex = (this.width * y + x) * 4;
        if (typeof r === 'object') [r, g, b, a] = r;

        this.imageData.data[baseIndex] = r!;
        this.imageData.data[baseIndex + 1] = g!;
        this.imageData.data[baseIndex + 2] = b!;
        this.imageData.data[baseIndex + 3] = a!;
    }

    toImageData(): ImageData {
        return this.imageData;
    }
}

export function fromImageData(imageData: ImageData): RGBAImage {
    return new BrowserRGBAImage(imageData);
}
