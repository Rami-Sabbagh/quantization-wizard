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
};
