import React, { useRef, useCallback } from 'react';

import { Button, IconButton, InputAdornment, MenuItem, OutlinedInput, Select, Tooltip } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaletteIcon from '@mui/icons-material/Palette';
import BarChartIcon from '@mui/icons-material/BarChart';

import { RGBA } from '../lib/images/interfaces';
import { QuantizationAlgorithm } from '../lib/images/browser/async';
import { NumericFormatCustom } from './numeric-format-custom';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';


const algorithmDisplayName: Record<QuantizationAlgorithm, string> = {
    'k-means': 'Naïve k-Means',
    'median-cut': 'Median Cut',
    'octree': 'Octree',
    'popularity': 'Popularity',
};


type ToolBarProps = {
    onLoadImage?: (imageFile: File) => void;
    onSaveImage?: () => void;

    showPalette?: () => void;
    showHistogram?: () => void;

    algorithm?: QuantizationAlgorithm,
    setAlgorithm?: (algorithm: QuantizationAlgorithm) => void,

    paletteSize?: string,
    setPaletteSize?: (size: string) => void,

    reperformQuantization?: () => void;
};


export function ToolBar({
    onLoadImage, onSaveImage,
    showPalette, showHistogram,
    algorithm, setAlgorithm,
    paletteSize, setPaletteSize,
    reperformQuantization
}: ToolBarProps) {

    const fileInputRef = useRef<HTMLInputElement>(null);

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    type InputEventHandler = React.ChangeEventHandler<HTMLInputElement>;

    const onFileInputChange = useCallback<InputEventHandler>((event) => {
        if (!event.target.files || event.target.files.length === 0 || !onLoadImage) return;
        onLoadImage(event.target.files[0]);
    }, [onLoadImage]);

    type AlgorithmChangeHandler = (event: SelectChangeEvent<QuantizationAlgorithm>) => void;


    const onAlgorithmChange = useCallback<AlgorithmChangeHandler>((ev) => {
        if (!setAlgorithm) return;
        setAlgorithm(ev.target.value as QuantizationAlgorithm);
    }, [setAlgorithm]);

    type PaletteSizeChangeHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

    const onPaletteSizeChange = useCallback<PaletteSizeChangeHandler>((ev) => {
        if (!setPaletteSize) return;
        setPaletteSize(ev.target.value);
    }, [setPaletteSize]);

    const paletteSizeParsed = Number.parseInt(paletteSize ?? '');
    const paletteSizeInvalid = isNaN(paletteSizeParsed) || paletteSizeParsed < 1 || paletteSizeParsed > 256;

    return <div className="toolbar">
        <Button>
            Quantization Wizard
        </Button>

        <Tooltip title="Open/Load Image">
            <span>
                <IconButton onClick={openFileDialog} disabled={!onLoadImage}>
                    <FolderOpenIcon />
                </IconButton>
            </span>
        </Tooltip>

        <Tooltip title="Export/Save Image">
            <span>
                <IconButton onClick={onSaveImage} disabled={!onSaveImage}>
                    <SaveAltIcon />
                </IconButton>
            </span>
        </Tooltip>

        <div className='spacer' />

        <Tooltip title="Show Color Palette">
            <span>
                <IconButton onClick={showPalette} disabled={!showPalette}>
                    <PaletteIcon />
                </IconButton>
            </span>
        </Tooltip>

        <Tooltip title="Show Histogram">
            <span>
                <IconButton onClick={showHistogram} disabled={!showHistogram}>
                    <BarChartIcon />
                </IconButton>
            </span>
        </Tooltip>

        {
            algorithm !== undefined && <Select
                id="algorithm"
                value={algorithm}
                onChange={onAlgorithmChange}
                sx={{ width: '18ch' }}
                margin='none'
                disabled={setAlgorithm === undefined}
            >
                {Object.entries(algorithmDisplayName).map(([id, name]) =>
                    <MenuItem key={id} value={id}>{name}</MenuItem>
                )}
            </Select>
        }

        {
            paletteSize !== undefined && <OutlinedInput
                id="palette-size"
                value={paletteSize}
                onChange={onPaletteSizeChange}
                endAdornment={<InputAdornment position="end">colors</InputAdornment>}
                size="small"
                sx={{ width: '12ch' }}
                margin='none'
                inputProps={{
                    inputComponent: NumericFormatCustom as any,
                }}
                error={paletteSizeInvalid}
                disabled={setPaletteSize === undefined}
            />
        }

        <Tooltip title="Reperform Quantization">
            <span>
                <IconButton onClick={reperformQuantization} disabled={!reperformQuantization}>
                    <RefreshIcon />
                </IconButton>
            </span>
        </Tooltip>

        <input
            type='file'
            ref={fileInputRef}
            onChange={onFileInputChange}
            style={{ display: 'none' }}
            accept='image/jpeg, image/png, image/bmp'
        />
    </div>;
}