import { RGBA, RGBAImage } from './interfaces';



function getInternalElements() {
    if (!document) throw new Error('Operation not allowed in workers!');

    const imageElement: HTMLImageElement = document.querySelector('#internal-image')!;
    const canvasElement: HTMLCanvasElement = document.querySelector('#internal-canvas')!;

    if (!imageElement) throw new Error('The internal image element could not be found. Did anyone modify index.html?');
    if (!canvasElement) throw new Error('The internal canvas element could not be found. Did anyone modify index.html?');

    return { imageElement, canvasElement };
}

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

    toDataURL(): string {
        const { canvasElement } = getInternalElements();

        canvasElement.width = this.width;
        canvasElement.height = this.height;

        if (canvasElement.width !== this.width || canvasElement.height !== this.height)
            throw new Error('Failed to resized the canvas to match the image dimensions!');

        const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Failed to create 2D context');

        ctx.clearRect(0, 0, this.width, this.height);
        ctx.putImageData(this.imageData, 0, 0);

        return canvasElement.toDataURL();
    }
}

export function fromImageData(imageData: ImageData): RGBAImage {
    return new BrowserRGBAImage(imageData);
}

export async function loadImage(uri: string): Promise<RGBAImage> {
    const { imageElement, canvasElement } = getInternalElements();
    imageElement.src = '';
    imageElement.src = uri;

    await new Promise<void>((resolve, reject) => {
        const controller = new AbortController();
        const { signal } = controller;

        const onLoad = () => { controller.abort(); resolve(); };
        const onError = (ev: ErrorEvent) => { controller.abort(); reject(ev); };

        imageElement.addEventListener('load', onLoad, { signal });
        imageElement.addEventListener('error', onError, { signal });
    });

    canvasElement.width = imageElement.width;
    canvasElement.height = imageElement.height;

    if (canvasElement.width !== imageElement.width || canvasElement.height !== imageElement.height)
        throw new Error('Failed to resized the canvas to match the image dimensions!');

    const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to create 2D context');

    ctx.clearRect(0, 0, imageElement.width, imageElement.height);
    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, imageElement.width, imageElement.height);

    return new BrowserRGBAImage(imageData);
}