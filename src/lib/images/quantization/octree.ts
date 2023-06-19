import { QuantizationReport, RGBA, RGBAImage } from '../interfaces';

class OctreeNode {
    colorSum: number[];
    colorCount: number;
    children: OctreeNode[];

    constructor() {
        this.colorSum = [0, 0, 0];
        this.colorCount = 0;
        this.children = [];
    }
}

export function octreeSync(image: RGBAImage, count: number): QuantizationReport {
    const octree = new Octree();
    const histogram: number[] = [];

    // Iterate over pixels and add them to Octree
    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
            const pixel = image.getPixel(x, y);
            octree.addColor(pixel[0], pixel[1], pixel[2]);
        }
    }

    // Convert Octree to a list of distinct colors and calculate histogram
    const distinctColors = octree.getDistinctColors(count);
    for (let i = 0; i < distinctColors.length; i++) {
        histogram[i] = 0;
    }

    // Apply distinct colors to the image and update histogram
    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
            const pixel = image.getPixel(x, y);
            const closestColor = octree.closestColor(pixel, distinctColors);
            image.setPixel(x, y, closestColor[0], closestColor[1], closestColor[2], closestColor[3]);

            // Update histogram
            const index = distinctColors.findIndex(color => color[0] === closestColor[0] && color[1] === closestColor[1] && color[2] === closestColor[2]);
            histogram[index]++;
        }
    }

    return {
        palette: distinctColors,
        histogram,
    };
}

class Octree {
    private root: OctreeNode | null;

    constructor() {
        this.root = null;
    }

    public addColor(red: number, green: number, blue: number): void {
        if (!this.root) {
            this.root = new OctreeNode();
        }
        this.addColorRecursive(this.root, red, green, blue, 0);
    }

    private addColorRecursive(node: OctreeNode, red: number, green: number, blue: number, level: number): void {
        if (level === 8) {
            node.colorSum[0] += red;
            node.colorSum[1] += green;
            node.colorSum[2] += blue;
            node.colorCount++;
            return;
        }

        const index = this.getColorIndex(red, green, blue, level);
        if (!node.children[index]) {
            node.children[index] = new OctreeNode();
        }

        this.addColorRecursive(node.children[index], red, green, blue, level + 1);
    }

    private getColorIndex(red: number, green: number, blue: number, level: number): number {
        let index = 0;
        if ((red & (1 << level)) !== 0) {
            index |= 1;
        }
        if ((green & (1 << level)) !== 0) {
            index |= 2;
        }
        if ((blue & (1 << level)) !== 0) {
            index |= 4;
        }
        return index;
    }

    public getDistinctColors(count: number): RGBA[] {
        const distinctColors: RGBA[] = [];
        this.getDistinctColorsRecursive(this.root, distinctColors, count);
        return distinctColors;
    }

    private getDistinctColorsRecursive(node: OctreeNode | null, distinctColors: RGBA[], count: number): void {
        if (!node || distinctColors.length >= count) {
            return;
        }

        if (node.colorCount > 0) {
            const red = Math.floor(node.colorSum[0] / node.colorCount);
            const green = Math.floor(node.colorSum[1] / node.colorCount);
            const blue = Math.floor(node.colorSum[2] / node.colorCount);
            distinctColors.push([red, green, blue, 255]);
        }

        for (const child of node.children) {
            this.getDistinctColorsRecursive(child, distinctColors, count);
        }
    }

    public closestColor(color: RGBA, colors: RGBA[]): RGBA {
        let closestColor = colors[0];
        let minDistance = this.getColorDistance(color, closestColor);

        for (let i = 1; i < colors.length; i++) {
            const currentColor = colors[i];
            const distance = this.getColorDistance(color, currentColor);
            if (distance < minDistance) {
                closestColor = currentColor;
                minDistance = distance;
            }
        }

        return closestColor;
    }

    private getColorDistance(color1: RGBA, color2: RGBA): number {
        const redDiff = color1[0] - color2[0];
        const greenDiff = color1[1] - color2[1];
        const blueDiff = color1[2] - color2[2];
        return redDiff * redDiff + greenDiff * greenDiff + blueDiff * blueDiff;
    }
}