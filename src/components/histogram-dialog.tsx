import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { RGBA } from 'lib/images/interfaces';
import { ColorsHistogram } from './colors-histogram';

type HistogramDialogProps = {
    open: boolean,
    onClose: () => void,

    showPalette?: () => void,

    palette: RGBA[],
    histogram: number[],
};

export function HistogramDialog({ open, onClose, showPalette, palette, histogram }: HistogramDialogProps) {
    return <Dialog maxWidth='xl' fullWidth scroll='body' open={open} onClose={onClose}>
        <DialogTitle>Colors Histogram</DialogTitle>
        <DialogContent>
            <ColorsHistogram palette={palette} histogram={histogram} />
        </DialogContent>
        <DialogActions>
            <Button onClick={showPalette} disabled={!showPalette}>Show Palette</Button>
            <Button onClick={onClose}>Close</Button>
        </DialogActions>
    </Dialog>
}