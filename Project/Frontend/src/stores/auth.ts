import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchCurrentUser, loginUser, registerUser, type User } from '@/lib/api'

const TOKEN_STORAGE_KEY = 'karteikarten_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  function hydrateFromStorage() {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) {
      token.value = stored
    }
  }

  async function initialize() {
    if (initialized.value) return

    hydrateFromStorage()

    if (token.value) {
      try {
        const response = await fetchCurrentUser(token.value)
        user.value = response.user
      } catch {
        clearSession()
      }
    }

    initialized.value = true
  }

  async function login(input: { email: string; password: string }) {
    const response = await loginUser(input)
    token.value = response.token
    user.value = response.user
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
  }

  async function register(input: { username: string; email: string; password: string }) {
    const response = await registerUser(input)
    token.value = response.token
    user.value = response.user
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  function logout() {
    clearSession()
  }

  return {
    token,
    user,
    initialized,
    isAuthenticated,
    initialize,
    login,
    register,
    logout,
  }
})
