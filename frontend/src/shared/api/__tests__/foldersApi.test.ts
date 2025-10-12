import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { foldersApi } from '../foldersApi'
import { useAuthStore } from '../../store/authStore'
import type { Folder, CreateFolderData, UpdateFolderData } from '../../types/folders'

// Мокаем axios и authStore
vi.mock('axios')
vi.mock('../../store/authStore')
const mockedAxios = axios as any

const getStateSpy = vi.spyOn(useAuthStore as any, 'getState')

describe('foldersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFolders', () => {
    it('should get folders successfully when user is authenticated', async () => {
      // Arrange
      const mockUserId = 'user-123'
      const mockFolders: Folder[] = [
        {
          id: 'folder-1',
          name: 'React Basics',
          userId: 'user-123'
        },
        {
          id: 'folder-2',
          name: 'TypeScript',
          userId: 'user-123'
        }
      ]

      getStateSpy.mockReturnValue({
        user: { id: mockUserId, username: 'testuser', email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        setUser: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      } as any)

      mockedAxios.get.mockResolvedValueOnce({ data: mockFolders })

      // Act
      const result = await foldersApi.getFolders()

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/folders/user-123'
      )
      expect(result).toEqual(mockFolders)
    })

    it('should throw error on API failure', async () => {
      // Arrange
      const mockUserId = 'user-123'
      getStateSpy.mockReturnValue({
        user: { id: mockUserId, username: 'testuser', email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        setUser: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      } as any)

      const errorMessage = 'Failed to get folders'
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(foldersApi.getFolders()).rejects.toThrow(errorMessage)
    })

    it('should throw error when user is not authenticated', async () => {
      // Arrange
      getStateSpy.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        setUser: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      } as any)

      // Act & Assert
      await expect(foldersApi.getFolders()).rejects.toThrow('User not authenticated')
    })
  })

  describe('createFolder', () => {
    it('should create folder successfully when user is authenticated', async () => {
      // Arrange
      const mockUserId = 'user-123'
      const createData: CreateFolderData = {
        name: 'New Folder'
      }

      const mockFolder: Folder = {
        id: 'folder-123',
        name: 'New Folder',
        userId: 'user-123'
      }

      getStateSpy.mockReturnValue({
        user: { id: mockUserId, username: 'testuser', email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        setUser: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      } as any)

      mockedAxios.post.mockResolvedValueOnce({ data: mockFolder })

      // Act
      const result = await foldersApi.createFolder(createData)

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/folders',
        {
          ...createData,
          userId: mockUserId
        }
      )
      expect(result).toEqual(mockFolder)
    })

    it('should throw error when user is not authenticated', async () => {
      // Arrange
      const createData: CreateFolderData = {
        name: 'New Folder'
      }

      getStateSpy.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        setUser: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      } as any)

      // Act & Assert
      await expect(foldersApi.createFolder(createData)).rejects.toThrow('User not authenticated')
    })

    it('should throw error on creation failure', async () => {
      // Arrange
      const mockUserId = 'user-123'
      const createData: CreateFolderData = {
        name: 'New Folder'
      }

      getStateSpy.mockReturnValue({
        user: { id: mockUserId, username: 'testuser', email: 'test@example.com' },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        setUser: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn(),
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn()
      } as any)

      const errorMessage = 'Failed to create folder'
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(foldersApi.createFolder(createData)).rejects.toThrow(errorMessage)
    })
  })

  describe('updateFolder', () => {
    it('should update folder successfully', async () => {
      // Arrange
      const folderId = 'folder-123'
      const updateData: UpdateFolderData = {
        name: 'Updated Folder Name'
      }

      const mockUpdatedFolder: Folder = {
        id: 'folder-123',
        name: 'Updated Folder Name',
        userId: 'user-123'
      }

      mockedAxios.patch.mockResolvedValueOnce({ data: mockUpdatedFolder })

      // Act
      const result = await foldersApi.updateFolder(folderId, updateData)

      // Assert
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        'http://localhost:3000/folders/folder-123',
        updateData
      )
      expect(result).toEqual(mockUpdatedFolder)
    })

    it('should throw error on update failure', async () => {
      // Arrange
      const folderId = 'folder-123'
      const updateData: UpdateFolderData = {
        name: 'Updated Folder Name'
      }

      const errorMessage = 'Failed to update folder'
      mockedAxios.patch.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(foldersApi.updateFolder(folderId, updateData)).rejects.toThrow(errorMessage)
    })
  })

  describe('deleteFolder', () => {
    it('should delete folder successfully', async () => {
      // Arrange
      const folderId = 'folder-123'
      mockedAxios.delete.mockResolvedValueOnce({ data: {} })

      // Act
      await foldersApi.deleteFolder(folderId)

      // Assert
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:3000/folders/folder-123'
      )
    })

    it('should throw error on delete failure', async () => {
      // Arrange
      const folderId = 'folder-123'
      const errorMessage = 'Failed to delete folder'
      mockedAxios.delete.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(foldersApi.deleteFolder(folderId)).rejects.toThrow(errorMessage)
    })
  })

  describe('axios configuration', () => {
    it('should set withCredentials to true', () => {
      // Assert
      expect(axios.defaults.withCredentials).toBe(true)
    })
  })
})
