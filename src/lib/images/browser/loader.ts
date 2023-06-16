if (!document) throw new Error('Unsupported in workers/node.ks!');

const imageElement: HTMLImageElement = document.querySelector('#internal-image')!;
const canvasElement: HTMLCanvasElement = document.querySelector('#internal-canvas')!;

if (!imageElement) throw new Error('The internal image element could not be found. Did anyone modify index.html?');
if (!canvasElement) throw new Error('The internal canvas element could not be found. Did anyone modify index.html?');

export async function loadImageData(uri: string): Promise<ImageData> {
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

    return ctx.getImageData(0, 0, imageElement.width, imageElement.height);
}

export function toDataURL(imageData: ImageData): string {
    canvasElement.width = imageData.width;
    canvasElement.height = imageData.height;

    if (canvasElement.width !== imageData.width || canvasElement.height !== imageData.height)
        throw new Error('Failed to resized the canvas to match the image dimensions!');

    const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to create 2D context');

    ctx.clearRect(0, 0, imageData.width, imageData.height);
    ctx.putImageData(imageData, 0, 0);

    return canvasElement.toDataURL();
}

export async function toBlob(imageData: ImageData): Promise<Blob> {
    canvasElement.width = imageData.width;
    canvasElement.height = imageData.height;

    if (canvasElement.width !== imageData.width || canvasElement.height !== imageData.height)
        throw new Error('Failed to resized the canvas to match the image dimensions!');

    const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to create 2D context');

    ctx.clearRect(0, 0, imageData.width, imageData.height);
    ctx.putImageData(imageData, 0, 0);

    return new Promise<Blob>((resolve, reject) => {
        canvasElement.toBlob((blob) => {
            if (blob !== null) resolve(blob);
            else reject('Failed to create blob.');
        })
    });
}
