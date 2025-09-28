import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { foldersApi } from '../foldersApi'
import { useAuthStore } from '../../store/authStore'
import type { Folder, CreateFolderData, UpdateFolderData } from '../../types/folders'

// Мокаем authStore
vi.mock('../../store/authStore')
const mockedAuthStore = vi.mocked(useAuthStore)

// Создаем mock сервер
const server = setupServer(
  // Mock для получения папок
  http.get('http://localhost:3000/folders/:userId', () => {
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
    return HttpResponse.json(mockFolders, { status: 200 })
  }),

  // Mock для создания папки
  http.post('http://localhost:3000/folders', () => {
    const mockFolder: Folder = {
      id: 'folder-123',
      name: 'New Folder',
      userId: 'user-123'
    }
    return HttpResponse.json(mockFolder, { status: 201 })
  }),

  // Mock для обновления папки
  http.patch('http://localhost:3000/folders/:id', () => {
    const mockUpdatedFolder: Folder = {
      id: 'folder-123',
      name: 'Updated Folder Name',
      userId: 'user-123'
    }
    return HttpResponse.json(mockUpdatedFolder, { status: 200 })
  }),

  // Mock для удаления папки
  http.delete('http://localhost:3000/folders/:id', () => {
    return HttpResponse.json({}, { status: 200 })
  })
)

describe('foldersApi Integration Tests', () => {
  beforeAll(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('getFolders', () => {
    it('should get folders successfully when user is authenticated', async () => {
      // Arrange
      const mockUserId = 'user-123'
      mockedAuthStore.getState.mockReturnValue({
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
      })

      // Act
      const result = await foldersApi.getFolders()

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'folder-1',
        name: 'React Basics',
        userId: 'user-123'
      })
      expect(result[1]).toEqual({
        id: 'folder-2',
        name: 'TypeScript',
        userId: 'user-123'
      })
    })

    it('should handle get folders error', async () => {
      // Arrange
      const mockUserId = 'user-123'
      mockedAuthStore.getState.mockReturnValue({
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
      })

      // Переопределяем handler для возврата ошибки
      server.use(
        http.get('http://localhost:3000/folders/:userId', () => {
          return HttpResponse.json(
            { message: 'Failed to get folders' },
            { status: 500 }
          )
        })
      )

      // Act & Assert
      await expect(foldersApi.getFolders()).rejects.toThrow()
    })
  })

  describe('createFolder', () => {
    it('should create folder successfully when user is authenticated', async () => {
      // Arrange
      const mockUserId = 'user-123'
      const createData: CreateFolderData = {
        name: 'New Folder'
      }

      mockedAuthStore.getState.mockReturnValue({
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
      })

      // Act
      const result = await foldersApi.createFolder(createData)

      // Assert
      expect(result).toEqual({
        id: 'folder-123',
        name: 'New Folder',
        userId: 'user-123'
      })
    })

    it('should handle creation error', async () => {
      // Arrange
      const mockUserId = 'user-123'
      const createData: CreateFolderData = {
        name: 'New Folder'
      }

      mockedAuthStore.getState.mockReturnValue({
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
      })

      // Переопределяем handler для возврата ошибки
      server.use(
        http.post('http://localhost:3000/folders', () => {
          return HttpResponse.json(
            { message: 'Failed to create folder' },
            { status: 400 }
          )
        })
      )

      // Act & Assert
      await expect(foldersApi.createFolder(createData)).rejects.toThrow()
    })
  })

  describe('updateFolder', () => {
    it('should update folder successfully', async () => {
      // Arrange
      const updateData: UpdateFolderData = {
        name: 'Updated Folder Name'
      }

      // Act
      const result = await foldersApi.updateFolder('folder-123', updateData)

      // Assert
      expect(result).toEqual({
        id: 'folder-123',
        name: 'Updated Folder Name',
        userId: 'user-123'
      })
    })

    it('should handle update error', async () => {
      // Arrange
      const updateData: UpdateFolderData = {
        name: 'Updated Folder Name'
      }

      // Переопределяем handler для возврата ошибки
      server.use(
        http.patch('http://localhost:3000/folders/:id', () => {
          return HttpResponse.json(
            { message: 'Failed to update folder' },
            { status: 400 }
          )
        })
      )

      // Act & Assert
      await expect(foldersApi.updateFolder('folder-123', updateData)).rejects.toThrow()
    })
  })

  describe('deleteFolder', () => {
    it('should delete folder successfully', async () => {
      // Act
      await expect(foldersApi.deleteFolder('folder-123')).resolves.not.toThrow()
    })

    it('should handle delete error', async () => {
      // Переопределяем handler для возврата ошибки
      server.use(
        http.delete('http://localhost:3000/folders/:id', () => {
          return HttpResponse.json(
            { message: 'Failed to delete folder' },
            { status: 500 }
          )
        })
      )

      // Act & Assert
      await expect(foldersApi.deleteFolder('folder-123')).rejects.toThrow()
    })
  })
})
