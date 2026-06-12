<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiRequest, type ApiResponse } from '@/services/api'

defineOptions({ name: 'CreateSetView' })

interface LearningSet {
  set_id: number
}

const router = useRouter()
const form = reactive({ title: '', description: '', isPublic: false })
const loading = ref(false)
const error = ref('')

async function createSet() {
  error.value = ''
  if (form.title.trim().length < 2) {
    error.value = 'Der Titel muss mindestens 2 Zeichen lang sein.'
    return
  }

  loading.value = true
  try {
    const response = await apiRequest<ApiResponse<{ learningSet: LearningSet }>>('/api/learning-sets', {
      method: 'POST',
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim(),
        isPublic: form.isPublic,
      }),
    })
    await router.push(`/sets/${response.data.learningSet.set_id}/cards`)
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : 'Lernset konnte nicht erstellt werden.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="create-page">
    <section class="create-card">
      <button class="back" @click="router.push('/dashboard')"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Dashboard</button>
      <span class="mark"><i class="fa-solid fa-plus" aria-hidden="true"></i></span>
      <h1>Neues Lernset</h1>
      <p>Lege zuerst das Lernset an. Karten kannst du anschließend ergänzen.</p>

      <form @submit.prevent="createSet">
        <label>Titel<input v-model="form.title" maxlength="100" placeholder="z. B. Datenbanken" autofocus></label>
        <label>Beschreibung<textarea v-model="form.description" rows="4" placeholder="Worum geht es in diesem Lernset?"></textarea></label>
        <label class="checkbox"><input v-model="form.isPublic" type="checkbox"> Öffentliches Lernset</label>
        <p v-if="error" class="error">{{ error }}</p>
        <button class="submit" type="submit" :disabled="loading">{{ loading ? 'Wird erstellt …' : 'Lernset erstellen' }}</button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.create-page { min-height: 100vh; display: grid; padding: 24px; place-items: center; background: linear-gradient(145deg,var(--color-bg),var(--color-bg-soft)); }.create-card { width: min(100%,580px); padding: clamp(26px,5vw,48px); border: 1px solid var(--color-border-purple); border-radius: 28px; background: white; box-shadow: 0 24px 60px #8f89e829; }.back { padding: 0; border: 0; color: var(--color-periwinkle-dark); background: none; cursor: pointer; font-weight: 800; }.mark { display: grid; width: 52px; height: 52px; margin-top: 28px; place-items: center; border-radius: 16px; color: white; background: linear-gradient(135deg,var(--color-salmon),var(--color-periwinkle)); font-size: 30px; font-weight: 800; }.create-card h1 { margin: 18px 0 4px; font-size: 30px; }.create-card > p { margin: 0 0 26px; color: var(--color-text-muted); }.create-card form,.create-card label { display: flex; flex-direction: column; }.create-card form { gap: 18px; }.create-card label { gap: 7px; font-size: 13px; font-weight: 800; }.create-card input,.create-card textarea { width: 100%; padding: 12px 14px; border: 1px solid var(--color-border-purple); border-radius: 12px; color: var(--color-text); background: var(--color-bg-soft); font: inherit; resize: vertical; }.create-card input:focus,.create-card textarea:focus { outline: 3px solid #b9b4ff33; border-color: var(--color-periwinkle); background: white; }.create-card .checkbox { flex-direction: row; align-items: center; }.checkbox input { width: 17px; }.error { margin: 0; color: var(--color-error); font-size: 13px; }.submit { min-height: 48px; border: 0; border-radius: 13px; color: white; background: linear-gradient(135deg,var(--color-salmon),var(--color-salmon-dark)); cursor: pointer; font-weight: 900; }.submit:disabled { cursor: wait; opacity: .65; }
</style>
