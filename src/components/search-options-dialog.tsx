import React, { useState, useCallback, useEffect } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

import { SearchOptions } from 'lib/images/interfaces';

const thresholdMarks = [
    { value: 25 },
    { value: 50 },
    { value: 75 },
];

interface SearchOptionsDialogProps {
    open: boolean,
    onClose: () => void,

    activeOptions?: SearchOptions,
    setActiveOptions?: (options: SearchOptions) => void,
}

export function SearchOptionsDialog({
    open, onClose,
    activeOptions, setActiveOptions,
}: SearchOptionsDialogProps) {
    const [options, setOptions] = useState<SearchOptions>({});

    /* =---: Effects :---= */

    useEffect(() => {
        if (!activeOptions || !open) return;
        setOptions(activeOptions);
    }, [activeOptions, open]);

    // =---: Changes Handlers :---= //

    const onThresholdChange = useCallback((_ev: Event, value: number | number[]) => {
        if (typeof value === 'number') setOptions({
            ...options,
            threshold: value,
        });
    }, [options]);

    /* =---: Actions :---= */

    const applyOptions = useCallback(() => {
        if (!setActiveOptions) return;
        setActiveOptions(options)
        onClose();
    }, [options, setActiveOptions, onClose]);

    /* =---:  View   :---= */

    return <Dialog maxWidth='sm' fullWidth open={open} onClose={onClose}>
        <DialogTitle>Search Options</DialogTitle>
        <DialogContent>
            <Grid container>
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