import { IndexedImage } from '../interfaces';
import { AsyncTask, AsyncTaskResult } from './messages';

export type QuantizationAlgorithm = 'k-means' | 'median-cut' | 'popularity' | 'octree';

let nextTaskId = 0;

async function executeTask<T extends AsyncTask>(task: T, signal?: AbortSignal): Promise<AsyncTaskResult<T> | null> {
    if (signal?.aborted) return null;

    const worker = new Worker(new URL('./worker.ts', import.meta.url));
    const taskId = nextTaskId++;

    worker.postMessage({ ...task, id: taskId });

    return new Promise<AsyncTaskResult<T> | null>((resolve, reject) => {
        let alive = true;

        worker.onmessage = ({ data: result }: MessageEvent<AsyncTaskResult<T>>) => {
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
    const result = await executeTask({
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
    const result = await executeTask({
        id: -1,
        type: 'crop',
        data: image,
        minX, minY,
        maxX, maxY,
    });

    return result?.data ?? null;
}
