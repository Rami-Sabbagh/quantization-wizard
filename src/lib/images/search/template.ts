import { IndexedImage } from '../interfaces';

/**
 * A template for an algorithm that searches for similar images.
 * 
 * @param target The image which want to find similar images to.
 * @param selectedColors The indexes of the colors selected from the target image to be searched by.
 * @param images The images to search in.
 * @returns A list of the similar images.
 */
export function similarSearch(target: IndexedImage, selectedColors: number[], images: IndexedImage[]): IndexedImage[] {
    throw new Error('Not implemented !');
}