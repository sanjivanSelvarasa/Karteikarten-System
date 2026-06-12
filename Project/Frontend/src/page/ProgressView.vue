<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import { apiRequest, type ApiResponse } from '@/services/api'

defineOptions({ name: 'ProgressView' })

interface User { username: string; email: string }
interface Flashcard { flashcard_id: number }
interface LearningSetApi { set_id: number; title: string; description: string | null; updated_at: string }
interface LearningSet extends LearningSetApi { cards: Flashcard[] }
interface StudySession { id: string; setId: number; setTitle: string; total: number; known: number; hard: number; repeat: number; completedAt: string }

const router = useRouter()
const user = ref<User | null>(readStoredUser())
const sets = ref<LearningSet[]>([])
const sessions = ref<StudySession[]>(readSessions())
const loading = ref(true)
const error = ref('')
const period = ref<'all' | '7' | '30'>('all')

function readStoredUser(): User | null {
  const raw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
  if (!raw) return null
  try { return JSON.parse(raw) as User } catch { return null }
}

function readSessions(): StudySession[] {
  try { return JSON.parse(localStorage.getItem('studyDeckSessions') || '[]') as StudySession[] } catch { return [] }
}

const filteredSessions = computed(() => {
  if (period.value === 'all') return sessions.value
  const cutoff = Date.now() - Number(period.value) * 86400000
  return sessions.value.filter((session) => new Date(session.completedAt).getTime() >= cutoff)
})
const totalCards = computed(() => sets.value.reduce((sum, set) => sum + set.cards.length, 0))
const practicedCards = computed(() => filteredSessions.value.reduce((sum, session) => sum + session.total, 0))
const knownCards = computed(() => filteredSessions.value.reduce((sum, session) => sum + session.known, 0))
const hardCards = computed(() => filteredSessions.value.reduce((sum, session) => sum + session.hard, 0))
const repeatCards = computed(() => filteredSessions.value.reduce((sum, session) => sum + session.repeat, 0))
const successRate = computed(() => practicedCards.value ? Math.round((knownCards.value / practicedCards.value) * 100) : 0)
const readinessRate = computed(() => sets.value.length ? Math.round((sets.value.filter((set) => set.cards.length).length / sets.value.length) * 100) : 0)
const nextSet = computed(() => sets.value.find((set) => set.cards.length > 0) || null)
const largestSetSize = computed(() => Math.max(0, ...sets.value.map((set) => set.cards.length)))
const setDistribution = computed(() => sets.value
  .slice()
  .sort((a, b) => b.cards.length - a.cards.length)
  .map((set) => ({ ...set, percentage: largestSetSize.value ? Math.round((set.cards.length / largestSetSize.value) * 100) : 0 })))
const recentSessions = computed(() => filteredSessions.value.slice(0, 6))
const weeklyActivity = computed(() => {
  const formatter = new Intl.DateTimeFormat('de-CH', { weekday: 'short' })
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    const next = new Date(date); next.setDate(next.getDate() + 1)
    const count = sessions.value
      .filter((session) => { const time = new Date(session.completedAt).getTime(); return time >= date.getTime() && time < next.getTime() })
      .reduce((sum, session) => sum + session.total, 0)
    return { label: formatter.format(date), count }
  })
})
const maxDailyCards = computed(() => Math.max(1, ...weeklyActivity.value.map((day) => day.count)))

function formatDate(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

async function loadProgress() {
  loading.value = true
  error.value = ''
  try {
    const [setsResponse, userResponse] = await Promise.all([
      apiRequest<ApiResponse<{ learningSets: LearningSetApi[] }>>('/api/learning-sets'),
      apiRequest<ApiResponse<{ user: User }>>('/api/auth/me'),
    ])
    user.value = userResponse.data.user
    sets.value = await Promise.all(setsResponse.data.learningSets.map(async (set) => {
      const response = await apiRequest<ApiResponse<{ flashcards: Flashcard[] }>>(`/api/learning-sets/${set.set_id}/flashcards`)
      return { ...set, cards: response.data.flashcards }
    }))
    sessions.value = readSessions()
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : 'Fortschritt konnte nicht geladen werden.'
  } finally { loading.value = false }
}

function openDashboardPanel(panel: 'profile' | 'settings' | 'upgrade') {
  void router.push({ name: 'dashboard', query: { panel } })
}

async function logout() {
  localStorage.removeItem('authToken'); localStorage.removeItem('authUser')
  sessionStorage.removeItem('authToken'); sessionStorage.removeItem('authUser')
  await router.push('/login')
}

onMounted(loadProgress)
</script>

<template>
  <div class="progress-page">
    <AppSidebar active="progress" :user="user" :learn-set-id="nextSet?.set_id" @profile="openDashboardPanel('profile')" @settings="openDashboardPanel('settings')" @upgrade="openDashboardPanel('upgrade')" @logout="logout" />

    <main class="progress-main">
      <header class="page-head">
        <div><span class="eyebrow">Lernanalyse</span><h1>Dein Fortschritt</h1><p>Sieh, wie sich deine Lernsets entwickeln und wie sicher deine Antworten werden.</p></div>
        <label class="period"><span>Zeitraum</span><select v-model="period"><option value="all">Gesamte Zeit</option><option value="7">Letzte 7 Tage</option><option value="30">Letzte 30 Tage</option></select></label>
      </header>

      <section v-if="loading" class="state"><i class="fa-solid fa-spinner fa-spin"></i> Fortschritt wird geladen …</section>
      <section v-else-if="error" class="state error"><i class="fa-solid fa-circle-exclamation"></i><span>{{ error }}</span><button @click="loadProgress">Erneut versuchen</button></section>

      <template v-else>
        <section class="kpi-grid">
          <article><span class="kpi-icon salmon"><i class="fa-solid fa-note-sticky"></i></span><div><strong>{{ totalCards }}</strong><small>Karten verfügbar</small></div></article>
          <article><span class="kpi-icon purple"><i class="fa-solid fa-repeat"></i></span><div><strong>{{ practicedCards }}</strong><small>Karten geübt</small></div></article>
          <article><span class="kpi-icon green"><i class="fa-solid fa-circle-check"></i></span><div><strong>{{ successRate }}%</strong><small>Direkt gewusst</small></div></article>
          <article><span class="kpi-icon orange"><i class="fa-solid fa-bolt"></i></span><div><strong>{{ filteredSessions.length }}</strong><small>Lernsessions</small></div></article>
        </section>

        <section v-if="!sessions.length" class="info-banner"><i class="fa-solid fa-circle-info"></i><div><strong>Noch keine abgeschlossene Lernsession</strong><p>Die Set- und Kartenwerte sind bereits sichtbar. Antwortquoten und Wochenaktivität erscheinen nach deiner ersten vollständigen Lernsession.</p></div><RouterLink v-if="nextSet" :to="`/learn/${nextSet.set_id}`">Jetzt lernen</RouterLink></section>

        <section class="analytics-grid">
          <article class="panel activity-panel">
            <header><div><h2>Aktivität</h2><p>Geübte Karten der letzten sieben Tage</p></div><span>{{ weeklyActivity.reduce((sum, day) => sum + day.count, 0) }} Karten</span></header>
            <div class="bar-chart">
              <div v-for="day in weeklyActivity" :key="day.label" class="bar-column"><span class="bar-value">{{ day.count }}</span><div class="bar-track"><i :style="{ height: `${Math.max(day.count ? 10 : 0, (day.count / maxDailyCards) * 100)}%` }"></i></div><small>{{ day.label }}</small></div>
            </div>
          </article>

          <article class="panel accuracy-panel">
            <header><div><h2>Antworten</h2><p>Bewertungen deiner Sessions</p></div></header>
            <div class="donut" :style="{ '--rate': `${successRate * 3.6}deg` }"><div><strong>{{ successRate }}%</strong><small>gewusst</small></div></div>
            <div class="answer-legend"><span><i class="green-dot"></i>Gewusst <b>{{ knownCards }}</b></span><span><i class="orange-dot"></i>Fast gewusst <b>{{ hardCards }}</b></span><span><i class="salmon-dot"></i>Wiederholen <b>{{ repeatCards }}</b></span></div>
          </article>
        </section>

        <section class="detail-grid">
          <article class="panel distribution-panel">
            <header><div><h2>Fortschritt nach Lernset</h2><p>Kartenverteilung deiner Bibliothek</p></div><RouterLink to="/sets">Alle Lernsets</RouterLink></header>
            <div v-if="setDistribution.length" class="set-list">
              <div v-for="set in setDistribution" :key="set.set_id" class="set-row"><span class="set-mark"><i class="fa-solid fa-layer-group"></i></span><div><strong>{{ set.title }}</strong><small>{{ set.cards.length }} Karten</small><span class="progress-track"><i :style="{ width: `${set.percentage}%` }"></i></span></div><RouterLink :to="set.cards.length ? `/learn/${set.set_id}` : `/sets/${set.set_id}/cards`"><i :class="set.cards.length ? 'fa-solid fa-play' : 'fa-solid fa-plus'"></i></RouterLink></div>
            </div>
            <p v-else class="empty-copy">Noch keine Lernsets vorhanden.</p>
          </article>

          <article class="panel sessions-panel">
            <header><div><h2>Letzte Sessions</h2><p>Deine zuletzt abgeschlossenen Runden</p></div></header>
            <div v-if="recentSessions.length" class="session-list">
              <div v-for="session in recentSessions" :key="session.id"><span class="session-icon"><i class="fa-solid fa-graduation-cap"></i></span><div><strong>{{ session.setTitle }}</strong><small>{{ formatDate(session.completedAt) }} · {{ session.total }} Karten</small></div><b>{{ session.total ? Math.round((session.known / session.total) * 100) : 0 }}%</b></div>
            </div>
            <p v-else class="empty-copy">Schließe eine Lernsession ab, damit sie hier erscheint.</p>
          </article>
        </section>

        <section class="readiness-card"><div><span class="readiness-icon"><i class="fa-solid fa-chart-line"></i></span><div><h2>Deine Bibliothek ist zu {{ readinessRate }}% lernbereit</h2><p>{{ sets.filter(set => set.cards.length).length }} von {{ sets.length }} Lernsets enthalten mindestens eine Karte.</p></div></div><RouterLink to="/sets">Lernsets verwalten <i class="fa-solid fa-arrow-right"></i></RouterLink></section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.progress-page { min-height: 100vh; display: flex; color: var(--color-text); background: linear-gradient(145deg,var(--color-bg),var(--color-bg-soft)); font-family: Nunito,Inter,system-ui,sans-serif; }.progress-main { min-width: 0; flex: 1; padding: 38px clamp(22px,4vw,52px) 64px; }.page-head,.panel header,.readiness-card,.readiness-card > div { display: flex; align-items: center; justify-content: space-between; gap: 20px; }.page-head { align-items: flex-end; margin-bottom: 28px; }.eyebrow { color: var(--color-periwinkle-dark); font-size: 11px; font-weight: 900; letter-spacing: .09em; text-transform: uppercase; }.page-head h1 { margin: 5px 0 4px; font-size: clamp(30px,4vw,42px); letter-spacing: -.035em; }.page-head p,.panel header p { margin: 0; color: var(--color-text-muted); font-weight: 600; }.period { display: flex; flex-direction: column; gap: 5px; }.period span { color: var(--color-text-muted); font-size: 10px; font-weight: 900; text-transform: uppercase; }.period select { min-height: 42px; padding: 0 13px; border: 1px solid var(--color-border-purple); border-radius: 11px; background: white; font: inherit; font-weight: 800; }.kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 22px; }.kpi-grid article { display: flex; align-items: center; gap: 14px; padding: 19px; border: 1px solid var(--color-border-purple); border-radius: 19px; background: white; box-shadow: 0 5px 18px #8f89e814; }.kpi-icon { display: grid; width: 46px; height: 46px; place-items: center; border-radius: 14px; font-size: 19px; }.kpi-icon.salmon { color: var(--color-salmon-dark); background: var(--color-salmon-light); }.kpi-icon.purple { color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.kpi-icon.green { color: #16a34a; background: #dcfce7; }.kpi-icon.orange { color: #d98a2b; background: #ffeccf; }.kpi-grid strong,.kpi-grid small { display: block; }.kpi-grid strong { font-size: 25px; line-height: 1; }.kpi-grid small { margin-top: 5px; color: var(--color-text-muted); font-size: 12px; font-weight: 700; }.info-banner { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; padding: 16px 18px; border: 1px solid var(--color-border-purple); border-radius: 16px; color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.info-banner > i { font-size: 21px; }.info-banner div { flex: 1; }.info-banner p { margin: 2px 0 0; color: var(--color-text-muted); font-size: 12px; }.info-banner a { padding: 9px 13px; border-radius: 10px; color: white; background: var(--color-periwinkle-dark); font-weight: 900; text-decoration: none; }.panel { padding: 22px; border: 1px solid var(--color-border-purple); border-radius: 21px; background: white; box-shadow: 0 5px 18px #8f89e814; }.panel h2 { margin: 0; font-size: 18px; }.panel header p { font-size: 12px; }.panel header > span { color: var(--color-periwinkle-dark); font-size: 12px; font-weight: 900; }.analytics-grid,.detail-grid { display: grid; gap: 20px; margin-bottom: 20px; }.analytics-grid { grid-template-columns: minmax(0,1.55fr) minmax(280px,.75fr); }.detail-grid { grid-template-columns: 1.15fr 1fr; }.bar-chart { display: flex; height: 220px; align-items: flex-end; gap: 12px; margin-top: 24px; padding: 12px 8px 0; border-bottom: 1px solid var(--color-border-purple); background: repeating-linear-gradient(to bottom,#d6d3ff55 0 1px,transparent 1px 48px); }.bar-column { display: flex; height: 100%; flex: 1; align-items: center; flex-direction: column; justify-content: flex-end; gap: 6px; }.bar-value { color: var(--color-text-muted); font-size: 10px; font-weight: 800; }.bar-track { display: flex; width: min(38px,80%); height: 160px; align-items: flex-end; }.bar-track i { display: block; width: 100%; border-radius: 9px 9px 2px 2px; background: linear-gradient(var(--color-periwinkle),var(--color-salmon)); min-height: 0; }.bar-column small { padding-bottom: 8px; color: var(--color-text-muted); font-weight: 800; }.accuracy-panel { display: flex; align-items: center; flex-direction: column; }.accuracy-panel header { width: 100%; }.donut { display: grid; width: 150px; height: 150px; margin: 25px auto 20px; place-items: center; border-radius: 50%; background: conic-gradient(var(--color-success) var(--rate),var(--color-periwinkle-light) 0); }.donut::before { position: absolute; width: 108px; height: 108px; border-radius: 50%; background: white; content: ''; }.donut div { z-index: 1; text-align: center; }.donut strong,.donut small { display: block; }.donut strong { font-size: 28px; }.donut small { color: var(--color-text-muted); font-size: 11px; }.answer-legend { display: flex; width: 100%; flex-direction: column; gap: 10px; }.answer-legend span { display: flex; align-items: center; gap: 8px; color: var(--color-text-muted); font-size: 12px; }.answer-legend b { margin-left: auto; color: var(--color-text); }.answer-legend i { width: 8px; height: 8px; border-radius: 50%; }.green-dot { background: var(--color-success); }.orange-dot { background: var(--color-accent); }.salmon-dot { background: var(--color-salmon); }.distribution-panel header a { color: var(--color-periwinkle-dark); font-size: 12px; font-weight: 900; }.set-list,.session-list { display: flex; margin-top: 18px; flex-direction: column; gap: 10px; }.set-row,.session-list > div { display: flex; align-items: center; gap: 11px; padding: 11px; border: 1px solid #d6d3ff8c; border-radius: 13px; background: var(--color-bg-soft); }.set-mark,.session-icon { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; border-radius: 11px; color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.set-row > div,.session-list > div > div { min-width: 0; flex: 1; }.set-row strong,.set-row small,.session-list strong,.session-list small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.set-row small,.session-list small { color: var(--color-text-muted); font-size: 10px; }.progress-track { display: block; height: 6px; margin-top: 6px; overflow: hidden; border-radius: 99px; background: white; }.progress-track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,var(--color-salmon),var(--color-periwinkle)); }.set-row > a { display: grid; width: 35px; height: 35px; place-items: center; border-radius: 10px; color: white; background: var(--color-periwinkle); text-decoration: none; }.session-list > div > b { color: var(--color-success); }.empty-copy { margin: 28px 0; color: var(--color-text-muted); text-align: center; }.readiness-card { padding: 20px 22px; border-radius: 21px; color: white; background: radial-gradient(100% 180% at 0 0,#ffffff2e,transparent 55%),linear-gradient(135deg,var(--color-periwinkle-dark),var(--color-salmon)); box-shadow: 0 14px 34px #8f89e838; }.readiness-icon { display: grid; width: 52px; height: 52px; place-items: center; border-radius: 16px; background: #ffffff29; font-size: 22px; }.readiness-card h2,.readiness-card p { margin: 0; }.readiness-card p { margin-top: 3px; opacity: .82; }.readiness-card > a { padding: 11px 15px; border-radius: 11px; color: var(--color-periwinkle-dark); background: white; font-weight: 900; text-decoration: none; }.state { display: flex; min-height: 300px; align-items: center; justify-content: center; gap: 11px; border: 1px dashed var(--color-border-purple); border-radius: 22px; color: var(--color-text-muted); background: white; }.state.error { color: #b91c1c; }.state button { padding: 8px 12px; border: 0; border-radius: 9px; background: var(--color-bg-soft); font-weight: 900; }
.donut { position: relative; }
@media (max-width:1100px) { .kpi-grid { grid-template-columns: repeat(2,1fr); }.analytics-grid,.detail-grid { grid-template-columns: 1fr; } }
@media (max-width:650px) { .progress-main { padding: 24px 16px 50px; }.page-head,.readiness-card { align-items: stretch; flex-direction: column; }.kpi-grid { grid-template-columns: 1fr; }.info-banner { align-items: flex-start; flex-wrap: wrap; }.info-banner a { width: 100%; text-align: center; }.bar-chart { gap: 5px; }.readiness-card > a { text-align: center; } }
</style>
