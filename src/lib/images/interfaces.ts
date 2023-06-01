
export type RGBA = [r: number, g: number, b: number, a: number];

export interface RGBAImage {
    width: number;
    height: number;

    getPixel(x: number, y: number): RGBA;
    getPixel(x: number, y: number, rgba: RGBA): void;

    setPixel(x: number, y: number, r: number, g: number, b: number, a: number): void;
    setPixel(x: number, y: number, rgba: RGBA): void;

    toImageData(): ImageData;
}

export interface QuantizationReport {
    palette: RGBA[],
    histogram: number[],
}