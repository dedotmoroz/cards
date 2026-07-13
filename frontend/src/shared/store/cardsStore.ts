import { create } from 'zustand'
import type { Card, CardGenerationRequest, ReviewOutcome, UpdateCardData } from '../types/cards'
import { cardsApi } from '../api/cardsApi'
import { useFoldersStore } from './foldersStore'

const POLLING_INTERVAL_MS = 2000
const generationTimers = new Map<string, number>()

export type CardGenerationState = {
    status: 'idle' | 'pending' | 'polling' | 'completed' | 'failed'
    progress?: number
    error?: string
}

const clearGenerationTimer = (cardId: string) => {
    const timerId = generationTimers.get(cardId)
    if (timerId !== undefined) {
        clearTimeout(timerId)
        generationTimers.delete(cardId)
    }
}

export const __cardsStoreInternals = {
    resetGenerationTimers: () => {
        generationTimers.forEach((timerId) => {
            clearTimeout(timerId)
        })
        generationTimers.clear()
    },
}


interface CardsState {
    // State
    cards: Card[]
    isLoading: boolean
    error: string | null
    generationStatuses: Record<string, CardGenerationState>

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
    fetchVirtualCards: (kind: 'remember' | 'hard', limit?: number) => Promise<void>
    createCard: (folderId: string, question: string, answer: string) => Promise<void>
    updateCardApi: (id: string, updates: UpdateCardData) => Promise<void>
    deleteCardContext: (cardId: string, contextId: string) => Promise<void>
    updateCardLearnStatus: (id: string, isLearned: boolean) => Promise<void>
    updateFolderLearnStatus: (folderId: string, isLearned: boolean) => Promise<void>
    reviewCard: (id: string, outcome: ReviewOutcome) => Promise<void>
    deleteCard: (id: string) => Promise<void>
    moveCardToFolder: (cardId: string, targetFolderId: string) => Promise<void>
    generateCardSentences: (id: string, options?: CardGenerationRequest) => Promise<void>
    generateAllCardsSentences: (options?: CardGenerationRequest) => Promise<void>
}


export const useCardsStore = create<CardsState>((set, get) => ({
    // Initial state
    cards: [],
    isLoading: false,
    error: null,
    generationStatuses: {},

    // Basic setters
    setCards: (cards) => set((state) => {
        const nextStatuses: Record<string, CardGenerationState> = {}
        const keepIds = new Set<string>()

        for (const card of cards) {
            const status = state.generationStatuses[card.id]
            if (status) {
                nextStatuses[card.id] = status
            }
            keepIds.add(card.id)
        }

        for (const cardId of Object.keys(state.generationStatuses)) {
            if (!keepIds.has(cardId)) {
                clearGenerationTimer(cardId)
            }
        }

        return { cards, generationStatuses: nextStatuses }
    }),
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

    removeCard: (id) => {
        clearGenerationTimer(id)
        set((state) => {
            const { [id]: _removed, ...restStatuses } = state.generationStatuses
            return {
                cards: state.cards.filter(card => card.id !== id),
                generationStatuses: restStatuses,
            }
        })
    },

    // API calls
    fetchCards: async (folderId: string) => {
        set({ error: null, isLoading: true })
        try {
            const cards = await cardsApi.getCards(folderId)
            get().setCards(cards)
        } catch (error) {
            console.error('Error fetching cards:', error)
            set({ error: 'Failed to fetch cards' })
        } finally {
            set({ isLoading: false })
        }
    },

    fetchVirtualCards: async (kind: 'remember' | 'hard', limit?: number) => {
        set({ error: null, isLoading: true })
        try {
            const cards =
                kind === 'remember'
                    ? await cardsApi.getVirtualRemember({ limit })
                    : await cardsApi.getVirtualHard({ limit })
            get().setCards(cards)
        } catch (error) {
            console.error('Error fetching virtual cards:', error)
            set({ error: 'Failed to fetch cards' })
        } finally {
            set({ isLoading: false })
        }
    },

    createCard: async (folderId: string, question: string, answer: string) => {
        set({ error: null })
        try {
            await cardsApi.createCard({ folderId, question, answer })
            await get().fetchCards(folderId)
            useFoldersStore.getState().incrementFolderCount(folderId)
        } catch (error) {
            console.error('Error creating card:', error)
            set({ error: 'Failed to create card' })
        }
    },

    updateCardApi: async (id: string, updates: UpdateCardData) => {
        set({ error: null })
        try {
            const updated = await cardsApi.updateCard(id, updates)
            get().updateCard(id, {
                question: updated.question,
                answer: updated.answer,
                questionSentences: updated.questionSentences,
                answerSentences: updated.answerSentences,
                contexts: updated.contexts,
                activeContextId: updated.activeContextId,
            })
        } catch (error) {
            console.error('Error updating card:', error)
            set({ error: 'Failed to update card' })
        }
    },

    deleteCardContext: async (cardId: string, contextId: string) => {
        set({ error: null })
        try {
            const updated = await cardsApi.deleteCardContext(cardId, contextId)
            get().updateCard(cardId, {
                questionSentences: updated.questionSentences,
                answerSentences: updated.answerSentences,
                contexts: updated.contexts,
                activeContextId: updated.activeContextId,
            })
        } catch (error) {
            console.error('Error deleting card context:', error)
            set({ error: 'Failed to delete card context' })
        }
    },

    updateCardLearnStatus: async (id: string, isLearned: boolean) => {
        set({ error: null })
        try {
            await cardsApi.updateCardLearnStatus(id, { isLearned })
            get().updateCard(id, { isLearned })
            await useFoldersStore.getState().refreshVirtualFolderCounts()
        } catch (error) {
            console.error('Error updating card learn status:', error)
            set({ error: 'Failed to update card learn status' })
        }
    },

    updateFolderLearnStatus: async (folderId: string, isLearned: boolean) => {
        set({ error: null })
        try {
            await cardsApi.updateFolderLearnStatus(folderId, { isLearned })
            set((state) => ({
                cards: state.cards.map((card) => ({ ...card, isLearned })),
            }))
            await useFoldersStore.getState().refreshVirtualFolderCounts()
        } catch (error) {
            console.error('Error updating folder learn status:', error)
            set({ error: 'Failed to update folder learn status' })
        }
    },

    reviewCard: async (id: string, outcome: ReviewOutcome) => {
        set({ error: null })
        try {
            const updated = await cardsApi.reviewCard(id, { outcome })
            get().updateCard(id, {
                question: updated.question,
                answer: updated.answer,
                questionSentences: updated.questionSentences,
                answerSentences: updated.answerSentences,
                contexts: updated.contexts,
                activeContextId: updated.activeContextId,
                isLearned: updated.isLearned,
                folderId: updated.folderId,
            })
            await useFoldersStore.getState().refreshVirtualFolderCounts()
        } catch (error) {
            console.error('Error reviewing card:', error)
            set({ error: 'Failed to review card' })
        }
    },

    deleteCard: async (id: string) => {
        set({ error: null })
        try {
            const card = get().cards.find((c) => c.id === id)
            await cardsApi.deleteCard(id)
            get().removeCard(id)
            if (card?.folderId) {
                useFoldersStore.getState().decrementFolderCount(card.folderId)
            }
            await useFoldersStore.getState().refreshVirtualFolderCounts()
        } catch (error) {
            console.error('Error deleting card:', error)
            set({ error: 'Failed to delete card' })
        }
    },

    moveCardToFolder: async (cardId: string, targetFolderId: string) => {
        set({ error: null })
        try {
            const card = get().cards.find((c) => c.id === cardId)
            await cardsApi.moveCardToFolder(cardId, targetFolderId)
            get().removeCard(cardId)
            if (card?.folderId && card.folderId !== targetFolderId) {
                useFoldersStore.getState().adjustFolderCountsOnMove(card.folderId, targetFolderId)
            }
        } catch (error) {
            console.error('Error moving card:', error)
            set({ error: 'Failed to move card' })
        }
    },

    generateCardSentences: async (id: string, options?: CardGenerationRequest) => {
        set({ error: null })
        clearGenerationTimer(id)
        set((state) => ({
            generationStatuses: {
                ...state.generationStatuses,
                [id]: { status: 'pending', progress: 0 },
            },
        }))

        try {
            const { jobId } = await cardsApi.generateCardSentences(id, options ?? {})

            set((state) => ({
                generationStatuses: {
                    ...state.generationStatuses,
                    [id]: { status: 'polling', progress: 0 },
                },
            }))

            const poll = async (): Promise<void> => {
                try {
                    const response = await cardsApi.getCardGenerationStatus(id, {
                        jobId,
                        replaceOldest: options?.replaceOldest,
                    })
                    const progressValue =
                        typeof response.progress === 'number' ? response.progress : 0

                    if (response.status === 'completed' && response.card) {
                        clearGenerationTimer(id)
                        set((state) => ({
                            cards: state.cards.map((card) =>
                                card.id === id ? response.card! : card
                            ),
                            generationStatuses: {
                                ...state.generationStatuses,
                                [id]: { status: 'completed', progress: 100 },
                            },
                        }))
                        return
                    }

                    if (response.status === 'failed') {
                        clearGenerationTimer(id)
                        set((state) => ({
                            generationStatuses: {
                                ...state.generationStatuses,
                                [id]: {
                                    status: 'failed',
                                    progress: progressValue,
                                    error: response.error ?? 'Generation failed',
                                },
                            },
                        }))
                        return
                    }

                    set((state) => ({
                        generationStatuses: {
                            ...state.generationStatuses,
                            [id]: {
                                status: 'polling',
                                progress: progressValue,
                            },
                        },
                    }))

                    schedule()
                } catch (error) {
                    console.error('Error polling generation status:', error)
                    clearGenerationTimer(id)
                    set((state) => ({
                        generationStatuses: {
                            ...state.generationStatuses,
                            [id]: {
                                status: 'failed',
                                error: 'Failed to fetch generation status',
                            },
                        },
                    }))
                }
            }

            function schedule() {
                clearGenerationTimer(id)
                const timerId = window.setTimeout(() => {
                    poll().catch((error) => {
                        console.error('Error polling generation status:', error)
                    })
                }, POLLING_INTERVAL_MS)
                generationTimers.set(id, timerId)
            }

            await poll()
        } catch (error) {
            console.error('Error starting generation:', error)
            clearGenerationTimer(id)
            set((state) => ({
                generationStatuses: {
                    ...state.generationStatuses,
                    [id]: {
                        status: 'failed',
                        error: 'Failed to start generation',
                    },
                },
            }))
        }
    },

    generateAllCardsSentences: async (options?: CardGenerationRequest) => {
        const { cards } = get()
        // Запускаем генерацию для всех карточек параллельно
        await Promise.allSettled(
            cards.map(card => get().generateCardSentences(card.id, options))
        )
    },
}))
