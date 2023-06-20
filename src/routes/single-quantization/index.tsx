import React, { useEffect, useState, useCallback } from 'react';

import defaultImage from 'assets/grad_default.png';

import { saveAs } from 'file-saver';

import { loadBlobIntoDataURL, loadImageData, toDataURL } from 'lib/images/browser/loader';
import { QuantizationAlgorithm, quantize } from 'lib/images/browser/async';
import { encodeIndexedBinImage } from 'lib/images/indexed-bin-coder';
import { RGBA } from 'lib/images/interfaces';

import { CanvasLayer } from 'components/canvas-layer';
import { CompareFrame } from 'components/compare-frame';
import { PaletteDialog } from 'components/color-palette-dialog';
import { HistogramDialog } from 'components/histogram-dialog';

import { ToolBar } from './toolbar';
import { AppMode } from 'components/app-mode-switch';

interface SingleQuantizationProps {
    setMode?: (mode: AppMode) => void;
}

export function SingleQuantization({ setMode }: SingleQuantizationProps) {
    const [sourceImage, setSourceImage] = useState(defaultImage);
    const [resultImage, setResultImage] = useState<string | undefined>(undefined);
    const [resultIndexedImage, setResultIndexedImage] = useState<Blob | undefined>(undefined);
    const [dimensions, setDimensions] = useState({ w: 0, h: 0, show: false });

    const [histogramDialogOpen, setHistogramDialogOpen] = useState(false);
    const [paletteDialogOpen, setPaletteDialogOpen] = useState(false);

    const [paletteSize, setPaletteSize] = useState('8');
    const [algorithm, setAlgorithm] = useState<QuantizationAlgorithm>('k-means');

    const [palette, setPalette] = useState<RGBA[]>([]);
    const [histogram, setHistogram] = useState<number[]>([]);

    const [quantizationToken, setQuantizationToken] = useState(Date.now());
    const [canvasResetToken, setCanvasResetToken] = useState(Date.now());

    useEffect(() => {
        const size = Number.parseInt(paletteSize);
        if (isNaN(size) || size < 1 || size > 256) return;

        setResultImage(undefined);
        setResultIndexedImage(undefined);
        setDimensions({ w: 0, h: 0, show: false });

        const controller = new AbortController();

        (async () => {
            const image = await loadImageData(sourceImage);
            setDimensions({ w: image.width, h: image.height, show: true });
            setCanvasResetToken(Date.now());

            const result = await quantize(image, algorithm, size, controller.signal);
            if (result) {
                const indexedImage = encodeIndexedBinImage(result.data, {
                    palette: result.palette,
                    histogram: result.histogram,
                });

                // Prevent state changes if aborted.
                if (controller.signal.aborted) return;

                setResultIndexedImage(indexedImage);
                setResultImage(toDataURL(result.data));
                setPalette(result.palette);
                setHistogram(result.histogram);
            }
        })().catch(console.error);

        return () => controller.abort();
    }, [algorithm, paletteSize, quantizationToken, sourceImage]);


    const onLoadImage = useCallback((imageFile: File) => {
        URL.revokeObjectURL(sourceImage);
        loadBlobIntoDataURL(imageFile)
            .then(setSourceImage)
            .catch(console.error);
    }, [sourceImage, setSourceImage]);


    const onSaveImage = useCallback(() => {
        if (!resultImage) return;

        const timestamp = new Date().toLocaleString();
        saveAs(resultImage, `${timestamp} - Quantization Output.png`);
    }, [resultImage]);

    const onSaveIndexedImage = useCallback(() => {
        if (!resultIndexedImage) return;

        const timestamp = new Date().toLocaleString();
        saveAs(resultIndexedImage, `${timestamp} - Quantization Indexed Output.bin`);
    }, [resultIndexedImage]);

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
        <CanvasLayer resetToken={dimensions.show ? canvasResetToken : undefined}>
            {dimensions.show && <CompareFrame
                source={sourceImage} result={resultImage}
                width={dimensions.w} height={dimensions.h}
            />}
        </CanvasLayer>
        <ToolBar
            setMode={setMode}

            onLoadImage={onLoadImage}
            onSaveImage={resultImage ? onSaveImage : undefined}
            onSaveIndexedImage={resultIndexedImage ? onSaveIndexedImage : undefined}

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