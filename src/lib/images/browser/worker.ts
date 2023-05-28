import { fromImageData } from './imagedata';
import { kMeans } from '../../quantization';

console.log('Worker started!');

onmessage = ({ data }: MessageEvent<ImageData>) => {
    console.log(`Started processing an image of dimensions ${data.width}x${data.height}.`);
    const image = fromImageData(data);
    
    kMeans(image, 8);

    postMessage(image.toImageData());
}
