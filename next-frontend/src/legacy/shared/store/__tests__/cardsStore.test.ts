import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCardsStore, __cardsStoreInternals } from '../cardsStore'
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
      error: null,
      generationStatuses: {}
    })
    vi.clearAllMocks()
    __cardsStoreInternals.resetGenerationTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    __cardsStoreInternals.resetGenerationTimers()
  })

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useCardsStore())

    expect(result.current.cards).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.generationStatuses).toEqual({})
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
    expect(result.current.generationStatuses).toEqual({})
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
    expect(result.current.generationStatuses).toEqual({})
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
    expect(result.current.generationStatuses).toEqual({})
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
    expect(result.current.generationStatuses).toEqual({})
  })

  it('should handle generateCardSentences with immediate completion', async () => {
    const generatedCard: Card = {
      ...mockCard,
      questionSentences: 'Sentence 1',
      answerSentences: 'Translation 1'
    }

    mockedCardsApi.generateCardSentences.mockResolvedValueOnce({ jobId: 'job-123' })
    mockedCardsApi.getCardGenerationStatus.mockResolvedValueOnce({
      status: 'completed',
      progress: 100,
      card: generatedCard
    })

    useCardsStore.setState({
      cards: [mockCard],
      isLoading: false,
      error: null,
      generationStatuses: {}
    })

    const { result } = renderHook(() => useCardsStore())

    await act(async () => {
      await result.current.generateCardSentences('card-1')
    })

    expect(mockedCardsApi.generateCardSentences).toHaveBeenCalledWith('card-1', {})
    expect(mockedCardsApi.getCardGenerationStatus).toHaveBeenCalledWith('card-1', { jobId: 'job-123' })
    expect(result.current.cards[0]).toEqual(generatedCard)
    expect(result.current.generationStatuses['card-1']).toEqual({ status: 'completed', progress: 100 })
  })

  it('should poll until generation completes', async () => {
    vi.useFakeTimers()

    mockedCardsApi.generateCardSentences.mockResolvedValueOnce({ jobId: 'job-123' })
    mockedCardsApi.getCardGenerationStatus
      .mockResolvedValueOnce({
        status: 'waiting',
        progress: 10
      } as any)
      .mockResolvedValueOnce({
        status: 'completed',
        progress: 100,
        card: {
          ...mockCard,
          questionSentences: 'Generated',
          answerSentences: 'Перевод'
        }
      } as any)

    useCardsStore.setState({
      cards: [mockCard],
      isLoading: false,
      error: null,
      generationStatuses: {}
    })

    const { result } = renderHook(() => useCardsStore())

    await act(async () => {
      await result.current.generateCardSentences('card-1')
    })

    expect(result.current.generationStatuses['card-1']).toEqual({ status: 'polling', progress: 10 })

    await act(async () => {
      vi.advanceTimersByTime(2000)
      await Promise.resolve()
    })

    expect(result.current.generationStatuses['card-1']).toEqual({ status: 'completed', progress: 100 })
    expect(result.current.cards[0].questionSentences).toBe('Generated')
  })

  it('should handle generation failure', async () => {
    mockedCardsApi.generateCardSentences.mockResolvedValueOnce({ jobId: 'job-123' })
    mockedCardsApi.getCardGenerationStatus.mockResolvedValueOnce({
      status: 'failed',
      progress: 40,
      error: 'Some error'
    })

    useCardsStore.setState({
      cards: [mockCard],
      isLoading: false,
      error: null,
      generationStatuses: {}
    })

    const { result } = renderHook(() => useCardsStore())

    await act(async () => {
      await result.current.generateCardSentences('card-1')
    })

    expect(result.current.generationStatuses['card-1']).toEqual({
      status: 'failed',
      progress: 40,
      error: 'Some error'
    })
  })
})

