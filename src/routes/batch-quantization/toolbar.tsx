import React, { useCallback } from 'react';

import { AppMode, AppModeSwitch } from 'components/app-mode-switch';

import { Box, IconButton, InputAdornment, LinearProgress, MenuItem, OutlinedInput, Select, SelectChangeEvent, Tooltip } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import GifBoxIcon from '@mui/icons-material/GifBox';
import { QuantizationAlgorithm } from 'lib/images/browser/async';
import { algorithmDisplayName } from 'lib/locale';
import { NumericFormatCustom } from 'components/numeric-format-custom';

interface ToolBarIconButtonProp {
    title: string;
    icon: JSX.Element;

    onClick?: () => void;
}

function ToolBarIconButton({ title, icon, onClick }: ToolBarIconButtonProp) {
    return <Tooltip title={title}>
        <span>
            <IconButton disabled={!onClick} onClick={onClick}>
                {icon}
            </IconButton>
        </span>
    </Tooltip>;
}

interface ToolBarProps {
    setMode?: (mode: AppMode) => void;

    onLoadImages?: () => void;
    onSaveImages?: () => void;
    onSaveIndexedImages?: () => void;

    algorithm?: QuantizationAlgorithm;
    setAlgorithm?: (algorithm: QuantizationAlgorithm) => void;

    paletteSize?: string;
    setPaletteSize?: (size: string) => void;

    quantizationProgress?: number;
    reperformQuantization?: () => void;
}


export function ToolBar({
    setMode,
    onLoadImages, onSaveImages, onSaveIndexedImages,
    algorithm, setAlgorithm,
    paletteSize, setPaletteSize,
    quantizationProgress, reperformQuantization,
}: ToolBarProps) {
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
        {setMode && <AppModeSwitch active="batch-quantization" setMode={setMode} />}

        <ToolBarIconButton
            title="Open/Load Images"
            icon={<FolderOpenIcon />}
            onClick={onLoadImages}
        />

        <ToolBarIconButton
            title="Export/Save Images"
            icon={<SaveAltIcon />}
            onClick={onSaveImages}
        />

        <ToolBarIconButton
            title="Export/Save Indexed Images"
            icon={<GifBoxIcon />}
            onClick={onSaveIndexedImages}
        />

        {(quantizationProgress ?? 1) < 1 ? <Box sx={{
            width: '100%', display: 'flex',
            flexDirection: 'column', justifyContent: 'center',
        }}>
            <LinearProgress variant="determinate" value={quantizationProgress! * 100} />
        </Box> : <div className="spacer" />}

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

        <ToolBarIconButton
            title="Reperform Quantization"
            icon={<RefreshIcon />}
            onClick={reperformQuantization}
        />

    </div>;
}