import React, { useState } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import CompareIcon from '@mui/icons-material/Compare';
import RefreshIcon from '@mui/icons-material/Refresh';

import { IconButtonWithTooltip } from 'components/icon-button-with-tooltip';
import { AlgorithmSelector } from 'components/algorithm-selector';
import { PaletteSizeBox } from './palette-size-box';
import { QuantizationAlgorithm } from 'lib/images/browser/async';

interface TargetImageDialogProps {
    open: boolean;
    onClose: () => void;
}

export function TargetImageDialog({ open, onClose }: TargetImageDialogProps) {
    const [paletteSize, setPaletteSize] = useState('8');
    const [algorithm, setAlgorithm] = useState<QuantizationAlgorithm>('k-means');

    return <Dialog maxWidth='md' fullWidth open={open} onClose={onClose}>
        <DialogTitle>Target Image</DialogTitle>
        <DialogContent>

            <Grid container spacing={2}>
                <Grid xs={6}>
                    <div style={{
                        width: '100%',
                        height: '100px',
                        background: '#222',
                        borderRadius: 5,
                    }} />
                </Grid>
                <Grid container xs={6} spacing={1}>
                    <Grid xs={12}>
                        <Stack direction='row' alignItems='center' spacing={0.5}>
                            <Typography variant='h6' style={{ marginRight: 'auto' }}>
                                Quantization
                            </Typography>

                            <IconButtonWithTooltip
                                title='Toggle Preview'
                                icon={<CompareIcon />}
                                onClick={() => { }}
                            />

                            <IconButtonWithTooltip
                                title='Reperform Quantization'
                                icon={<RefreshIcon />}
                                onClick={() => { }}
                            />
                        </Stack>
                    </Grid>

                    <Grid xs={8}>
                        <AlgorithmSelector fullWidth
                            algorithm={algorithm}
                            setAlgorithm={setAlgorithm}
                        />
                    </Grid>

                    <Grid xs={4}>
                        <PaletteSizeBox fullSize
                            paletteSize={paletteSize}
                            setPaletteSize={setPaletteSize}
                        />
                    </Grid>
                </Grid>
            </Grid>

        </DialogContent>
        <DialogActions>
            <Button>Load Image</Button>
            <div style={{ flex: 'auto' }} />
            <Button onClick={onClose}>Cancel</Button>
            <Button>Use</Button>
        </DialogActions>
    </Dialog>
}