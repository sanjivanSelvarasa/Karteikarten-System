<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import { apiRequest, type ApiResponse } from '@/services/api'

defineOptions({ name: 'LearningSetsView' })

interface User { username: string; email: string }
interface Flashcard { flashcard_id: number }
interface LearningSetApi { set_id: number; title: string; description: string | null; is_public: number; created_at: string; updated_at: string }
interface LearningSet extends LearningSetApi { cards: Flashcard[]; icon: string; tone: string }

const router = useRouter()
const user = ref<User | null>(readStoredUser())
const sets = ref<LearningSet[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const visibility = ref<'all' | 'private' | 'public'>('all')
const readiness = ref<'all' | 'ready' | 'empty'>('all')
const sort = ref<'updated' | 'title' | 'cards'>('updated')
const selectedSet = ref<LearningSet | null>(null)
const modalOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const actionError = ref('')
const editForm = reactive({ title: '', description: '', isPublic: false })
const tones = ['salmon', 'purple', 'accent', 'success']
const icons = ['fa-solid fa-layer-group', 'fa-solid fa-book-open', 'fa-solid fa-note-sticky', 'fa-solid fa-graduation-cap']

function readStoredUser(): User | null {
  const raw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
  if (!raw) return null
  try { return JSON.parse(raw) as User } catch { return null }
}

const totalCards = computed(() => sets.value.reduce((sum, set) => sum + set.cards.length, 0))
const readySets = computed(() => sets.value.filter((set) => set.cards.length > 0).length)
const nextSet = computed(() => sets.value.find((set) => set.cards.length > 0) || null)
const filteredSets = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('de')
  return sets.value
    .filter((set) => !term || `${set.title} ${set.description || ''}`.toLocaleLowerCase('de').includes(term))
    .filter((set) => visibility.value === 'all' || (visibility.value === 'public' ? Boolean(set.is_public) : !set.is_public))
    .filter((set) => readiness.value === 'all' || (readiness.value === 'ready' ? set.cards.length > 0 : set.cards.length === 0))
    .slice()
    .sort((a, b) => {
      if (sort.value === 'title') return a.title.localeCompare(b.title, 'de')
      if (sort.value === 'cards') return b.cards.length - a.cards.length
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
})

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'unbekannt' : new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium' }).format(date)
}

async function loadSets() {
  loading.value = true
  error.value = ''
  try {
    const [setsResponse, userResponse] = await Promise.all([
      apiRequest<ApiResponse<{ learningSets: LearningSetApi[] }>>('/api/learning-sets'),
      apiRequest<ApiResponse<{ user: User }>>('/api/auth/me'),
    ])
    user.value = userResponse.data.user
    sets.value = await Promise.all(setsResponse.data.learningSets.map(async (set, index) => {
      const response = await apiRequest<ApiResponse<{ flashcards: Flashcard[] }>>(`/api/learning-sets/${set.set_id}/flashcards`)
      return { ...set, cards: response.data.flashcards, tone: tones[index % tones.length]!, icon: icons[index % icons.length]! }
    }))
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : 'Lernsets konnten nicht geladen werden.'
  } finally { loading.value = false }
}

function openEdit(set: LearningSet) {
  selectedSet.value = set
  editForm.title = set.title
  editForm.description = set.description || ''
  editForm.isPublic = Boolean(set.is_public)
  actionError.value = ''
  modalOpen.value = true
}

function closeModal() {
  if (saving.value || deleting.value) return
  modalOpen.value = false
  selectedSet.value = null
  actionError.value = ''
}

async function saveSet() {
  if (!selectedSet.value || editForm.title.trim().length < 2) {
    actionError.value = 'Der Titel muss mindestens 2 Zeichen lang sein.'
    return
  }
  saving.value = true
  actionError.value = ''
  try {
    await apiRequest(`/api/learning-sets/${selectedSet.value.set_id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: editForm.title.trim(), description: editForm.description.trim(), isPublic: editForm.isPublic }),
    })
    modalOpen.value = false
    selectedSet.value = null
    await loadSets()
  } catch (requestError) {
    actionError.value = requestError instanceof Error ? requestError.message : 'Speichern fehlgeschlagen.'
  } finally { saving.value = false }
}

async function deleteSet() {
  if (!selectedSet.value || !window.confirm(`Lernset „${selectedSet.value.title}“ wirklich löschen?`)) return
  deleting.value = true
  try {
    await apiRequest(`/api/learning-sets/${selectedSet.value.set_id}`, { method: 'DELETE' })
    modalOpen.value = false
    selectedSet.value = null
    await loadSets()
  } catch (requestError) {
    actionError.value = requestError instanceof Error ? requestError.message : 'Löschen fehlgeschlagen.'
  } finally { deleting.value = false }
}

function openDashboardPanel(panel: 'profile' | 'settings' | 'upgrade') {
  void router.push({ name: 'dashboard', query: { panel } })
}

async function logout() {
  localStorage.removeItem('authToken'); localStorage.removeItem('authUser')
  sessionStorage.removeItem('authToken'); sessionStorage.removeItem('authUser')
  await router.push('/login')
}

onMounted(loadSets)
</script>

<template>
  <div class="sets-page">
    <AppSidebar
      active="sets"
      :user="user"
      :learn-set-id="nextSet?.set_id"
      @profile="openDashboardPanel('profile')"
      @settings="openDashboardPanel('settings')"
      @upgrade="openDashboardPanel('upgrade')"
      @logout="logout"
    />

    <main class="sets-main">
      <header class="page-head">
        <div><span class="eyebrow">Deine Bibliothek</span><h1>Meine Lernsets</h1><p>Organisiere deine Themen, ergänze Karten und starte direkt mit dem Lernen.</p></div>
        <RouterLink class="primary-button" to="/sets/create"><i class="fa-solid fa-plus"></i> Neues Lernset</RouterLink>
      </header>

      <section class="summary-grid" aria-label="Übersicht">
        <article><span class="summary-icon salmon"><i class="fa-solid fa-layer-group"></i></span><div><strong>{{ sets.length }}</strong><small>Lernsets gesamt</small></div></article>
        <article><span class="summary-icon purple"><i class="fa-solid fa-note-sticky"></i></span><div><strong>{{ totalCards }}</strong><small>Karteikarten</small></div></article>
        <article><span class="summary-icon green"><i class="fa-solid fa-circle-check"></i></span><div><strong>{{ readySets }}</strong><small>Bereit zum Lernen</small></div></article>
      </section>

      <section class="toolbar">
        <label class="search"><i class="fa-solid fa-magnifying-glass"></i><input v-model="search" type="search" placeholder="Lernsets durchsuchen …"></label>
        <label><span>Sichtbarkeit</span><select v-model="visibility"><option value="all">Alle</option><option value="private">Privat</option><option value="public">Öffentlich</option></select></label>
        <label><span>Status</span><select v-model="readiness"><option value="all">Alle</option><option value="ready">Lernbereit</option><option value="empty">Ohne Karten</option></select></label>
        <label><span>Sortierung</span><select v-model="sort"><option value="updated">Zuletzt geändert</option><option value="title">Alphabetisch</option><option value="cards">Kartenanzahl</option></select></label>
      </section>

      <section v-if="loading" class="state"><i class="fa-solid fa-spinner fa-spin"></i> Lernsets werden geladen …</section>
      <section v-else-if="error" class="state error"><i class="fa-solid fa-circle-exclamation"></i><span>{{ error }}</span><button @click="loadSets">Erneut versuchen</button></section>

      <section v-else-if="filteredSets.length" class="sets-grid">
        <article v-for="set in filteredSets" :key="set.set_id" class="set-card">
          <header>
            <span class="set-icon" :class="set.tone"><i :class="set.icon"></i></span>
            <span class="visibility"><i :class="set.is_public ? 'fa-solid fa-earth-europe' : 'fa-solid fa-lock'"></i> {{ set.is_public ? 'Öffentlich' : 'Privat' }}</span>
          </header>
          <h2>{{ set.title }}</h2>
          <p>{{ set.description || 'Keine Beschreibung vorhanden.' }}</p>
          <div class="set-meta"><span><i class="fa-solid fa-note-sticky"></i> {{ set.cards.length }} Karten</span><span><i class="fa-solid fa-clock"></i> {{ formatDate(set.updated_at) }}</span></div>
          <div class="readiness" :class="{ empty: !set.cards.length }"><span></span>{{ set.cards.length ? 'Bereit zum Lernen' : 'Noch keine Karten' }}</div>
          <footer>
            <RouterLink class="open-button" :to="`/sets/${set.set_id}/cards`"><i class="fa-solid fa-folder-open"></i> Öffnen</RouterLink>
            <RouterLink v-if="set.cards.length" class="learn-button" :to="`/learn/${set.set_id}`"><i class="fa-solid fa-play"></i> Lernen</RouterLink>
            <button v-else class="learn-button disabled" disabled><i class="fa-solid fa-play"></i> Lernen</button>
            <button class="edit-button" title="Bearbeiten" aria-label="Bearbeiten" @click="openEdit(set)"><i class="fa-solid fa-pen"></i></button>
          </footer>
        </article>
      </section>

      <section v-else class="empty-state">
        <span><i class="fa-solid fa-layer-group"></i></span>
        <h2>{{ sets.length ? 'Keine passenden Lernsets' : 'Noch keine Lernsets' }}</h2>
        <p>{{ sets.length ? 'Passe deine Suche oder Filter an.' : 'Erstelle dein erstes Lernset und füge anschließend Karteikarten hinzu.' }}</p>
        <RouterLink v-if="!sets.length" class="primary-button" to="/sets/create"><i class="fa-solid fa-plus"></i> Erstes Lernset erstellen</RouterLink>
      </section>
    </main>

    <Transition name="modal">
      <div v-if="modalOpen && selectedSet" class="modal-backdrop" @click.self="closeModal">
        <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-title">
          <button class="modal-close" title="Schließen" aria-label="Schließen" @click="closeModal"><i class="fa-solid fa-xmark"></i></button>
          <span class="modal-icon"><i class="fa-solid fa-pen"></i></span>
          <h2 id="edit-title">Lernset bearbeiten</h2>
          <p>Ändere Titel, Beschreibung oder Sichtbarkeit.</p>
          <form @submit.prevent="saveSet">
            <label>Titel<input v-model="editForm.title" maxlength="100"></label>
            <label>Beschreibung<textarea v-model="editForm.description" rows="4"></textarea></label>
            <label class="checkbox"><input v-model="editForm.isPublic" type="checkbox"> Öffentliches Lernset</label>
            <p v-if="actionError" class="form-error">{{ actionError }}</p>
            <button class="save-button" type="submit" :disabled="saving || deleting">{{ saving ? 'Speichert …' : 'Änderungen speichern' }}</button>
            <button class="delete-button" type="button" :disabled="saving || deleting" @click="deleteSet"><i class="fa-solid fa-trash"></i> {{ deleting ? 'Wird gelöscht …' : 'Lernset löschen' }}</button>
          </form>
        </section>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.sets-page { min-height: 100vh; display: flex; color: var(--color-text); background: linear-gradient(145deg,var(--color-bg),var(--color-bg-soft)); font-family: Nunito,Inter,system-ui,sans-serif; }.sets-main { min-width: 0; flex: 1; padding: 38px clamp(22px,4vw,52px) 64px; }.page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 28px; }.eyebrow { color: var(--color-periwinkle-dark); font-size: 11px; font-weight: 900; letter-spacing: .09em; text-transform: uppercase; }.page-head h1 { margin: 5px 0 4px; font-size: clamp(30px,4vw,42px); letter-spacing: -.035em; }.page-head p { margin: 0; color: var(--color-text-muted); font-weight: 600; }.primary-button { display: inline-flex; min-height: 46px; align-items: center; justify-content: center; gap: 8px; padding: 0 18px; border-radius: 14px; color: white; background: linear-gradient(135deg,var(--color-salmon),var(--color-salmon-dark)); box-shadow: 0 10px 24px #e66f6847; font-weight: 900; text-decoration: none; }.summary-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin-bottom: 22px; }.summary-grid article { display: flex; align-items: center; gap: 14px; padding: 18px; border: 1px solid var(--color-border-purple); border-radius: 18px; background: white; box-shadow: 0 5px 18px #8f89e814; }.summary-icon { display: grid; width: 44px; height: 44px; place-items: center; border-radius: 13px; }.summary-icon.salmon { color: var(--color-salmon-dark); background: var(--color-salmon-light); }.summary-icon.purple { color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.summary-icon.green { color: #16a34a; background: #dcfce7; }.summary-grid strong,.summary-grid small { display: block; }.summary-grid strong { font-size: 24px; line-height: 1; }.summary-grid small { margin-top: 4px; color: var(--color-text-muted); font-weight: 700; }.toolbar { display: grid; grid-template-columns: minmax(220px,1fr) repeat(3,auto); gap: 12px; margin-bottom: 24px; padding: 14px; border: 1px solid var(--color-border-purple); border-radius: 18px; background: #ffffffbd; }.toolbar label { display: flex; flex-direction: column; gap: 5px; }.toolbar label > span { color: var(--color-text-muted); font-size: 10px; font-weight: 900; text-transform: uppercase; }.toolbar input,.toolbar select { min-height: 42px; padding: 0 12px; border: 1px solid var(--color-border-purple); border-radius: 11px; color: var(--color-text); background: var(--color-bg-soft); font: inherit; font-size: 13px; font-weight: 700; }.toolbar input:focus,.toolbar select:focus { outline: 3px solid #b9b4ff38; border-color: var(--color-periwinkle); background: white; }.toolbar .search { position: relative; justify-content: flex-end; }.search i { position: absolute; left: 13px; bottom: 13px; color: var(--color-text-muted); }.search input { padding-left: 38px; }.sets-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(290px,1fr)); gap: 18px; }.set-card { display: flex; min-height: 310px; padding: 20px; flex-direction: column; border: 1px solid var(--color-border-purple); border-radius: 21px; background: white; box-shadow: 0 5px 18px #8f89e814; transition: .18s; }.set-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px #8f89e824; }.set-card header { display: flex; align-items: flex-start; justify-content: space-between; }.set-icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 15px; font-size: 21px; }.set-icon.salmon { color: var(--color-salmon-dark); background: var(--color-salmon-light); }.set-icon.purple { color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.set-icon.accent { color: #d98a2b; background: #ffeccf; }.set-icon.success { color: #16a34a; background: #dcfce7; }.visibility { padding: 5px 9px; border-radius: 9px; color: var(--color-text-muted); background: var(--color-bg-soft); font-size: 10px; font-weight: 900; }.set-card h2 { margin: 17px 0 5px; font-size: 19px; }.set-card > p { display: -webkit-box; min-height: 42px; margin: 0 0 16px; overflow: hidden; color: var(--color-text-muted); font-size: 13px; font-weight: 600; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }.set-meta { display: flex; flex-wrap: wrap; gap: 12px; color: var(--color-text-muted); font-size: 11px; font-weight: 800; }.readiness { display: flex; align-items: center; gap: 7px; margin-top: 13px; color: #16803a; font-size: 11px; font-weight: 900; }.readiness span { width: 7px; height: 7px; border-radius: 50%; background: var(--color-success); }.readiness.empty { color: #b56b16; }.readiness.empty span { background: var(--color-accent); }.set-card footer { display: flex; gap: 8px; margin-top: auto; padding-top: 18px; }.set-card footer a,.set-card footer button { display: flex; min-height: 39px; align-items: center; justify-content: center; gap: 6px; border: 0; border-radius: 11px; cursor: pointer; font: inherit; font-size: 12px; font-weight: 900; text-decoration: none; }.open-button { flex: 1; color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.learn-button { flex: 1; color: white; background: var(--color-periwinkle); }.learn-button.disabled { cursor: not-allowed; opacity: .5; }.edit-button { width: 39px; color: var(--color-text-muted); background: var(--color-bg-soft); }.state,.empty-state { display: flex; min-height: 280px; align-items: center; justify-content: center; flex-direction: column; gap: 12px; border: 1px dashed var(--color-border-purple); border-radius: 22px; color: var(--color-text-muted); background: white; text-align: center; }.state { flex-direction: row; }.state.error { color: #b91c1c; }.state button { padding: 8px 12px; border: 0; border-radius: 9px; background: var(--color-bg-soft); font-weight: 900; }.empty-state > span { display: grid; width: 60px; height: 60px; place-items: center; border-radius: 18px; color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); font-size: 25px; }.empty-state h2,.empty-state p { margin: 0; }.modal-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; padding: 20px; place-items: center; background: #1f29374d; backdrop-filter: blur(6px); }.modal-card { position: relative; width: min(100%,520px); padding: 30px; border-radius: 24px; background: white; box-shadow: 0 30px 70px #1f293740; }.modal-close { position: absolute; top: 14px; right: 14px; width: 36px; height: 36px; border: 0; border-radius: 10px; color: var(--color-text-muted); background: var(--color-bg-soft); }.modal-icon { display: grid; width: 52px; height: 52px; place-items: center; border-radius: 16px; color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); font-size: 21px; }.modal-card h2 { margin: 16px 0 3px; }.modal-card > p { margin: 0 0 20px; color: var(--color-text-muted); }.modal-card form,.modal-card label { display: flex; flex-direction: column; }.modal-card form { gap: 14px; }.modal-card label { gap: 6px; font-size: 12px; font-weight: 900; }.modal-card input,.modal-card textarea { padding: 11px 12px; border: 1px solid var(--color-border-purple); border-radius: 11px; background: var(--color-bg-soft); font: inherit; }.modal-card .checkbox { align-items: center; flex-direction: row; }.checkbox input { width: 17px; }.form-error { margin: 0; color: #b91c1c; font-size: 12px; }.save-button,.delete-button { min-height: 44px; border: 0; border-radius: 12px; font-weight: 900; }.save-button { color: white; background: linear-gradient(135deg,var(--color-salmon),var(--color-salmon-dark)); }.delete-button { color: #b91c1c; background: #fef2f2; }.modal-enter-active,.modal-leave-active { transition: .18s; }.modal-enter-from,.modal-leave-to { opacity: 0; }
@media (max-width:900px) { .toolbar { grid-template-columns: 1fr 1fr; }.summary-grid { grid-template-columns: 1fr; } }
@media (max-width:650px) { .sets-main { padding: 24px 16px 50px; }.page-head { align-items: stretch; flex-direction: column; }.toolbar { grid-template-columns: 1fr; }.sets-grid { grid-template-columns: 1fr; } }
</style>
