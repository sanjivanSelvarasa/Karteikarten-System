<template>
  <main class="auth-page">
    <section class="card">
      <header class="card-header">
        <h1>Konto erstellen</h1>
        <p>Registriere dich und starte mit deinen Karteikarten.</p>
      </header>

      <form class="form" @submit.prevent="handleRegister">
        <label class="field">
          <span>Benutzername</span>
          <input v-model.trim="username" type="text" autocomplete="username" minlength="3" required />
        </label>

        <label class="field">
          <span>E-Mail</span>
          <input v-model.trim="email" type="email" autocomplete="email" required />
        </label>

        <label class="field">
          <span>Passwort</span>
          <input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="8" required />
        </label>

        <label class="field">
          <span>Passwort bestätigen</span>
          <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" required />
        </label>

        <label class="remember">
          <input v-model="showPassword" type="checkbox" />
          Passwort anzeigen
        </label>

        <p v-if="errorMessage" class="alert error">{{ errorMessage }}</p>

        <button class="button" :disabled="loading" type="submit">
          {{ loading ? 'Registrierung läuft...' : 'Registrieren' }}
        </button>
      </form>

      <p class="switch-line">
        Bereits registriert?
        <RouterLink to="/login">Zum Login</RouterLink>
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Die Passwörter stimmen nicht überein.'
    return
  }

  loading.value = true

  try {
    await authStore.register({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    await router.push('/dashboard')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registrierung fehlgeschlagen'
    errorMessage.value = message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, var(--color-bg-soft) 0%, var(--color-bg) 100%);
}

.card {
  width: min(100%, 30rem);
  border-radius: 16px;
  padding: 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-purple);
  box-shadow: 0 12px 30px rgba(31, 41, 55, 0.08);
}

.card-header h1 {
  margin: 0;
  font-size: 1.7rem;
}

.card-header p {
  margin: 0.4rem 0 1rem;
  color: var(--color-text-muted);
}

.form {
  display: grid;
  gap: 0.9rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field span {
  font-weight: 700;
}

.field input {
  border: 1px solid var(--color-border-purple);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  background: var(--color-bg-soft);
}

.remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.button {
  border: 0;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-weight: 800;
  color: var(--color-text-light);
  background: var(--color-periwinkle-dark);
  cursor: pointer;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.alert.error {
  color: var(--color-error);
  margin: 0;
}

.switch-line {
  margin: 1rem 0 0;
  color: var(--color-text-muted);
}

.switch-line a {
  font-weight: 700;
  color: var(--color-salmon-dark);
}
</style>
