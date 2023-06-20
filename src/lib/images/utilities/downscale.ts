/**
 * Resize an image **down**.
 * 
 * @param image The data of the image to downscale.
 * @param width The target width. Must be <= the original width.
 * @param height The target height. Must be <= the original height.
 */
export function downscale(image: ImageData, width: number, height: number): ImageData {
    if (width > image.width || height > image.height)
        throw new Error('Target dimensions must be <= original dimensions.');

    // Create an in-memory canvas and context
    const canvas = document.createElement('canvas');

    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not create canvas context.');
    }

    // Draw the original image onto the canvas
    ctx.putImageData(image, 0, 0);

    // Create a new canvas with the target dimensions and draw the original canvas onto it
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = width;
    scaledCanvas.height = height;
    const scaledCtx = scaledCanvas.getContext('2d');
    if (!scaledCtx) throw new Error('Could not create scaled canvas context.');

    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.drawImage(canvas, 0, 0, image.width, image.height, 0, 0, width, height);

    // Return the pixel data of the scaled image
    return scaledCtx.getImageData(0, 0, width, height);
}