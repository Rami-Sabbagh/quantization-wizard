/**
 * Resize an image **down**.
 * 
 * @param image The data of the image to downscale.
 * @param width The target width. Must be <= the original width.
 * @param height The target height. Must be <= the original height.
 */
export function downscale(image: ImageData, width: number, height: number): ImageData {
    const widthScale = image.width / width, heightScale = image.height / height;
    const result = new ImageData(width, height);

    const srcData = new Uint32Array(image.data.buffer);
    const dstData = new Uint32Array(result.data.buffer);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const srcIndex = Math.floor(y * heightScale) * image.width + Math.floor(x * widthScale);
            const dstIndex = y * width + x;

            dstData[dstIndex] = srcData[srcIndex];
        }
    }

    return result;
}