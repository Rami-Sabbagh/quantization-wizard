import React, { useRef, useEffect, useState, useCallback } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.scss';
import defaultImage from './assets/gimp-2.10-splash.png';

import { Button, IconButton, Skeleton, Tooltip } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import RefreshIcon from '@mui/icons-material/Refresh';

import { saveAs } from 'file-saver';

import { loadImageData, toDataURL } from './lib/images/browser/loader';
import { kMeans } from './lib/images/browser/async';

type CanvasLayerProps = {
    sourceImage: string;
    resultImage?: string;
};

function CanvasLayer({ sourceImage, resultImage }: CanvasLayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const paneRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<{ w: number, h: number } | null>(null);

    const centerCanvas = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        container.scrollTo(
            (container.scrollWidth - container.clientWidth) * .5,
            (container.scrollHeight - container.clientHeight - 50) * .5,
        );
    }, []);

    useEffect(() => {
        const pane = paneRef.current, container = containerRef.current;
        if (!pane || !container) return;

        let activePointer: number | null = null;

        const listener = (ev: PointerEvent) => {
            const { type, pointerId, movementX, movementY } = ev;

            if (type === 'pointerdown' && activePointer === null) activePointer = pointerId;
            else if ((type === 'pointerup' || type === 'pointerout') && activePointer === pointerId) activePointer = null;

            pane.style.cursor = activePointer === null ? 'grab' : 'grabbing';
            if (activePointer !== pointerId) return;

            container.scrollBy(-movementX, -movementY);
            ev.preventDefault();
        };

        pane.addEventListener('pointerdown', listener);
        pane.addEventListener('pointermove', listener);
        pane.addEventListener('pointerup', listener);
        pane.addEventListener('pointerout', listener);

        return () => {
            pane.removeEventListener('pointerdown', listener);
            pane.removeEventListener('pointermove', listener);
            pane.removeEventListener('pointerup', listener);
            pane.removeEventListener('pointerout', listener);
        };
    }, [centerCanvas]);

    const onLoad = useCallback<React.ReactEventHandler<HTMLImageElement>>((ev) => {
        setTimeout(centerCanvas, 20);
        setDimensions({ w: ev.currentTarget.width, h: ev.currentTarget.height });
    }, [centerCanvas]);

    return <div ref={containerRef} className="canvas-layer">
        <div ref={paneRef} className="canvas-pane" style={{
            writingMode: (dimensions && dimensions.w <= dimensions.h) ? 'vertical-lr' : 'horizontal-tb'
        }}>
            <img src={sourceImage} alt='Original' onLoad={onLoad} />
            {resultImage
                ? <img src={resultImage} alt='Quantized' />
                : <Skeleton
                    variant='rectangular'
                    width={dimensions?.w}
                    height={dimensions?.h}
                />}
        </div>
    </div>;
}

type ToolBarProps = {
    onLoadImage?: (imageFile: File) => void;
    onSaveImage?: () => void;

    reperformQuantization?: () => void;
};

function ToolBar({ onLoadImage, onSaveImage, reperformQuantization }: ToolBarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    type InputEventHandler = React.ChangeEventHandler<HTMLInputElement>;

    const onFileInputChange = useCallback<InputEventHandler>((event) => {
        if (!event.target.files || event.target.files.length === 0 || !onLoadImage) return;
        onLoadImage(event.target.files[0]);
    }, [onLoadImage]);

    return <div className="toolbar">
        <Button>
            Quantization Wizard
        </Button>

        <Tooltip title="Open/Load Image">
            <span>
                <IconButton onClick={openFileDialog} disabled={!onLoadImage}>
                    <FolderOpenIcon />
                </IconButton>
            </span>
        </Tooltip>

        <Tooltip title="Export/Save Image">
            <span>
                <IconButton onClick={onSaveImage} disabled={!onSaveImage}>
                    <SaveAltIcon />
                </IconButton>
            </span>
        </Tooltip>

        <div className='spacer' />

        <Tooltip title="Reperform Quantization">
            <span>
                <IconButton onClick={reperformQuantization} disabled={!reperformQuantization}>
                    <RefreshIcon />
                </IconButton>
            </span>
        </Tooltip>

        <input
            type='file'
            ref={fileInputRef}
            onChange={onFileInputChange}
            style={{ display: 'none' }}
            accept='image/jpeg, image/png, image/bmp'
        />
    </div>;
}

function App() {
    const [sourceImage, setSourceImage] = useState(defaultImage);
    const [resultImage, setResultImage] = useState<string | undefined>(undefined);
    const [quantizationToken, setQuantizationToken] = useState(Date.now());

    useEffect(() => {
        const controller = new AbortController();
        setResultImage('');

        (async () => {
            const image = await loadImageData(sourceImage);
            const result = await kMeans(image, 8, controller.signal);
            if (result) setResultImage(toDataURL(result));
        })();

        return () => controller.abort();
    }, [quantizationToken, sourceImage]);


    const onLoadImage = useCallback((imageFile: File) => {
        URL.revokeObjectURL(sourceImage);
        setSourceImage(URL.createObjectURL(imageFile));
    }, [sourceImage, setSourceImage]);


    const onSaveImage = useCallback(() => {
        if (!resultImage) return;

        const timestamp = new Date().toLocaleString();
        saveAs(resultImage, `${timestamp} - Quantization Output.png`);
    }, [resultImage]);


    const reperformQuantization = useCallback(() => {
        setQuantizationToken(Date.now());
    }, []);

    return <>
        <CanvasLayer sourceImage={sourceImage} resultImage={resultImage} />
        <ToolBar
            onLoadImage={onLoadImage}
            onSaveImage={resultImage ? onSaveImage : undefined}
            reperformQuantization={resultImage ? reperformQuantization : undefined}
        />
    </>;
}

export default App;
