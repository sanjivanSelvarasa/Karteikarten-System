<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest, type ApiResponse } from '@/services/api'

defineOptions({ name: 'SetCardsView' })

interface LearningSet {
  set_id: number
  title: string
  description: string | null
  updated_at: string
}

interface Flashcard {
  flashcard_id: number
  question: string
  answer: string
  position: number
}

const MAX_LENGTH = 1000
const route = useRoute()
const router = useRouter()
const learningSet = ref<LearningSet | null>(null)
const cards = ref<Flashcard[]>([])
const loading = ref(true)
const loadError = ref('')
const modalOpen = ref(false)
const flipped = ref(false)
const saving = ref(false)
const deletingId = ref<number | null>(null)
const status = ref('')
const toast = ref('')
const questionInput = ref<HTMLTextAreaElement | null>(null)
const form = reactive({ question: '', answer: '' })
const touched = reactive({ question: false, answer: false })
let toastTimer: number | undefined

const setId = computed(() => Number(route.params.id))
const questionError = computed(() => touched.question && !form.question.trim() ? 'Die Vorderseite darf nicht leer sein.' : '')
const answerError = computed(() => touched.answer && !form.answer.trim() ? 'Die Rückseite darf nicht leer sein.' : '')
const canSave = computed(() => Boolean(form.question.trim() && form.answer.trim()) && !saving.value)

function formatDate(value?: string) {
  if (!value) return 'noch nie'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'unbekannt' : new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium' }).format(date)
}

async function loadSet() {
  if (!Number.isInteger(setId.value) || setId.value <= 0) {
    loadError.value = 'Ungültiges Lernset.'
    loading.value = false
    return
  }

  loading.value = true
  loadError.value = ''
  try {
    const [setResponse, cardsResponse] = await Promise.all([
      apiRequest<ApiResponse<{ learningSet: LearningSet }>>(`/api/learning-sets/${setId.value}`),
      apiRequest<ApiResponse<{ flashcards: Flashcard[] }>>(`/api/learning-sets/${setId.value}/flashcards`),
    ])
    learningSet.value = setResponse.data.learningSet
    cards.value = cardsResponse.data.flashcards
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Das Lernset konnte nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

async function openModal() {
  form.question = ''
  form.answer = ''
  touched.question = false
  touched.answer = false
  status.value = ''
  flipped.value = false
  modalOpen.value = true
  document.body.style.overflow = 'hidden'
  await nextTick()
  questionInput.value?.focus()
}

function closeModal() {
  if (saving.value) return
  modalOpen.value = false
  document.body.style.overflow = ''
}

function showToast(message: string) {
  toast.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toast.value = '' }, 2600)
}

async function saveCard() {
  touched.question = true
  touched.answer = true
  status.value = ''
  if (!canSave.value) {
    status.value = 'Bitte fülle beide Felder aus.'
    return
  }

  saving.value = true
  try {
    const response = await apiRequest<ApiResponse<{ flashcard: Flashcard }>>(`/api/learning-sets/${setId.value}/flashcards`, {
      method: 'POST',
      body: JSON.stringify({ question: form.question.trim(), answer: form.answer.trim() }),
    })
    cards.value.push(response.data.flashcard)
    saving.value = false
    closeModal()
    showToast('Karteikarte gespeichert')
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Speichern fehlgeschlagen.'
  } finally { saving.value = false }
}

async function removeCard(card: Flashcard) {
  if (!window.confirm(`Karte „${card.question}“ löschen?`)) return
  deletingId.value = card.flashcard_id
  try {
    await apiRequest(`/api/flashcards/${card.flashcard_id}`, { method: 'DELETE' })
    cards.value = cards.value.filter((item) => item.flashcard_id !== card.flashcard_id)
    showToast('Karteikarte gelöscht')
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'Löschen fehlgeschlagen.')
  } finally {
    deletingId.value = null
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && modalOpen.value) closeModal()
  if (modalOpen.value && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) void saveCard()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  void loadSet()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
  window.clearTimeout(toastTimer)
})
</script>

<template>
  <div class="cards-page">
    <div class="app-shell">
      <header class="topbar">
        <RouterLink class="brand" to="/dashboard">
          <span class="brand-mark"><i class="fa-solid fa-feather-pointed" aria-hidden="true"></i></span>
          <span>Study<em>Deck</em></span>
        </RouterLink>
        <button class="account" title="Zum Dashboard" aria-label="Zum Dashboard" @click="router.push('/dashboard')">
          <i class="fa-solid fa-user" aria-hidden="true"></i>
        </button>
      </header>

      <nav class="crumbs" aria-label="Brotkrümel">
        <RouterLink to="/dashboard">Meine Lernsets</RouterLink>
        <i class="fa-solid fa-chevron-right sep" aria-hidden="true"></i>
        <span class="current">{{ learningSet?.title || 'Lernset' }}</span>
      </nav>

      <section v-if="loading" class="state-card"><i class="fa-solid fa-spinner fa-spin"></i> Lernset wird geladen …</section>
      <section v-else-if="loadError" class="state-card error-state">
        <i class="fa-solid fa-circle-exclamation"></i>
        <strong>{{ loadError }}</strong>
        <button class="btn btn-ghost" @click="loadSet">Erneut versuchen</button>
      </section>

      <template v-else-if="learningSet">
        <section class="set-head">
          <div class="set-head-info">
            <span class="set-eyebrow"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i> Lernset</span>
            <h1>{{ learningSet.title }}</h1>
            <p>{{ learningSet.description || 'Noch keine Beschreibung für dieses Lernset.' }}</p>
            <div class="set-meta">
              <div class="set-stat"><i class="fa-solid fa-note-sticky"></i><strong>{{ cards.length }}</strong><span>Karteikarten</span></div>
              <div class="set-stat"><i class="fa-solid fa-clock"></i><span>Aktualisiert: {{ formatDate(learningSet.updated_at) }}</span></div>
            </div>
          </div>
          <button class="btn btn-primary" @click="openModal"><i class="fa-solid fa-plus"></i> Karteikarte erstellen</button>
        </section>

        <div class="list-head">
          <h2>Karteikarten</h2>
          <span>{{ cards.length }} {{ cards.length === 1 ? 'Karte' : 'Karten' }}</span>
        </div>

        <section v-if="cards.length" class="cards-grid">
          <article v-for="(card, index) in cards" :key="card.flashcard_id" class="card-item">
            <div class="card-top">
              <span>Karte {{ index + 1 }}</span>
              <button title="Karte löschen" aria-label="Karte löschen" :disabled="deletingId === card.flashcard_id" @click="removeCard(card)">
                <i :class="deletingId === card.flashcard_id ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-trash'" aria-hidden="true"></i>
              </button>
            </div>
            <strong>{{ card.question }}</strong>
            <div class="divider"></div>
            <p>{{ card.answer }}</p>
          </article>
        </section>
        <section v-else class="empty-state">
          <span><i class="fa-solid fa-note-sticky"></i></span>
          <h2>Noch keine Karteikarten</h2>
          <p>Erstelle die erste Karte für dieses Lernset.</p>
          <button class="btn btn-primary" @click="openModal"><i class="fa-solid fa-plus"></i> Erste Karte erstellen</button>
        </section>
      </template>
    </div>

    <Transition name="modal">
      <div v-if="modalOpen" class="overlay" @mousedown.self="closeModal">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="create-card-title">
          <header class="modal-head">
            <div class="modal-title">
              <span><i class="fa-solid fa-note-sticky"></i></span>
              <div><h2 id="create-card-title">Neue Karteikarte erstellen</h2><p>Lernset: {{ learningSet?.title }}</p></div>
            </div>
            <button title="Schließen" aria-label="Schließen" :disabled="saving" @click="closeModal"><i class="fa-solid fa-xmark"></i></button>
          </header>

          <div class="modal-body">
            <form id="card-form" class="form-column" @submit.prevent="saveCard">
              <label class="field front" :class="{ invalid: questionError }">
                <span class="field-label"><strong>Vorderseite <b>*</b></strong><small>{{ form.question.length }} / {{ MAX_LENGTH }}</small></span>
                <span class="input-wrap"><i></i><textarea ref="questionInput" v-model="form.question" :maxlength="MAX_LENGTH" rows="4" placeholder="Begriff, Frage oder Aufgabe eingeben" @blur="touched.question = true" @focus="flipped = false"></textarea></span>
                <small v-if="questionError" class="field-error"><i class="fa-solid fa-circle-exclamation"></i> {{ questionError }}</small>
              </label>

              <label class="field back" :class="{ invalid: answerError }">
                <span class="field-label"><strong>Rückseite <b>*</b></strong><small>{{ form.answer.length }} / {{ MAX_LENGTH }}</small></span>
                <span class="input-wrap"><i></i><textarea v-model="form.answer" :maxlength="MAX_LENGTH" rows="4" placeholder="Antwort oder Erklärung eingeben" @blur="touched.answer = true" @focus="flipped = true"></textarea></span>
                <small v-if="answerError" class="field-error"><i class="fa-solid fa-circle-exclamation"></i> {{ answerError }}</small>
              </label>

              <p class="form-note"><i class="fa-solid fa-circle-info"></i> Halte die Vorderseite kurz und präzise. Erklärungen und Beispiele gehören auf die Rückseite.</p>
            </form>

            <aside class="preview-column">
              <div class="preview-title"><span>Vorschau</span><button type="button" @click="flipped = !flipped"><i class="fa-solid fa-rotate"></i> Umdrehen</button></div>
              <div class="flip-scene">
                <div class="flip-card" :class="{ flipped }">
                  <article class="flip-face flip-front"><small>Vorderseite</small><p :class="{ empty: !form.question.trim() }">{{ form.question.trim() || 'Begriff, Frage oder Aufgabe' }}</p><i class="fa-solid fa-question corner"></i></article>
                  <article class="flip-face flip-back"><small>Rückseite</small><p :class="{ empty: !form.answer.trim() }">{{ form.answer.trim() || 'Antwort oder Erklärung' }}</p><i class="fa-solid fa-lightbulb corner"></i></article>
                </div>
              </div>
            </aside>
          </div>

          <footer class="modal-foot">
            <p :class="{ error: status }">{{ status }}</p>
            <div><button class="btn btn-ghost" type="button" :disabled="saving" @click="closeModal">Abbrechen</button><button class="btn btn-primary" type="submit" form="card-form" :disabled="saving"><i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i> {{ saving ? 'Speichern …' : 'Speichern' }}</button></div>
          </footer>
        </section>
      </div>
    </Transition>

    <Transition name="toast"><div v-if="toast" class="toast" role="status"><span><i class="fa-solid fa-check"></i></span>{{ toast }}</div></Transition>
  </div>
</template>

<style scoped>
.cards-page { min-height: 100vh; color: var(--color-text); background: radial-gradient(900px 520px at 8% -5%,var(--color-salmon-light),transparent 55%),radial-gradient(900px 560px at 100% 0,var(--color-periwinkle-light),transparent 52%),var(--color-bg); font-family: Nunito,Inter,system-ui,sans-serif; }
button,a,textarea { font: inherit; }.app-shell { width: min(100%,1040px); margin: auto; padding: 28px 24px 80px; }.topbar,.set-head,.list-head,.card-top,.modal-head,.modal-title,.preview-title,.modal-foot { display: flex; align-items: center; }.topbar { justify-content: space-between; margin-bottom: 32px; }.brand { display: flex; align-items: center; gap: 12px; color: var(--color-text); font-size: 21px; font-weight: 900; text-decoration: none; }.brand-mark { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; color: white; background: linear-gradient(135deg,var(--color-salmon),var(--color-periwinkle)); box-shadow: 0 10px 24px #e66f6847; }.brand em { color: var(--color-periwinkle-dark); font-style: normal; }.account { display: grid; width: 44px; height: 44px; place-items: center; border: 2px solid var(--color-border-purple); border-radius: 50%; color: var(--color-periwinkle-dark); background: white; cursor: pointer; }.crumbs { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; color: var(--color-text-muted); font-size: 13px; font-weight: 800; }.crumbs a { color: inherit; text-decoration: none; }.crumbs a:hover { color: var(--color-salmon-dark); }.sep { font-size: 11px; opacity: .55; }.current { color: var(--color-text); }.set-head { position: relative; align-items: flex-start; justify-content: space-between; gap: 24px; overflow: hidden; padding: 26px 28px 26px 36px; border: 1px solid var(--color-border-purple); border-radius: 24px; background: white; box-shadow: 0 8px 24px #8f89e81f; }.set-head::before { position: absolute; inset: 0 auto 0 0; width: 6px; background: linear-gradient(var(--color-salmon),var(--color-periwinkle)); content: ''; }.set-eyebrow { display: inline-flex; align-items: center; gap: 7px; padding: 5px 11px; border-radius: 999px; color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }.set-head h1 { margin: 12px 0 3px; font-size: 31px; line-height: 1.15; }.set-head p { max-width: 580px; margin: 0; color: var(--color-text-muted); font-weight: 600; }.set-meta { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 16px; }.set-stat { display: flex; align-items: center; gap: 8px; font-size: 14px; }.set-stat i { color: var(--color-salmon-dark); }.set-stat span { color: var(--color-text-muted); }.btn { display: inline-flex; min-height: 46px; align-items: center; justify-content: center; gap: 9px; padding: 11px 20px; border: 0; border-radius: 14px; cursor: pointer; font-weight: 900; text-decoration: none; }.btn-primary { color: white; background: linear-gradient(135deg,var(--color-salmon),var(--color-salmon-dark)); box-shadow: 0 10px 24px #e66f6847; }.btn-ghost { border: 1px solid var(--color-border-purple); color: var(--color-text); background: white; }.btn:disabled { cursor: wait; opacity: .6; }.list-head { justify-content: space-between; margin: 34px 4px 16px; }.list-head h2 { margin: 0; font-size: 19px; }.list-head span { color: var(--color-text-muted); font-size: 14px; font-weight: 800; }.cards-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 16px; }.card-item { padding: 18px 20px; border: 1px solid var(--color-border-salmon); border-radius: 16px; background: white; box-shadow: 0 2px 8px #8f89e814; transition: .18s; }.card-item:hover { transform: translateY(-3px); box-shadow: 0 8px 24px #8f89e81f; }.card-top { justify-content: space-between; margin-bottom: 8px; color: var(--color-periwinkle-dark); font-size: 11px; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }.card-top button { border: 0; color: var(--color-text-muted); background: transparent; cursor: pointer; }.card-top button:hover { color: var(--color-salmon-dark); }.card-item > strong { display: block; overflow-wrap: anywhere; }.card-item p { margin: 0; overflow-wrap: anywhere; color: var(--color-text-muted); font-size: 14px; font-weight: 600; }.divider { height: 1px; margin: 11px 0; background: var(--color-bg-soft); }.empty-state,.state-card { display: flex; min-height: 260px; align-items: center; justify-content: center; flex-direction: column; gap: 10px; border: 1px dashed var(--color-border-purple); border-radius: 20px; color: var(--color-text-muted); background: #ffffffa6; text-align: center; }.empty-state > span { display: grid; width: 58px; height: 58px; place-items: center; border-radius: 18px; color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); font-size: 25px; }.empty-state h2,.empty-state p { margin: 0; }.error-state { color: var(--color-salmon-dark); }.overlay { position: fixed; z-index: 100; inset: 0; display: grid; overflow-y: auto; padding: 22px; place-items: center; background: #1f29376b; backdrop-filter: blur(5px); }.modal-card { width: min(100%,880px); overflow: hidden; border-radius: 30px; background: white; box-shadow: 0 24px 70px #1f293740; }.modal-head { justify-content: space-between; padding: 22px 28px; border-bottom: 1px solid var(--color-bg-soft); }.modal-title { gap: 13px; }.modal-title > span { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.modal-title h2,.modal-title p { margin: 0; }.modal-title h2 { font-size: 21px; }.modal-title p { color: var(--color-text-muted); font-size: 13px; font-weight: 700; }.modal-head > button { width: 40px; height: 40px; border: 0; border-radius: 12px; color: var(--color-text-muted); background: transparent; cursor: pointer; }.modal-head > button:hover { color: var(--color-salmon-dark); background: var(--color-bg-soft); }.modal-body { display: grid; grid-template-columns: 1fr 320px; }.form-column { padding: 26px 28px; }.field { display: block; margin-bottom: 22px; }.field-label { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }.field-label b { color: var(--color-salmon-dark); }.field-label small { color: var(--color-text-muted); font-weight: 700; }.input-wrap { position: relative; display: block; }.input-wrap > i { position: absolute; z-index: 1; inset: 0 auto 0 0; width: 5px; border-radius: 5px 0 0 5px; }.front .input-wrap > i { background: var(--color-salmon); }.back .input-wrap > i { background: var(--color-periwinkle); }.field textarea { width: 100%; min-height: 105px; box-sizing: border-box; padding: 14px 16px 14px 18px; resize: vertical; border: 1.5px solid var(--color-border-purple); border-radius: 10px; color: var(--color-text); background: var(--color-bg-soft); font-weight: 600; line-height: 1.5; }.field textarea:focus { outline: none; border-color: var(--color-periwinkle); background: white; box-shadow: 0 0 0 4px #b9b4ff59; }.front textarea:focus { border-color: var(--color-salmon); box-shadow: 0 0 0 4px #ff918938; }.field.invalid textarea { border-color: var(--color-salmon-dark); }.field-error { display: block; margin-top: 7px; color: var(--color-salmon-dark); font-weight: 800; }.form-note { display: flex; align-items: flex-start; gap: 9px; margin: 0; padding: 12px 14px; border: 1px solid var(--color-border-purple); border-radius: 10px; color: var(--color-text-muted); background: var(--color-bg-soft); font-size: 13px; font-weight: 700; }.form-note i { margin-top: 3px; color: var(--color-periwinkle-dark); }.preview-column { display: flex; padding: 26px 24px; flex-direction: column; border-left: 1px solid var(--color-bg-soft); background: radial-gradient(500px 260px at 50% -20%,var(--color-periwinkle-light),transparent 60%),var(--color-bg); }.preview-title { justify-content: space-between; color: var(--color-text-muted); font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }.preview-title button { border: 0; border-radius: 8px; color: var(--color-periwinkle-dark); background: transparent; cursor: pointer; font-size: 11px; font-weight: 900; }.flip-scene { display: flex; flex: 1; align-items: center; perspective: 1200px; }.flip-card { position: relative; width: 100%; aspect-ratio: 5/3; transform-style: preserve-3d; transition: transform .55s; }.flip-card.flipped { transform: rotateY(180deg); }.flip-face { position: absolute; inset: 0; display: flex; padding: 20px; flex-direction: column; backface-visibility: hidden; border-radius: 16px; box-shadow: 0 8px 24px #8f89e81f; }.flip-front { border: 1.5px solid var(--color-border-salmon); background: linear-gradient(150deg,#fff,var(--color-salmon-light) 140%); }.flip-back { transform: rotateY(180deg); border: 1.5px solid var(--color-border-purple); background: linear-gradient(150deg,#fff,var(--color-periwinkle-light) 140%); }.flip-face small { color: var(--color-salmon-dark); font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }.flip-back small { color: var(--color-periwinkle-dark); }.flip-face p { flex: 1; margin: 10px 0; overflow-wrap: anywhere; font-weight: 900; }.flip-face p.empty { color: var(--color-text-muted); font-style: italic; font-weight: 600; opacity: .7; }.corner { align-self: flex-end; opacity: .16; }.modal-foot { justify-content: space-between; gap: 14px; padding: 18px 28px; border-top: 1px solid var(--color-bg-soft); }.modal-foot > p { min-height: 20px; margin: 0; color: var(--color-text-muted); font-size: 13px; font-weight: 800; }.modal-foot > p.error { color: var(--color-salmon-dark); }.modal-foot > div { display: flex; gap: 11px; }.toast { position: fixed; z-index: 120; bottom: 28px; left: 50%; display: flex; align-items: center; gap: 10px; transform: translateX(-50%); padding: 13px 19px; border-radius: 14px; color: white; background: var(--color-text); box-shadow: 0 20px 50px #1f29373d; font-weight: 800; }.toast span { display: grid; width: 24px; height: 24px; place-items: center; border-radius: 50%; background: var(--color-success); }.modal-enter-active,.modal-leave-active,.toast-enter-active,.toast-leave-active { transition: .2s; }.modal-enter-from,.modal-leave-to,.toast-enter-from,.toast-leave-to { opacity: 0; }.modal-enter-from .modal-card,.modal-leave-to .modal-card { transform: translateY(15px) scale(.98); }
@media (max-width:760px) { .app-shell { padding: 22px 16px 60px; }.set-head { flex-direction: column; }.set-head .btn { width: 100%; }.modal-body { grid-template-columns: 1fr; }.preview-column { min-height: 280px; order: -1; border-bottom: 1px solid var(--color-bg-soft); border-left: 0; }.modal-foot { align-items: stretch; flex-direction: column; }.modal-foot > div { flex-direction: column-reverse; }.modal-foot .btn { width: 100%; }.set-head h1 { font-size: 25px; } }
</style>
