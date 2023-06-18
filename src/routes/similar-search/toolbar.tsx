import React from 'react';

import { IconButton, Tooltip } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ClearIcon from '@mui/icons-material/Clear';
import ImageIcon from '@mui/icons-material/Image';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PageviewIcon from '@mui/icons-material/Pageview';
// import CropIcon from '@mui/icons-material/Crop';
// import ImageAspectRatioIcon from '@mui/icons-material/ImageAspectRatio';
import TuneIcon from '@mui/icons-material/Tune';
import RefreshIcon from '@mui/icons-material/Refresh';

import { AppMode, AppModeSwitch } from 'components/app-mode-switch';

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
}

export function ToolBar({ setMode }: ToolBarProps) {
    return <div className="toolbar">
        {setMode && <AppModeSwitch active="similar-search" setMode={setMode} />}

        <ToolBarIconButton
            title="Open/Load Source Images"
            icon={<FolderOpenIcon />}
            onClick={() => { }}
        />

        <ToolBarIconButton
            title="Clear Source Images"
            icon={<ClearIcon />}
            onClick={() => { }}
        />

        <div className="separator" />

        <ToolBarIconButton
            title="Open/Load Target Image"
            icon={<ImageIcon />}
            onClick={() => { }}
        />

        <div className="separator" />

        <ToolBarIconButton
            title="Export/Save Similar Images"
            icon={<SaveAltIcon />}
            onClick={() => { }}
        />

        <ToolBarIconButton
            title="Show Similar Images Path"
            icon={<PageviewIcon />}
            onClick={() => { }}
        />

        <div className="spacer" />

        <ToolBarIconButton
            title="Search Options"
            icon={<TuneIcon />}
            onClick={() => { }}
        />

        <ToolBarIconButton
            title="Research"
            icon={<RefreshIcon />}
            onClick={() => { }}
        />

    </div>;
}