import { fromImageData } from "./imagedata";
import { AsyncTask, AsyncTaskResult, CropTask, DownscaleTask, QuantizationTask } from "./messages";

import { kMeansSync } from "../quantization/k-means";
import { medianCutSync } from "../quantization/median-cut";
import { octreeSync } from "../quantization/octree";
import { popularitySync } from "../quantization/popularity";

import { QuantizationReport } from '../interfaces';
import { cropSync } from '../utilities/crop';
import { downscaleSync } from '../utilities/downscale';

type TaskHandler<T extends AsyncTask> = (task: T) => Omit<AsyncTaskResult<T>, 'id' | 'type'>;

const quantizationHandler: TaskHandler<QuantizationTask> = (task) => {
    const { id, algorithm, data, count } = task;

    console.log(
        `[Task ${id}]: Started processing an image of dimensions ${data.width}x${data.height}.`
    );

    const image = fromImageData(data);
    let report: QuantizationReport;

    if (algorithm === "k-means") report = kMeansSync(image, count);
    else if (algorithm === "median-cut") report = medianCutSync(image, count);
    else if (algorithm === "octree") report = octreeSync(image, count);
    else if (algorithm === "popularity") report = popularitySync(image, count);
    else throw new Error(`Unsupported algorithm '${algorithm}'.`);

    return {
        data: image.toImageData(),
        palette: report.palette,
        histogram: report.histogram,
    };
};

const cropHandler: TaskHandler<CropTask> = (task) => {
    const { data, minX, minY, maxX, maxY } = task;
    return { data: cropSync(data, minX, minY, maxX, maxY) };
};

const downscaleHandler: TaskHandler<DownscaleTask> = (task) => {
    const { data, width, height } = task;
    return { data: downscaleSync(data, width, height) };
}

onmessage = ({ data: task }: MessageEvent<AsyncTask>) => {
    const { id, type } = task;

    if (type === 'quantization') postMessage({ id, type, ...quantizationHandler(task) });
    if (type === 'crop') postMessage({ id, type, ...cropHandler(task) });
    if (type === 'downscale') postMessage({ id, type, ...downscaleHandler(task) });
};
