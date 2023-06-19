/**
     * Crops an image into a specific region.
     * 
     * @param image The data of the image to crop.
     * @param minX The X coordinates of the top-left corner.
     * @param minY The Y coordinates of the top-left corner.
     * @param maxX The X coordinates of the bottom-right corner.
     * @param maxY The Y coordinates of the bottom-right corner.
     */

export function crop(image: ImageData, minX: number, minY: number, maxX: number, maxY: number): 
ImageData {
    
// Calculate the dimensions of the cropped region
const width = maxX - minX;
const height = maxY - minY;

// Create a new ImageData object for the cropped region
const croppedImage = new ImageData(width, height);

// Copy the pixels from the original image to the cropped image
for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const srcIdx = ((y + minY) * image.width + (x + minX)) * 4;
        const destIdx = (y * width + x) * 4;
        croppedImage.data.set(image.data.slice(srcIdx, srcIdx + 4), destIdx);
    }
}

return croppedImage;
}