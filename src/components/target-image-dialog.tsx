import React, { useRef, useState, useCallback } from 'react';

import './target-image-dialog.scss';

import defaultImage from 'assets/grad_default.png';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Stack, InputAdornment, TextField, Slider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import CompareIcon from '@mui/icons-material/Compare';
import RefreshIcon from '@mui/icons-material/Refresh';

import { IconButtonWithTooltip } from 'components/icon-button-with-tooltip';
import { AlgorithmSelector } from 'components/algorithm-selector';
import { PaletteSizeBox } from './palette-size-box';
import { QuantizationAlgorithm } from 'lib/images/browser/async';
import { NumericFormatCustom } from './numeric-format-custom';
import { ACCEPTED_IMAGE_TYPES } from 'lib/config';
import { loadBlobIntoDataURL } from 'lib/images/browser/loader';
import { IndexedImage } from 'lib/images/interfaces';

type CropFieldHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
type CropSide = 'left' | 'right' | 'top' | 'bottom';

interface CropFieldProps {
    side: CropSide;
    value?: Record<CropSide, string>;
    invalid?: boolean;
    onChange?: CropFieldHandler;
}

function CropField({ side, value, invalid, onChange }: CropFieldProps) {
    return <TextField
        id={`crop-${side}`}
        name={side}
        label={side}

        value={value?.[side]}
        onChange={onChange}

        size='small'
        margin='none'
        error={invalid}

        InputProps={{
            endAdornment: <InputAdornment position="end">px</InputAdornment>,
            inputComponent: NumericFormatCustom as any,
        }}
    />;
}

const scaleMarks = [
    { value: 25 },
    { value: 50 },
    { value: 75 },
];

interface TargetImageDialogProps {
    open: boolean;
    onClose: () => void;
}

type FileEventHandler = React.ChangeEventHandler<HTMLInputElement>;

export function TargetImageDialog({ open, onClose }: TargetImageDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [originalImage, setOriginalImage] = useState<string>(defaultImage);

    const [paletteSize, setPaletteSize] = useState('8');
    const [algorithm, setAlgorithm] = useState<QuantizationAlgorithm>('k-means');
    const [cropLimits, setCropLimits] = useState({ left: '', right: '', top: '', bottom: '' });

    const initScale = 40;
    const [scale, setScale] = useState(initScale);

    const resetCropLimits = useCallback(() =>
        setCropLimits({ left: '', right: '', top: '', bottom: '' }), []);

    const resetScale = useCallback(() => setScale(initScale), []);

    // =---: Changes Handlers :---= //

    const onCropChange = useCallback<CropFieldHandler>((ev) => {
        setCropLimits({
            ...cropLimits,
            [ev.target?.name]: ev.target?.value,
        });
    }, [cropLimits]);

    const onScaleChange = useCallback((_ev: Event, value: number | number[]) => {
        if (typeof value === 'number') setScale(value);
    }, []);

    const onFileInputChange = useCallback<FileEventHandler>((event) => {
        if (!event.target.files || event.target.files.length === 0) return;
        loadBlobIntoDataURL(event.target.files[0])
            .then(setOriginalImage)
            .catch(console.error);
    }, []);

    // =---:     Actions      :---= //

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // =---:        UI        :---= //

    return <Dialog maxWidth='md' fullWidth open={open} onClose={onClose}>
        <DialogTitle>Target Image</DialogTitle>
        <DialogContent>

            <Grid container spacing={2}>
                {/* =---: Image Preview  :---= */}
                <Grid xs={5}>
                    <div className='preview-frame'>
                        {originalImage && <img src={originalImage} alt="Original" />}
                    </div>
                </Grid>

                {/* =---: Options  :---= */}
                <Grid container xs={7} spacing={1}>
                    {/* =---: Quantization Options  :---= */}
                    <>
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
                    </>

                    {/* =---: Cropping Options  :---= */}
                    <>
                        <Grid xs={12}>
                            <Stack direction='row' alignItems='center' spacing={0.5}>
                                <Typography variant='h6' style={{ marginRight: 'auto' }}>
                                    Cropping
                                </Typography>

                                <IconButtonWithTooltip
                                    title='Reset'
                                    icon={<RefreshIcon />}
                                    onClick={resetCropLimits}
                                />
                            </Stack>
                        </Grid>

                        <Grid xs={12}>
                            <Stack direction='row' spacing={1}>
                                <CropField side='left' value={cropLimits} onChange={onCropChange} />
                                <CropField side='right' value={cropLimits} onChange={onCropChange} />
                                <CropField side='top' value={cropLimits} onChange={onCropChange} />
                                <CropField side='bottom' value={cropLimits} onChange={onCropChange} />
                            </Stack>
                        </Grid>
                    </>

                    {/* =---: Resizing Options  :---= */}
                    <>
                        <Grid xs={12}>
                            <Stack direction='row' alignItems='center' spacing={0.5}>
                                <Typography variant='h6' style={{ marginRight: 'auto' }}>
                                    Scaling
                                </Typography>

                                <IconButtonWithTooltip
                                    title='Reset'
                                    icon={<RefreshIcon />}
                                    onClick={resetScale}
                                />
                            </Stack>
                        </Grid>

                        <Grid xs={12}>
                            <Stack direction='row' alignItems='center' spacing={1}>
                                <Slider
                                    value={scale}
                                    onChange={onScaleChange}
                                    marks={scaleMarks}
                                    style={{ marginLeft: 20, marginRight: 20 }}
                                />

                                <Typography style={{ minWidth: '5ch', textAlign: 'right' }}>
                                    {`${scale}%`}
                                </Typography>
                            </Stack>
                        </Grid>
                    </>
                </Grid>
            </Grid>

        </DialogContent>
        <DialogActions>
            <input
                type='file'
                ref={fileInputRef}
                onChange={onFileInputChange}
                style={{ display: 'none' }}
                accept={ACCEPTED_IMAGE_TYPES.join(', ')}
            />

            <Button onClick={openFileDialog}>Load Image</Button>
            <div style={{ flex: 'auto' }} />
            <Button onClick={onClose}>Cancel</Button>
            <Button>Use</Button>
        </DialogActions>
    </Dialog>
}