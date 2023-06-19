import React, { useState, useCallback } from 'react';

import { ToolBar } from './toolbar';
import { AppMode } from 'components/app-mode-switch';
import { TargetImageDialog } from 'components/target-image-dialog';

interface SimilarSearchProps {
    setMode?: (mode: AppMode) => void;
}

export function SimilarSearch({ setMode }: SimilarSearchProps) {
    const [targetImageDialog, setTargetImageDialog] = useState(true);

    const openTargetImageDialog = useCallback(() => setTargetImageDialog(true), []);
    const closeTargetImageDialog = useCallback(() => setTargetImageDialog(false), []);

    return <>
        <ToolBar setMode={setMode} onOpenTargetImageDialog={openTargetImageDialog} />
        <TargetImageDialog open={targetImageDialog} onClose={closeTargetImageDialog} />
    </>;
}