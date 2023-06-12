import { QuantizationAlgorithm } from './images/browser/async';

export const algorithmDisplayName: Record<QuantizationAlgorithm, string> = {
    'k-means': 'Naïve k-Means',
    'median-cut': 'Median Cut',
    'octree': 'Octree',
    'popularity': 'Popularity',
};