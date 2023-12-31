import React, { useCallback, useState, useEffect } from 'react';

import { ToolBar } from './toolbar';
import { AppMode } from 'components/app-mode-switch';

import { ACCEPTED_IMAGE_TYPES } from 'lib/config';

import { loadBlobIntoDataURL, loadImageData, toBlob, toDataURL } from 'lib/images/browser/loader';
import { QuantizationAlgorithm, quantize } from 'lib/images/browser/async';
import { encodeIndexedBinImage } from 'lib/images/indexed-bin-coder';
import { FilesHandlesList, findAllFiles } from 'lib/fs-utils';

import { CanvasLayer } from 'components/canvas-layer';
import { CompareFrame } from 'components/compare-frame';

interface BatchQuantizationProps {
    setMode?: (mode: AppMode) => void;
}



type SourceImagesList = { path: string, dataURL: string }[];
type ResultImagesList = ({ path: string, dataURL: string, blob: Blob, indexedBlob: Blob } | null)[];
type DimensionsList = { w: number, h: number }[];

async function loadAllImages(handles: FilesHandlesList, acceptedTypes: string[] = ACCEPTED_IMAGE_TYPES): Promise<SourceImagesList> {
    const results: SourceImagesList = [];

    for (const { path, handle } of handles) {
        const file = await handle.getFile();

        if (acceptedTypes && !acceptedTypes.includes(file.type)) {
            console.warn(`Unaccepted file "${path}" with type "${file.type}"`);
            continue;
        };

        results.push({ path, dataURL: await loadBlobIntoDataURL(file) });
    }

    return results;
}

/**
 * Creates a file handling the creation of nested parent directories if necessary.
 */
async function createFile(directory: FileSystemDirectoryHandle, filePath: string): Promise<FileSystemFileHandle> {
    const segments = filePath.split('/');
    const fileName = segments.pop();

    if (fileName === undefined) throw new Error('"filePath" can\'t be an empty string!');

    for (const segment of segments)
        directory = await directory.getDirectoryHandle(segment, { create: true });

    return await directory.getFileHandle(fileName, { create: true });
}

export function BatchQuantization({ setMode }: BatchQuantizationProps) {
    const [sourceImages, setSourceImages] = useState<SourceImagesList>([]);
    const [resultImages, setResultImages] = useState<ResultImagesList>([]);
    const [dimensions, setDimensions] = useState<DimensionsList>([]);
    const [progress, setProgress] = useState(1);

    const [paletteSize, setPaletteSize] = useState('8');
    const [algorithm, setAlgorithm] = useState<QuantizationAlgorithm>('k-means');

    const [quantizationToken, setQuantizationToken] = useState(Date.now());
    const [canvasToken, setCanvasToken] = useState(Date.now());

    useEffect(() => {
        const size = Number.parseInt(paletteSize);
        if (isNaN(size) || size < 1 || size > 256) return;

        setCanvasToken(Date.now());

        const results: ResultImagesList = sourceImages.map(() => null);

        setResultImages([...results]);
        setProgress(0);

        const controller = new AbortController();

        (async () => {
            let totalPixels = 0, processedPixels = 0;
            const images: { path: string, image: ImageData }[] = [];
            const dimensions: DimensionsList = [];

            for (const { path, dataURL } of sourceImages) {
                const image = await loadImageData(dataURL);
                totalPixels += image.width * image.height;
                images.push({ path, image });
                dimensions.push({ w: image.width, h: image.height });
            }

            // Avoid changing the state if the operation is aborted.
            if (controller.signal.aborted) return;

            setDimensions(dimensions);

            let nextIndex = 0;
            for (const { path, image } of images) {
                const result = await quantize(image, algorithm, size, controller.signal);
                if (!result) return;

                const indexedBlob = encodeIndexedBinImage(result.data, result);
                const blob = await toBlob(result.data);

                // Avoid changing the state if the operation is aborted.
                if (controller.signal.aborted) return;

                results[nextIndex++] = ({ path, dataURL: toDataURL(result.data), blob, indexedBlob });
                setResultImages([...results]);

                processedPixels += image.width * image.height;
                setProgress(processedPixels / totalPixels);
            }

            setProgress(1);
        })().catch(console.error);

        return () => controller.abort();
    }, [sourceImages, quantizationToken, algorithm, paletteSize]);

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

                setDimensions([]);
                setSourceImages(images);
            })
            .catch(console.error);
    }, []);

    const onSaveImages = useCallback(() => {
        showDirectoryPicker({
            id: 'batch-images-output',
            mode: 'readwrite',
            startIn: 'pictures',
        })
            .catch(() => console.log('User cancelled directory input.'))
            .then(async (directory) => {
                if (!directory) return;

                // FIXME: Display a progress dialog while writing files.

                for (const entry of resultImages) {
                    if (entry === null) continue;
                    const { path, blob } = entry;

                    const handle = await createFile(directory, path);

                    const stream = await handle.createWritable();
                    await stream.write(blob);
                    await stream.close();
                }
            })
            .catch(console.error);
    }, [resultImages]);

    const onSaveIndexedImages = useCallback(() => {
        showDirectoryPicker({
            id: 'batch-images-output',
            mode: 'readwrite',
            startIn: 'pictures',
        })
            .catch(() => console.log('User cancelled directory input.'))
            .then(async (directory) => {
                if (!directory) return;

                // FIXME: Display a progress dialog while writing files.

                for (const entry of resultImages) {
                    if (entry === null) continue;
                    const { path, indexedBlob } = entry;

                    const handle = await createFile(directory, `${path}.bin`);

                    const stream = await handle.createWritable();
                    await stream.write(indexedBlob);
                    await stream.close();
                }
            })
            .catch(console.error);
    }, [resultImages]);

    const reperformQuantization = useCallback(() => {
        setQuantizationToken(Date.now());
    }, []);

    const allowSaving = progress === 1 && sourceImages.length !== 0;
    const showPreview = dimensions.length !== 0;

    return <>
        <CanvasLayer resetToken={showPreview ? canvasToken : undefined}>
            {showPreview && dimensions.map(({ w, h }, index) => <CompareFrame
                source={sourceImages[index].dataURL} result={resultImages[index]?.dataURL}
                width={w} height={h} key={sourceImages[index].path}
            />)}
        </CanvasLayer>
        <ToolBar
            setMode={setMode}

            onLoadImages={onLoadImages}
            onSaveImages={allowSaving ? onSaveImages : undefined}
            onSaveIndexedImages={allowSaving ? onSaveIndexedImages : undefined}

            algorithm={algorithm}
            setAlgorithm={setAlgorithm}

            paletteSize={paletteSize}
            setPaletteSize={setPaletteSize}

            quantizationProgress={progress}
            reperformQuantization={sourceImages.length === 0 ? undefined : reperformQuantization}
        />
    </>;
}