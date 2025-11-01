import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useFoldersStore } from '../foldersStore'
import { foldersApi } from '../../api/foldersApi'
import type { Folder } from '../../types/cards'

vi.mock('../../api/foldersApi')
const mockedFoldersApi = vi.mocked(foldersApi)

const mockFolder: Folder = {
  id: 'folder-1',
  name: 'My folder',
  userId: 'user-1'
}

describe('foldersStore', () => {
  beforeEach(() => {
    useFoldersStore.setState({
      folders: [],
      selectedFolderId: null,
      isLoading: false,
      error: null
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useFoldersStore())

    expect(result.current.folders).toEqual([])
    expect(result.current.selectedFolderId).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should set selected folder', () => {
    const { result } = renderHook(() => useFoldersStore())

    act(() => {
      result.current.setSelectedFolder('folder-1')
    })

    expect(result.current.selectedFolderId).toBe('folder-1')
  })

  it('should fetch folders successfully', async () => {
    mockedFoldersApi.getFolders.mockResolvedValueOnce([mockFolder])

    const { result } = renderHook(() => useFoldersStore())

    await act(async () => {
      await result.current.fetchFolders()
    })

    expect(mockedFoldersApi.getFolders).toHaveBeenCalled()
    expect(result.current.folders).toEqual([mockFolder])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch folders error', async () => {
    mockedFoldersApi.getFolders.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useFoldersStore())

    await act(async () => {
      await result.current.fetchFolders()
    })

    expect(result.current.folders).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe('Failed to fetch folders')
  })

  it('should create folder and refresh list', async () => {
    mockedFoldersApi.createFolder.mockResolvedValueOnce(mockFolder)
    mockedFoldersApi.getFolders.mockResolvedValueOnce([mockFolder])

    const { result } = renderHook(() => useFoldersStore())

    await act(async () => {
      await result.current.createFolder('My folder')
    })

    expect(mockedFoldersApi.createFolder).toHaveBeenCalledWith({ name: 'My folder' })
    expect(mockedFoldersApi.getFolders).toHaveBeenCalled()
    expect(result.current.folders).toEqual([mockFolder])
  })

  it('should update folder name', async () => {
    useFoldersStore.setState({
      folders: [mockFolder],
      selectedFolderId: 'folder-1',
      isLoading: false,
      error: null
    })

    mockedFoldersApi.updateFolder.mockResolvedValueOnce({ ...mockFolder, name: 'Updated' })

    const { result } = renderHook(() => useFoldersStore())

    await act(async () => {
      await result.current.updateFolderName('folder-1', 'Updated')
    })

    expect(mockedFoldersApi.updateFolder).toHaveBeenCalledWith('folder-1', { name: 'Updated' })
    expect(result.current.folders[0].name).toBe('Updated')
  })

  it('should delete folder and reset selection if necessary', async () => {
    useFoldersStore.setState({
      folders: [mockFolder],
      selectedFolderId: 'folder-1',
      isLoading: false,
      error: null
    })

    mockedFoldersApi.deleteFolder.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useFoldersStore())

    await act(async () => {
      await result.current.deleteFolder('folder-1')
    })

    expect(mockedFoldersApi.deleteFolder).toHaveBeenCalledWith('folder-1')
    expect(result.current.folders).toHaveLength(0)
    expect(result.current.selectedFolderId).toBeNull()
  })
})

