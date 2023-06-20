import React, { useRef, useState, useCallback, useEffect } from 'react';

import './target-image-dialog.scss';

import defaultImage from 'assets/grad_default.png';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Stack, InputAdornment, TextField, Slider, Skeleton } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import CompareIcon from '@mui/icons-material/Compare';
import RefreshIcon from '@mui/icons-material/Refresh';

import { IconButtonWithTooltip } from 'components/icon-button-with-tooltip';
import { AlgorithmSelector } from 'components/algorithm-selector';
import { PaletteSizeBox } from './palette-size-box';
import { QuantizationAlgorithm, quantize } from 'lib/images/browser/async';
import { NumericFormatCustom } from './numeric-format-custom';
import { ACCEPTED_IMAGE_TYPES } from 'lib/config';
import { loadBlobIntoDataURL, loadImageData, toDataURL } from 'lib/images/browser/loader';
import { IndexedImage } from 'lib/images/interfaces';
import { crop } from 'lib/images/utilities/crop';
import { downscale } from 'lib/images/utilities/downscale';

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
    const [sourceImage, setSourceImage] = useState<ImageData | undefined>();
    const [resultImage, setResultImage] = useState<IndexedImage | undefined>();
    const [displayImage, setDisplayImage] = useState<string | undefined>();

    const [previewResult, setPreviewResult] = useState(false);
    const [paletteSize, setPaletteSize] = useState('8');
    const [algorithm, setAlgorithm] = useState<QuantizationAlgorithm>('k-means');
    const [quantizationToken, setQuantizationToken] = useState(Date.now());

    const initScale = 100; // FIXME: change to 40
    const [scale, setScale] = useState(initScale);
    const [cropLimits, setCropLimits] = useState({ left: '', right: '', top: '', bottom: '' });

    const resetCropLimits = useCallback(() =>
        setCropLimits({ left: '', right: '', top: '', bottom: '' }), []);

    const resetScale = useCallback(() => setScale(initScale), []);

    /* =---: Image Rendering  :---= */

    // Source Image
    useEffect(() => {
        setSourceImage(undefined);

        const controller = new AbortController();

        (async () => {
            let image = await loadImageData(originalImage);

            const cropValues: Record<keyof typeof cropLimits, number> =
                Object.fromEntries(Object.entries(cropLimits).map(([key, value]) =>
                    [key, value === '' ? 0 : Number.parseInt(value)])) as any;

            if (Object.entries(cropValues).some(([, value]) => value !== 0)) {
                let { left, right, top, bottom } = cropValues;

                const minX = Math.min(left, image.width - 2);
                const maxX = Math.max(minX + 1, image.width - right);
                const minY = Math.min(top, image.height - 2);
                const maxY = Math.max(minY + 1, image.height - bottom);

                image = crop(image, minX, minY, maxX, maxY);
            }

            if (scale !== 100) image = downscale(image,
                Math.floor(image.width * scale / 100),
                Math.floor(image.height * scale / 100),
            )

            // Prevent state changes if aborted.
            if (controller.signal.aborted) return;

            setSourceImage(image);
        })().catch(console.error);

        return () => controller.abort();
    }, [originalImage, cropLimits, scale]);

    // Result image
    useEffect(() => {
        if (!sourceImage || !previewResult) return;
        if (resultImage) return;

        const size = Number.parseInt(paletteSize);
        if (isNaN(size) || size <= 0 || size > 256) return;

        const controller = new AbortController();

        (async () => {
            const result = await quantize(sourceImage, algorithm, size, controller.signal);
            if (result) {
                // Prevent state changes if aborted.
                if (controller.signal.aborted) return;

                setResultImage(result);
            };
        })().catch(console.error);

        return () => controller.abort();
    }, [sourceImage, resultImage, previewResult, algorithm, paletteSize, quantizationToken]);

    useEffect(() => setResultImage(undefined),
        [quantizationToken, sourceImage, algorithm, paletteSize]);

    // Display Image
    useEffect(() => {
        if (!previewResult && sourceImage) setDisplayImage(toDataURL(sourceImage));
        else if (previewResult && resultImage) setDisplayImage(toDataURL(resultImage.data));
        else setDisplayImage(undefined);
    }, [previewResult, sourceImage, resultImage]);

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

    const togglePreviewResult = useCallback(() => {
        setPreviewResult(!previewResult);
    }, [previewResult]);

    const reperformQuantization = useCallback(() => {
        setQuantizationToken(Date.now());
    }, []);

    // =---:        UI        :---= //

    return <Dialog maxWidth='md' fullWidth open={open} onClose={onClose}>
        <DialogTitle>Target Image</DialogTitle>
        <DialogContent>

            <Grid container spacing={2}>
                {/* =---: Image Preview  :---= */}
                <Grid xs={5}>
                    <div className='preview-frame'>
                        {displayImage ? <img src={displayImage} alt="Preview" /> :
                            <Skeleton variant='rectangular' width={330} height={330} />}
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
                                    title={`${previewResult ? 'Disable' : 'Enable'} Preview`}
                                    icon={<CompareIcon color={previewResult ? 'action' : 'disabled'} />}
                                    onClick={togglePreviewResult}
                                />

                                <IconButtonWithTooltip
                                    title='Reperform Quantization'
                                    icon={<RefreshIcon />}
                                    onClick={resultImage && reperformQuantization}
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
                                    onClick={Object.entries(cropLimits).some(([, value]) => value !== '')
                                        ? resetCropLimits : undefined}
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
                                    onClick={scale !== initScale ? resetScale : undefined}
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
            <Button disabled={!resultImage}>Use</Button>
        </DialogActions>
    </Dialog>
}