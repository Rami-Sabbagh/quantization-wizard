import React from 'react';

import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ClearIcon from '@mui/icons-material/Clear';
import ImageIcon from '@mui/icons-material/Image';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PageviewIcon from '@mui/icons-material/Pageview';
import TuneIcon from '@mui/icons-material/Tune';
import RefreshIcon from '@mui/icons-material/Refresh';

import { AppMode, AppModeSwitch } from 'components/app-mode-switch';
import { IconButtonWithTooltip } from 'components/icon-button-with-tooltip';

interface ToolBarProps {
    setMode?: (mode: AppMode) => void;

    onOpenTargetImageDialog?: () => void;
}

export function ToolBar({ setMode, onOpenTargetImageDialog }: ToolBarProps) {
    return <div className="toolbar">
        {setMode && <AppModeSwitch active="similar-search" setMode={setMode} />}

        <IconButtonWithTooltip
            title="Open/Load Source Images"
            icon={<FolderOpenIcon />}
        />

        <IconButtonWithTooltip
            title="Clear Source Images"
            icon={<ClearIcon />}
        />

        <div className="separator" />

        <IconButtonWithTooltip
            title="Open/Load Target Image"
            icon={<ImageIcon />}
            onClick={onOpenTargetImageDialog}
        />

        <div className="separator" />

        <IconButtonWithTooltip
            title="Export/Save Similar Images"
            icon={<SaveAltIcon />}
        />

        <IconButtonWithTooltip
            title="Show Similar Images Path"
            icon={<PageviewIcon />}
        />

        <div className="spacer" />

        <IconButtonWithTooltip
            title="Search Options"
            icon={<TuneIcon />}
        />

        <IconButtonWithTooltip
            title="Research"
            icon={<RefreshIcon />}
        />

    </div>;
}