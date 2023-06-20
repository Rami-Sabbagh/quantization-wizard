import React, { useState, useCallback, useEffect } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { SearchOptions } from 'lib/images/interfaces';

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
        if (!activeOptions) return;
        setOptions(activeOptions);
    }, [activeOptions, open]);

    /* =---: Actions :---= */

    const applyOptions = useCallback(() => {
        if (!setActiveOptions) return;
        setActiveOptions(options)
        onClose();
    }, [options, setActiveOptions, onClose]);

    /* =---:  View   :---= */

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>Search Options</DialogTitle>
        <DialogContent>

        </DialogContent>
        <DialogActions>
            <Button color="warning" onClick={onClose}>Cancel</Button>
            <Button onClick={applyOptions}>Apply</Button>
        </DialogActions>
    </Dialog>;
}