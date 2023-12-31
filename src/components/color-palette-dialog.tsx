import React, { useEffect, useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { RGBA } from 'lib/images/interfaces';
import { ColorSelector } from './color-selector';

type PaletteDialogProps = {
    open: boolean,
    onClose: () => void,

    showHistogram?: () => void,

    palette: RGBA[],
};

export function PaletteDialog({ open, onClose, showHistogram, palette }: PaletteDialogProps) {
    const [selected, setSelected] = useState(0);

    useEffect(() => setSelected(0), [palette]);
    if (selected >= palette.length && selected !== 0) setSelected(0);

    return <Dialog maxWidth='md' scroll='body' open={open} onClose={onClose} >
        <DialogTitle>Color Palette</DialogTitle>
        <DialogContent>
            <ColorSelector palette={palette} selected={selected} onSelect={setSelected} />
        </DialogContent>
        <DialogActions>
            <Button color="secondary" onClick={showHistogram} disabled={!showHistogram}>Show Histogram</Button>
            <Button onClick={onClose}>Close</Button>
        </DialogActions>
    </Dialog>;
}