<template>
  <main class="study-page">
    <header class="topbar">
      <button class="ghost" type="button" @click="goBack">Zurück</button>
      <div>
        <h1>Üben</h1>
        <p v-if="learningSet">{{ learningSet.title }}</p>
      </div>
      <span class="counter" v-if="currentCard">{{ currentCardIndex + 1 }} / {{ flashcards.length }}</span>
    </header>

    <section class="panel" v-if="errorMessage">
      <p class="error">{{ errorMessage }}</p>
    </section>

    <section class="panel panel--study" v-else-if="currentCard">
      <button class="study-card" type="button" @click="flipCard" :aria-pressed="isCardFlipped">
        <span class="flip-inner" :class="{ flipped: isCardFlipped }">
          <span class="face face--front">
            <small>Frage</small>
            <p>{{ currentCard.question }}</p>
            <span>Klicken zum Umdrehen</span>
          </span>
          <span class="face face--back">
            <small>Antwort</small>
            <p>{{ currentCard.answer }}</p>
            <span>Klicken zum Zurückdrehen</span>
          </span>
        </span>
      </button>

      <div class="controls">
        <button class="ghost" type="button" @click="previousCard" :disabled="currentCardIndex === 0">
          Zurück
        </button>
        <button class="ghost" type="button" @click="nextCard" :disabled="currentCardIndex === flashcards.length - 1">
          Weiter
        </button>
      </div>
    </section>

    <section class="panel" v-else>
      <p>Dieses Lernset hat keine Karten.</p>
      <button class="primary" type="button" @click="goBack">Zurück zum Dashboard</button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { listFlashcards, listLearningSets, listPublicLearningSets, type Flashcard, type LearningSet } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const flashcards = ref<Flashcard[]>([])
const learningSet = ref<LearningSet | null>(null)
const currentCardIndex = ref(0)
const isCardFlipped = ref(false)
const errorMessage = ref('')

const setId = Number(route.params.setId)

const currentCard = computed(() => flashcards.value[currentCardIndex.value] ?? null)

function getTokenOrThrow() {
  if (!authStore.token) {
    throw new Error('Nicht authentifiziert')
  }

  return authStore.token
}

function goBack() {
  router.push('/dashboard')
}

function flipCard() {
  isCardFlipped.value = !isCardFlipped.value
}

function nextCard() {
  if (currentCardIndex.value >= flashcards.value.length - 1) return
  currentCardIndex.value += 1
  isCardFlipped.value = false
}

function previousCard() {
  if (currentCardIndex.value <= 0) return
  currentCardIndex.value -= 1
  isCardFlipped.value = false
}

async function loadLearningSetInfo() {
  const token = getTokenOrThrow()
  const [mine, publicSets] = await Promise.all([listLearningSets(token), listPublicLearningSets(token)])
  learningSet.value = [...mine.learningSets, ...publicSets.learningSets].find((set) => set.set_id === setId) ?? null
}

async function loadFlashcardsForSet() {
  const token = getTokenOrThrow()
  const response = await listFlashcards(token, setId)
  flashcards.value = response.flashcards
}

onMounted(async () => {
  errorMessage.value = ''
  if (!Number.isInteger(setId) || setId <= 0) {
    errorMessage.value = 'Ungültiges Lernset.'
    return
  }

  try {
    await Promise.all([loadLearningSetInfo(), loadFlashcardsForSet()])
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Daten konnten nicht geladen werden.'
  }
})
</script>

<style scoped>
.study-page {
  min-height: 100vh;
  padding: 1rem;
  background: var(--color-bg);
  color: var(--color-text);
  display: grid;
  gap: 1rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.topbar h1 {
  margin: 0;
}

.topbar p {
  margin: 0.25rem 0 0;
  color: var(--color-text-muted);
}

.counter {
  color: var(--color-text-muted);
  font-weight: 700;
}

.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border-purple);
  border-radius: 14px;
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
}

.panel--study {
  background:
    radial-gradient(circle at top right, color-mix(in oklab, var(--color-salmon-dark) 12%, transparent), transparent 55%),
    var(--color-surface);
}

.study-card {
  border: 1px solid var(--color-border-purple);
  border-radius: 12px;
  background: transparent;
  padding: 0;
  cursor: pointer;
  min-height: 200px;
  perspective: 1100px;
  overflow: hidden;
  box-shadow: 0 16px 34px -26px rgba(0, 0, 0, 0.55);
}

.flip-inner {
  position: relative;
  display: block;
  min-height: 220px;
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 420ms ease;
}

.flip-inner.flipped {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  inset: 0;
  padding: 1.2rem;
  border-radius: 12px;
  display: grid;
  gap: 0.7rem;
  align-content: center;
  text-align: left;
  backface-visibility: hidden;
}

.face--front {
  background: linear-gradient(145deg, var(--color-bg-soft), color-mix(in oklab, var(--color-bg-soft) 82%, white));
}

.face--back {
  background: linear-gradient(145deg, color-mix(in oklab, var(--color-salmon-dark) 14%, white), var(--color-bg-soft));
  transform: rotateY(180deg);
}

.face small,
.face span {
  color: var(--color-text-muted);
}

.face p {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.45;
}

.controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.primary,
.ghost {
  border: 0;
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.primary {
  background: var(--color-salmon-dark);
  color: var(--color-text-light);
}

.ghost {
  background: var(--color-bg-soft);
}

.error {
  color: var(--color-error);
  margin: 0;
}
</style>
