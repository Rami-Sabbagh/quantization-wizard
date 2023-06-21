import React, { useState, useCallback, useEffect } from 'react';

import { ToolBar } from './toolbar';

import { AppMode } from 'components/app-mode-switch';
import { TargetImageDialog } from 'components/target-image-dialog';
import { SearchOptionsDialog } from 'components/search-options-dialog';

import { IndexedImage, SearchOptions } from 'lib/images/interfaces';
import { FilesHandlesList, findAllFiles } from 'lib/fs-utils';
import { decodeIndexedBinImage } from 'lib/images/indexed-bin-coder';
import { toBlob, toDataURL } from 'lib/images/browser/loader';
import { CanvasLayer } from 'components/canvas-layer';
import { findSimilar } from 'lib/images/browser/async';

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000;

interface SourceImage extends IndexedImage {
    path: string;
    dataURL: string;

    size: number;
    lastModified: number;
}

async function loadAllIndexedImages(handles: FilesHandlesList): Promise<SourceImage[]> {
    const results: SourceImage[] = [];

    for (const { path, handle } of handles) {
        const file = await handle.getFile();
        if (file.type !== 'application/octet-stream') continue;

        const image = await decodeIndexedBinImage(file);
        const dataURL = toDataURL(image.data);

        const { size, lastModified } = file;

        results.push({ path, dataURL, size, lastModified, ...image });
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

        const { beforeDate, afterDate, minFileSize, maxFileSize } = searchOptions;
        const beforeTimestamp = beforeDate?.getTime();
        const afterTimestamp = afterDate?.getTime();

        console.log(beforeTimestamp, afterTimestamp, beforeDate, afterDate);

        const filteredImages = sourceImages.filter(image => {
            if (beforeTimestamp && image.lastModified >= beforeTimestamp + DAY_MILLISECONDS) return false;
            if (afterTimestamp && image.lastModified < afterTimestamp) return false;
            if (minFileSize && image.size < minFileSize * 1024) return false;
            if (maxFileSize && image.size > maxFileSize * 1024) return false;

            return true;
        });

        (async () => {
            const results = await findSimilar(targetImage, filteredImages, searchOptions, controller.signal);
            if (!results) return;

            setResultImages(results.map(index => filteredImages[index]));
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

    const onSetTargetImage = useCallback((target: IndexedImage) => {
        setTargetImage(target);
        setSearchOptions({ ...searchOptions, colors: undefined });
    }, [searchOptions]);

    const onSaveResultImages = useCallback(() => {
        if (resultImages.length === 0) return;

        showDirectoryPicker({
            id: 'similar-images-output',
            mode: 'readwrite',
            startIn: 'pictures',
        })
            .catch(() => console.log('User cancelled directory input.'))
            .then(async (directory) => {
                if (!directory) return;

                // FIXME: Display a progress dialog while writing files.

                let nextId = 0;
                const prefixLen = `${resultImages.length}`.length;

                for (const image of resultImages) {
                    let prefix = `${++nextId}`;
                    prefix = `${'0'.repeat(prefixLen - prefix.length)}${prefix}`;

                    let originalFileName = image.path.split('/').pop() ?? 'unknown.png.bin';
                    let fileName = `${prefix}-${originalFileName.substring(0, originalFileName.length - 4)}`;

                    const blob = await toBlob(image.data);
                    const handle = await directory.getFileHandle(fileName, { create: true });

                    const stream = await handle.createWritable();
                    await stream.write(blob);
                    await stream.close();
                }
            })
            .catch(console.error);
    }, [resultImages]);

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

            onSaveResultImages={resultImages.length === 0 ? undefined : onSaveResultImages}

            onOpenOptionsDialog={openSearchOptionsDialog}
            onResearch={targetImage ? research : undefined}
        />
        <TargetImageDialog setTargetImage={onSetTargetImage}
            open={targetImageDialog} onClose={closeTargetImageDialog} />
        <SearchOptionsDialog targetImage={targetImage}
            activeOptions={searchOptions} setActiveOptions={setSearchOptions}
            open={searchOptionsDialog} onClose={closeSearchOptionsDialog} />
    </>;
}