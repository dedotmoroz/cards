import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { authApi } from '../authApi'
import type { User, RegisterData, LoginData, GuestData, RegisterGuestData } from '../../types/auth'

// Мокаем axios
vi.mock('axios')
const mockedAxios = axios as any

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      // Arrange
      const registerData: RegisterData = {
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      // Act
      await authApi.register(registerData)

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/auth/register',
        registerData,
        { withCredentials: true }
      )
    })

    it('should throw error on registration failure', async () => {
      // Arrange
      const registerData: RegisterData = {
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      const errorMessage = 'Registration failed'
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(authApi.register(registerData)).rejects.toThrow(errorMessage)
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      // Act
      await authApi.login(loginData)

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/auth/login',
        loginData,
        { withCredentials: true }
      )
    })

    it('should throw error on login failure', async () => {
      // Arrange
      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const errorMessage = 'Invalid credentials'
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(authApi.login(loginData)).rejects.toThrow(errorMessage)
    })
  })

  describe('getMe', () => {
    it('should return user data', async () => {
      // Arrange
      const mockUser: User = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      }

      mockedAxios.get.mockResolvedValueOnce({ data: mockUser })

      // Act
      const result = await authApi.getMe()

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/auth/me',
        { withCredentials: true }
      )
      expect(result).toEqual(mockUser)
    })

    it('should throw error when user not authenticated', async () => {
      // Arrange
      const errorMessage = 'Unauthorized'
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(authApi.getMe()).rejects.toThrow(errorMessage)
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Arrange
      mockedAxios.post.mockResolvedValueOnce({ data: {} })

      // Act
      await authApi.logout()

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/auth/logout',
        {},
        { withCredentials: true }
      )
    })

    it('should handle logout error gracefully', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mockedAxios.post.mockRejectedValueOnce(new Error('Logout failed'))

      // Act
      await authApi.logout()

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error))
      
      // Cleanup
      consoleSpy.mockRestore()
    })
  })

  describe('createGuest', () => {
    it('should create guest user successfully', async () => {
      // Arrange
      const guestData: GuestData = {
        language: 'ru'
      }
      const mockGuestUser: User = {
        id: 'guest-123',
        username: 'Guest',
        email: 'guest@example.com',
        language: 'ru',
        isGuest: true
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockGuestUser })

      // Act
      const result = await authApi.createGuest(guestData)

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/auth/guests',
        guestData,
        { withCredentials: true }
      )
      expect(result).toEqual(mockGuestUser)
    })

    it('should throw error on guest creation failure', async () => {
      // Arrange
      const guestData: GuestData = {
        language: 'ru'
      }
      const errorMessage = 'Failed to create guest'
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(authApi.createGuest(guestData)).rejects.toThrow(errorMessage)
    })
  })

  describe('registerGuest', () => {
    it('should register guest user successfully', async () => {
      // Arrange
      const guestId = 'guest-123'
      const registerGuestData: RegisterGuestData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
        language: 'ru'
      }
      const mockRegisteredUser: User = {
        id: guestId,
        username: 'Test User',
        email: 'user@example.com',
        language: 'ru',
        isGuest: false
      }

      mockedAxios.patch.mockResolvedValueOnce({ data: mockRegisteredUser })

      // Act
      const result = await authApi.registerGuest(guestId, registerGuestData)

      // Assert
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `http://localhost:3000/auth/guests/${guestId}`,
        registerGuestData,
        { withCredentials: true }
      )
      expect(result).toEqual(mockRegisteredUser)
    })

    it('should throw error on guest registration failure', async () => {
      // Arrange
      const guestId = 'guest-123'
      const registerGuestData: RegisterGuestData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
        language: 'ru'
      }
      const errorMessage = 'Registration failed'
      mockedAxios.patch.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(authApi.registerGuest(guestId, registerGuestData)).rejects.toThrow(errorMessage)
    })
  })

  describe('axios configuration', () => {
    it('should set withCredentials to true', () => {
      // Assert
      expect(axios.defaults.withCredentials).toBe(true)
    })
  })
})
