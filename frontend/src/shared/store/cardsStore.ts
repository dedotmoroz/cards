import { create } from 'zustand'
import type { Card } from '../types/cards'
import { cardsApi } from '../api/cardsApi'


interface CardsState {
    // State
    cards: Card[]
    isLoading: boolean
    error: string | null

    // Actions
    setCards: (cards: Card[]) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void

    // CRUD operations
    addCard: (card: Card) => void
    updateCard: (id: string, updates: Partial<Card>) => void
    removeCard: (id: string) => void

    // API calls
    fetchCards: (folderId: string) => Promise<void>
    createCard: (folderId: string, question: string, answer: string) => Promise<void>
    updateCardApi: (id: string, updates: { question?: string; answer?: string; questionSentences?: string | null; answerSentences?: string | null }) => Promise<void>
    updateCardLearnStatus: (id: string, isLearned: boolean) => Promise<void>
    deleteCard: (id: string) => Promise<void>
}


export const useCardsStore = create<CardsState>((set, get) => ({
    // Initial state
    cards: [],
    isLoading: false,
    error: null,

    // Basic setters
    setCards: (cards) => set({ cards }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // CRUD operations
    addCard: (card) => set((state) => ({
        cards: [...state.cards, card]
    })),

    updateCard: (id, updates) => set((state) => ({
        cards: state.cards.map(card =>
            card.id === id ? { ...card, ...updates } : card
        )
    })),

    removeCard: (id) => set((state) => ({
        cards: state.cards.filter(card => card.id !== id)
    })),

    // API calls
    fetchCards: async (folderId: string) => {
        set({ error: null })
        try {
            const cards = await cardsApi.getCards(folderId)
            set({ cards })
        } catch (error) {
            console.error('Error fetching cards:', error)
            set({ error: 'Failed to fetch cards' })
        }
    },

    createCard: async (folderId: string, question: string, answer: string) => {
        set({ error: null })
        try {
            await cardsApi.createCard({ folderId, question, answer })
            await get().fetchCards(folderId)
        } catch (error) {
            console.error('Error creating card:', error)
            set({ error: 'Failed to create card' })
        }
    },

    updateCardApi: async (id: string, updates: { question?: string; answer?: string; questionSentences?: string | null; answerSentences?: string | null }) => {
        set({ error: null })
        try {
            const updated = await cardsApi.updateCard(id, updates)
            get().updateCard(id, {
                question: updated.question,
                answer: updated.answer,
                questionSentences: updated.questionSentences,
                answerSentences: updated.answerSentences
            })
        } catch (error) {
            console.error('Error updating card:', error)
            set({ error: 'Failed to update card' })
        }
    },

    updateCardLearnStatus: async (id: string, isLearned: boolean) => {
        set({ error: null })
        try {
            await cardsApi.updateCardLearnStatus(id, { isLearned })
            get().updateCard(id, { isLearned })
        } catch (error) {
            console.error('Error updating card learn status:', error)
            set({ error: 'Failed to update card learn status' })
        }
    },

    deleteCard: async (id: string) => {
        set({ error: null })
        try {
            await cardsApi.deleteCard(id)
            get().removeCard(id)
        } catch (error) {
            console.error('Error deleting card:', error)
            set({ error: 'Failed to delete card' })
        }
    },
}))
