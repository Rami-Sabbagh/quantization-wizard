/* eslint-disable no-restricted-globals */
import { fromImageData } from './images/browser';
import { kmeans } from './quantization';

console.log('Worker started!');

self.onmessage = ({ data }: MessageEvent<ImageData>) => {
    console.log('Received a message', data);
    const image = fromImageData(data);

    kmeans(image, 16);

    self.postMessage(image.toImageData());
}

export { }