/**
     * Crops an image into a specific region.
     * 
     * @param image The data of the image to crop.
     * @param minX The X coordinates of the top-left corner.
     * @param minY The Y coordinates of the top-left corner.
     * @param maxX The X coordinates of the bottom-right corner.
     * @param maxY The Y coordinates of the bottom-right corner.
     */

export function crop(image: ImageData, minX: number, minY: number, maxX: number, maxY: number): ImageData {
    const width = maxX - minX;
    const height = maxY - minY;

    const result = new ImageData(width, height);
    const dstData = new Uint32Array(result.data.buffer);

    for (let y = 0; y < height; y++) {
        // Create a view of the line to copy.
        const line = new Uint32Array(image.data.buffer,
            ((minY + y) * image.width + minX) * 4, width);
        dstData.set(line, y * width);
    }

    return result;
}