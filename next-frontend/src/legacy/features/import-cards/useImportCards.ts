import { useCardsStore } from '@/shared/store/cardsStore';

export const useImportCards = () => {
    const { createCard, isLoading } = useCardsStore();

    const importCards = async (
        folderId: string, 
        cards: { question: string; answer: string }[]
    ) => {
        // Создаем карточки последовательно
        for (const card of cards) {
            await createCard(folderId, card.question, card.answer);
        }
    };

    return {
        importCards,
        isLoading
    };
};
