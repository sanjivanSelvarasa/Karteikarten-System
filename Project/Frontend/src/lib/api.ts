export interface ApiResponse<T> {
  ok: boolean
  message?: string
  data: T
}

export interface User {
  user_id: number
  username: string
  email: string
  created_at: string
  updated_at: string
}

export interface LearningSet {
  set_id: number
  user_id: number
  title: string
  description: string | null
  is_public: number
  owner_username?: string
  created_at: string
  updated_at: string
}

export interface Flashcard {
  flashcard_id: number
  set_id: number
  question: string
  answer: string
  position: number
  created_at: string
  updated_at: string
}

interface RequestOptions extends RequestInit {
  token?: string | null
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const payload = (await response.json()) as { ok: boolean; message?: string; data?: T }

  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || 'API request failed')
  }

  return payload.data as T
}

export async function registerUser(input: { username: string; email: string; password: string }) {
  return apiRequest<{ user: User; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function loginUser(input: { email: string; password: string }) {
  return apiRequest<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function fetchCurrentUser(token: string) {
  return apiRequest<{ user: User }>('/auth/me', { token })
}

export async function listLearningSets(token: string) {
  return apiRequest<{ learningSets: LearningSet[] }>('/learning-sets', { token })
}

export async function listPublicLearningSets(token: string) {
  return apiRequest<{ learningSets: LearningSet[] }>('/learning-sets/public', { token })
}

export async function createLearningSet(
  token: string,
  input: { title: string; description?: string; isPublic?: boolean },
) {
  return apiRequest<{ learningSet: LearningSet }>('/learning-sets', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  })
}

export async function updateLearningSet(
  token: string,
  setId: number,
  input: { title?: string; description?: string; isPublic?: boolean },
) {
  return apiRequest<{ learningSet: LearningSet }>(`/learning-sets/${setId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(input),
  })
}

export async function deleteLearningSet(token: string, setId: number) {
  return apiRequest<{}>(`/learning-sets/${setId}`, {
    method: 'DELETE',
    token,
  })
}

export async function listFlashcards(token: string, setId: number) {
  return apiRequest<{ flashcards: Flashcard[] }>(`/learning-sets/${setId}/flashcards`, { token })
}

export async function createFlashcard(
  token: string,
  setId: number,
  input: { question: string; answer: string; position?: number },
) {
  return apiRequest<{ flashcard: Flashcard }>(`/learning-sets/${setId}/flashcards`, {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  })
}

export async function updateFlashcard(
  token: string,
  flashcardId: number,
  input: { question?: string; answer?: string; position?: number },
) {
  return apiRequest<{ flashcard: Flashcard }>(`/flashcards/${flashcardId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(input),
  })
}

export async function deleteFlashcard(token: string, flashcardId: number) {
  return apiRequest<{}>(`/flashcards/${flashcardId}`, {
    method: 'DELETE',
    token,
  })
}
