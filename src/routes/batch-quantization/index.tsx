import React from 'react';

import { ToolBar } from './toolbar';
import { AppMode } from 'components/app-mode-switch';

interface BatchQuantizationProps {
    setMode?: (mode: AppMode) => void;
}

export function BatchQuantization({ setMode }: BatchQuantizationProps) {
    return <>
        <ToolBar setMode={setMode} />
    </>;
}