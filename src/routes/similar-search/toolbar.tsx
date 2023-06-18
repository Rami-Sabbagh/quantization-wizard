import React from 'react';

import { AppMode, AppModeSwitch } from 'components/app-mode-switch';

interface ToolBarProps {
    setMode?: (mode: AppMode) => void;
}

export function ToolBar({ setMode }: ToolBarProps) {
    return <div className="toolbar">
        {setMode && <AppModeSwitch active="similar-search" setMode={setMode} />}

        <div className="spacer" />

    </div>;
}