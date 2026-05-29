<script setup lang="ts">
import { ref, computed } from 'vue'

defineOptions({ name: 'DashboardPage' })

const userName = ref('Max Mustermann')

const stats = ref([
  { label: 'Lernsets', value: 8, icon: '📚', color: 'salmon' },
  { label: 'Karten gesamt', value: 142, icon: '🃏', color: 'periwinkle' },
  { label: 'Heute gelernt', value: 24, icon: '✅', color: 'accent' },
  { label: 'Lerntage', value: 12, icon: '🔥', color: 'success' },
])

const lernsets = ref([
  { id: 1, title: 'Mathe – Analysis', count: 38, progress: 72, lastLearned: 'Heute' },
  { id: 2, title: 'Deutsch – Grammatik', count: 25, progress: 45, lastLearned: 'Gestern' },
  { id: 3, title: 'Englisch Vokabeln', count: 54, progress: 91, lastLearned: 'vor 2 Tagen' },
  { id: 4, title: 'Geschichte – WK2', count: 19, progress: 18, lastLearned: 'vor 5 Tagen' },
  { id: 5, title: 'Biologie – Zellen', count: 6, progress: 0, lastLearned: 'Nie' },
])

const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const activity = ref([true, true, false, true, true, false, false])

const progressColor = computed(() => (val: number) => {
  if (val >= 80) return 'var(--color-success)'
  if (val >= 40) return 'var(--color-accent)'
  return 'var(--color-salmon)'
})
</script>

<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar" aria-label="Seitennavigation">
      <a class="brand" href="/" aria-label="Zur Startseite">
        <span class="brand-mark">K</span>
        <span class="brand-name">Karteikarten</span>
      </a>

      <nav class="sidebar-nav" aria-label="Hauptnavigation">
        <a class="nav-item active" href="/dashboard" aria-current="page">
          <span class="nav-icon">⊞</span>
          Dashboard
        </a>
        <a class="nav-item" href="/lernsets">
          <span class="nav-icon">📚</span>
          Lernsets
        </a>
        <a class="nav-item" href="/lernen">
          <span class="nav-icon">🃏</span>
          Lernen
        </a>
        <a class="nav-item" href="/statistiken">
          <span class="nav-icon">📊</span>
          Statistiken
        </a>
      </nav>

      <div class="sidebar-footer">
        <a class="nav-item" href="/einstellungen">
          <span class="nav-icon">⚙</span>
          Einstellungen
        </a>
        <a class="nav-item logout" href="/login">
          <span class="nav-icon">→</span>
          Abmelden
        </a>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">Dashboard</h1>
          <p class="greeting">Willkommen zurück, <strong>{{ userName }}</strong>!</p>
        </div>
        <div class="topbar-right">
          <a class="btn-primary" href="/lernsets/neu">
            <span>+</span> Neues Lernset
          </a>
          <div class="avatar" aria-label="Profilbild">{{ userName.charAt(0) }}</div>
        </div>
      </header>

      <!-- Stats -->
      <section class="stats-grid" aria-label="Übersicht">
        <article
          v-for="stat in stats"
          :key="stat.label"
          class="stat-card"
          :class="`stat-card--${stat.color}`"
        >
          <span class="stat-icon" aria-hidden="true">{{ stat.icon }}</span>
          <div>
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </article>
      </section>

      <!-- Weekly Activity -->
      <section class="activity-section" aria-label="Wochentliche Aktivität">
        <div class="section-header">
          <h2>Diese Woche</h2>
        </div>
        <div class="activity-bar">
          <div
            v-for="(active, i) in activity"
            :key="i"
            class="activity-day"
            :class="{ 'activity-day--active': active }"
          >
            <div class="activity-dot"></div>
            <span>{{ weekDays[i] }}</span>
          </div>
        </div>
      </section>

      <!-- Lernsets -->
      <section class="lernsets-section" aria-label="Meine Lernsets">
        <div class="section-header">
          <h2>Meine Lernsets</h2>
          <a class="link-muted" href="/lernsets">Alle anzeigen →</a>
        </div>

        <div class="lernsets-list">
          <article
            v-for="set in lernsets"
            :key="set.id"
            class="lernset-card"
          >
            <div class="lernset-info">
              <h3>{{ set.title }}</h3>
              <p class="lernset-meta">{{ set.count }} Karten · Zuletzt: {{ set.lastLearned }}</p>
            </div>

            <div class="lernset-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{
                    width: set.progress + '%',
                    background: progressColor(set.progress),
                  }"
                ></div>
              </div>
              <span class="progress-label">{{ set.progress }}%</span>
            </div>

            <div class="lernset-actions">
              <a class="btn-secondary" :href="`/lernen/${set.id}`">Lernen</a>
              <a class="btn-ghost" :href="`/lernsets/${set.id}`">Bearbeiten</a>
            </div>
          </article>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions" aria-label="Schnellzugriff">
        <div class="section-header">
          <h2>Schnellzugriff</h2>
        </div>
        <div class="quick-grid">
          <a class="quick-card" href="/lernsets/neu">
            <span class="quick-icon">➕</span>
            <span>Lernset erstellen</span>
          </a>
          <a class="quick-card" href="/lernen/zufall">
            <span class="quick-icon">🎲</span>
            <span>Zufällig lernen</span>
          </a>
          <a class="quick-card" href="/statistiken">
            <span class="quick-icon">📈</span>
            <span>Fortschritt sehen</span>
          </a>
          <a class="quick-card" href="/importieren">
            <span class="quick-icon">📥</span>
            <span>Importieren</span>
          </a>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Layout */
.dashboard {
  display: grid;
  grid-template-columns: 15rem 1fr;
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 1.5rem 1rem;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border-purple);
  overflow-y: auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  color: var(--color-text);
  font-weight: 900;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-salmon), var(--color-periwinkle));
  color: var(--color-text-light);
  font-weight: 900;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(230, 111, 104, 0.22);
}

.brand-name {
  font-size: 0.95rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--color-periwinkle-light);
  color: var(--color-text);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--color-salmon-light), var(--color-periwinkle-light));
  color: var(--color-salmon-dark);
  font-weight: 900;
}

.nav-icon {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-purple);
}

.logout {
  color: var(--color-error);
}

.logout:hover {
  background: #fee2e2;
  color: var(--color-error);
}

/* Main */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem clamp(1.5rem, 4vw, 3rem);
  overflow-y: auto;
}

/* Topbar */
.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  margin: 0 0 0.2rem;
  font-size: 1.9rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.greeting {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.1rem;
  border-radius: 10px;
  background: var(--color-salmon-dark);
  color: var(--color-text-light);
  font-weight: 900;
  font-size: 0.9rem;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(230, 111, 104, 0.25);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-salmon);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(230, 111, 104, 0.35);
}

.avatar {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-periwinkle), var(--color-periwinkle-dark));
  color: var(--color-text-light);
  font-weight: 900;
  font-size: 1rem;
  flex-shrink: 0;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 14px;
  background: var(--color-surface);
  border: 1px solid transparent;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-card--salmon {
  border-color: var(--color-border-salmon);
  background: linear-gradient(135deg, var(--color-surface) 60%, var(--color-salmon-light));
}

.stat-card--periwinkle {
  border-color: var(--color-border-purple);
  background: linear-gradient(135deg, var(--color-surface) 60%, var(--color-periwinkle-light));
}

.stat-card--accent {
  border-color: rgba(255, 184, 107, 0.35);
  background: linear-gradient(135deg, var(--color-surface) 60%, rgba(255, 184, 107, 0.2));
}

.stat-card--success {
  border-color: rgba(34, 197, 94, 0.25);
  background: linear-gradient(135deg, var(--color-surface) 60%, rgba(34, 197, 94, 0.1));
}

.stat-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.stat-card div {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 900;
  line-height: 1.1;
  color: var(--color-text);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.link-muted {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s;
}

.link-muted:hover {
  color: var(--color-salmon-dark);
}

/* Weekly Activity */
.activity-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border-purple);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
}

.activity-bar {
  display: flex;
  gap: 0.5rem;
}

.activity-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
}

.activity-dot {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 8px;
  background: var(--color-bg-soft);
  border: 2px solid var(--color-border-purple);
  transition: all 0.2s ease;
}

.activity-day--active .activity-dot {
  background: linear-gradient(135deg, var(--color-salmon), var(--color-periwinkle));
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(230, 111, 104, 0.3);
}

.activity-day span {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.activity-day--active span {
  color: var(--color-salmon-dark);
}

/* Lernsets */
.lernsets-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border-purple);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
}

.lernsets-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.lernset-card {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.1rem;
  border-radius: 10px;
  border: 1px solid transparent;
  background: var(--color-bg);
  transition: all 0.2s ease;
}

.lernset-card:hover {
  border-color: var(--color-border-salmon);
  background: var(--color-surface);
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(230, 111, 104, 0.08);
}

.lernset-info h3 {
  margin: 0 0 0.2rem;
  font-size: 0.95rem;
  font-weight: 800;
}

.lernset-meta {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.lernset-progress {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 10rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  border-radius: 99px;
  background: var(--color-bg-soft);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}

.progress-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text-muted);
  min-width: 2.5rem;
  text-align: right;
}

.lernset-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  background: var(--color-salmon-dark);
  color: var(--color-text-light);
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-salmon);
  box-shadow: 0 4px 12px rgba(230, 111, 104, 0.3);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--color-border-purple);
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
  background: transparent;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  border-color: var(--color-periwinkle-dark);
  color: var(--color-text);
  background: var(--color-periwinkle-light);
}

/* Quick Actions */
.quick-actions {
  padding-bottom: 2rem;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  padding: 1.5rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--color-border-purple);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  text-align: center;
  transition: all 0.25s ease;
}

.quick-card:hover {
  border-color: var(--color-salmon-light);
  background: linear-gradient(135deg, var(--color-salmon-light), var(--color-periwinkle-light));
  color: var(--color-text);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(230, 111, 104, 0.15);
}

.quick-icon {
  font-size: 1.75rem;
}

/* Responsive */
@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 1rem;
    border-right: none;
    border-bottom: 1px solid var(--color-border-purple);
  }

  .brand {
    margin-bottom: 0;
  }

  .sidebar-nav {
    flex-direction: row;
    flex: none;
    gap: 0.25rem;
  }

  .sidebar-footer {
    flex-direction: row;
    border-top: none;
    border-left: 1px solid var(--color-border-purple);
    padding-top: 0;
    padding-left: 0.75rem;
    margin-left: auto;
  }

  .lernset-card {
    grid-template-columns: 1fr;
  }

  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .stats-grid,
  .quick-grid {
    grid-template-columns: 1fr 1fr;
  }

  .topbar {
    flex-direction: column;
  }
}
</style>
