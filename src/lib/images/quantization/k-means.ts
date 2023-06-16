import { QuantizationReport, RGBA, RGBAImage } from '../interfaces';

function distance(c1: RGBA, c2: RGBA): number {
    const [r1, g1, b1] = c1;
    const [r2, g2, b2] = c2;

    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

function updateClusters(image: RGBAImage, centroids: RGBA[], clusters: number[]): boolean {
    let changed = false;

    const pixel: RGBA = [0, 0, 0, 0];

    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
            image.getPixel(x, y, pixel);
            let cluster = 0, bestDistance = distance(pixel, centroids[0]);

            for (let i = 1; i < centroids.length; i++) {
                const centroidDistance = distance(pixel, centroids[i]);
                if (centroidDistance >= bestDistance) continue;
                bestDistance = centroidDistance;
                cluster = i;
            }

            const clusterIndex = y * image.width + x;
            if (clusters[clusterIndex] !== cluster) changed = true;
            clusters[clusterIndex] = cluster;
        }
    }

    return changed;
}

function applyClusters(image: RGBAImage, centroids: RGBA[], clusters: number[]): void {
    for (let y = 0; y < image.height; y++)
        for (let x = 0; x < image.width; x++)
            image.setPixel(x, y, centroids[clusters[y * image.width + x]]);
}

function updateCentroids(image: RGBAImage, centroids: RGBA[], histogram: number[], clusters: number[]): void {
    const pixel: RGBA = [0, 0, 0, 0];

    for (let i = 0; i < centroids.length; i++) {
        const centroid = centroids[i];
        for (let j = 0; j < 3; j++) centroid[j] = 0;
        let count = 0;

        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                if (clusters[y * image.width + x] !== i) continue;
                image.getPixel(x, y, pixel);

                for (let j = 0; j < 3; j++) centroid[j] += pixel[j];
                count++;
            }
        }

        histogram[i] = count;

        if (count === 0) count = 1;
        for (let j = 0; j < 3; j++) centroid[j] = Math.floor(centroid[j] / count);
    }
}

export function kMeansSync(image: RGBAImage, count: number): QuantizationReport {
    const centroids: RGBA[] = [];
    const histogram: number[] = [];
    for (let i = 0; i < count; i++) {
        centroids[i] = [
            Math.floor(Math.random() * 255 + .5),
            Math.floor(Math.random() * 255 + .5),
            Math.floor(Math.random() * 255 + .5),
            255,
        ];
        histogram[i] = 0;
    }

    const clusters: number[] = [];
    for (let i = 0; i < image.width * image.height; i++)
        clusters[i] = 0;

    updateClusters(image, centroids, clusters);

    let iterations = 0;

    do {
        updateCentroids(image, centroids, histogram, clusters);
        iterations++;
    } while (updateClusters(image, centroids, clusters));

    console.info(`Took ${iterations} iterations to quantize with ${count} colors.`);

    applyClusters(image, centroids, clusters);

    return {
        palette: centroids,
        histogram,
    };
}