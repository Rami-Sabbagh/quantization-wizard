export type FilesHandlesList = { path: string, handle: FileSystemFileHandle }[];

export async function findAllFiles(directory: FileSystemDirectoryHandle, handlesList: FilesHandlesList = [], basePath = ''): Promise<FilesHandlesList> {
    for await (const [name, handle] of directory.entries()) {
        if (handle.kind === 'file') handlesList.push({ path: `${basePath}${name}`, handle });
        else if (handle.kind === 'directory') await findAllFiles(handle, handlesList, `${basePath}${name}/`);
    }

    return handlesList;
}