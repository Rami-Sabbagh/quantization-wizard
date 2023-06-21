import React, { useState, useCallback, useEffect } from 'react';

import dayjs, { Dayjs } from 'dayjs';

import { DatePicker } from '@mui/x-date-pickers';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Slider, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import RefreshIcon from '@mui/icons-material/Refresh';

import { IndexedImage, SearchOptions } from 'lib/images/interfaces';

import { IconButtonWithTooltip } from 'components/icon-button-with-tooltip';
import { ColorMultiSelector, DetailedPaletteColor } from 'components/color-multi-selector';
import { NumericFormatCustom } from 'components/numeric-format-custom';

const thresholdMarks = [
    { value: 25 },
    { value: 50 },
    { value: 75 },
];

type FileSizeHandler = React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

interface FileSizeFieldProps {
    label: 'min' | 'max',
    invalid?: boolean,
    value?: string,
    onChange?: FileSizeHandler,
}

function FileSizeField({ label, invalid, value, onChange }: FileSizeFieldProps) {
    return <TextField
        id={`file-size-${label}`}
        name={label}
        label={label}

        value={value}
        onChange={onChange}

        size='small'
        margin='none'
        error={invalid}

        fullWidth

        InputProps={{
            endAdornment: <InputAdornment position="end">kBytes</InputAdornment>,
            inputComponent: NumericFormatCustom as any,
        }}
    />;
}

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

    const onFileSizeChange = useCallback<FileSizeHandler>((ev) => {
        const field = ev.target?.name === 'min' ? 'minFileSize' : 'maxFileSize';
        let rawValue: string | undefined = ev.target?.value;
        if (rawValue === '') rawValue = undefined;

        let value: number | undefined = rawValue !== undefined
            ? Number.parseInt(rawValue ?? '') : undefined;
        if (value !== undefined && isNaN(value)) value = undefined;

        setOptions({ ...options, [field]: value });
    }, [options]);

    const onAfterDateChange = useCallback((date: Dayjs | null) => {
        if (date && !date.isValid()) return;
        setOptions({
            ...options,
            afterDate: date ? date.toDate() : undefined
        });
    }, [options]);

    const onBeforeDateChange = useCallback((date: Dayjs | null) => {
        if (date && !date.isValid()) return;
        setOptions({
            ...options,
            beforeDate: date ? date.toDate() : undefined
        });
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

    const resetFileSize = useCallback(() => {
        setOptions({ ...options, minFileSize: undefined, maxFileSize: undefined });
    }, [options]);

    const resetDates = useCallback(() => {
        setOptions({ ...options, beforeDate: undefined, afterDate: undefined });
    }, [options]);

    /* =---:  View   :---= */

    const fileSizeCanBeReset = options.minFileSize !== undefined || options.maxFileSize;
    const fileSizeInvalid = options.minFileSize !== undefined && options.maxFileSize !== undefined
        && options.minFileSize > options.maxFileSize;

    const datesCanBeReset = options.afterDate !== undefined || options.beforeDate !== undefined;

    return <Dialog maxWidth='sm' fullWidth scroll='body' open={open} onClose={onClose}>
        <DialogTitle>Search Options</DialogTitle>
        <DialogContent>
            <Grid container spacing={2}>
                <Grid container xs={12} spacing={0}>
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
                </Grid>

                <Grid container xs={12} spacing={0}>
                    <Grid xs={12}>
                        <Stack direction='row' alignItems='center' spacing={.5}>
                            <Typography style={{ marginRight: 'auto' }}>
                                File Size
                            </Typography>

                            <IconButtonWithTooltip
                                title='Reset'
                                icon={<RefreshIcon />}
                                onClick={fileSizeCanBeReset ? resetFileSize : undefined}
                            />
                        </Stack>
                    </Grid>

                    <Grid xs={12}>
                        <Stack direction='row' spacing={1}>
                            <FileSizeField label='min'
                                value={`${options.minFileSize ?? ''}`}
                                onChange={onFileSizeChange}
                                invalid={fileSizeInvalid} />
                            <FileSizeField label='max'
                                value={`${options.maxFileSize ?? ''}`}
                                onChange={onFileSizeChange}
                                invalid={fileSizeInvalid} />
                        </Stack>
                    </Grid>
                </Grid>

                <Grid container xs={12} spacing={0}>
                    <Grid xs={12}>
                        <Stack direction='row' alignItems='center' spacing={.5}>
                            <Typography style={{ marginRight: 'auto' }}>
                                Modification Date
                            </Typography>

                            <IconButtonWithTooltip
                                title='Reset'
                                icon={<RefreshIcon />}
                                onClick={datesCanBeReset ? resetDates : undefined}
                            />
                        </Stack>
                    </Grid>

                    <Grid xs={12}>
                        <Stack direction='row' spacing={1}>
                            <div style={{ flex: 1 }} />
                            <DatePicker label="After"
                                value={options.afterDate ? dayjs(options.afterDate) : null}
                                onChange={onAfterDateChange} />
                            <DatePicker label="Before"
                                value={options.beforeDate ? dayjs(options.beforeDate) : null}
                                onChange={onBeforeDateChange} />
                            <div style={{ flex: 1 }} />
                        </Stack>
                    </Grid>
                </Grid>

                <Grid container xs={12} spacing={0}>
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
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button color="warning" onClick={onClose}>Cancel</Button>
            <Button onClick={applyOptions}>Apply</Button>
        </DialogActions>
    </Dialog>;
}