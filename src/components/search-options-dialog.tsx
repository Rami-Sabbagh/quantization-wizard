import React, { useState, useCallback, useEffect } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';

import { IndexedImage, SearchOptions } from 'lib/images/interfaces';

import { IconButtonWithTooltip } from 'components/icon-button-with-tooltip';
import { ColorMultiSelector, DetailedPaletteColor } from 'components/color-multi-selector';

const thresholdMarks = [
    { value: 25 },
    { value: 50 },
    { value: 75 },
];

interface SearchOptionsDialogProps {
    open: boolean,
    onClose: () => void,

    targetImage?: IndexedImage,

    activeOptions?: SearchOptions,
    setActiveOptions?: (options: SearchOptions) => void,
}

export function SearchOptionsDialog({
    open, onClose, targetImage,
    activeOptions, setActiveOptions,
}: SearchOptionsDialogProps) {
    const [options, setOptions] = useState<SearchOptions>({});
    const [palette, setPalette] = useState<DetailedPaletteColor[]>([]);

    /* =---: Effects :---= */

    useEffect(() => {
        if (!activeOptions || !open) return;
        setOptions(activeOptions);
    }, [activeOptions, open]);

    useEffect(() => {
        setPalette(targetImage ?
            targetImage.palette
                .map<DetailedPaletteColor>(([r, g, b, a], index) => {
                    return {
                        r, g, b, a, index,
                        count: targetImage.histogram[index],
                    }
                }).sort((a, b) => b.count - a.count)
            : []
        );
    }, [targetImage]);

    // =---: Changes Handlers :---= //

    const onThresholdChange = useCallback((_ev: Event, value: number | number[]) => {
        if (typeof value === 'number') setOptions({
            ...options,
            threshold: value,
        });
    }, [options]);

    const setSelectedColors = useCallback((colors: number[]) => {
        setOptions({ ...options, colors });
    }, [options]);

    /* =---: Actions :---= */

    const applyOptions = useCallback(() => {
        if (!setActiveOptions) return;
        setActiveOptions(options)
        onClose();
    }, [options, setActiveOptions, onClose]);

    const selectAllColors = useCallback(() => {
        if (!targetImage) return;
        const colors = targetImage.palette.map((_, index) => index);
        setOptions({ ...options, colors });
    }, [options, targetImage]);

    const deselectAllColors = useCallback(() => {
        setOptions({ ...options, colors: [] });
    }, [options]);

    /* =---:  View   :---= */

    return <Dialog maxWidth='sm' fullWidth open={open} onClose={onClose}>
        <DialogTitle>Search Options</DialogTitle>
        <DialogContent>
            <Grid container>
                <>
                    <Grid xs={12}>
                        <Stack direction='row' alignItems='center' spacing={.5}>
                            <Typography style={{ marginRight: 'auto' }}>
                                Palette
                            </Typography>

                            <IconButtonWithTooltip
                                title='Deselect All'
                                icon={<DeselectIcon />}
                                onClick={(options.colors?.length ?? 0) === 0
                                    ? undefined : deselectAllColors}
                            />

                            <IconButtonWithTooltip
                                title='Select All'
                                icon={<SelectAllIcon />}
                                onClick={(options.colors?.length ?? 0) === (targetImage?.palette.length ?? 0)
                                    ? undefined : selectAllColors}
                            />
                        </Stack>
                    </Grid>

                    <Grid xs={12}>
                        <ColorMultiSelector
                            palette={palette}
                            selected={options.colors ?? []}
                            setSelected={setSelectedColors}
                        />
                    </Grid>
                </>

                <>
                    <Grid xs={12}>
                        <Typography>Threshold</Typography>
                    </Grid>
                    <Grid xs={12}>
                        <Stack direction='row' alignItems='center' spacing={1}>
                            <Slider
                                value={options.threshold ?? 50}
                                onChange={onThresholdChange}
                                marks={thresholdMarks}
                                style={{ marginLeft: 20, marginRight: 20 }}
                            />

                            <Typography style={{ minWidth: '5ch', textAlign: 'right' }}>
                                {`${options.threshold ?? 50}%`}
                            </Typography>
                        </Stack>
                    </Grid>
                </>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button color="warning" onClick={onClose}>Cancel</Button>
            <Button onClick={applyOptions}>Apply</Button>
        </DialogActions>
    </Dialog>;
}