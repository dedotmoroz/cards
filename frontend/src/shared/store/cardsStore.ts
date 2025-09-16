import { create } from 'zustand'
import axios from 'axios'

export type Folder = {
    id: string;
    name: string;
    userId: string;
}

export type Card = {
    id: string;
    question: string;
    answer: string;
    isLearned: boolean;
    folderId: string;
}

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

const USER_ID = '11111111-1111-1111-1111-111111111111'

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
            const res = await axios.get<Folder[]>(`http://localhost:3000/folders/${USER_ID}`)
            set({ folders: res.data })
        } catch (error) {
            console.error('Error fetching folders:', error)
            set({ error: 'Failed to fetch folders' })
        } finally {
            set({ isLoading: false })
        }
    },
    
    fetchCards: async (folderId: string) => {
        set({ isLoading: true, error: null })
        try {
            const res = await axios.get<Card[]>(`http://localhost:3000/cards/folder/${folderId}`)
            set({ cards: res.data })
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
            const res = await axios.post('http://localhost:3000/folders', {
                name,
                userId: USER_ID,
            })
            const newFolder = res.data
            
            // Add to local state immediately
            get().addFolder(newFolder)
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
            const res = await axios.post('http://localhost:3000/cards', {
                folderId,
                question,
                answer,
            })
            const newCard = res.data
            
            // Add to local state immediately
            get().addCard(newCard)
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
            await axios.patch(`http://localhost:3000/folders/${id}`, { name })
            
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
            await axios.delete(`http://localhost:3000/folders/${id}`)
            
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
            const res = await axios.patch(`http://localhost:3000/cards/${id}`, updates)
            const updated = res.data as Card
            // Sync local state
            get().updateCard(id, { question: updated.question, answer: updated.answer })
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
            await axios.patch(`http://localhost:3000/cards/${id}/learn-status`, { isLearned })
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
            await axios.delete(`http://localhost:3000/cards/${id}`)
            get().removeCard(id)
        } catch (error) {
            console.error('Error deleting card:', error)
            set({ error: 'Failed to delete card' })
        } finally {
            set({ isLoading: false })
        }
    },
}))
