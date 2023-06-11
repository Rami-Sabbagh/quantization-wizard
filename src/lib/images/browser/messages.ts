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

//Code Haidar's
export type QuantizationSearch = {
    //Original
    idO: number,
    algorithmO: QuantizationAlgorithm,
    dataO: ImageData,
    countO: number,
    //Result
    idR: number,
    dataR: ImageData,
    paletteR: RGBA[],
    histogramR: number[],
};
