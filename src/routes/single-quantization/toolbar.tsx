import React, { useRef, useCallback } from 'react';

import { InputAdornment, MenuItem, OutlinedInput, Select } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaletteIcon from '@mui/icons-material/Palette';
import BarChartIcon from '@mui/icons-material/BarChart';
import GifBoxIcon from '@mui/icons-material/GifBox';

import { QuantizationAlgorithm } from 'lib/images/browser/async';
import { NumericFormatCustom } from 'components/numeric-format-custom';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';

import { algorithmDisplayName } from 'lib/locale';
import { AppMode, AppModeSwitch } from 'components/app-mode-switch';
import { ACCEPTED_IMAGE_TYPES } from 'lib/config';
import { IconButtonWithTooltip } from 'components/icon-button-with-tooltip';

interface ToolBarProps {
    setMode?: (mode: AppMode) => void;

    onLoadImage?: (imageFile: File) => void;
    onSaveImage?: () => void;
    onSaveIndexedImage?: () => void;

    showPalette?: () => void;
    showHistogram?: () => void;

    algorithm?: QuantizationAlgorithm;
    setAlgorithm?: (algorithm: QuantizationAlgorithm) => void;

    paletteSize?: string;
    setPaletteSize?: (size: string) => void;

    reperformQuantization?: () => void;
}

export function ToolBar({
    setMode,
    onLoadImage, onSaveImage, onSaveIndexedImage,
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
        {setMode && <AppModeSwitch active='single-quantization' setMode={setMode} />}

        <IconButtonWithTooltip
            title="Open/Load Image"
            icon={<FolderOpenIcon />}
            onClick={openFileDialog}
        />

        <div className="separator" />

        <IconButtonWithTooltip
            title="Export/Save Image"
            icon={<SaveAltIcon />}
            onClick={onSaveImage}
        />

        <IconButtonWithTooltip
            title="Export/Save Indexed Image"
            icon={<GifBoxIcon />}
            onClick={onSaveIndexedImage}
        />

        <div className='spacer' />

        <IconButtonWithTooltip
            title="Show Histogram"
            icon={<BarChartIcon />}
            onClick={showHistogram}
        />

        <IconButtonWithTooltip
            title="Show Color Palette"
            icon={<PaletteIcon />}
            onClick={showPalette}
        />

        {
            algorithm !== undefined && <Select
                id="algorithm"
                value={algorithm}
                onChange={onAlgorithmChange}
                sx={{ width: '18ch', minWidth: '18ch', marginTop: '1px' }}
                margin='none'
                disabled={!setAlgorithm}
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
                sx={{ width: '12ch', minWidth: '12ch', marginTop: '1px' }}
                margin='none'
                inputProps={{
                    inputComponent: NumericFormatCustom as any,
                }}
                error={paletteSizeInvalid}
                disabled={!setPaletteSize}
            />
        }

        <IconButtonWithTooltip
            title="Reperform Quantization"
            icon={<RefreshIcon />}
            onClick={reperformQuantization}
        />

        <input
            type='file'
            ref={fileInputRef}
            onChange={onFileInputChange}
            style={{ display: 'none' }}
            accept={ACCEPTED_IMAGE_TYPES.join(', ')}
        />
    </div>;
}
