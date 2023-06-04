import React, { useEffect, useState, useCallback } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.scss';
import defaultImage from './assets/gimp-2.10-splash.png';

import { saveAs } from 'file-saver';

import { loadImageData, toDataURL } from './lib/images/browser/loader';
import { QuantizationAlgorithm, quantize } from './lib/images/browser/async';
import { RGBA } from './lib/images/interfaces';

import { ToolBar } from './components/toolbar';
import { CanvasLayer } from './components/canvas-layer';
import { PaletteDialog } from './components/color-palette-dialog';


function App() {
    const [sourceImage, setSourceImage] = useState(defaultImage);
    const [resultImage, setResultImage] = useState<string | undefined>(undefined);

    const [paletteDialogOpen, setPaletteDialogOpen] = useState(false);

    const [paletteSize, setPaletteSize] = useState('8');
    const [algorithm, setAlgorithm] = useState<QuantizationAlgorithm>('k-means');

    const [palette, setPalette] = useState<RGBA[]>([]);
    const [histogram, setHistogram] = useState<number[]>([]);

    const [quantizationToken, setQuantizationToken] = useState(Date.now());

    useEffect(() => {
        const size = Number.parseInt(paletteSize);
        if (isNaN(size) || size < 1 || size > 256) return;

        setResultImage('');
        const controller = new AbortController();

        (async () => {
            const image = await loadImageData(sourceImage);
            const result = await quantize(image, algorithm, size, controller.signal);
            if (result) {
                setResultImage(toDataURL(result.data));
                setPalette(result.palette);
                setHistogram(result.histogram);
            }
        })();

        return () => controller.abort();
    }, [algorithm, paletteSize, quantizationToken, sourceImage]);


    const onLoadImage = useCallback((imageFile: File) => {
        URL.revokeObjectURL(sourceImage);
        setSourceImage(URL.createObjectURL(imageFile));
    }, [sourceImage, setSourceImage]);


    const onSaveImage = useCallback(() => {
        if (!resultImage) return;

        const timestamp = new Date().toLocaleString();
        saveAs(resultImage, `${timestamp} - Quantization Output.png`);
    }, [resultImage]);


    const showPalette = useCallback(() => {
        setPaletteDialogOpen(true);
    }, []);

    const onViewPaletteClose = useCallback(() => {
        setPaletteDialogOpen(false);
    }, []);


    const reperformQuantization = useCallback(() => {
        setQuantizationToken(Date.now());
    }, []);

    return <>
        <CanvasLayer sourceImage={sourceImage} resultImage={resultImage} />
        <ToolBar
            onLoadImage={onLoadImage}
            onSaveImage={resultImage ? onSaveImage : undefined}

            showPalette={resultImage ? showPalette : undefined}

            algorithm={algorithm}
            setAlgorithm={setAlgorithm}

            paletteSize={paletteSize}
            setPaletteSize={setPaletteSize}

            reperformQuantization={resultImage ? reperformQuantization : undefined}
        />
        <PaletteDialog open={paletteDialogOpen} onClose={onViewPaletteClose} palette={palette} />
    </>;
}

export default App;
