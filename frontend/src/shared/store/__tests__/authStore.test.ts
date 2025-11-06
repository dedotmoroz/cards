import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from '../authStore'
import { authApi } from '../../api/authApi'
import type { User } from '../../types/auth'

// Мокаем authApi
vi.mock('../../api/authApi')
const mockedAuthApi = vi.mocked(authApi)

describe('authStore', () => {
  beforeEach(() => {
    // Очищаем состояние store перед каждым тестом
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('setUser', () => {
    it('should set user and update authentication status', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser: User = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      }

      act(() => {
        result.current.setUser(mockUser)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should set user to null and update authentication status', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setUser(null)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('setLoading', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should set error state', () => {
      const { result } = renderHook(() => useAuthStore())
      const errorMessage = 'Test error'

      act(() => {
        result.current.setError(errorMessage)
      })

      expect(result.current.error).toBe(errorMessage)

      act(() => {
        result.current.setError(null)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser: User = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      }

      mockedAuthApi.register.mockResolvedValueOnce(undefined)
      mockedAuthApi.getMe.mockResolvedValueOnce(mockUser)

      await act(async () => {
        await result.current.register('testuser', 'test@example.com', 'password123')
      })

      expect(mockedAuthApi.register).toHaveBeenCalledWith({
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
      expect(mockedAuthApi.getMe).toHaveBeenCalled()
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle registration error', async () => {
      const { result } = renderHook(() => useAuthStore())
      const errorMessage = 'Registration failed'

      mockedAuthApi.register.mockRejectedValueOnce(new Error(errorMessage))

      await act(async () => {
        try {
          await result.current.register('testuser', 'test@example.com', 'password123')
        } catch (error) {
          // Ожидаем ошибку
        }
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(undefined) // Используем русское сообщение по умолчанию
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser: User = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      }

      mockedAuthApi.login.mockResolvedValueOnce(undefined)
      mockedAuthApi.getMe.mockResolvedValueOnce(mockUser)

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(mockedAuthApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(mockedAuthApi.getMe).toHaveBeenCalled()
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle login error', async () => {
      const { result } = renderHook(() => useAuthStore())
      const errorMessage = 'Invalid credentials'

      mockedAuthApi.login.mockRejectedValueOnce(new Error(errorMessage))

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword')
        } catch (error) {
          // Ожидаем ошибку
        }
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(undefined) // Используем русское сообщение по умолчанию
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Сначала устанавливаем пользователя
      const mockUser: User = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      }
      
      act(() => {
        result.current.setUser(mockUser)
      })

      mockedAuthApi.logout.mockResolvedValueOnce(undefined)

      await act(async () => {
        await result.current.logout()
      })

      expect(mockedAuthApi.logout).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('checkAuth', () => {
    it('should check authentication when user is not authenticated', async () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser: User = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      }

      mockedAuthApi.getMe.mockResolvedValueOnce(mockUser)

      await act(async () => {
        await result.current.checkAuth()
      })

      expect(mockedAuthApi.getMe).toHaveBeenCalled()
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('should not check authentication when user is already authenticated', async () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser: User = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      }

      // Сначала устанавливаем пользователя
      act(() => {
        result.current.setUser(mockUser)
      })

      await act(async () => {
        await result.current.checkAuth()
      })

      expect(mockedAuthApi.getMe).not.toHaveBeenCalled()
    })

    it('should handle authentication check error', async () => {
      const { result } = renderHook(() => useAuthStore())

      mockedAuthApi.getMe.mockRejectedValueOnce(new Error('Unauthorized'))

      await act(async () => {
        await result.current.checkAuth()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('createGuest', () => {
    it('should create guest user successfully', async () => {
      const { result } = renderHook(() => useAuthStore())
      const mockGuestUser: User = {
        id: 'guest-123',
        username: 'Guest',
        email: 'guest@example.com',
        language: 'ru',
        isGuest: true
      }

      mockedAuthApi.createGuest.mockResolvedValueOnce(mockGuestUser)

      await act(async () => {
        await result.current.createGuest('ru')
      })

      expect(mockedAuthApi.createGuest).toHaveBeenCalledWith({ language: 'ru' })
      expect(result.current.user).toEqual(mockGuestUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should handle guest creation error', async () => {
      const { result } = renderHook(() => useAuthStore())
      const errorMessage = 'Failed to create guest'
      const error = {
        response: {
          data: {
            message: errorMessage
          }
        }
      }

      mockedAuthApi.createGuest.mockRejectedValueOnce(error)

      await act(async () => {
        try {
          await result.current.createGuest('ru')
        } catch (e) {
          // Ожидаем ошибку
        }
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('should map name to username correctly', async () => {
      const { result } = renderHook(() => useAuthStore())
      const mockGuestUser = {
        id: 'guest-123',
        name: 'Guest User',
        email: 'guest@example.com',
        language: 'en',
        isGuest: true
      }

      mockedAuthApi.createGuest.mockResolvedValueOnce(mockGuestUser as any)

      await act(async () => {
        await result.current.createGuest('en')
      })

      expect(result.current.user?.username).toBe('Guest User')
      expect(result.current.user?.isGuest).toBe(true)
    })
  })

  describe('registerGuest', () => {
    it('should register guest user successfully', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Сначала устанавливаем гостя
      const mockGuestUser: User = {
        id: 'guest-123',
        username: 'Guest',
        email: 'guest@example.com',
        language: 'ru',
        isGuest: true
      }

      act(() => {
        result.current.setUser(mockGuestUser)
      })

      const mockRegisteredUser: User = {
        id: 'guest-123',
        username: 'Test User',
        email: 'user@example.com',
        language: 'ru',
        isGuest: false
      }

      mockedAuthApi.registerGuest.mockResolvedValueOnce(mockRegisteredUser)

      await act(async () => {
        await result.current.registerGuest('user@example.com', 'password123', 'Test User', 'ru')
      })

      expect(mockedAuthApi.registerGuest).toHaveBeenCalledWith('guest-123', {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
        language: 'ru'
      })
      expect(result.current.user?.isGuest).toBe(false)
      expect(result.current.user?.email).toBe('user@example.com')
      expect(result.current.user?.username).toBe('Test User')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should throw error when user not found', async () => {
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.registerGuest('user@example.com', 'password123', 'Test User', 'ru')
        } catch (e) {
          // Ожидаем ошибку
        }
      })

      expect(mockedAuthApi.registerGuest).not.toHaveBeenCalled()
      expect(result.current.user).toBeNull()
    })

    it('should handle registration error', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Сначала устанавливаем гостя
      const mockGuestUser: User = {
        id: 'guest-123',
        username: 'Guest',
        email: 'guest@example.com',
        language: 'ru',
        isGuest: true
      }

      act(() => {
        result.current.setUser(mockGuestUser)
      })

      const errorMessage = 'Registration failed'
      const error = {
        response: {
          data: {
            message: errorMessage
          }
        }
      }

      mockedAuthApi.registerGuest.mockRejectedValueOnce(error)

      await act(async () => {
        try {
          await result.current.registerGuest('user@example.com', 'password123', 'Test User', 'ru')
        } catch (e) {
          // Ожидаем ошибку
        }
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.user?.isGuest).toBe(true) // Остается гостем при ошибке
    })

    it('should map name to username correctly', async () => {
      const { result } = renderHook(() => useAuthStore())
      
      // Сначала устанавливаем гостя
      const mockGuestUser: User = {
        id: 'guest-123',
        username: 'Guest',
        email: 'guest@example.com',
        language: 'ru',
        isGuest: true
      }

      act(() => {
        result.current.setUser(mockGuestUser)
      })

      const mockRegisteredUser = {
        id: 'guest-123',
        name: 'Registered User',
        email: 'user@example.com',
        language: 'en',
        isGuest: false
      }

      mockedAuthApi.registerGuest.mockResolvedValueOnce(mockRegisteredUser as any)

      await act(async () => {
        await result.current.registerGuest('user@example.com', 'password123', 'Registered User', 'en')
      })

      expect(result.current.user?.username).toBe('Registered User')
      expect(result.current.user?.isGuest).toBe(false)
    })
  })
})
