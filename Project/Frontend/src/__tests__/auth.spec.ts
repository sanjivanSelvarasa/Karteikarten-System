import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const { loginUser } = vi.hoisted(() => ({
  loginUser: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  loginUser,
  registerUser: vi.fn(),
  fetchCurrentUser: vi.fn(),
}))

import { useAuthStore } from '@/stores/auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    sessionStorage.clear()
    loginUser.mockReset()
  })

  it('stores a successful login for the router and authenticated API requests', async () => {
    const user = {
      user_id: 1,
      username: 'Test User',
      email: 'test@example.com',
      created_at: '2026-06-12T00:00:00.000Z',
      updated_at: '2026-06-12T00:00:00.000Z',
    }
    loginUser.mockResolvedValue({ token: 'signed-token', user })

    const store = useAuthStore()
    await store.login({ email: user.email, password: 'password123' })

    expect(localStorage.getItem('authToken')).toBe('signed-token')
    expect(JSON.parse(localStorage.getItem('authUser') || '{}')).toEqual(user)
    expect(localStorage.getItem('karteikarten_token')).toBeNull()
  })
})
