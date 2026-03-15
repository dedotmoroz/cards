import { create } from 'zustand'
import type { Folder } from '../types/cards'
import { foldersApi } from '../api/foldersApi'


interface FoldersState {
    // State
    folders: Folder[]
    folderCardCounts: Record<string, number>
    selectedFolderId: string | null
    isLoading: boolean
    error: string | null

    // Actions
    setFolders: (folders: Folder[]) => void
    setSelectedFolder: (id: string | null) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void

    // CRUD operations
    addFolder: (folder: Folder) => void
    updateFolder: (id: string, updates: Partial<Folder>) => void
    removeFolder: (id: string) => void

    // Card count adjustments (used by cardsStore)
    incrementFolderCount: (folderId: string) => void
    decrementFolderCount: (folderId: string) => void
    adjustFolderCountsOnMove: (sourceFolderId: string, targetFolderId: string) => void

    // API calls
    fetchFolders: () => Promise<void>
    createFolder: (name: string) => Promise<void>
    updateFolderName: (id: string, name: string) => Promise<void>
    deleteFolder: (id: string) => Promise<void>
}


export const useFoldersStore = create<FoldersState>((set, get) => ({
    // Initial state
    folders: [],
    folderCardCounts: {},
    selectedFolderId: null,
    isLoading: false,
    error: null,

    // Basic setters
    setFolders: (folders) => set({ folders }),
    setSelectedFolder: (selectedFolderId) => set({ selectedFolderId }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // CRUD operations
    addFolder: (folder) => set((state) => ({
        folders: [...state.folders, folder]
    })),

    updateFolder: (id, updates) => set((state) => ({
        folders: state.folders.map(folder =>
            folder.id === id ? { ...folder, ...updates } : folder
        )
    })),

    removeFolder: (id) => set((state) => {
        const { [id]: _, ...restCounts } = state.folderCardCounts;
        return {
            folders: state.folders.filter(folder => folder.id !== id),
            selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId,
            folderCardCounts: restCounts
        };
    }),

    incrementFolderCount: (folderId) => set((state) => ({
        folderCardCounts: {
            ...state.folderCardCounts,
            [folderId]: (state.folderCardCounts[folderId] ?? 0) + 1
        }
    })),

    decrementFolderCount: (folderId) => set((state) => ({
        folderCardCounts: {
            ...state.folderCardCounts,
            [folderId]: Math.max(0, (state.folderCardCounts[folderId] ?? 0) - 1)
        }
    })),

    adjustFolderCountsOnMove: (sourceFolderId, targetFolderId) => set((state) => {
        const counts = { ...state.folderCardCounts };
        counts[sourceFolderId] = Math.max(0, (counts[sourceFolderId] ?? 0) - 1);
        counts[targetFolderId] = (counts[targetFolderId] ?? 0) + 1;
        return { folderCardCounts: counts };
    }),

    // API calls
    fetchFolders: async () => {
        set({ error: null })
        try {
            const folders = await foldersApi.getFolders()
            const folderCardCounts = Object.fromEntries(
                folders.map((f) => [f.id, f.cardCount ?? 0])
            )
            set({ folders, folderCardCounts })
        } catch (error) {
            console.error('Error fetching folders:', error)
            set({ error: 'Failed to fetch folders' })
        }
    },

    createFolder: async (name: string) => {
        set({ error: null })
        try {
            const folder = await foldersApi.createFolder({ name })
            get().addFolder(folder)
            set((state) => ({
                folderCardCounts: { ...state.folderCardCounts, [folder.id]: 0 }
            }))
        } catch (error) {
            console.error('Error creating folder:', error)
            set({ error: 'Failed to create folder' })
        }
    },

    updateFolderName: async (id: string, name: string) => {
        set({ error: null })
        try {
            await foldersApi.updateFolder(id, { name })
            get().updateFolder(id, { name })
        } catch (error) {
            console.error('Error updating folder:', error)
            set({ error: 'Failed to update folder' })
        }
    },

    deleteFolder: async (id: string) => {
        set({ error: null })
        try {
            await foldersApi.deleteFolder(id)
            get().removeFolder(id)
        } catch (error) {
            console.error('Error deleting folder:', error)
            set({ error: 'Failed to delete folder' })
        }
    },
}))

