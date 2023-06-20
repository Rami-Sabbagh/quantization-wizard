import { RGBA } from '../interfaces';
import { QuantizationAlgorithm } from './async';

export interface QuantizationTask {
    id: number,
    type: 'quantization',
    algorithm: QuantizationAlgorithm,
    data: ImageData,
    count: number,
}

export interface QuantizationResult {
    id: number,
    type: 'quantization',
    data: ImageData,
    palette: RGBA[],
    histogram: number[],
}

export interface CropTask {
    id: number,
    type: 'crop',

    data: ImageData,

    minX: number,
    minY: number,

    maxX: number,
    maxY: number,
}

export interface CropResult {
    id: number,
    type: 'crop',
    data: ImageData
}

export interface DownscaleTask {
    id: number,
    type: 'downscale',

    data: ImageData,

    width: number,
    height: number,
}

export interface DownscaleResult {
    id: number,
    type: 'downscale',
    data: ImageData,
}

export type AsyncTask = QuantizationTask | CropTask | DownscaleTask;

export type AsyncTaskResult<T extends AsyncTask> =
    T extends QuantizationTask ? QuantizationResult :
    T extends CropTask ? CropResult :
    T extends DownscaleTask ? DownscaleResult :
    unknown;