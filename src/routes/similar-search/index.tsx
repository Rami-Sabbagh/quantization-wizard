import React from 'react';

import { ToolBar } from './toolbar';
import { AppMode } from 'components/app-mode-switch';

interface SimilarSearchProps {
    setMode?: (mode: AppMode) => void;
}

export function SimilarSearch({ setMode }: SimilarSearchProps) {
    return <>
        <ToolBar setMode={setMode} />
    </>;
}