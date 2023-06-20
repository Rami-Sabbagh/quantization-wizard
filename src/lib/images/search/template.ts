import { IndexedImage } from '../interfaces';

/**
 * A template for an algorithm that searches for similar images.
 * 
 * @param target The image which want to find similar images to.
 * @param images The images to search in.
 * @param colors The indexes of the colors selected from the target image to be searched by.
 * @returns A list of the similar images.
 */
export function findSimilarSync(target: IndexedImage, images: IndexedImage[], colors: number[] = []): IndexedImage[] {
    // FIXME: Implement this
    
    return images;
}