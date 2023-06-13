import React, { useCallback, useState } from 'react';

import { ToolBar } from './toolbar';
import { AppMode } from 'components/app-mode-switch';
import { blobToDataURL } from 'lib/dataurl-utils';
import { ACCEPTED_IMAGE_TYPES } from 'lib/config';

interface BatchQuantizationProps {
    setMode?: (mode: AppMode) => void;
}

type FilesHandlesList = { path: string, handle: FileSystemFileHandle }[];

async function findAllFiles(directory: FileSystemDirectoryHandle, handlesList: FilesHandlesList = [], basePath = ''): Promise<FilesHandlesList> {
    for await (const [name, handle] of directory.entries()) {
        if (handle.kind === 'file') handlesList.push({ path: `${basePath}${name}`, handle });
        else if (handle.kind === 'directory') await findAllFiles(handle, handlesList, `${basePath}${name}/`);
    }

    return handlesList;
}

type ImagesList = { path: string, dataURL: string }[];

async function loadAllImages(handles: FilesHandlesList, acceptedTypes: string[] = ACCEPTED_IMAGE_TYPES): Promise<ImagesList> {
    const results: ImagesList = [];

    for (const { path, handle } of handles) {
        const file = await handle.getFile();

        if (acceptedTypes && !acceptedTypes.includes(file.type)) {
            console.warn(`Unaccepted file "${path}" with type "${file.type}"`);
            continue;
        };

        results.push({ path, dataURL: await blobToDataURL(file) })
    }

    return results;
}

export function BatchQuantization({ setMode }: BatchQuantizationProps) {
    const [images, setImages] = useState<ImagesList>([]);

    const onLoadImages = useCallback(() => {
        showDirectoryPicker({
            id: 'batch-images-input',
            mode: 'read',
            startIn: 'pictures',
        })
            .catch(() => console.log('User cancelled directory input.'))
            .then(async (directory) => {
                if (!directory) return;

                const handles = await findAllFiles(directory);
                const images = await loadAllImages(handles);

                setImages(images);
            });
    }, []);

    return <>
        <ToolBar
            setMode={setMode}

            onLoadImages={onLoadImages}

            algorithm='k-means'
            paletteSize='8'

            quantizationProgress={1 / 3}
        />
    </>;
}