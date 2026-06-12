<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest, getAuthToken, type ApiResponse } from '@/services/api'
import AppSidebar from '@/components/AppSidebar.vue'

defineOptions({ name: 'DashboardPage' })

interface User { user_id: number; username: string; email: string }
interface Flashcard { flashcard_id: number; question: string; answer: string }
interface LearningSetApi { set_id: number; title: string; description: string | null; is_public: number; created_at: string; updated_at: string }
interface DashboardSet extends LearningSetApi { cards: Flashcard[]; tone: string; icon: string }

const router = useRouter()
const route = useRoute()
const search = ref('')
const loading = ref(true)
const error = ref('')
const actionError = ref('')
const notificationsOpen = ref(false)
const focusDismissed = ref(sessionStorage.getItem('focusDismissed') === 'true')
const activeModal = ref<'details' | 'edit' | 'profile' | 'settings' | 'upgrade' | null>(null)
const selectedSet = ref<DashboardSet | null>(null)
const user = ref<User | null>(readStoredUser())
const learningSets = ref<DashboardSet[]>([])
const saving = ref(false)
const deleting = ref(false)
const editForm = reactive({ title: '', description: '', isPublic: false })
const newCard = reactive({ question: '', answer: '' })
const creatingCard = ref(false)
const settings = reactive({ compact: localStorage.getItem('dashboardCompact') === 'true', notifications: localStorage.getItem('dashboardNotifications') !== 'false' })
const tones = ['salmon', 'purple', 'accent', 'success']
const icons = ['fa-solid fa-layer-group', 'fa-solid fa-book-open', 'fa-solid fa-note-sticky', 'fa-solid fa-graduation-cap']

function readStoredUser(): User | null {
  const raw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
  if (!raw) return null
  try { return JSON.parse(raw) as User } catch { return null }
}

const initials = computed(() => user.value?.username.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'HT')
const totalCards = computed(() => learningSets.value.reduce((sum, set) => sum + set.cards.length, 0))
const averageCards = computed(() => learningSets.value.length ? Math.round(totalCards.value / learningSets.value.length) : 0)
const nextSet = computed(() => learningSets.value.find((set) => set.cards.length > 0) || null)
const kpis = computed(() => [
  { icon: 'fa-solid fa-layer-group', value: String(learningSets.value.length), label: 'Lernsets', note: 'Gesamt', tone: 'salmon' },
  { icon: 'fa-solid fa-note-sticky', value: String(totalCards.value), label: 'Karteikarten gesamt', note: 'In allen Sets', tone: 'purple' },
  { icon: 'fa-solid fa-calculator', value: String(averageCards.value), label: 'Karten pro Set', note: 'Durchschnitt', tone: 'accent' },
  { icon: 'fa-solid fa-circle-check', value: String(learningSets.value.filter((set) => set.cards.length > 0).length), label: 'Bereit zum Lernen', note: 'Mit Karten', tone: 'success' },
])

const filteredSets = computed(() => {
  const term = search.value.trim().toLocaleLowerCase('de')
  if (!term) return learningSets.value
  return learningSets.value.filter((set) => `${set.title} ${set.description || ''}`.toLocaleLowerCase('de').includes(term))
})

const activities = computed(() => learningSets.value.slice(0, 4).map((set) => ({
  icon: 'fa-solid fa-pen-to-square', text: `Lernset „${set.title}“ aktualisiert`, time: formatDate(set.updated_at), tag: `${set.cards.length} Karten`, tone: set.tone,
})))
const chart = computed(() => {
  const maximum = Math.max(1, ...learningSets.value.map((set) => set.cards.length))
  return learningSets.value.slice(0, 7).map((set, index) => ({
    day: set.title.slice(0, 3),
    learned: Math.max(6, Math.round((set.cards.length / maximum) * 100)),
    correct: set.cards.length ? Math.max(4, Math.round((set.cards.length / maximum) * 72)) : 0,
    today: index === 0,
  }))
})

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'unbekannt' : new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium' }).format(date)
}

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try {
    const [setsResponse, meResponse] = await Promise.all([
      apiRequest<ApiResponse<{ learningSets: LearningSetApi[] }>>('/api/learning-sets'),
      apiRequest<ApiResponse<{ user: User }>>('/api/auth/me'),
    ])
    user.value = meResponse.data.user
    const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage
    storage.setItem('authUser', JSON.stringify(user.value))

    learningSets.value = await Promise.all(setsResponse.data.learningSets.map(async (set, index) => {
      const cardsResponse = await apiRequest<ApiResponse<{ flashcards: Flashcard[] }>>(`/api/learning-sets/${set.set_id}/flashcards`)
      return { ...set, cards: cardsResponse.data.flashcards, tone: tones[index % tones.length]!, icon: icons[index % icons.length]! }
    }))
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : 'Dashboard konnte nicht geladen werden.'
    if (!getAuthToken()) await router.push('/login')
  } finally { loading.value = false }
}

function openEdit(set: DashboardSet) {
  selectedSet.value = set
  editForm.title = set.title
  editForm.description = set.description || ''
  editForm.isPublic = Boolean(set.is_public)
  actionError.value = ''
  activeModal.value = 'edit'
}
function closeModal() { activeModal.value = null; selectedSet.value = null; actionError.value = '' }

async function addCard() {
  if (!selectedSet.value || !newCard.question.trim() || !newCard.answer.trim()) { actionError.value = 'Frage und Antwort sind erforderlich.'; return }
  creatingCard.value = true
  actionError.value = ''
  try {
    await apiRequest(`/api/learning-sets/${selectedSet.value.set_id}/flashcards`, { method: 'POST', body: JSON.stringify({ question: newCard.question.trim(), answer: newCard.answer.trim() }) })
    newCard.question = ''; newCard.answer = ''
    const setId = selectedSet.value.set_id
    await loadDashboard()
    selectedSet.value = learningSets.value.find((set) => set.set_id === setId) || null
  } catch (requestError) { actionError.value = requestError instanceof Error ? requestError.message : 'Karte konnte nicht erstellt werden.' }
  finally { creatingCard.value = false }
}

async function removeCard(card: Flashcard) {
  if (!selectedSet.value || !window.confirm(`Karte „${card.question}“ löschen?`)) return
  try {
    await apiRequest(`/api/flashcards/${card.flashcard_id}`, { method: 'DELETE' })
    const setId = selectedSet.value.set_id
    await loadDashboard()
    selectedSet.value = learningSets.value.find((set) => set.set_id === setId) || null
  } catch (requestError) { actionError.value = requestError instanceof Error ? requestError.message : 'Karte konnte nicht gelöscht werden.' }
}

async function saveSet() {
  if (!selectedSet.value || editForm.title.trim().length < 2) { actionError.value = 'Der Titel muss mindestens 2 Zeichen lang sein.'; return }
  saving.value = true
  actionError.value = ''
  try {
    await apiRequest(`/api/learning-sets/${selectedSet.value.set_id}`, { method: 'PUT', body: JSON.stringify({ title: editForm.title.trim(), description: editForm.description.trim(), isPublic: editForm.isPublic }) })
    closeModal()
    await loadDashboard()
  } catch (requestError) { actionError.value = requestError instanceof Error ? requestError.message : 'Speichern fehlgeschlagen.' }
  finally { saving.value = false }
}

async function deleteSet() {
  if (!selectedSet.value || !window.confirm(`Lernset „${selectedSet.value.title}“ wirklich löschen?`)) return
  deleting.value = true
  try {
    await apiRequest(`/api/learning-sets/${selectedSet.value.set_id}`, { method: 'DELETE' })
    closeModal()
    await loadDashboard()
  } catch (requestError) { actionError.value = requestError instanceof Error ? requestError.message : 'Löschen fehlgeschlagen.' }
  finally { deleting.value = false }
}

function dismissFocus() { focusDismissed.value = true; sessionStorage.setItem('focusDismissed', 'true') }
function saveSettings() {
  localStorage.setItem('dashboardCompact', String(settings.compact))
  localStorage.setItem('dashboardNotifications', String(settings.notifications))
  closeModal()
}
async function logout() {
  localStorage.removeItem('authToken'); localStorage.removeItem('authUser')
  sessionStorage.removeItem('authToken'); sessionStorage.removeItem('authUser')
  await router.push('/login')
}

onMounted(() => {
  const panel = route.query.panel
  if (panel === 'profile' || panel === 'settings' || panel === 'upgrade') activeModal.value = panel
  void loadDashboard()
})
</script>

<template>
  <div class="dashboard">
    <AppSidebar
      active="dashboard"
      :user="user"
      :learn-set-id="nextSet?.set_id"
      @profile="activeModal = 'profile'"
      @settings="activeModal = 'settings'"
      @upgrade="activeModal = 'upgrade'"
      @logout="logout"
    />

    <div class="main">
      <header class="topbar">
        <div class="greeting">
          <h1>Willkommen zurück, {{ user?.username || 'Lerner' }}</h1>
          <p>Bereit für deine nächste Lerneinheit?</p>
        </div>
        <div class="topbar-actions">
          <label class="search">
            <span><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></span>
            <input v-model="search" type="search" placeholder="Lernsets durchsuchen …">
          </label>
          <div class="notification-wrap">
            <button class="icon-button" title="Benachrichtigungen" @click="notificationsOpen = !notificationsOpen">
              <i class="fa-solid fa-bell" aria-hidden="true"></i><span class="notification-dot"></span>
            </button>
            <Transition name="drop">
              <div v-if="notificationsOpen && settings.notifications" class="notification-popover">
                <strong>Benachrichtigungen</strong>
                <p v-if="nextSet">„{{ nextSet.title }}“ ist mit {{ nextSet.cards.length }} Karten bereit.</p>
                <p v-else>Erstelle Karten, um eine Lernsession zu starten.</p>
                <RouterLink v-if="nextSet" :to="`/learn/${nextSet.set_id}`" @click="notificationsOpen = false">Jetzt lernen →</RouterLink>
              </div>
            </Transition>
          </div>
          <button class="avatar top-avatar" @click="activeModal = 'profile'">{{ initials }}</button>
        </div>
      </header>

      <main class="content" :class="{ compact: settings.compact }">
        <div v-if="error" class="dashboard-error">{{ error }} <button @click="loadDashboard">Erneut versuchen</button></div>
        <div v-if="loading" class="dashboard-loading"><span></span>Lernsets werden geladen …</div>
        <section class="kpi-grid" aria-label="Übersicht">
          <article v-for="kpi in kpis" :key="kpi.label" class="kpi" :class="kpi.tone">
            <div class="kpi-top"><span class="kpi-icon"><i :class="kpi.icon" aria-hidden="true"></i></span><span class="trend">{{ kpi.note }}</span></div>
            <strong>{{ kpi.value }}</strong><p>{{ kpi.label }}</p>
          </article>
        </section>

        <section id="sets" class="main-grid">
          <div>
            <div class="section-head">
              <h2>Meine Lernsets</h2>
              <RouterLink class="primary-button" to="/sets/create"><i class="fa-solid fa-plus" aria-hidden="true"></i> Neues Lernset erstellen</RouterLink>
            </div>
            <div v-if="!loading && filteredSets.length" class="set-grid">
              <article v-for="set in filteredSets" :key="set.set_id" class="set-card">
                <div class="set-head">
                  <span class="subject-icon" :class="set.tone"><i :class="set.icon" aria-hidden="true"></i></span>
                  <div><h3>{{ set.title }}</h3><p>{{ set.description || 'Keine Beschreibung' }}</p></div>
                </div>
                <div class="set-meta"><span><i class="fa-solid fa-note-sticky" aria-hidden="true"></i> {{ set.cards.length }} Karten</span><span><i class="fa-solid fa-clock" aria-hidden="true"></i> {{ formatDate(set.updated_at) }}</span></div>
                <div class="progress-row"><span>{{ set.is_public ? 'Öffentlich' : 'Privat' }}</span><strong>{{ set.cards.length ? 'Lernbereit' : 'Noch leer' }}</strong></div>
                <div class="progress-bar"><i :style="{ width: set.cards.length ? '100%' : '0%' }"></i></div>
                <div class="set-actions">
                  <RouterLink v-if="set.cards.length" class="learn-button" :to="`/learn/${set.set_id}`"><i class="fa-solid fa-play" aria-hidden="true"></i> Lernen</RouterLink>
                  <button v-else class="learn-button disabled" disabled>Keine Karten</button>
                  <RouterLink class="open-button" :to="`/sets/${set.set_id}/cards`">Öffnen</RouterLink><button class="edit" title="Bearbeiten" aria-label="Bearbeiten" @click="openEdit(set)"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
                </div>
              </article>
            </div>
            <div v-else-if="!loading" class="empty-state">
              {{ search ? `Keine Lernsets für „${search}“ gefunden.` : 'Du hast noch keine Lernsets.' }}
              <RouterLink v-if="!search" to="/sets/create">Erstes Lernset erstellen</RouterLink>
            </div>
          </div>

          <aside class="today-column">
            <div class="section-head"><h2>Heute lernen</h2></div>
            <section v-if="nextSet && !focusDismissed" class="focus-card">
              <span class="eyebrow"><i class="fa-solid fa-bolt" aria-hidden="true"></i> Nächste Einheit</span>
              <h3>{{ nextSet.title }}</h3><p>{{ nextSet.description || 'Bereit für deine nächste Runde' }}</p>
              <div class="focus-stats"><div><span>Karten</span><strong>{{ nextSet.cards.length }}</strong></div><div><span>Lernzeit</span><strong>~{{ Math.max(1, Math.ceil(nextSet.cards.length * 0.4)) }} Min</strong></div></div>
              <div class="focus-progress"><i></i></div><small>Das Lernset ist vollständig geladen.</small>
              <div class="focus-actions"><RouterLink :to="`/learn/${nextSet.set_id}`"><i class="fa-solid fa-play" aria-hidden="true"></i> Lernsession starten</RouterLink><button @click="dismissFocus">Später</button></div>
            </section>
            <section v-else-if="!loading" class="focus-empty">{{ focusDismissed ? 'Lerneinheit für diese Sitzung ausgeblendet.' : 'Füge einem Lernset Karten hinzu, um zu starten.' }}</section>
            <div class="reminders">
              <RouterLink v-if="nextSet" :to="`/learn/${nextSet.set_id}`"><span class="reminder-icon salmon"><i class="fa-solid fa-note-sticky" aria-hidden="true"></i></span><span><strong>{{ nextSet.cards.length }} Karten bereit</strong><small>{{ nextSet.title }}</small></span><b><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></b></RouterLink>
              <a href="#sets"><span class="reminder-icon purple"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></span><span><strong>{{ learningSets.filter(set => !set.cards.length).length }} leere Lernsets</strong><small>Karten ergänzen</small></span><b><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></b></a>
              <RouterLink to="/sets/create"><span class="reminder-icon accent"><i class="fa-solid fa-plus" aria-hidden="true"></i></span><span><strong>Neues Lernset</strong><small>Weiteres Thema anlegen</small></span><b><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></b></RouterLink>
            </div>
          </aside>
        </section>

        <section id="progress" class="bottom-grid">
          <div>
            <div class="section-head"><h2>Verteilung deiner Karten</h2><span>Nach Lernset</span></div>
            <article class="panel progress-panel">
              <div class="chart-summary"><div><span>Karten gesamt</span><strong>{{ totalCards }}</strong></div><div><span>Größtes Set</span><strong>{{ Math.max(0, ...learningSets.map(set => set.cards.length)) }}</strong></div><div><span>Lernbereit</span><strong>{{ learningSets.filter(set => set.cards.length).length }} Sets</strong></div></div>
              <div v-if="chart.length" class="chart">
                <div v-for="item in chart" :key="item.day" class="chart-column" :class="{ today: item.today }">
                  <div class="bars"><i :style="{ height: `${item.learned}%` }"></i><i :style="{ height: `${item.correct}%` }"></i></div>
                  <span>{{ item.day }}</span>
                </div>
              </div>
              <div v-else class="chart-empty">Noch keine Karten für eine Auswertung vorhanden.</div>
              <div class="legend"><span><i class="salmon-dot"></i>Kartenmenge</span><span><i class="purple-dot"></i>Vergleichswert</span></div>
            </article>
          </div>

          <div>
            <div class="section-head"><h2>Letzte Aktivitäten</h2><span>Heute</span></div>
            <article v-if="activities.length" class="panel activity-panel">
              <div v-for="activity in activities" :key="activity.text" class="activity-item">
                <span class="activity-icon" :class="activity.tone"><i :class="activity.icon" aria-hidden="true"></i></span>
                <span class="activity-copy"><strong>{{ activity.text }}</strong><small>{{ activity.time }}</small></span>
                <span class="activity-tag" :class="activity.tone">{{ activity.tag }}</span>
              </div>
            </article>
            <div v-else class="panel empty-activities">Noch keine Lernset-Aktivitäten.</div>
          </div>
        </section>
      </main>
    </div>

    <Transition name="modal">
      <div v-if="activeModal" class="modal-backdrop" @click.self="closeModal">
        <section class="modal-card" role="dialog" aria-modal="true">
          <button class="modal-close" title="Schließen" aria-label="Schließen" @click="closeModal"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>

          <template v-if="activeModal === 'details' && selectedSet">
            <span class="modal-mark" :class="selectedSet.tone"><i :class="selectedSet.icon" aria-hidden="true"></i></span>
            <h2>{{ selectedSet.title }}</h2>
            <p>{{ selectedSet.description || 'Keine Beschreibung vorhanden.' }}</p>
            <div class="detail-stats"><div><strong>{{ selectedSet.cards.length }}</strong><span>Karten</span></div><div><strong>{{ selectedSet.is_public ? 'Ja' : 'Nein' }}</strong><span>Öffentlich</span></div></div>
            <div v-if="selectedSet.cards.length" class="card-preview">
              <strong>Karten</strong>
              <div v-for="card in selectedSet.cards" :key="card.flashcard_id"><span>{{ card.question }}</span><small>{{ card.answer }}</small><button title="Karte löschen" aria-label="Karte löschen" @click="removeCard(card)"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div>
            </div>
            <form class="quick-card-form" @submit.prevent="addCard">
              <strong>Neue Karte</strong>
              <input v-model="newCard.question" placeholder="Frage">
              <textarea v-model="newCard.answer" rows="2" placeholder="Antwort"></textarea>
              <p v-if="actionError" class="modal-error">{{ actionError }}</p>
              <button class="modal-primary" type="submit" :disabled="creatingCard">{{ creatingCard ? 'Fügt hinzu …' : 'Karte hinzufügen' }}</button>
            </form>
            <RouterLink v-if="selectedSet.cards.length" class="modal-primary" :to="`/learn/${selectedSet.set_id}`">Lernsession starten</RouterLink>
            <button class="modal-secondary" @click="openEdit(selectedSet)">Lernset bearbeiten</button>
          </template>

          <template v-else-if="activeModal === 'edit' && selectedSet">
            <span class="modal-mark purple"><i class="fa-solid fa-pen" aria-hidden="true"></i></span><h2>Lernset bearbeiten</h2><p>Ändere Titel, Beschreibung oder Sichtbarkeit.</p>
            <form class="modal-form" @submit.prevent="saveSet">
              <label>Titel<input v-model="editForm.title" maxlength="100"></label>
              <label>Beschreibung<textarea v-model="editForm.description" rows="4"></textarea></label>
              <label class="modal-check"><input v-model="editForm.isPublic" type="checkbox"> Öffentlich</label>
              <p v-if="actionError" class="modal-error">{{ actionError }}</p>
              <button class="modal-primary" type="submit" :disabled="saving">{{ saving ? 'Speichert …' : 'Änderungen speichern' }}</button>
              <button class="danger-button" type="button" :disabled="deleting" @click="deleteSet">{{ deleting ? 'Löscht …' : 'Lernset löschen' }}</button>
            </form>
          </template>

          <template v-else-if="activeModal === 'profile'">
            <span class="profile-avatar">{{ initials }}</span><h2>{{ user?.username }}</h2><p>{{ user?.email }}</p>
            <div class="detail-stats"><div><strong>{{ learningSets.length }}</strong><span>Lernsets</span></div><div><strong>{{ totalCards }}</strong><span>Karten</span></div></div>
            <button class="modal-secondary" @click="logout">Abmelden</button>
          </template>

          <template v-else-if="activeModal === 'settings'">
            <span class="modal-mark accent"><i class="fa-solid fa-gear" aria-hidden="true"></i></span><h2>Dashboard-Einstellungen</h2><p>Diese Einstellungen werden lokal im Browser gespeichert.</p>
            <div class="settings-list">
              <label><span><strong>Kompakte Ansicht</strong><small>Weniger Abstand zwischen Inhalten</small></span><input v-model="settings.compact" type="checkbox"></label>
              <label><span><strong>Benachrichtigungen</strong><small>Hinweise im Dashboard anzeigen</small></span><input v-model="settings.notifications" type="checkbox"></label>
            </div>
            <button class="modal-primary" @click="saveSettings">Einstellungen speichern</button>
          </template>

          <template v-else>
            <span class="modal-mark salmon"><i class="fa-solid fa-star" aria-hidden="true"></i></span><h2>HawkTalk Pro</h2><p>Das Projekt hat aktuell keine Bezahlfunktion. Alle vorhandenen Lernfunktionen bleiben frei nutzbar.</p>
            <button class="modal-primary" @click="closeModal">Verstanden</button>
          </template>
        </section>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dashboard { --shadow-sm: 0 2px 8px #1f29370a; --shadow-md: 0 6px 18px #8f89e824; min-height: 100vh; display: flex; color: var(--color-text); background: var(--color-bg); font-family: Nunito, Inter, system-ui, sans-serif; font-weight: 600; }
button { cursor: pointer; border: 0; font: inherit; }
.main { min-width: 0; flex: 1; }.topbar { position: sticky; z-index: 20; top: 0; display: flex; align-items: center; gap: 24px; padding: 18px 34px; border-bottom: 1px solid var(--color-border-salmon); background: #ffffffd1; backdrop-filter: blur(12px); }.greeting h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -.02em; }.greeting p { margin: 0; color: var(--color-text-muted); font-size: 14px; }.topbar-actions { position: relative; display: flex; margin-left: auto; align-items: center; gap: 14px; }.search { position: relative; display: flex; align-items: center; }.search span { position: absolute; left: 14px; color: var(--color-text-muted); font-size: 21px; }.search input { width: 268px; padding: 11px 14px 11px 42px; border: 1px solid var(--color-border-purple); border-radius: 14px; color: var(--color-text); background: var(--color-bg-soft); font: inherit; font-size: 14px; }.search input:focus { outline: 0; border-color: var(--color-periwinkle); background: white; box-shadow: 0 0 0 4px var(--color-periwinkle-light); }.notification-wrap { position: relative; }.icon-button { position: relative; display: grid; width: 44px; height: 44px; place-items: center; border: 1px solid var(--color-border-purple); border-radius: 14px; color: var(--color-text); background: white; font-size: 20px; }.notification-dot { position: absolute; top: 8px; right: 9px; width: 9px; height: 9px; border: 2px solid white; border-radius: 50%; background: var(--color-salmon); }.notification-popover { position: absolute; top: 52px; right: 0; width: 280px; padding: 16px; border: 1px solid var(--color-border-purple); border-radius: 14px; background: white; box-shadow: 0 16px 38px #1f293726; }.notification-popover p { margin: 6px 0 10px; color: var(--color-text-muted); font-size: 13px; }.notification-popover a { color: var(--color-periwinkle-dark); font-size: 13px; font-weight: 900; }.drop-enter-active,.drop-leave-active { transition: .16s; }.drop-enter-from,.drop-leave-to { transform: translateY(-5px); opacity: 0; }
.content { display: flex; padding: 30px 34px 44px; flex-direction: column; gap: 28px; }.kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }.kpi { padding: 20px; border: 1px solid var(--color-border-salmon); border-radius: 20px; background: white; box-shadow: var(--shadow-sm); transition: .18s; }.kpi:hover,.set-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }.kpi.purple,.kpi.success { border-color: var(--color-border-purple); }.kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }.kpi-icon { display: grid; width: 46px; height: 46px; place-items: center; border-radius: 13px; font-size: 22px; font-weight: 900; }.kpi.salmon .kpi-icon { color: var(--color-salmon-dark); background: var(--color-salmon-light); }.kpi.purple .kpi-icon { color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.kpi.accent .kpi-icon { color: #d98a2b; background: #ffeccf; }.kpi.success .kpi-icon { color: #16a34a; background: #dcfce7; }.trend { padding: 4px 8px; border-radius: 8px; color: var(--color-success); background: #ecfdf3; font-size: 12px; font-weight: 900; }.kpi > strong { font-size: 32px; font-weight: 900; line-height: 1; }.kpi > p { margin: 6px 0 0; color: var(--color-text-muted); font-size: 13px; }
.main-grid { display: grid; grid-template-columns: minmax(0,1.85fr) minmax(290px,1fr); gap: 24px; align-items: start; }.section-head { display: flex; min-height: 43px; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }.section-head h2 { margin: 0; font-size: 19px; font-weight: 900; }.section-head > span { color: var(--color-text-muted); font-size: 13px; }.primary-button { padding: 11px 18px; border-radius: 14px; color: white; background: linear-gradient(135deg,var(--color-salmon),var(--color-salmon-dark)); box-shadow: 0 10px 24px #e66f6847; font-size: 14px; font-weight: 900; }.set-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 18px; }.set-card { display: flex; padding: 18px; flex-direction: column; border: 1px solid var(--color-border-purple); border-radius: 20px; background: white; box-shadow: var(--shadow-sm); transition: .18s; }.set-head { display: flex; align-items: center; gap: 12px; margin-bottom: 13px; }.subject-icon { display: grid; width: 44px; height: 44px; flex: 0 0 44px; place-items: center; border-radius: 13px; font-size: 21px; font-weight: 900; }.subject-icon.salmon,.reminder-icon.salmon,.activity-icon.salmon { color: var(--color-salmon-dark); background: var(--color-salmon-light); }.subject-icon.purple,.reminder-icon.purple,.activity-icon.purple { color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.subject-icon.accent,.reminder-icon.accent,.activity-icon.accent { color: #d98a2b; background: #ffeccf; }.subject-icon.success,.activity-icon.success { color: #16a34a; background: #dcfce7; }.set-head h3 { margin: 0; font-size: 16px; font-weight: 900; }.set-head p { margin: 0; color: var(--color-text-muted); font-size: 12px; }.set-meta { display: flex; gap: 16px; margin-bottom: 13px; color: var(--color-text-muted); font-size: 12px; font-weight: 700; }.progress-row { display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--color-text-muted); font-size: 12px; }.progress-row strong { color: var(--color-text); }.progress-bar { height: 8px; margin-bottom: 16px; overflow: hidden; border-radius: 99px; background: var(--color-bg-soft); }.progress-bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,var(--color-salmon),var(--color-periwinkle)); }.set-actions { display: flex; gap: 8px; margin-top: auto; }.set-actions a,.set-actions button { display: flex; min-height: 38px; flex: 1; align-items: center; justify-content: center; border-radius: 10px; color: var(--color-text); background: var(--color-bg-soft); font-size: 13px; font-weight: 900; }.set-actions .learn-button { color: white; background: var(--color-periwinkle); }.set-actions .edit { flex: 0 0 38px; }.empty-state { padding: 42px; border: 1px dashed var(--color-border-purple); border-radius: 20px; color: var(--color-text-muted); background: white; text-align: center; }
.today-column { display: flex; flex-direction: column; gap: 20px; }.today-column .section-head { margin-bottom: -2px; }.focus-card { position: relative; overflow: hidden; padding: 24px; border-radius: 26px; color: white; background: radial-gradient(120% 120% at 0 0,#ffffff2e,transparent 50%),linear-gradient(150deg,var(--color-periwinkle-dark),var(--color-salmon)); box-shadow: 0 12px 32px #8f89e829; }.focus-card::after { position: absolute; top: -40px; right: -40px; width: 150px; height: 150px; border: 22px solid #ffffff14; border-radius: 50%; content: ''; }.eyebrow { font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }.focus-card h3 { margin: 18px 0 0; font-size: 25px; }.focus-card > p { margin: 0; opacity: .82; }.focus-stats { display: grid; margin: 22px 0 16px; grid-template-columns: 1fr 1fr; gap: 10px; }.focus-stats div { padding: 11px; border-radius: 12px; background: #ffffff1f; }.focus-stats span,.focus-stats strong { display: block; }.focus-stats span { font-size: 11px; opacity: .78; }.focus-stats strong { margin-top: 2px; }.focus-progress { height: 7px; overflow: hidden; border-radius: 99px; background: #ffffff38; }.focus-progress i { display: block; width: 38%; height: 100%; border-radius: inherit; background: white; }.focus-card > small { display: block; margin-top: 7px; opacity: .8; }.focus-actions { display: flex; gap: 8px; margin-top: 20px; }.focus-actions a,.focus-actions button { display: flex; min-height: 42px; align-items: center; justify-content: center; border-radius: 11px; font-size: 13px; font-weight: 900; }.focus-actions a { flex: 1; color: var(--color-periwinkle-dark); background: white; }.focus-actions button { padding: 0 15px; color: white; background: #ffffff1f; }.reminders { display: flex; flex-direction: column; gap: 10px; }.reminders > a { display: flex; align-items: center; gap: 11px; padding: 12px; border: 1px solid var(--color-border-purple); border-radius: 14px; background: white; }.reminder-icon { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 11px; font-weight: 900; }.reminders a > span:nth-child(2) { display: flex; flex: 1; flex-direction: column; }.reminders strong { font-size: 13px; }.reminders small { color: var(--color-text-muted); font-size: 11px; }.reminders b { color: var(--color-text-muted); font-size: 21px; }
.bottom-grid { display: grid; grid-template-columns: minmax(0,1.55fr) minmax(320px,1fr); gap: 24px; align-items: start; }.panel { border: 1px solid var(--color-border-purple); border-radius: 20px; background: white; box-shadow: var(--shadow-sm); }.progress-panel { padding: 22px; }.chart-summary { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }.chart-summary div { display: flex; flex-direction: column; }.chart-summary span { color: var(--color-text-muted); font-size: 11px; }.chart-summary strong { font-size: 20px; }.chart-summary em { color: var(--color-success); font-size: 11px; font-style: normal; }.chart { display: flex; height: 180px; align-items: end; justify-content: space-between; gap: 12px; margin-top: 20px; padding-top: 12px; border-bottom: 1px solid var(--color-border-purple); background: repeating-linear-gradient(to bottom,#d6d3ff55 0 1px,transparent 1px 45px); }.chart-column { display: flex; height: 100%; flex: 1; flex-direction: column; align-items: center; justify-content: end; gap: 7px; }.bars { display: flex; width: 100%; height: 135px; align-items: end; justify-content: center; gap: 4px; }.bars i { width: min(14px,35%); border-radius: 5px 5px 0 0; background: var(--color-salmon); }.bars i:last-child { background: var(--color-periwinkle); }.chart-column > span { padding-bottom: 8px; color: var(--color-text-muted); font-size: 11px; }.chart-column.today > span { color: var(--color-salmon-dark); font-weight: 900; }.legend { display: flex; gap: 18px; margin-top: 14px; color: var(--color-text-muted); font-size: 11px; }.legend span { display: flex; align-items: center; gap: 6px; }.legend i { width: 8px; height: 8px; border-radius: 50%; }.salmon-dot { background: var(--color-salmon); }.purple-dot { background: var(--color-periwinkle); }.activity-panel { overflow: hidden; }.activity-item { display: flex; align-items: center; gap: 11px; padding: 15px; border-bottom: 1px solid #d6d3ff70; }.activity-item:last-child { border: 0; }.activity-icon { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; border-radius: 11px; font-weight: 900; }.activity-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; }.activity-copy strong { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }.activity-copy small { color: var(--color-text-muted); font-size: 11px; }.activity-tag { padding: 4px 7px; border-radius: 8px; font-size: 10px; font-weight: 900; }.activity-tag.purple { color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.activity-tag.success { color: #16a34a; background: #dcfce7; }.activity-tag.salmon { color: var(--color-salmon-dark); background: var(--color-salmon-light); }.activity-tag.accent { color: #d98a2b; background: #ffeccf; }
@media (max-width: 1180px) { .kpi-grid { grid-template-columns: repeat(2,1fr); }.main-grid,.bottom-grid { grid-template-columns: 1fr; }.today-column { display: grid; grid-template-columns: 1fr 1fr; }.today-column .section-head { grid-column: 1/-1; }.reminders { justify-content: center; } }
@media (max-width: 880px) { .topbar { padding: 16px 22px; }.content { padding: 24px 22px 40px; }.search input { width: 210px; } }
@media (max-width: 650px) { .topbar { align-items: flex-start; flex-direction: column; }.topbar-actions { width: 100%; margin-left: 0; }.search { flex: 1; }.search input { width: 100%; }.top-avatar { display: none; }.set-grid,.today-column { grid-template-columns: 1fr; }.today-column .section-head { grid-column: auto; }.section-head { align-items: flex-start; flex-direction: column; }.primary-button { width: 100%; text-align: center; }.chart-summary { grid-template-columns: 1fr 1fr; } }
@media (max-width: 430px) { .kpi-grid { grid-template-columns: 1fr; }.content { padding-inline: 16px; }.topbar { padding-inline: 16px; }.set-meta { align-items: flex-start; flex-direction: column; gap: 4px; }.chart { gap: 4px; }.activity-tag { display: none; } }
.set-actions .disabled { cursor: not-allowed; opacity: .5; }.dashboard-loading,.dashboard-error { display: flex; min-height: 52px; align-items: center; justify-content: center; gap: 10px; padding: 12px 16px; border-radius: 14px; font-size: 13px; font-weight: 800; }.dashboard-loading { border: 1px solid var(--color-border-purple); color: var(--color-periwinkle-dark); background: white; }.dashboard-loading span { width: 18px; height: 18px; border: 2px solid var(--color-periwinkle-light); border-top-color: var(--color-periwinkle-dark); border-radius: 50%; animation: spin .7s linear infinite; }.dashboard-error { border: 1px solid #fecaca; color: #b91c1c; background: #fef2f2; }.dashboard-error button { padding: 6px 10px; border-radius: 8px; color: #b91c1c; background: white; font-weight: 900; }.compact { gap: 18px; padding-top: 20px; }.compact .set-card,.compact .kpi { padding: 14px; }.empty-state a { display: block; width: fit-content; margin: 14px auto 0; color: var(--color-periwinkle-dark); font-weight: 900; }.focus-empty,.chart-empty,.empty-activities { padding: 24px; border: 1px dashed var(--color-border-purple); border-radius: 18px; color: var(--color-text-muted); background: white; text-align: center; }.chart-empty { margin: 20px 0; }.empty-activities { min-height: 120px; display: grid; place-items: center; }
.modal-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; overflow-y: auto; padding: 20px; place-items: center; background: #1f29374d; backdrop-filter: blur(7px); }.modal-card { position: relative; width: min(100%,520px); max-height: calc(100vh - 40px); overflow-y: auto; padding: 30px; border: 1px solid var(--color-border-purple); border-radius: 24px; background: white; box-shadow: 0 30px 70px #1f293740; }.modal-close { position: absolute; top: 14px; right: 14px; width: 36px; height: 36px; border-radius: 10px; color: var(--color-text-muted); background: var(--color-bg-soft); font-size: 23px; }.modal-mark,.profile-avatar { display: grid; width: 52px; height: 52px; margin-bottom: 16px; place-items: center; border-radius: 16px; font-size: 22px; font-weight: 900; }.profile-avatar { color: white; background: linear-gradient(135deg,var(--color-periwinkle-dark),var(--color-salmon)); }.modal-mark.salmon { color: var(--color-salmon-dark); background: var(--color-salmon-light); }.modal-mark.purple { color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.modal-mark.accent { color: #d98a2b; background: #ffeccf; }.modal-card h2 { margin: 0; font-size: 24px; }.modal-card > p { margin: 5px 0 20px; color: var(--color-text-muted); }.detail-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }.detail-stats div { display: flex; padding: 14px; flex-direction: column; border: 1px solid var(--color-border-purple); border-radius: 14px; background: var(--color-bg-soft); }.detail-stats strong { font-size: 20px; }.detail-stats span { color: var(--color-text-muted); font-size: 11px; }.card-preview { margin-bottom: 18px; }.card-preview > strong { display: block; margin-bottom: 8px; }.card-preview div { display: flex; padding: 10px 0; flex-direction: column; border-bottom: 1px solid #d6d3ff80; }.card-preview span { font-size: 13px; font-weight: 800; }.card-preview small { color: var(--color-text-muted); }.modal-primary,.modal-secondary,.danger-button { display: flex; width: 100%; min-height: 44px; align-items: center; justify-content: center; border: 0; border-radius: 12px; font-weight: 900; }.modal-primary { color: white; background: linear-gradient(135deg,var(--color-salmon),var(--color-salmon-dark)); }.modal-secondary { margin-top: 9px; color: var(--color-periwinkle-dark); background: var(--color-bg-soft); }.danger-button { margin-top: 9px; color: #b91c1c; background: #fef2f2; }.modal-form { display: flex; flex-direction: column; gap: 14px; }.modal-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 900; }.modal-form input,.modal-form textarea { padding: 11px 12px; border: 1px solid var(--color-border-purple); border-radius: 11px; color: var(--color-text); background: var(--color-bg-soft); font: inherit; resize: vertical; }.modal-form .modal-check { flex-direction: row; align-items: center; }.modal-check input { width: 17px; }.modal-error { margin: 0; color: var(--color-error); font-size: 12px; }.settings-list { display: flex; margin-bottom: 20px; flex-direction: column; gap: 10px; }.settings-list label { display: flex; align-items: center; gap: 18px; padding: 14px; border: 1px solid var(--color-border-purple); border-radius: 13px; }.settings-list label > span { display: flex; flex: 1; flex-direction: column; }.settings-list small { color: var(--color-text-muted); }.settings-list input { width: 18px; height: 18px; }.modal-enter-active,.modal-leave-active { transition: opacity .18s; }.modal-enter-from,.modal-leave-to { opacity: 0; } @keyframes spin { to { transform: rotate(360deg); } }
.card-preview div { position: relative; padding-right: 34px; }.card-preview button { position: absolute; top: 10px; right: 0; width: 28px; height: 28px; border-radius: 8px; color: #b91c1c; background: #fef2f2; font-size: 18px; }.quick-card-form { display: flex; margin: 18px 0; flex-direction: column; gap: 9px; }.quick-card-form input,.quick-card-form textarea { padding: 10px 12px; border: 1px solid var(--color-border-purple); border-radius: 10px; background: var(--color-bg-soft); font: inherit; resize: vertical; }
</style>
