import React, { useRef, useEffect, useState, useCallback } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.scss';
import defaultImage from './assets/gimp-2.10-splash.png';

import { Button, IconButton, Tooltip } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

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

    useEffect(() => {
        const pane = paneRef.current, container = containerRef.current;
        if (!pane || !container) return;

        setTimeout(() => {
            container.scrollTo(
                (container.scrollWidth - container.clientWidth) * .5,
                (container.scrollHeight - container.clientHeight - 50) * .5,
            );
        }, 100);

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
    }, []);

    return <div ref={containerRef} className="canvas-layer">
        <div ref={paneRef} className="canvas-pane">
            <img src={sourceImage} alt='Original' />
            {resultImage && <img src={resultImage} alt='Quantized' />}
        </div>
    </div>;
}

type ToolBarProps = {
    onLoadImage?: (imageFile: File) => void;
    onSaveImage?: () => void;
};

function ToolBar({ onLoadImage, onSaveImage }: ToolBarProps) {
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

        <Tooltip title="Open/Load Image" onClick={openFileDialog}>
            <IconButton color="primary">
                <FolderOpenIcon />
            </IconButton>
        </Tooltip>

        <Tooltip title="Export/Save Image" onClick={onSaveImage}>
            <IconButton color="primary" disabled={!onSaveImage}>
                <SaveAltIcon />
            </IconButton>
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


    useEffect(() => {
        const controller = new AbortController();
        setResultImage('');

        (async () => {
            const image = await loadImageData(sourceImage);
            const result = await kMeans(image, 8, controller.signal);
            if (result) setResultImage(toDataURL(result));
        })();

        return () => controller.abort();
    }, [sourceImage]);


    const onLoadImage = useCallback((imageFile: File) => {
        URL.revokeObjectURL(sourceImage);
        setSourceImage(URL.createObjectURL(imageFile));
    }, [sourceImage, setSourceImage]);


    const onSaveImage = useCallback(() => {
        if (!resultImage) return;

        const timestamp = new Date().toLocaleString();
        saveAs(resultImage, `${timestamp} - Quantization Output.png`);
    }, [resultImage]);


    return <>
        <CanvasLayer sourceImage={sourceImage} resultImage={resultImage} />
        <ToolBar onLoadImage={onLoadImage} onSaveImage={resultImage ? onSaveImage : undefined} />
    </>;
}

export default App;
