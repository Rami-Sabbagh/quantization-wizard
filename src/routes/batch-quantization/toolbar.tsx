import React from 'react';

import { AppMode, AppModeSwitch } from 'components/app-mode-switch';

import { Box, LinearProgress } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import GifBoxIcon from '@mui/icons-material/GifBox';

import { QuantizationAlgorithm } from 'lib/images/browser/async';

import { IconButtonWithTooltip } from 'components/icon-button-with-tooltip';
import { AlgorithmSelector } from 'components/algorithm-selector';
import { PaletteSizeBox } from 'components/palette-size-box';

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

    return <div className="toolbar">
        {setMode && <AppModeSwitch active="batch-quantization" setMode={setMode} />}

        <IconButtonWithTooltip
            title="Open/Load Images"
            icon={<FolderOpenIcon />}
            onClick={onLoadImages}
        />

        <div className="separator" />

        <IconButtonWithTooltip
            title="Export/Save Images"
            icon={<SaveAltIcon />}
            onClick={onSaveImages}
        />

        <IconButtonWithTooltip
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

        {algorithm !== undefined && <AlgorithmSelector
            algorithm={algorithm} setAlgorithm={setAlgorithm}
        />}

        {paletteSize !== undefined && <PaletteSizeBox
            paletteSize={paletteSize} setPaletteSize={setPaletteSize}
        />}

        <IconButtonWithTooltip
            title="Reperform Quantization"
            icon={<RefreshIcon />}
            onClick={reperformQuantization}
        />

    </div>;
}