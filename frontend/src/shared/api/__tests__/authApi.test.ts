import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { authApi } from '../authApi'
import type { User, RegisterData, LoginData } from '../../types/auth'

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

  describe('axios configuration', () => {
    it('should set withCredentials to true', () => {
      // Assert
      expect(axios.defaults.withCredentials).toBe(true)
    })
  })
})
