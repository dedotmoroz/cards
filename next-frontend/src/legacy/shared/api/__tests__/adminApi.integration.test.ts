import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { adminApi, type AdminUserListResponse, type AdminUserStats } from '../adminApi'

const baseUrl = 'http://localhost:3000'

const sampleListResponse: AdminUserListResponse = {
  rows: [
    {
      id: 'u1',
      email: 'a@example.com',
      name: 'Alice',
      createdAt: '2025-01-01T00:00:00.000Z',
      lastLoginAt: '2025-02-01T00:00:00.000Z',
      isGuest: false,
      isAdmin: true,
      foldersCount: 3,
      cardsCount: 42,
    },
    {
      id: 'u2',
      email: 'b@example.com',
      name: null,
      createdAt: '2025-01-02T00:00:00.000Z',
      lastLoginAt: null,
      isGuest: true,
      isAdmin: false,
      foldersCount: 0,
      cardsCount: 0,
    },
  ],
  total: 2,
}

const sampleStats: AdminUserStats = {
  id: 'u2',
  email: 'b@example.com',
  name: null,
  createdAt: '2025-01-02T00:00:00.000Z',
  lastLoginAt: null,
  isGuest: true,
  isAdmin: false,
  language: 'ru',
  oauthProvider: null,
  foldersCount: 0,
  cardsCount: 0,
  learnedCardsCount: 0,
}

const server = setupServer(
  http.get(`${baseUrl}/admin/users`, () => HttpResponse.json(sampleListResponse, { status: 200 })),
  http.get(`${baseUrl}/admin/users/:id/stats`, () => HttpResponse.json(sampleStats, { status: 200 })),
  http.delete(`${baseUrl}/admin/users/:id`, () => HttpResponse.json({ ok: true }, { status: 200 })),
  http.post(`${baseUrl}/admin/users/:id/impersonate`, () => HttpResponse.json({ ok: true }, { status: 200 })),
  http.post(`${baseUrl}/admin/impersonate/stop`, () => HttpResponse.json({ ok: true }, { status: 200 }))
)

describe('adminApi Integration Tests', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  describe('listUsers', () => {
    it('returns rows and total', async () => {
      const result = await adminApi.listUsers({ limit: 50, offset: 0 })
      expect(result).toEqual(sampleListResponse)
      expect(result.rows).toHaveLength(2)
    })

    it('throws on 403', async () => {
      server.use(
        http.get(`${baseUrl}/admin/users`, () =>
          HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
        )
      )
      await expect(adminApi.listUsers()).rejects.toThrow()
    })
  })

  describe('getUserStats', () => {
    it('returns stats payload', async () => {
      const result = await adminApi.getUserStats('u2')
      expect(result).toEqual(sampleStats)
    })

    it('throws on 404', async () => {
      server.use(
        http.get(`${baseUrl}/admin/users/:id/stats`, () =>
          HttpResponse.json({ error: 'User not found' }, { status: 404 })
        )
      )
      await expect(adminApi.getUserStats('missing')).rejects.toThrow()
    })
  })

  describe('deleteUser', () => {
    it('completes for valid request', async () => {
      await expect(adminApi.deleteUser('u2')).resolves.toBeUndefined()
    })

    it('throws on 403', async () => {
      server.use(
        http.delete(`${baseUrl}/admin/users/:id`, () =>
          HttpResponse.json({ error: 'Cannot delete another admin' }, { status: 403 })
        )
      )
      await expect(adminApi.deleteUser('admin-id')).rejects.toThrow()
    })
  })

  describe('impersonate / stopImpersonation', () => {
    it('starts impersonation', async () => {
      await expect(adminApi.impersonate('u2')).resolves.toBeUndefined()
    })

    it('stops impersonation', async () => {
      await expect(adminApi.stopImpersonation()).resolves.toBeUndefined()
    })
  })
})
