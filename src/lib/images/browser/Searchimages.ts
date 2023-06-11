import { QuantizationResult } from "./messages";

onmessage = ({ data: message }: MessageEvent<QuantizationResult>) => {
    const { id, data, palette,histogram } = message;
    

    if (id && data && (palette && palette.length > 0)&&(histogram && histogram.length > 0)) {
        

    }
      
};



