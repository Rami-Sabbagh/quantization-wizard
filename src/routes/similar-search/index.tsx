import React, { useState, useCallback, useEffect } from 'react';

import { ToolBar } from './toolbar';

import { AppMode } from 'components/app-mode-switch';
import { TargetImageDialog } from 'components/target-image-dialog';
import { SearchOptionsDialog } from 'components/search-options-dialog';

import { IndexedImage, SearchOptions } from 'lib/images/interfaces';
import { FilesHandlesList, findAllFiles } from 'lib/fs-utils';
import { decodeIndexedBinImage } from 'lib/images/indexed-bin-coder';
import { toDataURL } from 'lib/images/browser/loader';
import { CanvasLayer } from 'components/canvas-layer';
import { findSimilar } from 'lib/images/browser/async';

interface SourceImage extends IndexedImage {
    path: string;
    dataURL: string;
}

async function loadAllIndexedImages(handles: FilesHandlesList): Promise<SourceImage[]> {
    const results: SourceImage[] = [];

    for (const { path, handle } of handles) {
        const file = await handle.getFile();
        if (file.type !== 'application/octet-stream') continue;

        const image = await decodeIndexedBinImage(file);
        const dataURL = toDataURL(image.data);

        results.push({ path, dataURL, ...image });
    }

    return results;
}

interface SimilarSearchProps {
    setMode?: (mode: AppMode) => void;
}

export function SimilarSearch({ setMode }: SimilarSearchProps) {
    const [sourceImages, setSourceImages] = useState<SourceImage[]>([]);
    const [resultImages, setResultImages] = useState<SourceImage[]>([]);

    const [targetImage, setTargetImage] = useState<IndexedImage | undefined>();
    const [searchOptions, setSearchOptions] = useState<SearchOptions>({});

    const [targetImageDialog, setTargetImageDialog] = useState(false);
    const [searchOptionsDialog, setSearchOptionsDialog] = useState(false);

    const [canvasToken, setCanvasToken] = useState(Date.now());
    const [searchToken, setSearchToken] = useState(Date.now());

    /* =---: Search  :---= */

    useEffect(() => {
        setResultImages([]);
        if (!targetImage) return;

        const controller = new AbortController();

        (async () => {
            const results = await findSimilar(targetImage, sourceImages, searchOptions, controller.signal);
            if (!results) return;

            setResultImages(results.map(index => sourceImages[index]));
            setCanvasToken(Date.now());
        })().catch(console.error);

        return () => controller.abort();
    }, [sourceImages, targetImage, searchOptions, searchToken]);

    /* =---: Actions :---= */

    const onLoadImages = useCallback(() => {
        showDirectoryPicker({
            id: 'similar-images-input',
            mode: 'read',
            startIn: 'pictures',
        })
            .catch(() => console.log('User cancelled directory input.'))
            .then(async (directory) => {
                if (!directory) return;

                const handles = await findAllFiles(directory);
                const images = await loadAllIndexedImages(handles);

                setSourceImages([...sourceImages, ...images]);
                setCanvasToken(Date.now());
            })
            .catch(console.error);
    }, [sourceImages]);

    const onClearImages = useCallback(() => setSourceImages([]), []);
    const onClearTargetImage = useCallback(() => setTargetImage(undefined), []);

    const openTargetImageDialog = useCallback(() => setTargetImageDialog(true), []);
    const closeTargetImageDialog = useCallback(() => setTargetImageDialog(false), []);

    const openSearchOptionsDialog = useCallback(() => setSearchOptionsDialog(true), []);
    const closeSearchOptionsDialog = useCallback(() => setSearchOptionsDialog(false), []);

    const research = useCallback(() => setSearchToken(Date.now()), []);

    /* =---:  View   :---= */

    return <>
        <CanvasLayer resetToken={targetImage && resultImages.length === 0 ? undefined : canvasToken}>
            {(targetImage ? resultImages : sourceImages).map(({ data, dataURL, path }) => <img
                key={path} src={dataURL} alt={path}
                width={data.width} height={data.height}
            />)}
        </CanvasLayer>
        <ToolBar
            setMode={setMode}

            onLoadImages={onLoadImages}
            onClearImages={sourceImages.length === 0 ? undefined : onClearImages}

            onOpenTargetImageDialog={openTargetImageDialog}
            onClearTargetImage={targetImage ? onClearTargetImage : undefined}

            onOpenOptionsDialog={openSearchOptionsDialog}
            onResearch={targetImage ? research : undefined}
        />
        <TargetImageDialog setTargetImage={setTargetImage}
            open={targetImageDialog} onClose={closeTargetImageDialog} />
        <SearchOptionsDialog
            activeOptions={searchOptions} setActiveOptions={setSearchOptions}
            open={searchOptionsDialog} onClose={closeSearchOptionsDialog} />
    </>;
}