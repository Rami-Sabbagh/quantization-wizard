import { fromImageData } from "./imagedata";
import { AsyncTask, AsyncResult, AsyncTaskType, CropTask, DownscaleTask, QuantizationTask } from "./messages";

import { kMeansSync } from "../quantization/k-means";
import { medianCutSync } from "../quantization/median-cut";
import { octreeSync } from "../quantization/octree";
import { popularitySync } from "../quantization/popularity";

import { QuantizationReport } from '../interfaces';
import { cropSync } from '../utilities/crop';
import { downscaleSync } from '../utilities/downscale';
import { findSimilarSync } from '../search/template';

type TaskHandler<T extends AsyncTaskType> = (task: AsyncTask<T>) => Omit<AsyncResult<T>, 'id' | 'type'>;

const quantizationHandler: TaskHandler<'quantization'> = (task) => {
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

const cropHandler: TaskHandler<'crop'> = (task) => {
    const { data, minX, minY, maxX, maxY } = task;
    return { data: cropSync(data, minX, minY, maxX, maxY) };
};

const downscaleHandler: TaskHandler<'downscale'> = (task) => {
    const { data, width, height } = task;
    return { data: downscaleSync(data, width, height) };
}

const searchHandler: TaskHandler<'search'> = (task) => {
    const { target, images, colors } = task
    return { indexes: findSimilarSync(target, images, colors) };
}

onmessage = ({ data: task }: MessageEvent<AsyncTask>) => {
    const { id, type } = task;

    if (type === 'quantization') postMessage({ id, type, ...quantizationHandler(task) });
    if (type === 'crop') postMessage({ id, type, ...cropHandler(task) });
    if (type === 'downscale') postMessage({ id, type, ...downscaleHandler(task) });
    if (type === 'search') postMessage({ id, type, ...searchHandler(task) });
};
