import React, { useRef, useCallback } from 'react';

import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import PaletteIcon from '@mui/icons-material/Palette';
import BarChartIcon from '@mui/icons-material/BarChart';
import GifBoxIcon from '@mui/icons-material/GifBox';

import { QuantizationAlgorithm } from 'lib/images/browser/async';

import { ACCEPTED_IMAGE_TYPES } from 'lib/config';

import { AppMode, AppModeSwitch } from 'components/app-mode-switch';
import { IconButtonWithTooltip } from 'components/icon-button-with-tooltip';
import { AlgorithmSelector } from 'components/algorithm-selector';
import { PaletteSizeBox } from 'components/palette-size-box';

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

        <input
            type='file'
            ref={fileInputRef}
            onChange={onFileInputChange}
            style={{ display: 'none' }}
            accept={ACCEPTED_IMAGE_TYPES.join(', ')}
        />
    </div>;
}
