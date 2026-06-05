<template>
    <div class="auth-page">
      <!-- Decorative background blobs -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
  
      <div class="auth-container">
        <!-- Left panel: branding -->
        <div class="brand-panel">
          <div class="brand-inner">
            <div class="logo">
              <span class="logo-icon">🃏</span>
            </div>
            <h1 class="brand-title">Kartei<br /><span>Karten</span></h1>
            <p class="brand-tagline">
              Lerne smarter, nicht härter.<br />
              Deine persönliche Lernkartei.
            </p>
  
            <div class="feature-list">
              <div class="feature-item">
                <span class="feature-icon">🧠</span>
                <span>Smarter Wiederholungs-Algorithmus</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <span>Fortschritts-Statistiken</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🆓</span>
                <span>100% kostenlos – keine Abos</span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Right panel: form -->
        <div class="form-panel">
          <div class="form-inner">
            <div class="form-header">
              <h2 class="form-title">Willkommen zurück</h2>
              <p class="form-subtitle">Melde dich an und lerne weiter</p>
            </div>
  
            <form @submit.prevent="handleLogin" class="form" novalidate>
              <div class="field" :class="{ 'field--error': errors.email }">
                <label for="email" class="label">E-Mail</label>
                <div class="input-wrap">
                  <span class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="input"
                    placeholder="deine@email.ch"
                    autocomplete="email"
                    @blur="validateEmail"
                  />
                </div>
                <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
              </div>
  
              <div class="field" :class="{ 'field--error': errors.password }">
                <label for="password" class="label">Passwort</label>
                <div class="input-wrap">
                  <span class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="input"
                    placeholder="••••••••"
                    autocomplete="current-password"
                  />
                  <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
                    <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>
                <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
              </div>
  
              <div class="form-options">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="form.remember" class="checkbox" />
                  <span class="checkbox-custom"></span>
                  Angemeldet bleiben
                </label>
                <a href="#" class="forgot-link">Passwort vergessen?</a>
              </div>
  
              <div v-if="loginError" class="alert alert--error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {{ loginError }}
              </div>
  
              <button type="submit" class="btn-primary" :class="{ 'btn--loading': loading }" :disabled="loading">
                <span v-if="!loading">Anmelden</span>
                <span v-else class="loader"></span>
              </button>
            </form>
  
            <p class="switch-text">
              Noch kein Konto?
              <router-link to="/register" class="switch-link">Jetzt registrieren →</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const form = reactive({
    email: '',
    password: '',
    remember: false,
  })
  
  const errors = reactive({ email: '', password: '' })
  const showPassword = ref(false)
  const loading = ref(false)
  const loginError = ref('')
  
  function validateEmail() {
    if (!form.email) {
      errors.email = 'E-Mail ist erforderlich'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Ungültige E-Mail-Adresse'
    } else {
      errors.email = ''
    }
  }
  
  function validateForm() {
    validateEmail()
    if (!form.password) errors.password = 'Passwort ist erforderlich'
    else errors.password = ''
    return !errors.email && !errors.password
  }
  
  async function handleLogin() {
    loginError.value = ''
    if (!validateForm()) return
  
    loading.value = true
    try {
      // Replace with real API call
      await new Promise(r => setTimeout(r, 1200))
      // await authStore.login(form)
      router.push('/dashboard')
    } catch (e) {
      loginError.value = 'E-Mail oder Passwort ist falsch.'
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  /* ── Layout ── */
  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    background: var(--color-bg);
  }
  
  /* Decorative blobs */
  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.45;
    pointer-events: none;
    z-index: 0;
  }
  .blob-1 {
    width: 520px; height: 520px;
    background: var(--color-salmon-light);
    top: -160px; left: -160px;
    animation: drift1 12s ease-in-out infinite alternate;
  }
  .blob-2 {
    width: 420px; height: 420px;
    background: var(--color-periwinkle-light);
    bottom: -120px; right: -100px;
    animation: drift2 10s ease-in-out infinite alternate;
  }
  .blob-3 {
    width: 260px; height: 260px;
    background: #ffe8c2;
    top: 55%; left: 40%;
    animation: drift1 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes drift1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(30px, 20px) scale(1.08); } }
  @keyframes drift2 { from { transform: translate(0, 0) scale(1); } to { transform: translate(-20px, -30px) scale(1.05); } }
  
  /* ── Card ── */
  .auth-container {
    position: relative;
    z-index: 1;
    display: flex;
    width: 100%;
    max-width: 900px;
    min-height: 560px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(185, 180, 255, 0.25),
      0 24px 60px rgba(180, 120, 120, 0.12),
      0 4px 16px rgba(0,0,0,0.06);
    background: var(--color-surface);
    animation: slideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  
  /* ── Brand panel ── */
  .brand-panel {
    flex: 1;
    background: linear-gradient(145deg, var(--color-salmon) 0%, var(--color-periwinkle) 100%);
    padding: 3rem 2.5rem;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  .brand-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .brand-inner {
    position: relative;
    color: white;
  }
  .logo {
    width: 64px; height: 64px;
    background: rgba(255,255,255,0.2);
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem;
    margin-bottom: 1.5rem;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.3);
  }
  .brand-title {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 2.4rem;
    font-weight: 700;
    line-height: 1.1;
    margin: 0 0 1rem;
    color: white;
  }
  .brand-title span {
    opacity: 0.75;
  }
  .brand-tagline {
    font-size: 0.95rem;
    opacity: 0.85;
    line-height: 1.6;
    margin: 0 0 2rem;
  }
  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    opacity: 0.9;
  }
  .feature-icon {
    font-size: 1rem;
    width: 28px; height: 28px;
    background: rgba(255,255,255,0.2);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  
  /* ── Form panel ── */
  .form-panel {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 3rem 2.5rem;
    background: var(--color-surface);
  }
  .form-inner {
    width: 100%;
    max-width: 360px;
    margin: 0 auto;
    animation: fadeIn 0.6s 0.2s both;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  
  .form-header { margin-bottom: 2rem; }
  .form-title {
    font-family: 'Georgia', serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 0.25rem;
  }
  .form-subtitle {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    margin: 0;
  }
  
  /* ── Fields ── */
  .form { display: flex; flex-direction: column; gap: 1.1rem; }
  .field { display: flex; flex-direction: column; gap: 0.4rem; }
  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .input-icon {
    position: absolute;
    left: 0.875rem;
    color: var(--color-text-muted);
    display: flex;
    pointer-events: none;
  }
  .input {
    width: 100%;
    padding: 0.7rem 0.875rem 0.7rem 2.5rem;
    border: 1.5px solid var(--color-border-purple);
    border-radius: 12px;
    background: var(--color-bg-soft);
    color: var(--color-text);
    font-size: 0.95rem;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    outline: none;
  }
  .input:focus {
    border-color: var(--color-periwinkle);
    background: white;
    box-shadow: 0 0 0 3px rgba(185, 180, 255, 0.2);
  }
  .field--error .input {
    border-color: var(--color-error);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
  }
  .toggle-pw {
    position: absolute;
    right: 0.875rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: 0;
    display: flex;
    transition: color 0.2s;
  }
  .toggle-pw:hover { color: var(--color-periwinkle-dark); }
  .error-msg {
    font-size: 0.78rem;
    color: var(--color-error);
    padding-left: 0.25rem;
  }
  
  /* ── Options row ── */
  .form-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: -0.2rem;
  }
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    cursor: pointer;
    user-select: none;
  }
  .checkbox { display: none; }
  .checkbox-custom {
    width: 16px; height: 16px;
    border: 1.5px solid var(--color-border-purple);
    border-radius: 5px;
    background: var(--color-bg-soft);
    transition: all 0.2s;
    flex-shrink: 0;
    position: relative;
  }
  .checkbox:checked + .checkbox-custom {
    background: var(--color-periwinkle);
    border-color: var(--color-periwinkle);
  }
  .checkbox:checked + .checkbox-custom::after {
    content: '';
    position: absolute;
    left: 4px; top: 1px;
    width: 5px; height: 9px;
    border: 2px solid white;
    border-top: none; border-left: none;
    transform: rotate(45deg);
  }
  .forgot-link {
    font-size: 0.875rem;
    color: var(--color-periwinkle-dark);
    font-weight: 500;
    transition: color 0.2s;
  }
  .forgot-link:hover { color: var(--color-salmon-dark); }
  
  /* ── Alert ── */
  .alert {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1rem;
    border-radius: 10px;
    font-size: 0.875rem;
  }
  .alert--error {
    background: #fef2f2;
    color: var(--color-error);
    border: 1px solid #fecaca;
  }
  
  /* ── Buttons ── */
  .btn-primary {
    padding: 0.8rem;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--color-salmon) 0%, var(--color-periwinkle) 100%);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(255, 145, 137, 0.35);
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
  }
  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255, 145, 137, 0.45);
  }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
  .loader {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  /* ── Switch ── */
  .switch-text {
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }
  .switch-link {
    color: var(--color-periwinkle-dark);
    font-weight: 600;
    margin-left: 0.25rem;
    transition: color 0.2s;
  }
  .switch-link:hover { color: var(--color-salmon-dark); }
  
  /* ── Responsive ── */
  @media (max-width: 680px) {
    .auth-container { flex-direction: column; min-height: unset; border-radius: 20px; }
    .brand-panel { padding: 2rem 1.75rem 1.75rem; }
    .brand-title { font-size: 1.8rem; }
    .feature-list { display: none; }
    .form-panel { padding: 2rem 1.75rem; }
  }
  </style>