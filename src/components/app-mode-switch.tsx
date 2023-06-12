import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useCallback } from 'react';

const applicationModes = {
    'single-quantization': 'Single Quantization',
    'batch-quantization': 'Batch Quantization',
    'similar-search': 'Similar Search',
} satisfies Record<string, string>;

export type AppMode = keyof typeof applicationModes;

interface AppModeSwitchProps {
    /**
     * The currently active application mode.
     */
    active: AppMode;

    setMode?: (mode: AppMode) => void;
}

type AppModeChangeHandler = (event: SelectChangeEvent<AppMode>) => void;

export function AppModeSwitch({ active, setMode }: AppModeSwitchProps) {
    const onChange = useCallback<AppModeChangeHandler>((ev) => {
        if (!setMode) return;
        setMode(ev.target.value as AppMode);
    }, [setMode]);

    return <Select
        id="app-mode"
        value={active}
        onChange={onChange}
        sx={{ width: '22ch', marginTop: '1px' }}
        margin='none'
    >
        {Object.entries(applicationModes).map(([id, name]) =>
            <MenuItem key={id} value={id}>{name}</MenuItem>
        )}
    </Select>;
}