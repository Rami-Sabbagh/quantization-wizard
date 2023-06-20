import { IndexedImage } from '../interfaces';
import { AsyncTask, AsyncResult, AsyncTaskType } from './messages';

export type QuantizationAlgorithm = 'k-means' | 'median-cut' | 'popularity' | 'octree';

let nextTaskId = 0;

async function executeTask<T extends AsyncTaskType>(task: AsyncTask<T>, signal?: AbortSignal): Promise<AsyncResult<T> | null> {
    if (signal?.aborted) return null;

    const worker = new Worker(new URL('./worker.ts', import.meta.url));
    const taskId = nextTaskId++;

    worker.postMessage({ ...task, id: taskId });

    return new Promise<AsyncResult<T> | null>((resolve, reject) => {
        let alive = true;

        worker.onmessage = ({ data: result }: MessageEvent<AsyncResult<T>>) => {
            if (result.id !== taskId) return;

            worker.terminate();
            alive = false;

            if (signal?.aborted) resolve(null);
            else resolve(result);
        };

        worker.onerror = (ev: ErrorEvent) => {
            worker.terminate();
            alive = false;

            reject(ev.error);
        };

        if (signal) signal.onabort = () => {
            if (!alive) return;

            worker.terminate();
            alive = false;

            console.log('aborted!');
            resolve(null);
        };
    });
}

export async function quantize(imageData: ImageData, algorithm: QuantizationAlgorithm, count: number, signal?: AbortSignal): Promise<IndexedImage | null> {
    const result = await executeTask<'quantization'>({
        id: -1,
        type: 'quantization',
        algorithm: algorithm,
        data: imageData,
        count,
    }, signal);

    if (!result) return null;

    const { data, palette, histogram } = result;
    return { data, palette, histogram } satisfies IndexedImage;
}

export async function crop(image: ImageData, minX: number, minY: number, maxX: number, maxY: number, signal?: AbortSignal): Promise<ImageData | null> {
    const result = await executeTask<'crop'>({
        id: -1,
        type: 'crop',
        data: image,
        minX, minY,
        maxX, maxY,
    }, signal);

    return result?.data ?? null;
}

export async function downscale(image: ImageData, width: number, height: number, signal?: AbortSignal): Promise<ImageData | null> {
    const result = await executeTask<'downscale'>({
        id: -1,
        type: 'downscale',
        data: image,
        width, height,
    }, signal);

    return result?.data ?? null;
}

export async function findSimilar(target: IndexedImage, images: IndexedImage[], colors: number[] = [], signal?: AbortSignal): Promise<number[] | null> {
    const result = await executeTask<'search'>({
        id: -1,
        type: 'search',
        target, images, colors,
    }, signal);

    return result?.indexes ?? null;
}
