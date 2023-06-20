import { IndexedImage, RGBA } from '../interfaces';
import { QuantizationAlgorithm } from './async';

export type AsyncTaskType = 'quantization' | 'crop' | 'downscale' | 'search';

interface Task<Type extends AsyncTaskType> {
    id: number,
    type: Type,
}

interface Result<Type extends AsyncTaskType> {
    id: number,
    type: Type,
}

export interface QuantizationTask extends Task<'quantization'> {
    algorithm: QuantizationAlgorithm,
    data: ImageData,
    count: number,
}

export interface QuantizationResult extends Result<'quantization'> {
    data: ImageData,
    palette: RGBA[],
    histogram: number[],
}

export interface CropTask extends Task<'crop'> {
    data: ImageData,

    minX: number,
    minY: number,

    maxX: number,
    maxY: number,
}

export interface CropResult extends Result<'crop'> {
    id: number,
    type: 'crop',
    data: ImageData
}

export interface DownscaleTask extends Task<'downscale'> {
    data: ImageData,
    width: number,
    height: number,
}

export interface DownscaleResult extends Result<'downscale'> {
    data: ImageData,
}

export interface SearchTask extends Task<'search'> {
    target: IndexedImage,
    images: IndexedImage[],
    colors: number[],
}

export interface SearchResult extends Result<'search'> {
    id: number,
    type: 'search',
    images: IndexedImage[],
}

type AsyncTaskTable = {
    quantization: QuantizationTask,
    crop: CropTask,
    downscale: DownscaleTask,
    search: SearchTask,
};

export type AsyncTask<T extends AsyncTaskType = AsyncTaskType> = AsyncTaskTable[T];

type AsyncResultTable = {
    quantization: QuantizationResult,
    crop: CropResult,
    downscale: DownscaleResult,
    search: SearchResult,
};

export type AsyncResult<T extends AsyncTaskType = AsyncTaskType> = AsyncResultTable[T];