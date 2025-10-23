import { create } from 'zustand'
import type { Folder, Card } from '../types/cards'
import { cardsApi } from '../api/cardsApi'
import { foldersApi } from '../api/foldersApi'


interface CardsState {
    // State
    folders: Folder[]
    cards: Card[]
    selectedFolderId: string | null
    isLoading: boolean
    error: string | null
    
    // Actions
    setFolders: (folders: Folder[]) => void
    setCards: (cards: Card[]) => void
    setSelectedFolder: (id: string | null) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    
    // CRUD operations
    addFolder: (folder: Folder) => void
    addCard: (card: Card) => void
    updateCard: (id: string, updates: Partial<Card>) => void
    updateFolder: (id: string, updates: Partial<Folder>) => void
    removeFolder: (id: string) => void
    removeCard: (id: string) => void
    
    // API calls
    fetchFolders: () => Promise<void>
    fetchCards: (folderId: string) => Promise<void>
    createFolder: (name: string) => Promise<void>
    createCard: (folderId: string, question: string, answer: string) => Promise<void>
    updateFolderName: (id: string, name: string) => Promise<void>
    deleteFolder: (id: string) => Promise<void>
    updateCardApi: (id: string, updates: { question?: string; answer?: string }) => Promise<void>
    updateCardLearnStatus: (id: string, isLearned: boolean) => Promise<void>
    deleteCard: (id: string) => Promise<void>
}


export const useCardsStore = create<CardsState>((set, get) => ({
    // Initial state
    folders: [],
    cards: [],
    selectedFolderId: null,
    isLoading: false,
    error: null,
    
    // Basic setters
    setFolders: (folders) => set({ folders }),
    setCards: (cards) => set({ cards }),
    setSelectedFolder: (selectedFolderId) => set({ selectedFolderId }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    
    // CRUD operations
    addFolder: (folder) => set((state) => ({ 
        folders: [...state.folders, folder] 
    })),
    
    addCard: (card) => set((state) => ({ 
        cards: [...state.cards, card] 
    })),
    
    updateCard: (id, updates) => set((state) => ({
        cards: state.cards.map(card => 
            card.id === id ? { ...card, ...updates } : card
        )
    })),
    
    updateFolder: (id, updates) => set((state) => ({
        folders: state.folders.map(folder => 
            folder.id === id ? { ...folder, ...updates } : folder
        )
    })),
    
    removeFolder: (id) => set((state) => ({
        folders: state.folders.filter(folder => folder.id !== id),
        selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId
    })),

    removeCard: (id) => set((state) => ({
        cards: state.cards.filter(card => card.id !== id),
    })),
    
    // API calls
    fetchFolders: async () => {
        set({ isLoading: true, error: null })
        try {
            const folders = await foldersApi.getFolders()
            set({ folders })
        } catch (error) {
            console.error('Error fetching folders:', error)
            set({ error: 'Failed to fetch folders' })
        } finally {
            set({ isLoading: false })
        }
    },
    
    fetchCards: async (folderId: string) => {
        console.log('fetchCards called with folderId:', folderId);
        set({ isLoading: true, error: null, selectedFolderId: folderId })
        try {
            const cards = await cardsApi.getCards(folderId)
            console.log('Cards fetched:', cards.length);
            set({ cards })
        } catch (error) {
            console.error('Error fetching cards:', error)
            set({ error: 'Failed to fetch cards' })
        } finally {
            set({ isLoading: false })
        }
    },
    
    createFolder: async (name: string) => {
        set({ isLoading: true, error: null })
        try {
            await foldersApi.createFolder({ name })
            // Перезагружаем папки с бэкенда для сохранения порядка
            await get().fetchFolders()
        } catch (error) {
            console.error('Error creating folder:', error)
            set({ error: 'Failed to create folder' })
        } finally {
            set({ isLoading: false })
        }
    },
    
    createCard: async (folderId: string, question: string, answer: string) => {
        set({ isLoading: true, error: null })
        try {
            await cardsApi.createCard({ folderId, question, answer })
            // Перезагружаем карточки с бэкенда для сохранения порядка
            await get().fetchCards(folderId)
        } catch (error) {
            console.error('Error creating card:', error)
            set({ error: 'Failed to create card' })
        } finally {
            set({ isLoading: false })
        }
    },
    
    updateFolderName: async (id: string, name: string) => {
        set({ isLoading: true, error: null })
        try {
            await foldersApi.updateFolder(id, { name })
            // Update local state immediately
            get().updateFolder(id, { name })
        } catch (error) {
            console.error('Error updating folder:', error)
            set({ error: 'Failed to update folder' })
        } finally {
            set({ isLoading: false })
        }
    },
    
    deleteFolder: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
            await foldersApi.deleteFolder(id)
            // Remove from local state immediately
            get().removeFolder(id)
        } catch (error) {
            console.error('Error deleting folder:', error)
            set({ error: 'Failed to delete folder' })
        } finally {
            set({ isLoading: false })
        }
    },

    updateCardApi: async (id: string, updates: { question?: string; answer?: string }) => {
        set({ isLoading: true, error: null })
        try {
            const updated = await cardsApi.updateCard(id, updates)
            // Sync local state
            get().updateCard(id, { 
                question: updated.question, 
                answer: updated.answer 
            })
        } catch (error) {
            console.error('Error updating card:', error)
            set({ error: 'Failed to update card' })
        } finally {
            set({ isLoading: false })
        }
    },

    updateCardLearnStatus: async (id: string, isLearned: boolean) => {
        set({ isLoading: true, error: null })
        try {
            await cardsApi.updateCardLearnStatus(id, { isLearned })
            // Update local state immediately
            get().updateCard(id, { isLearned })
        } catch (error) {
            console.error('Error updating card learn status:', error)
            set({ error: 'Failed to update card learn status' })
        } finally {
            set({ isLoading: false })
        }
    },

    deleteCard: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
            await cardsApi.deleteCard(id)
            get().removeCard(id)
        } catch (error) {
            console.error('Error deleting card:', error)
            set({ error: 'Failed to delete card' })
        } finally {
            set({ isLoading: false })
        }
    },
}))
