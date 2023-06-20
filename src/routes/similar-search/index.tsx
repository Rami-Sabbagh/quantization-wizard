import React, { useState, useCallback } from 'react';

import { ToolBar } from './toolbar';
import { AppMode } from 'components/app-mode-switch';
import { TargetImageDialog } from 'components/target-image-dialog';
import { IndexedImage } from 'lib/images/interfaces';

interface SimilarSearchProps {
    setMode?: (mode: AppMode) => void;
}

export function SimilarSearch({ setMode }: SimilarSearchProps) {
    const [targetImage, setTargetImage] = useState<IndexedImage | undefined>();

    const [targetImageDialog, setTargetImageDialog] = useState(false);

    const openTargetImageDialog = useCallback(() => setTargetImageDialog(true), []);
    const closeTargetImageDialog = useCallback(() => setTargetImageDialog(false), []);

    return <>
        <ToolBar setMode={setMode} onOpenTargetImageDialog={openTargetImageDialog} />
        <TargetImageDialog setTargetImage={setTargetImage}
            open={targetImageDialog} onClose={closeTargetImageDialog} />
    </>;
}