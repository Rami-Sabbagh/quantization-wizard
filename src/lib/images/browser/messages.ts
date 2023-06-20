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
}

export interface CropResult {
    id: number,
    type: 'crop',
    data: ImageData
}

export type AsyncTask = QuantizationTask | CropTask;

export type AsyncTaskResult<T> =
    T extends QuantizationTask ? QuantizationResult :
    T extends CropTask ? CropResult :
    unknown;