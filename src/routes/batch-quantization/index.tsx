import React from 'react';

import { ToolBar } from './toolbar';
import { AppMode } from 'components/app-mode-switch';

interface BatchQuantizationProps {
    setMode?: (mode: AppMode) => void;
}

export function BatchQuantization({ setMode }: BatchQuantizationProps) {
    return <>
        <ToolBar
            setMode={setMode}

            algorithm='k-means'
            paletteSize='8'

            quantizationProgress={1 / 3}
        />
    </>;
}