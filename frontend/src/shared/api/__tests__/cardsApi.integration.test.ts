import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { cardsApi } from '../cardsApi'
import type { Card, CreateCardData, UpdateCardData, UpdateCardLearnStatusData } from '../../types/cards'

// Создаем mock сервер
const server = setupServer(
  // Mock для создания карточки
  http.post('http://localhost:3000/cards', () => {
    const mockCard: Card = {
      id: 'card-123',
      question: 'What is React?',
      answer: 'A JavaScript library for building user interfaces',
      isLearned: false,
      folderId: 'folder-123'
    }
    return HttpResponse.json(mockCard, { status: 201 })
  }),

  // Mock для получения карточек папки
  http.get('http://localhost:3000/cards/folder/:folderId', () => {
    const mockCards: Card[] = [
      {
        id: 'card-1',
        question: 'What is React?',
        answer: 'A JavaScript library',
        isLearned: false,
        folderId: 'folder-123'
      },
      {
        id: 'card-2',
        question: 'What is TypeScript?',
        answer: 'A typed superset of JavaScript',
        isLearned: true,
        folderId: 'folder-123'
      }
    ]
    return HttpResponse.json(mockCards, { status: 200 })
  }),

  // Mock для обновления карточки
  http.patch('http://localhost:3000/cards/:id', () => {
    const mockUpdatedCard: Card = {
      id: 'card-123',
      question: 'Updated question?',
      answer: 'Updated answer',
      isLearned: false,
      folderId: 'folder-123'
    }
    return HttpResponse.json(mockUpdatedCard, { status: 200 })
  }),

  // Mock для обновления статуса изучения
  http.patch('http://localhost:3000/cards/:id/learn-status', () => {
    const mockUpdatedCard: Card = {
      id: 'card-123',
      question: 'What is React?',
      answer: 'A JavaScript library',
      isLearned: true,
      folderId: 'folder-123'
    }
    return HttpResponse.json(mockUpdatedCard, { status: 200 })
  }),

  // Mock для удаления карточки
  http.delete('http://localhost:3000/cards/:id', () => {
    return HttpResponse.json({}, { status: 200 })
  })
)

describe('cardsApi Integration Tests', () => {
  beforeAll(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('createCard', () => {
    it('should create card successfully', async () => {
      // Arrange
      const createData: CreateCardData = {
        folderId: 'folder-123',
        question: 'What is React?',
        answer: 'A JavaScript library for building user interfaces'
      }

      // Act
      const result = await cardsApi.createCard(createData)

      // Assert
      expect(result).toEqual({
        id: 'card-123',
        question: 'What is React?',
        answer: 'A JavaScript library for building user interfaces',
        isLearned: false,
        folderId: 'folder-123'
      })
    })

    it('should handle creation error', async () => {
      // Arrange
      const createData: CreateCardData = {
        folderId: 'folder-123',
        question: 'What is React?',
        answer: 'A JavaScript library for building user interfaces'
      }

      // Переопределяем handler для возврата ошибки
      server.use(
        http.post('http://localhost:3000/cards', () => {
          return HttpResponse.json(
            { message: 'Failed to create card' },
            { status: 400 }
          )
        })
      )

      // Act & Assert
      await expect(cardsApi.createCard(createData)).rejects.toThrow()
    })
  })

  describe('getCards', () => {
    it('should get cards for folder successfully', async () => {
      // Act
      const result = await cardsApi.getCards('folder-123')

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'card-1',
        question: 'What is React?',
        answer: 'A JavaScript library',
        isLearned: false,
        folderId: 'folder-123'
      })
      expect(result[1]).toEqual({
        id: 'card-2',
        question: 'What is TypeScript?',
        answer: 'A typed superset of JavaScript',
        isLearned: true,
        folderId: 'folder-123'
      })
    })

    it('should handle get cards error', async () => {
      // Переопределяем handler для возврата ошибки
      server.use(
        http.get('http://localhost:3000/cards/folder/:folderId', () => {
          return HttpResponse.json(
            { message: 'Failed to get cards' },
            { status: 500 }
          )
        })
      )

      // Act & Assert
      await expect(cardsApi.getCards('folder-123')).rejects.toThrow()
    })
  })

  describe('updateCard', () => {
    it('should update card successfully', async () => {
      // Arrange
      const updateData: UpdateCardData = {
        question: 'Updated question?',
        answer: 'Updated answer'
      }

      // Act
      const result = await cardsApi.updateCard('card-123', updateData)

      // Assert
      expect(result).toEqual({
        id: 'card-123',
        question: 'Updated question?',
        answer: 'Updated answer',
        isLearned: false,
        folderId: 'folder-123'
      })
    })

    it('should handle update error', async () => {
      // Arrange
      const updateData: UpdateCardData = {
        question: 'Updated question?',
        answer: 'Updated answer'
      }

      // Переопределяем handler для возврата ошибки
      server.use(
        http.patch('http://localhost:3000/cards/:id', () => {
          return HttpResponse.json(
            { message: 'Failed to update card' },
            { status: 400 }
          )
        })
      )

      // Act & Assert
      await expect(cardsApi.updateCard('card-123', updateData)).rejects.toThrow()
    })
  })

  describe('updateCardLearnStatus', () => {
    it('should update card learn status successfully', async () => {
      // Arrange
      const learnStatusData: UpdateCardLearnStatusData = {
        isLearned: true
      }

      // Act
      const result = await cardsApi.updateCardLearnStatus('card-123', learnStatusData)

      // Assert
      expect(result).toEqual({
        id: 'card-123',
        question: 'What is React?',
        answer: 'A JavaScript library',
        isLearned: true,
        folderId: 'folder-123'
      })
    })

    it('should handle learn status update error', async () => {
      // Arrange
      const learnStatusData: UpdateCardLearnStatusData = {
        isLearned: true
      }

      // Переопределяем handler для возврата ошибки
      server.use(
        http.patch('http://localhost:3000/cards/:id/learn-status', () => {
          return HttpResponse.json(
            { message: 'Failed to update learn status' },
            { status: 400 }
          )
        })
      )

      // Act & Assert
      await expect(cardsApi.updateCardLearnStatus('card-123', learnStatusData)).rejects.toThrow()
    })
  })

  describe('deleteCard', () => {
    it('should delete card successfully', async () => {
      // Act
      await expect(cardsApi.deleteCard('card-123')).resolves.not.toThrow()
    })

    it('should handle delete error', async () => {
      // Переопределяем handler для возврата ошибки
      server.use(
        http.delete('http://localhost:3000/cards/:id', () => {
          return HttpResponse.json(
            { message: 'Failed to delete card' },
            { status: 500 }
          )
        })
      )

      // Act & Assert
      await expect(cardsApi.deleteCard('card-123')).rejects.toThrow()
    })
  })
})
