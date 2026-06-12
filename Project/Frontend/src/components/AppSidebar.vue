<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'AppSidebar' })

interface SidebarUser {
  username: string
  email: string
}

const props = withDefaults(defineProps<{
  active?: 'dashboard' | 'learn' | 'progress'
  user?: SidebarUser | null
  learnSetId?: number | null
}>(), {
  active: 'dashboard',
  user: null,
  learnSetId: null,
})

const emit = defineEmits<{
  profile: []
  settings: []
  upgrade: []
  logout: []
}>()

const initials = computed(() => props.user?.username
  .split(/\s+/)
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase() || 'HT')
</script>

<template>
  <aside class="app-sidebar" aria-label="Hauptnavigation">
    <RouterLink class="sidebar-brand" to="/">
      <span class="brand-mark"><i class="fa-solid fa-feather-pointed" aria-hidden="true"></i></span>
      <span class="brand-name">Hawk<span>Talk</span></span>
    </RouterLink>

    <p class="nav-label">Menü</p>
    <nav class="sidebar-nav">
      <RouterLink class="nav-item" :class="{ active: active === 'dashboard' }" to="/dashboard">
        <span><i class="fa-solid fa-table-columns" aria-hidden="true"></i></span>Dashboard
      </RouterLink>
      <RouterLink class="nav-item" to="/dashboard#sets">
        <span><i class="fa-solid fa-layer-group" aria-hidden="true"></i></span>Meine Lernsets
      </RouterLink>
      <RouterLink v-if="learnSetId" class="nav-item" :class="{ active: active === 'learn' }" :to="`/learn/${learnSetId}`">
        <span><i class="fa-solid fa-bolt" aria-hidden="true"></i></span>Lernmodus
      </RouterLink>
      <RouterLink v-else class="nav-item disabled" to="/dashboard#sets">
        <span><i class="fa-solid fa-bolt" aria-hidden="true"></i></span>Lernmodus
      </RouterLink>
      <RouterLink class="nav-item" :class="{ active: active === 'progress' }" to="/dashboard#progress">
        <span><i class="fa-solid fa-chart-line" aria-hidden="true"></i></span>Fortschritt
      </RouterLink>
      <button class="nav-item" type="button" @click="emit('profile')">
        <span><i class="fa-solid fa-user" aria-hidden="true"></i></span>Profil
      </button>
      <button class="nav-item" type="button" @click="emit('settings')">
        <span><i class="fa-solid fa-gear" aria-hidden="true"></i></span>Einstellungen
      </button>
    </nav>

    <div class="sidebar-spacer"></div>
    <section class="upgrade-card">
      <h2>HawkTalk Pro</h2>
      <p>Unbegrenzte Lernsets und smarte Wiederholungen freischalten.</p>
      <button type="button" @click="emit('upgrade')">Jetzt upgraden</button>
    </section>

    <div class="user-mini">
      <span class="avatar">{{ initials }}</span>
      <span class="user-info"><strong>{{ user?.username || 'Benutzer' }}</strong><small>{{ user?.email || 'Angemeldet' }}</small></span>
      <button class="logout" type="button" title="Abmelden" aria-label="Abmelden" @click="emit('logout')">
        <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar { position: sticky; top: 0; display: flex; width: 264px; height: 100vh; flex: 0 0 264px; flex-direction: column; padding: 26px 18px; border-right: 1px solid var(--color-border-purple); background: var(--color-bg-soft); }
.sidebar-brand { display: flex; align-items: center; gap: 12px; padding: 6px 8px 26px; color: var(--color-text); text-decoration: none; }
.brand-mark { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; border-radius: 13px; color: white; background: linear-gradient(135deg,var(--color-salmon),var(--color-periwinkle)); box-shadow: var(--shadow-md); }
.brand-name { font-size: 21px; font-weight: 900; }.brand-name span { color: var(--color-salmon-dark); }
.nav-label { margin: 6px 0 0; padding: 6px 12px; color: var(--color-text-muted); font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.sidebar-nav { display: flex; flex-direction: column; gap: 4px; }.nav-item { display: flex; width: 100%; align-items: center; gap: 13px; padding: 11px 13px; border: 0; border-radius: 14px; color: var(--color-text-muted); background: transparent; cursor: pointer; font: inherit; font-size: 15px; font-weight: 700; text-align: left; text-decoration: none; transition: .18s; }.nav-item > span { width: 21px; text-align: center; }.nav-item:hover { color: var(--color-text); background: var(--color-periwinkle-light); }.nav-item.active { color: white; background: var(--color-periwinkle); box-shadow: 0 6px 16px #8f89e859; }.nav-item.disabled { opacity: .5; }
.sidebar-spacer { flex: 1; }.upgrade-card { margin-bottom: 16px; padding: 16px; border: 1px solid var(--color-border-purple); border-radius: 20px; background: linear-gradient(140deg,var(--color-salmon-light),var(--color-periwinkle-light)); }.upgrade-card h2 { margin: 0 0 4px; font-size: 14px; }.upgrade-card p { margin: 0 0 12px; color: var(--color-text-muted); font-size: 12px; }.upgrade-card button { width: 100%; padding: 9px; border: 0; border-radius: 10px; color: var(--color-salmon-dark); background: white; cursor: pointer; font: inherit; font-weight: 800; }
.user-mini { display: flex; align-items: center; gap: 11px; padding: 10px; border: 1px solid var(--color-border-purple); border-radius: 14px; background: white; }.avatar { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; border-radius: 50%; color: white; background: linear-gradient(135deg,var(--color-periwinkle-dark),var(--color-salmon)); font-size: 13px; font-weight: 900; }.user-info { display: flex; min-width: 0; flex: 1; flex-direction: column; }.user-info strong { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }.user-info small { overflow: hidden; color: var(--color-text-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.logout { border: 0; color: var(--color-text-muted); background: transparent; cursor: pointer; font-size: 18px; }
@media (max-width: 1050px) { .app-sidebar { display: none; } }
</style>
