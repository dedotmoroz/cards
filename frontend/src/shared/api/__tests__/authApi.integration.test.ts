import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { authApi } from '../authApi'
import type { User, RegisterData, LoginData } from '../../types/auth'

// Создаем mock сервер
const server = setupServer(
  // Mock для регистрации
  http.post('http://localhost:3000/auth/register', () => {
    return HttpResponse.json({}, { status: 201 })
  }),

  // Mock для входа
  http.post('http://localhost:3000/auth/login', () => {
    return HttpResponse.json({}, { status: 200 })
  }),

  // Mock для получения информации о пользователе
  http.get('http://localhost:3000/auth/me', () => {
    const mockUser: User = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com'
    }
    return HttpResponse.json(mockUser, { status: 200 })
  }),

  // Mock для выхода
  http.post('http://localhost:3000/auth/logout', () => {
    return HttpResponse.json({}, { status: 200 })
  })
)

describe('authApi Integration Tests', () => {
  beforeAll(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      // Arrange
      const registerData: RegisterData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      // Act
      await expect(authApi.register(registerData)).resolves.not.toThrow()
    })

    it('should handle registration error', async () => {
      // Arrange
      const registerData: RegisterData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      // Переопределяем handler для возврата ошибки
      server.use(
        http.post('http://localhost:3000/auth/register', () => {
          return HttpResponse.json(
            { message: 'User already exists' },
            { status: 400 }
          )
        })
      )

      // Act & Assert
      await expect(authApi.register(registerData)).rejects.toThrow()
    })
  })

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      // Act
      await expect(authApi.login(loginData)).resolves.not.toThrow()
    })

    it('should handle login error', async () => {
      // Arrange
      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      // Переопределяем handler для возврата ошибки
      server.use(
        http.post('http://localhost:3000/auth/login', () => {
          return HttpResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
          )
        })
      )

      // Act & Assert
      await expect(authApi.login(loginData)).rejects.toThrow()
    })
  })

  describe('getMe', () => {
    it('should return user data', async () => {
      // Act
      const user = await authApi.getMe()

      // Assert
      expect(user).toEqual({
        id: '123',
        username: 'testuser',
        email: 'test@example.com'
      })
    })

    it('should handle unauthorized error', async () => {
      // Переопределяем handler для возврата ошибки
      server.use(
        http.get('http://localhost:3000/auth/me', () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          )
        })
      )

      // Act & Assert
      await expect(authApi.getMe()).rejects.toThrow()
    })
  })

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Act
      await expect(authApi.logout()).resolves.not.toThrow()
    })

    it('should handle logout error gracefully', async () => {
      // Переопределяем handler для возврата ошибки
      server.use(
        http.post('http://localhost:3000/auth/logout', () => {
          return HttpResponse.json(
            { message: 'Server error' },
            { status: 500 }
          )
        })
      )

      // Act - не должно выбрасывать ошибку
      await expect(authApi.logout()).resolves.not.toThrow()
    })
  })
})
