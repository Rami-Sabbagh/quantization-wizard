import { fromImageData } from './imagedata';
import { QuantizationResult, QuantizationTask } from './messages';

import { kMeansSync } from '../quantization/k-means';

console.log('Worker started!');

onmessage = ({ data: message }: MessageEvent<QuantizationTask>) => {
    const { id, algorithm, data } = message;

    if (algorithm === 'k-means') {
        console.log(`[Task ${id}]: Started processing an image of dimensions ${data.width}x${data.height}.`);

        const image = fromImageData(data);
        const { palette, histogram } = kMeansSync(image, message.count);

        postMessage({
            id, data: image.toImageData(),
            palette, histogram,
        } satisfies QuantizationResult);

    } else {
        throw new Error(`Unsupported algorithm '${algorithm}'.`);
    }
}
