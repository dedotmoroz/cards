import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCardsStore } from '../cardsStore'
import { cardsApi } from '../../api/cardsApi'
import type { Card } from '../../types/cards'

vi.mock('../../api/cardsApi')
const mockedCardsApi = vi.mocked(cardsApi)

const mockCard: Card = {
  id: 'card-1',
  question: 'Question 1',
  answer: 'Answer 1',
  isLearned: false,
  folderId: 'folder-1'
}

describe('cardsStore', () => {
  beforeEach(() => {
    useCardsStore.setState({
      cards: [],
      isLoading: false,
      error: null
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useCardsStore())

    expect(result.current.cards).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should manage card collection locally', () => {
    const { result } = renderHook(() => useCardsStore())

    act(() => {
      result.current.addCard(mockCard)
    })

    expect(result.current.cards).toHaveLength(1)

    act(() => {
      result.current.updateCard('card-1', { answer: 'Updated answer' })
    })

    expect(result.current.cards[0].answer).toBe('Updated answer')

    act(() => {
      result.current.removeCard('card-1')
    })

    expect(result.current.cards).toHaveLength(0)
  })

  it('should fetch cards successfully', async () => {
    mockedCardsApi.getCards.mockResolvedValueOnce([mockCard])

    const { result } = renderHook(() => useCardsStore())

    await act(async () => {
      await result.current.fetchCards('folder-1')
    })

    expect(mockedCardsApi.getCards).toHaveBeenCalledWith('folder-1')
    expect(result.current.cards).toEqual([mockCard])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch cards error', async () => {
    mockedCardsApi.getCards.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCardsStore())

    await act(async () => {
      await result.current.fetchCards('folder-1')
    })

    expect(result.current.cards).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('Failed to fetch cards')
  })

  it('should create card and refresh list', async () => {
    mockedCardsApi.createCard.mockResolvedValueOnce(mockCard)
    mockedCardsApi.getCards.mockResolvedValueOnce([mockCard])

    const { result } = renderHook(() => useCardsStore())

    await act(async () => {
      await result.current.createCard('folder-1', 'Question 1', 'Answer 1')
    })

    expect(mockedCardsApi.createCard).toHaveBeenCalledWith({
      folderId: 'folder-1',
      question: 'Question 1',
      answer: 'Answer 1'
    })
    expect(mockedCardsApi.getCards).toHaveBeenCalledWith('folder-1')
    expect(result.current.cards).toEqual([mockCard])
  })

  it('should update card learn status', async () => {
    useCardsStore.setState({
      cards: [mockCard],
      isLoading: false,
      error: null
    })

    mockedCardsApi.updateCardLearnStatus.mockResolvedValueOnce({ ...mockCard, isLearned: true })

    const { result } = renderHook(() => useCardsStore())

    await act(async () => {
      await result.current.updateCardLearnStatus('card-1', true)
    })

    expect(mockedCardsApi.updateCardLearnStatus).toHaveBeenCalledWith('card-1', { isLearned: true })
    expect(result.current.cards[0].isLearned).toBe(true)
  })

  it('should delete card', async () => {
    useCardsStore.setState({
      cards: [mockCard],
      isLoading: false,
      error: null
    })

    mockedCardsApi.deleteCard.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useCardsStore())

    await act(async () => {
      await result.current.deleteCard('card-1')
    })

    expect(mockedCardsApi.deleteCard).toHaveBeenCalledWith('card-1')
    expect(result.current.cards).toHaveLength(0)
  })
})

