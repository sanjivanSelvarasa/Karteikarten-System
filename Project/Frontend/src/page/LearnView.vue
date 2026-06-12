<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest, type ApiResponse } from '@/services/api'
import AppSidebar from '@/components/AppSidebar.vue'

type Rating = 'again' | 'hard' | 'good'

interface Flashcard {
  flashcard_id: number
  question: string
  answer: string
}

interface User { username: string; email: string }
interface StudySession { id: string; setId: number; setTitle: string; total: number; known: number; hard: number; repeat: number; completedAt: string }

const router = useRouter()
const route = useRoute()
const cards = ref<Flashcard[]>([])
const setTitle = ref('Lernset')
const loadError = ref('')
const loading = ref(true)
const total = computed(() => cards.value.length)
const current = ref(1)
const known = ref(0)
const repeat = ref(0)
const hard = ref(0)
const flipped = ref(false)
const summaryOpen = ref(false)
const sessionSaved = ref(false)
const user = ref<User | null>(readStoredUser())

function readStoredUser(): User | null {
  const raw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
  if (!raw) return null
  try { return JSON.parse(raw) as User } catch { return null }
}

async function logout() {
  localStorage.removeItem('authToken'); localStorage.removeItem('authUser')
  sessionStorage.removeItem('authToken'); sessionStorage.removeItem('authUser')
  await router.push('/login')
}

function openDashboardPanel(panel: 'profile' | 'settings' | 'upgrade') {
  void router.push({ name: 'dashboard', query: { panel } })
}

const activeCard = computed(() => cards.value[current.value - 1] || { flashcard_id: 0, question: 'Keine Karte vorhanden', answer: 'Füge diesem Lernset zuerst Karten hinzu.' })
const percentage = computed(() => total.value ? Math.round((current.value / total.value) * 100) : 0)
const remainingMinutes = computed(() => Math.max(0, Math.round((total.value - current.value) * 0.4)))
const difficultCards = computed(() => cards.value.slice(0, 3).map((card) => ({ label: card.question, count: 1 })))

function flipCard() {
  flipped.value = !flipped.value
}

function nextCard() {
  if (current.value >= total.value) {
    saveCompletedSession()
    summaryOpen.value = true
    return
  }
  current.value += 1
  flipped.value = false
}

function saveCompletedSession() {
  if (sessionSaved.value || !total.value) return
  const setId = Number(route.params.id)
  const session: StudySession = {
    id: `${Date.now()}-${setId}`,
    setId,
    setTitle: setTitle.value,
    total: total.value,
    known: known.value,
    hard: hard.value,
    repeat: repeat.value,
    completedAt: new Date().toISOString(),
  }
  try {
    const sessions = JSON.parse(localStorage.getItem('studyDeckSessions') || '[]') as StudySession[]
    localStorage.setItem('studyDeckSessions', JSON.stringify([session, ...sessions].slice(0, 100)))
    sessionSaved.value = true
  } catch { /* Lernsession bleibt auch ohne lokalen Verlauf nutzbar. */ }
}

function previousCard() {
  if (current.value <= 1) return
  current.value -= 1
  flipped.value = false
}

function rate(level: Rating) {
  if (!flipped.value) return
  if (level === 'good') known.value += 1
  if (level === 'hard') {
    hard.value += 1
    repeat.value += 1
  }
  if (level === 'again') repeat.value += 1
  nextCard()
}

function restartDifficult() {
  current.value = 1
  known.value = 0
  repeat.value = 0
  hard.value = 0
  flipped.value = false
  summaryOpen.value = false
  sessionSaved.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (summaryOpen.value) {
    if (event.key === 'Escape') summaryOpen.value = false
    return
  }
  if (event.code === 'Space' || event.key === 'Enter') {
    event.preventDefault()
    flipCard()
  } else if (event.key === 'ArrowRight') nextCard()
  else if (event.key === 'ArrowLeft') previousCard()
  else if (flipped.value && event.key === '1') rate('again')
  else if (flipped.value && event.key === '2') rate('hard')
  else if (flipped.value && event.key === '3') rate('good')
}

async function loadLearningSet() {
  const setId = Number(route.params.id)
  if (!Number.isInteger(setId)) { loadError.value = 'Ungültiges Lernset.'; loading.value = false; return }
  try {
    const [setResponse, cardsResponse] = await Promise.all([
      apiRequest<ApiResponse<{ learningSet: { title: string } }>>(`/api/learning-sets/${setId}`),
      apiRequest<ApiResponse<{ flashcards: Flashcard[] }>>(`/api/learning-sets/${setId}/flashcards`),
    ])
    setTitle.value = setResponse.data.learningSet.title
    cards.value = cardsResponse.data.flashcards
  } catch (error) { loadError.value = error instanceof Error ? error.message : 'Lernset konnte nicht geladen werden.' }
  finally { loading.value = false }
}

onMounted(() => { document.addEventListener('keydown', handleKeydown); void loadLearningSet() })
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="learn-view">
    <AppSidebar
      active="learn"
      :user="user"
      :learn-set-id="Number(route.params.id)"
      @profile="openDashboardPanel('profile')"
      @settings="openDashboardPanel('settings')"
      @upgrade="openDashboardPanel('upgrade')"
      @logout="logout"
    />

    <div class="workspace">
      <header class="topbar">
        <div class="set-heading">
          <button class="icon-button" title="Zurück" aria-label="Zurück" @click="router.push('/dashboard')"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>
          <div>
            <h1>{{ setTitle }}</h1>
            <p>Karte {{ current }} von {{ total }}</p>
          </div>
        </div>
        <div class="session-actions">
          <span class="session-status"><i></i>Lernsession aktiv</span>
          <button class="end-button" @click="summaryOpen = true"><span><i class="fa-solid fa-stop" aria-hidden="true"></i></span> Session beenden</button>
        </div>
      </header>

      <main v-if="!loading && !loadError && total" class="content">
        <section class="learn-column">
          <div class="progress-copy">
            <strong>{{ current }} / {{ total }} Karten gelernt</strong>
            <strong>{{ percentage }}% abgeschlossen</strong>
          </div>
          <div class="progress-track"><span :style="{ width: `${percentage}%` }"></span></div>

          <div class="card-ambient">
            <div class="card-scene">
              <div class="flip-card" :class="{ flipped }">
                <article class="card-face card-front" role="button" tabindex="0" @click="flipCard">
                  <div class="face-header">
                    <span class="pill question-pill"><i class="fa-solid fa-question" aria-hidden="true"></i> Frage</span>
                    <span class="face-icon"><i class="fa-solid fa-note-sticky" aria-hidden="true"></i></span>
                  </div>
                  <div class="face-content">
                    <h2>{{ activeCard.question }}</h2>
                    <p>Klicke auf die Karte oder den Button, um die Antwort anzuzeigen.</p>
                  </div>
                  <button class="reveal-button" @click.stop="flipCard"><span><i class="fa-solid fa-eye" aria-hidden="true"></i></span> Antwort anzeigen</button>
                </article>

                <article class="card-face card-back">
                  <div class="face-header">
                    <span class="pill answer-pill"><i class="fa-solid fa-check" aria-hidden="true"></i> Antwort</span>
                    <button class="face-icon" title="Frage erneut ansehen" aria-label="Frage erneut ansehen" @click="flipCard"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i></button>
                  </div>
                  <div class="face-content answer-content"><p>{{ activeCard.answer }}</p></div>
                  <div class="rating">
                    <p>Wie gut wusstest du es?</p>
                    <div class="rating-grid">
                      <button class="rating-button again" @click="rate('again')"><i class="fa-solid fa-xmark" aria-hidden="true"></i> Nicht gewusst</button>
                      <button class="rating-button hard" @click="rate('hard')"><i class="fa-solid fa-minus" aria-hidden="true"></i> Fast gewusst</button>
                      <button class="rating-button good" @click="rate('good')"><i class="fa-solid fa-check" aria-hidden="true"></i> Gewusst</button>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div class="card-navigation">
            <button :disabled="current <= 1" @click="previousCard"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Vorherige Karte</button>
            <button class="summary-link" @click="summaryOpen = true">Abschluss-Ansicht ansehen</button>
            <button @click="nextCard">Nächste Karte <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
          </div>
          <p class="keyboard-tip">Tipp: <kbd>Leertaste</kbd> zum Aufdecken · <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> zum Bewerten</p>
        </section>

        <aside class="overview">
          <div><h2>Session-Übersicht</h2><p>Dein Fortschritt in dieser Runde</p></div>
          <div class="stat-grid">
            <article><span class="stat-icon purple"><i class="fa-solid fa-layer-group" aria-hidden="true"></i></span><strong>{{ current }}</strong><small>Gelernte Karten</small></article>
            <article><span class="stat-icon green"><i class="fa-solid fa-check" aria-hidden="true"></i></span><strong>{{ known }}</strong><small>Gewusst</small></article>
            <article><span class="stat-icon salmon"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i></span><strong>{{ repeat }}</strong><small>Wiederholen</small></article>
            <article><span class="stat-icon orange"><i class="fa-solid fa-clock" aria-hidden="true"></i></span><strong>{{ remainingMinutes }} Min.</strong><small>Geschätzte Restzeit</small></article>
          </div>
          <section class="difficult">
            <div class="difficult-title"><span><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></span><h3>Schwierige Karten</h3></div>
            <ul>
              <li v-for="card in difficultCards" :key="card.label"><strong>{{ card.label }}</strong><span>{{ card.count }}×</span></li>
            </ul>
          </section>
        </aside>
      </main>
      <main v-else class="content state-content">
        <section class="load-state"><span v-if="loading">Lernset wird geladen …</span><span v-else>{{ loadError || 'Dieses Lernset enthält noch keine Karten.' }}</span><button v-if="!loading" @click="router.push('/dashboard')">Zurück zum Dashboard</button></section>
      </main>
    </div>

    <Transition name="fade">
      <div v-if="summaryOpen" class="overlay" @click.self="summaryOpen = false">
        <section class="summary-card" role="dialog" aria-modal="true" aria-labelledby="summary-title">
          <button class="close-button" title="Schließen" aria-label="Schließen" @click="summaryOpen = false"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
          <span class="trophy"><i class="fa-solid fa-trophy" aria-hidden="true"></i></span>
          <h2 id="summary-title">Session abgeschlossen</h2>
          <p>Du hast {{ current }} Karteikarten wiederholt.</p>
          <div class="summary-stats">
            <div class="known"><strong>{{ known }}</strong><small>gewusst</small></div>
            <div class="almost"><strong>{{ hard }}</strong><small>fast gewusst</small></div>
            <div class="unknown"><strong>{{ repeat - hard }}</strong><small>nicht gewusst</small></div>
          </div>
          <RouterLink class="dashboard-button" to="/dashboard"><i class="fa-solid fa-table-columns" aria-hidden="true"></i> Zurück zum Dashboard</RouterLink>
          <button class="restart-button" @click="restartDifficult"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Schwierige Karten wiederholen</button>
        </section>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.learn-view { min-height: 100vh; display: flex; background: linear-gradient(155deg, var(--color-bg) 0 35%, var(--color-bg-soft)); font-family: Nunito, Inter, ui-sans-serif, system-ui, sans-serif; }
button, a { -webkit-tap-highlight-color: transparent; }
button { cursor: pointer; }
.workspace { min-width: 0; flex: 1; }.topbar { position: sticky; z-index: 20; top: 0; display: flex; height: 76px; align-items: center; justify-content: space-between; gap: 16px; padding: 0 clamp(20px,3vw,32px); border-bottom: 1px solid rgba(214,211,255,.45); background: rgba(255,247,246,.78); backdrop-filter: blur(12px); }.set-heading, .session-actions { display: flex; align-items: center; gap: 12px; }.set-heading h1 { margin: 0; font-size: 19px; font-weight: 900; line-height: 1.2; }.set-heading p { margin: 1px 0 0; color: var(--color-text-muted); font-size: 13px; font-weight: 700; }.icon-button { display: grid; width: 40px; height: 40px; place-items: center; border: 1px solid rgba(214,211,255,.8); border-radius: 12px; color: var(--color-text); background: white; font-size: 23px; box-shadow: 0 8px 22px -16px rgba(143,137,232,.7); }.session-status { display: flex; align-items: center; gap: 9px; color: var(--color-text-muted); font-size: 13px; font-weight: 800; }.session-status i { position: relative; width: 8px; height: 8px; border-radius: 50%; background: var(--color-success); }.session-status i::after { position: absolute; inset: -4px; border-radius: 50%; background: var(--color-success); content: ''; animation: pulse 1.8s ease-in-out infinite; }.end-button { display: flex; height: 40px; align-items: center; gap: 8px; padding: 0 16px; border: 1px solid var(--color-border-salmon); border-radius: 12px; color: var(--color-salmon-dark); background: white; font-size: 14px; font-weight: 800; }
.content { display: grid; max-width: 1200px; margin: 0 auto; grid-template-columns: minmax(0,1fr) 330px; gap: 28px; padding: 28px clamp(20px,3vw,32px) 48px; }.progress-copy { display: flex; align-items: end; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }.progress-copy strong:last-child { color: var(--color-periwinkle-dark); font-weight: 900; }.progress-track { height: 12px; overflow: hidden; border: 1px solid rgba(214,211,255,.55); border-radius: 999px; background: white; }.progress-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,var(--color-salmon),var(--color-periwinkle)); transition: width .5s ease; }
.card-ambient { position: relative; margin-top: 24px; }.card-ambient::before,.card-ambient::after { position: absolute; z-index: 0; border-radius: 50%; content: ''; filter: blur(70px); opacity: .5; pointer-events: none; }.card-ambient::before { top: -35px; left: -20px; width: 300px; height: 300px; background: var(--color-salmon-light); }.card-ambient::after { right: -30px; bottom: -55px; width: 340px; height: 340px; background: var(--color-periwinkle-light); }.card-scene { position: relative; z-index: 1; perspective: 2000px; }.flip-card { position: relative; min-height: 420px; transform-style: preserve-3d; transition: transform .7s cubic-bezier(.22,.61,.36,1); }.flip-card.flipped { transform: rotateY(180deg); }.card-face { position: absolute; inset: 0; display: flex; flex-direction: column; padding: clamp(30px,5vw,48px); border: 1px solid var(--color-border-purple); border-radius: 32px; background: white; box-shadow: 0 30px 60px -24px rgba(143,137,232,.35),0 8px 20px -10px rgba(230,111,104,.18); backface-visibility: hidden; }.card-front { cursor: pointer; }.card-back { transform: rotateY(180deg); }.flip-card:not(.flipped) .card-back,.flip-card.flipped .card-front { pointer-events: none; }.face-header { display: flex; align-items: center; justify-content: space-between; }.pill { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }.question-pill { color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.answer-pill { color: var(--color-salmon-dark); background: var(--color-salmon-light); }.face-icon { display: grid; width: 40px; height: 40px; place-items: center; border: 0; border-radius: 16px; color: var(--color-periwinkle-dark); background: var(--color-bg-soft); font-size: 20px; }.face-content { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; padding: 28px 0; text-align: center; }.face-content h2 { max-width: 30ch; margin: 0; font-size: clamp(26px,3vw,32px); font-weight: 900; line-height: 1.35; letter-spacing: -.025em; }.face-content > p { max-width: 38ch; margin: 18px 0 0; color: var(--color-text-muted); font-size: 14px; font-weight: 700; }.answer-content > p { max-width: 40ch; margin: 0; color: var(--color-text); font-size: clamp(19px,2.2vw,22px); font-weight: 800; line-height: 1.65; }.reveal-button { display: flex; min-height: 52px; align-items: center; align-self: center; gap: 9px; padding: 0 28px; border: 0; border-radius: 16px; color: white; background: linear-gradient(90deg,var(--color-salmon),var(--color-salmon-dark)); box-shadow: 0 12px 24px -14px rgba(230,111,104,.8); font-size: 15px; font-weight: 900; }.rating > p { margin: 0 0 12px; color: var(--color-text-muted); font-size: 13px; font-weight: 800; text-align: center; }.rating-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }.rating-button { min-height: 48px; border-radius: 16px; font-size: 14px; font-weight: 900; transition: .15s ease; }.rating-button:active,.reveal-button:active { transform: scale(.98); }.again { border: 1px solid var(--color-border-salmon); color: var(--color-salmon-dark); background: rgba(255,214,210,.62); }.hard,.good { border: 0; color: white; }.hard { background: var(--color-accent); }.good { background: var(--color-success); }
.card-navigation { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 24px; }.card-navigation button { min-height: 44px; padding: 0 16px; border: 1px solid rgba(214,211,255,.75); border-radius: 12px; color: var(--color-text-muted); background: white; font-size: 14px; font-weight: 800; }.card-navigation button:disabled { cursor: not-allowed; opacity: .45; }.card-navigation .summary-link { border: 0; color: var(--color-periwinkle-dark); background: transparent; font-size: 13px; }.keyboard-tip { margin: 20px 0 0; color: rgba(107,114,128,.82); font-size: 12px; font-weight: 700; text-align: center; }.keyboard-tip kbd { padding: 2px 6px; border: 1px solid rgba(214,211,255,.7); border-radius: 5px; background: white; font: inherit; font-weight: 900; }
.overview { display: flex; flex-direction: column; gap: 20px; }.overview h2 { margin: 0 0 2px; font-size: 17px; font-weight: 900; }.overview > div > p { margin: 0; color: var(--color-text-muted); font-size: 13px; font-weight: 700; }.stat-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }.stat-grid article { display: flex; min-height: 145px; flex-direction: column; padding: 16px; border: 1px solid rgba(214,211,255,.55); border-radius: 16px; background: white; box-shadow: 0 10px 25px -22px rgba(143,137,232,.8); }.stat-icon { display: grid; width: 36px; height: 36px; margin-bottom: 12px; place-items: center; border-radius: 12px; font-size: 18px; font-weight: 900; }.stat-icon.purple { color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }.stat-icon.green { color: var(--color-success); background: rgba(34,197,94,.12); }.stat-icon.salmon { color: var(--color-salmon-dark); background: var(--color-salmon-light); }.stat-icon.orange { color: #d98a2b; background: rgba(255,184,107,.18); }.stat-grid strong { font-size: 24px; font-weight: 900; line-height: 1; }.stat-grid small { margin-top: 5px; color: var(--color-text-muted); font-size: 12px; font-weight: 800; }.difficult { padding: 20px; border: 1px solid rgba(214,211,255,.55); border-radius: 16px; background: var(--color-bg-soft); }.difficult-title { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }.difficult-title > span { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 9px; color: var(--color-salmon-dark); background: var(--color-salmon-light); font-weight: 900; }.difficult h3 { margin: 0; font-size: 15px; font-weight: 900; }.difficult ul { display: flex; margin: 0; padding: 0; flex-direction: column; gap: 8px; list-style: none; }.difficult li { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid rgba(214,211,255,.45); border-radius: 12px; background: white; font-size: 14px; }.difficult li span { padding: 2px 8px; border-radius: 999px; color: var(--color-salmon-dark); background: rgba(255,214,210,.72); font-size: 11px; font-weight: 900; }
.overlay { position: fixed; z-index: 100; inset: 0; display: grid; padding: 20px; place-items: center; background: rgba(31,41,55,.24); backdrop-filter: blur(6px); }.summary-card { position: relative; width: min(100%,460px); padding: 32px; border: 1px solid var(--color-border-purple); border-radius: 28px; background: white; box-shadow: 0 30px 60px -24px rgba(31,41,55,.45); text-align: center; animation: pop .45s cubic-bezier(.22,1.2,.36,1); }.close-button { position: absolute; top: 16px; right: 16px; display: grid; width: 36px; height: 36px; place-items: center; border: 0; border-radius: 12px; color: var(--color-text-muted); background: transparent; font-size: 24px; }.trophy { display: grid; width: 64px; height: 64px; margin: 0 auto 20px; place-items: center; border-radius: 24px; color: white; background: linear-gradient(135deg,var(--color-periwinkle),var(--color-salmon)); box-shadow: 0 12px 26px -15px rgba(143,137,232,.8); font-size: 31px; }.summary-card h2 { margin: 0; font-size: 24px; font-weight: 900; }.summary-card > p { margin: 8px 0 0; color: var(--color-text-muted); font-size: 15px; font-weight: 700; }.summary-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin: 24px 0 28px; }.summary-stats div { display: flex; padding: 12px 6px; flex-direction: column; border: 1px solid; border-radius: 16px; }.summary-stats strong { font-size: 22px; font-weight: 900; line-height: 1; }.summary-stats small { margin-top: 5px; color: var(--color-text-muted); font-size: 11px; font-weight: 800; }.summary-stats .known { border-color: rgba(34,197,94,.3); color: var(--color-success); background: rgba(34,197,94,.09); }.summary-stats .almost { border-color: rgba(255,184,107,.4); color: #d98a2b; background: rgba(255,184,107,.12); }.summary-stats .unknown { border-color: var(--color-border-salmon); color: var(--color-salmon-dark); background: rgba(255,214,210,.5); }.dashboard-button,.restart-button { display: flex; width: 100%; min-height: 48px; align-items: center; justify-content: center; gap: 8px; border-radius: 16px; font-size: 15px; font-weight: 900; }.dashboard-button { color: white; background: linear-gradient(90deg,var(--color-salmon),var(--color-salmon-dark)); }.restart-button { margin-top: 12px; border: 1px solid var(--color-border-purple); color: var(--color-periwinkle-dark); background: white; }
.fade-enter-active,.fade-leave-active { transition: opacity .2s ease; }.fade-enter-from,.fade-leave-to { opacity: 0; }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: .35; } 50% { transform: scale(1.7); opacity: 0; } } @keyframes pop { from { transform: translateY(10px) scale(.985); opacity: .4; } to { transform: none; opacity: 1; } }
@media (max-width: 1050px) { .content { grid-template-columns: 1fr; }.overview { display: grid; grid-template-columns: 1fr 1fr; }.overview > div:first-child { grid-column: 1/-1; } }
@media (max-width: 680px) { .topbar { height: auto; min-height: 76px; padding-top: 12px; padding-bottom: 12px; }.session-status { display: none; }.end-button { padding: 0 11px; }.end-button span { display: none; }.content { padding-top: 22px; }.flip-card { min-height: 535px; }.card-face { padding: 28px 22px; }.rating-grid { grid-template-columns: 1fr; }.rating-button { min-height: 43px; }.overview { display: flex; }.card-navigation { display: grid; grid-template-columns: 1fr 1fr; }.card-navigation .summary-link { grid-row: 2; grid-column: 1/-1; }.keyboard-tip { line-height: 2; } }
@media (max-width: 430px) { .set-heading h1 { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.end-button { font-size: 12px; }.progress-copy { align-items: flex-start; gap: 6px; flex-direction: column; }.stat-grid { grid-template-columns: 1fr 1fr; }.summary-card { padding: 28px 20px; } }
@media (prefers-reduced-motion: reduce) { .flip-card,.progress-track span { transition: none; }.session-status i::after,.summary-card { animation: none; } }
.state-content { display: grid; min-height: calc(100vh - 76px); place-items: center; }.load-state { display: flex; width: min(100%,520px); padding: 42px; flex-direction: column; align-items: center; gap: 18px; border: 1px solid var(--color-border-purple); border-radius: 24px; color: var(--color-text-muted); background: white; text-align: center; }.load-state button { min-height: 42px; padding: 0 18px; border: 0; border-radius: 12px; color: white; background: var(--color-periwinkle-dark); font-weight: 900; }
</style>
