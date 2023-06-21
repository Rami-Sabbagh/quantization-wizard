import { IndexedImage, SearchOptions ,RGBA } from '../interfaces';

/**
 * A template for an algorithm that searches for similar images.
 * 
 * @param target The image which want to find similar images to.
 * @param images The images to search in.
 * @param options The search options.
 * @returns An array of the indexes of the similar images.
 */
export function findSimilarSync(target: IndexedImage, images: IndexedImage[], {
    colors, threshold,
}: SearchOptions = { }): number[] {

    const similarImages: number[] = [];

    for (let index = 0; index < images.length; index++) {
        const image = images[index];
        if (ComparePalette(target.palette, image.palette,threshold,colors || [])
            &&CompareHistogram(target.histogram, image.histogram,threshold) 
            )
        {        
            similarImages.push(index);
        }

    }
    return similarImages;
}

//Using algorithm (Nearest Color Distance) for Compartion Palette two images .
function ComparePalette(paletteTarget: RGBA[], paletteImage: RGBA[],threshold: number=50,colors: number[]): boolean { 

    threshold*=2.55;
    //Collors number 
    if(colors.length===0)
    {
    
        for (let i = 0; i < paletteTarget.length; i++)
        {
            const colorTarget = paletteTarget[i];
            let closestDistance = Number.MAX_VALUE;

            for (let j=0;j < paletteImage.length;j++){
                const colorImage = paletteImage[j];
                const distance = nearestColorDistance(colorTarget, colorImage);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                }
            }
            if (closestDistance > threshold) {
                return false;
            }
        }
    }

    else
    {
        for (const colorIndex of colors)
        {
            const colorTarget = paletteTarget[colorIndex];
            let closestDistance = Number.MAX_VALUE;

            for (let j=0;j < paletteImage.length;j++){
                const colorImage = paletteImage[j];
                const distance = nearestColorDistance(colorTarget, colorImage);

                if (distance < closestDistance) {
                    closestDistance = distance;
                }
            }
            if (closestDistance > threshold) {
                return false;
            }
        }        
    }

    return true;
}
//algorithm (Nearest Color Distance)

function nearestColorDistance(colorTarget: RGBA, colorImage: RGBA): number {

    const rDiff = colorImage[0] - colorTarget[0];
    const gDiff = colorImage[1] - colorTarget[1];
    const bDiff = colorImage[2] - colorTarget[2];
    const aDiff = colorImage[3] - colorTarget[3];

    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff + aDiff * aDiff);
}

//Using algorithm (Statistical Similarity Distance) for Compartion Histogram two images .
function CompareHistogram(histogramTarget: number[], histogramImage: number[],threshold: number = 50): boolean {


    const minLength = Math.min(histogramTarget.length, histogramImage.length);

    let sumTarget = 0;
    let sumImage = 0;

    for (let i = 0; i < minLength; i++) {
        sumTarget += histogramTarget[i];
        sumImage += histogramImage[i];
    }

    const normalizedHistogram1 = histogramTarget.slice(0, minLength).map((value) => value / sumTarget);
    const normalizedHistogram2 = histogramImage.slice(0, minLength).map((value) => value / sumImage);

    let ssd =0;

    for (let i = 0; i < minLength; i++) {
        const p1 = normalizedHistogram1[i];
        const p2 = normalizedHistogram2[i];

        if (p1 + p2 !== 0) {
            ssd += Math.pow(p1 - p2, 2) / (p1 + p2);
        }
    }
    if (ssd > threshold/100) {
        return false;
    }
    
    return true;
}

