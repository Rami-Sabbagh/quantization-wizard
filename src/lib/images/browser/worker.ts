import { fromImageData } from "./imagedata";
import { AsyncTask, QuantizationResult } from "./messages";

import { kMeansSync } from "../quantization/k-means";
import { medianCutSync } from "../quantization/median-cut";
import { octreeSync } from "../quantization/octree";
import { popularitySync } from "../quantization/popularity";

import { QuantizationReport } from '../interfaces';

console.log("Worker started!");

onmessage = ({ data: message }: MessageEvent<AsyncTask>) => {
    const { id, type } = message;

    if (type === 'quantization') {
        const { algorithm, data } = message;

        console.log(
            `[Task ${id}]: Started processing an image of dimensions ${data.width}x${data.height}.`
        );

        const image = fromImageData(data);
        let report: QuantizationReport;

        if (algorithm === "k-means") report = kMeansSync(image, message.count);
        else if (algorithm === "median-cut") report = medianCutSync(image, message.count);
        else if (algorithm === "octree") report = octreeSync(image, message.count);
        else if (algorithm === "popularity") report = popularitySync(image, message.count);
        else throw new Error(`Unsupported algorithm '${algorithm}'.`);

        postMessage({
            id,
            type: 'quantization',
            data: image.toImageData(),
            palette: report.palette,
            histogram: report.histogram,
        } satisfies QuantizationResult);
    }
};
