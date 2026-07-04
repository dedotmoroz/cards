export type FolderSortMode = 'created_desc' | 'name_asc';

export interface SortableFolder {
    id: string;
    name: string;
    createdAt?: string;
    pinned?: boolean;
}

function compareByName(a: SortableFolder, b: SortableFolder, locale?: string): number {
    return a.name.localeCompare(b.name, locale, { sensitivity: 'base' });
}

export function sortFolders<T extends SortableFolder>(
    folders: T[],
    mode: FolderSortMode,
    locale?: string,
): T[] {
    const indexed = folders.map((folder, index) => ({ folder, index }));

    const compare = (
        a: { folder: T; index: number },
        b: { folder: T; index: number },
    ) => {
        if (mode === 'name_asc') {
            const byName = compareByName(a.folder, b.folder, locale);
            if (byName !== 0) {
                return byName;
            }
            return a.index - b.index;
        }

        const aTime = a.folder.createdAt ? new Date(a.folder.createdAt).getTime() : 0;
        const bTime = b.folder.createdAt ? new Date(b.folder.createdAt).getTime() : 0;
        if (aTime !== bTime) {
            return bTime - aTime;
        }

        // Same createdAt (e.g. migration backfill) or missing: preserve API order reversed
        return b.index - a.index;
    };

    const pinned = indexed.filter((item) => item.folder.pinned);
    const unpinned = indexed.filter((item) => !item.folder.pinned);

    return [
        ...pinned.sort(compare).map((item) => item.folder),
        ...unpinned.sort(compare).map((item) => item.folder),
    ];
}
