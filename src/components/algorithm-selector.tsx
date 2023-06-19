import React, { useCallback } from 'react';

import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { QuantizationAlgorithm } from 'lib/images/browser/async';

import { algorithmDisplayName } from 'lib/locale';

interface AlgorithmSelectorProps {
    algorithm?: QuantizationAlgorithm,
    setAlgorithm?: (algorithm: QuantizationAlgorithm) => void,

    fullWidth?: boolean,
}

type AlgorithmChangeHandler = (event: SelectChangeEvent<QuantizationAlgorithm>) => void;

export function AlgorithmSelector({ algorithm, setAlgorithm, fullWidth }: AlgorithmSelectorProps) {

    const onAlgorithmChange = useCallback<AlgorithmChangeHandler>((ev) => {
        if (!setAlgorithm) return;
        setAlgorithm(ev.target.value as QuantizationAlgorithm);
    }, [setAlgorithm]);

    return <Select
        id="algorithm"
        value={algorithm ?? 'k-means'}
        onChange={onAlgorithmChange}
        sx={fullWidth ? { width: '100%' } : { width: '18ch', minWidth: '18ch', marginTop: '1px' }}
        margin='none'
        disabled={!setAlgorithm}
    >
        {Object.entries(algorithmDisplayName).map(([id, name]) =>
            <MenuItem key={id} value={id}>{name}</MenuItem>
        )}
    </Select>;
}