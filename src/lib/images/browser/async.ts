import { QuantizationResult, QuantizationTask } from './messages';

export type QuantizationAlgorithm = 'k-means' | 'median-cut' | 'popularity' | 'octree';

let nextTaskId = 0;

export async function quantize(imageData: ImageData, algorithm: QuantizationAlgorithm, count: number, signal?: AbortSignal): Promise<ImageData | null> {
    if (signal?.aborted) return null;

    const worker = new Worker(new URL('./worker.ts', import.meta.url));
    const taskId = nextTaskId++;

    worker.postMessage({
        id: taskId,
        algorithm: algorithm,
        data: imageData,
        count,
    } satisfies QuantizationTask);

    return new Promise<ImageData | null>((resolve, reject) => {
        let alive = true;

        worker.onmessage = ({ data: { id, data } }: MessageEvent<QuantizationResult>) => {
            if (id !== taskId) return;

            worker.terminate();
            alive = false;

            resolve(data);
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

export async function kMeans(imageData: ImageData, count: number, signal?: AbortSignal): Promise<ImageData | null> {
    return quantize(imageData, 'k-means', count, signal);
}


