import React, { useRef, useEffect } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.scss';
import testingImage from './assets/gimp-2.10-splash.png';
import { Button, IconButton, Tooltip } from '@mui/material';

import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

function CanvasLayer() {
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
            else if (type === 'pointerup' && activePointer === pointerId) activePointer = null;

            pane.style.cursor = activePointer === null ? 'grab' : 'grabbing';
            if (activePointer !== pointerId) return;

            container.scrollBy(-movementX, -movementY);
            ev.preventDefault();
        };

        pane.addEventListener('pointerdown', listener);
        pane.addEventListener('pointermove', listener);
        pane.addEventListener('pointerup', listener);

        return () => {
            pane.removeEventListener('pointerdown', listener);
            pane.removeEventListener('pointermove', listener);
            pane.removeEventListener('pointerup', listener);
        };
    }, []);

    return <div ref={containerRef} className="canvas-layer">
        <div ref={paneRef} className="canvas-pane">
            <img src={testingImage} alt='Original' />
        </div>
    </div>;
}

function ToolBar() {
    return <div className="toolbar">
        <Button>
            Quantization Wizard
        </Button>

        <Tooltip title="Open/Load Image">
            <IconButton color="primary">
                <FolderOpenIcon />
            </IconButton>
        </Tooltip>

        <Tooltip title="Export/Save Image">
            <IconButton color="primary">
                <SaveAltIcon />
            </IconButton>
        </Tooltip>
    </div>;
}

function App() {
    return <>
        <CanvasLayer />
        <ToolBar />
    </>;
}

export default App;
