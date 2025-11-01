import { useFoldersStore } from '@/shared/store/foldersStore';

export const useCreateFolder = () => {
    const { createFolder, isLoading, error } = useFoldersStore();
    
    return { 
        createFolder, 
        isLoading, 
        error 
    };
};