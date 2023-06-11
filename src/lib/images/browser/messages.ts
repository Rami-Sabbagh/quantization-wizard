import { RGBA } from '../interfaces';
import { QuantizationAlgorithm } from './async';

export type QuantizationTask = {
    id: number,
    algorithm: QuantizationAlgorithm,
    data: ImageData,
    count: number,
};

export type QuantizationResult = {
    id: number,
    data: ImageData,
    palette: RGBA[],
    histogram: number[],
};
