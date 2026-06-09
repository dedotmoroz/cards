
import { useCardsStore } from '@/shared/store/cardsStore';

export function useCreateCard() {
  const { createCard, isLoading, error } = useCardsStore();

  return { 
    createCard, 
    isLoading, 
    error 
  };
}