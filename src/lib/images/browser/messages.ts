export type QuantizationTask = {
    id: number,
    algorithm: 'kMeans',
    data: ImageData,
    count: number,
};

export type QuantizationResult = {
    id: number,
    data: ImageData,
};
