import { useCardsStore } from '@/shared/store/cardsStore';

export const useCreateFolder = () => {
    const { createFolder, isLoading, error } = useCardsStore();
    
    return { 
        createFolder, 
        isLoading, 
        error 
    };
};