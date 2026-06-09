import { useFoldersStore } from '@/shared/store/foldersStore';
import type { CreateFolderData } from '@/shared/types/folders';

export const useCreateFolder = () => {
    const { createFolder, isLoading, error } = useFoldersStore();

    return {
        createFolder: (data: CreateFolderData) => createFolder(data),
        isLoading,
        error,
    };
};
