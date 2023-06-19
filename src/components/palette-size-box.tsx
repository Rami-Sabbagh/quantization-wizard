import React, { useCallback } from 'react';

import { InputAdornment, OutlinedInput } from '@mui/material';
import { NumericFormatCustom } from './numeric-format-custom';

interface PaletteSizeBoxProps {
    paletteSize?: string,
    setPaletteSize?: (size: string) => void,

    fullSize?: boolean,
}

type PaletteSizeChangeHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

export function PaletteSizeBox({ paletteSize, setPaletteSize, fullSize }: PaletteSizeBoxProps) {
    paletteSize = paletteSize ?? '8';

    const onPaletteSizeChange = useCallback<PaletteSizeChangeHandler>((ev) => {
        if (!setPaletteSize) return;
        setPaletteSize(ev.target.value);
    }, [setPaletteSize]);

    const paletteSizeParsed = Number.parseInt(paletteSize ?? '');
    const paletteSizeInvalid = isNaN(paletteSizeParsed) || paletteSizeParsed < 1 || paletteSizeParsed > 256;

    return <OutlinedInput
        id="palette-size"
        value={paletteSize}
        onChange={onPaletteSizeChange}
        endAdornment={<InputAdornment position="end">colors</InputAdornment>}
        size={fullSize ? 'medium' : 'small'}
        sx={fullSize ? { width: '100%' } : { width: '12ch', minWidth: '12ch', marginTop: '1px' }}
        margin='none'
        inputProps={{
            inputComponent: NumericFormatCustom as any,
        }}
        error={paletteSizeInvalid}
        disabled={!setPaletteSize}
    />
}