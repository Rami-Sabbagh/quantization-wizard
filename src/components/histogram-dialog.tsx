import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { RGBA } from '../lib/images/interfaces';

type HistogramDialogProps = {
    open: boolean,
    onClose: () => void,

    showPalette?: () => void,

    palette: RGBA[],
    histogram: number[],
};

export function HistogramDialog({ open, onClose, showPalette, palette, histogram }: HistogramDialogProps) {
    return <Dialog maxWidth='xl' fullWidth open={open} onClose={onClose}>
        <DialogTitle>Color Palette</DialogTitle>
        <DialogContent>
            Hello there!
        </DialogContent>
        <DialogActions>
            <Button onClick={showPalette} disabled={!showPalette}>Show Palette</Button>
            <Button onClick={onClose}>Close</Button>
        </DialogActions>
    </Dialog>
}