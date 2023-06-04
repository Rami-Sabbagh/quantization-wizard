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
import { HistogramDialog } from './components/histogram-dialog';


function App() {
    const [sourceImage, setSourceImage] = useState(defaultImage);
    const [resultImage, setResultImage] = useState<string | undefined>(undefined);

    const [histogramDialogOpen, setHistogramDialogOpen] = useState(false);
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

    const showHistogram = useCallback(() => {
        setHistogramDialogOpen(true);
        setPaletteDialogOpen(false);
    }, []);

    const onHistogramDialogClose = useCallback(() => {
        setHistogramDialogOpen(false);
    }, []);

    const showPalette = useCallback(() => {
        setPaletteDialogOpen(true);
        setHistogramDialogOpen(false);
    }, []);

    const onPaletteDialogClose = useCallback(() => {
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
            showHistogram={resultImage ? showHistogram : undefined}

            algorithm={algorithm}
            setAlgorithm={setAlgorithm}

            paletteSize={paletteSize}
            setPaletteSize={setPaletteSize}

            reperformQuantization={resultImage ? reperformQuantization : undefined}
        />
        <PaletteDialog open={paletteDialogOpen} onClose={onPaletteDialogClose} showHistogram={showHistogram} palette={palette} />
        <HistogramDialog open={histogramDialogOpen} onClose={onHistogramDialogClose} showPalette={showPalette} palette={palette} histogram={histogram} />
    </>;
}

export default App;
