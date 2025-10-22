import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { cardsApi } from '../cardsApi'
import type { Card, CreateCardData, UpdateCardData, UpdateCardLearnStatusData } from '../../types/cards'

// Мокаем axios
vi.mock('axios')
const mockedAxios = axios as any

describe('cardsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createCard', () => {
    it('should create card successfully', async () => {
      // Arrange
      const createData: CreateCardData = {
        folderId: 'folder-123',
        question: 'What is React?',
        answer: 'A JavaScript library for building user interfaces'
      }

      const mockCard: Card = {
        id: 'card-123',
        question: 'What is React?',
        answer: 'A JavaScript library for building user interfaces',
        isLearned: false,
        folderId: 'folder-123'
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockCard })

      // Act
      const result = await cardsApi.createCard(createData)

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/cards',
        createData
      )
      expect(result).toEqual(mockCard)
    })

    it('should throw error on creation failure', async () => {
      // Arrange
      const createData: CreateCardData = {
        folderId: 'folder-123',
        question: 'What is React?',
        answer: 'A JavaScript library for building user interfaces'
      }

      const errorMessage = 'Failed to create card'
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(cardsApi.createCard(createData)).rejects.toThrow(errorMessage)
    })
  })

  describe('getCards', () => {
    it('should get cards for folder successfully', async () => {
      // Arrange
      const folderId = 'folder-123'
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

      mockedAxios.get.mockResolvedValueOnce({ data: mockCards })

      // Act
      const result = await cardsApi.getCards(folderId)

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/cards/folder/folder-123'
      )
      expect(result).toEqual(mockCards)
    })

    it('should throw error on get cards failure', async () => {
      // Arrange
      const folderId = 'folder-123'
      const errorMessage = 'Failed to get cards'
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(cardsApi.getCards(folderId)).rejects.toThrow(errorMessage)
    })
  })

  describe('updateCard', () => {
    it('should update card successfully', async () => {
      // Arrange
      const cardId = 'card-123'
      const updateData: UpdateCardData = {
        question: 'Updated question?',
        answer: 'Updated answer'
      }

      const mockUpdatedCard: Card = {
        id: 'card-123',
        question: 'Updated question?',
        answer: 'Updated answer',
        isLearned: false,
        folderId: 'folder-123'
      }

      mockedAxios.patch.mockResolvedValueOnce({ data: mockUpdatedCard })

      // Act
      const result = await cardsApi.updateCard(cardId, updateData)

      // Assert
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        'http://localhost:3000/cards/card-123',
        updateData
      )
      expect(result).toEqual(mockUpdatedCard)
    })

    it('should throw error on update failure', async () => {
      // Arrange
      const cardId = 'card-123'
      const updateData: UpdateCardData = {
        question: 'Updated question?',
        answer: 'Updated answer'
      }

      const errorMessage = 'Failed to update card'
      mockedAxios.patch.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(cardsApi.updateCard(cardId, updateData)).rejects.toThrow(errorMessage)
    })
  })

  describe('updateCardLearnStatus', () => {
    it('should update card learn status successfully', async () => {
      // Arrange
      const cardId = 'card-123'
      const learnStatusData: UpdateCardLearnStatusData = {
        isLearned: true
      }

      const mockUpdatedCard: Card = {
        id: 'card-123',
        question: 'What is React?',
        answer: 'A JavaScript library',
        isLearned: true,
        folderId: 'folder-123'
      }

      mockedAxios.patch.mockResolvedValueOnce({ data: mockUpdatedCard })

      // Act
      const result = await cardsApi.updateCardLearnStatus(cardId, learnStatusData)

      // Assert
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        'http://localhost:3000/cards/card-123/learn-status',
        learnStatusData
      )
      expect(result).toEqual(mockUpdatedCard)
    })

    it('should throw error on learn status update failure', async () => {
      // Arrange
      const cardId = 'card-123'
      const learnStatusData: UpdateCardLearnStatusData = {
        isLearned: true
      }

      const errorMessage = 'Failed to update learn status'
      mockedAxios.patch.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(cardsApi.updateCardLearnStatus(cardId, learnStatusData)).rejects.toThrow(errorMessage)
    })
  })

  describe('deleteCard', () => {
    it('should delete card successfully', async () => {
      // Arrange
      const cardId = 'card-123'
      mockedAxios.delete.mockResolvedValueOnce({ data: {} })

      // Act
      await cardsApi.deleteCard(cardId)

      // Assert
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:3000/cards/card-123'
      )
    })

    it('should throw error on delete failure', async () => {
      // Arrange
      const cardId = 'card-123'
      const errorMessage = 'Failed to delete card'
      mockedAxios.delete.mockRejectedValueOnce(new Error(errorMessage))

      // Act & Assert
      await expect(cardsApi.deleteCard(cardId)).rejects.toThrow(errorMessage)
    })
  })

  describe('axios configuration', () => {
    it('should set withCredentials to true', () => {
      // Assert
      expect(axios.defaults.withCredentials).toBe(true)
    })
  })
})

