import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { RGBA } from '../lib/images/interfaces';

type PaletteDialogProps = {
    open: boolean,
    onClose: () => void,

    palette: RGBA[],
};

export function PaletteDialog({ open, onClose, palette }: PaletteDialogProps) {
    return <Dialog fullWidth maxWidth='sm' open={open} onClose={onClose} >
        <DialogTitle>Color Palette</DialogTitle>
        <DialogContent>
            Hello!
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Close</Button>
        </DialogActions>
    </Dialog>;
}