<template>
    <div class="auth-page">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
  
      <div class="auth-container">
        <!-- Left: form -->
        <div class="form-panel">
          <div class="form-inner">
            <div class="form-header">
              <div class="logo">
                <i class="fa-solid fa-layer-group" aria-hidden="true"></i>
              </div>
              <h2 class="form-title">Konto erstellen</h2>
              <p class="form-subtitle">Tritt der Gruppe 3 Lernrevolution bei</p>
            </div>
  
            <form @submit.prevent="handleRegister" class="form" novalidate>
              <!-- Name row -->
              <div class="field-row">
                <div class="field" :class="{ 'field--error': errors.firstName }">
                  <label for="firstName" class="label">Vorname</label>
                  <div class="input-wrap">
                    <span class="input-icon">
                      <i class="fa-solid fa-user" aria-hidden="true"></i>
                    </span>
                    <input
                      id="firstName"
                      v-model="form.firstName"
                      type="text"
                      class="input"
                      placeholder="Liam"
                      autocomplete="given-name"
                      @blur="validate('firstName')"
                    />
                  </div>
                  <span v-if="errors.firstName" class="error-msg">{{ errors.firstName }}</span>
                </div>
  
                <div class="field" :class="{ 'field--error': errors.lastName }">
                  <label for="lastName" class="label">Nachname</label>
                  <div class="input-wrap">
                    <span class="input-icon">
                      <i class="fa-solid fa-user" aria-hidden="true"></i>
                    </span>
                    <input
                      id="lastName"
                      v-model="form.lastName"
                      type="text"
                      class="input"
                      placeholder="Muster"
                      autocomplete="family-name"
                      @blur="validate('lastName')"
                    />
                  </div>
                  <span v-if="errors.lastName" class="error-msg">{{ errors.lastName }}</span>
                </div>
              </div>
  
              <!-- Email -->
              <div class="field" :class="{ 'field--error': errors.email }">
                <label for="email" class="label">E-Mail</label>
                <div class="input-wrap">
                  <span class="input-icon">
                    <i class="fa-solid fa-envelope" aria-hidden="true"></i>
                  </span>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="input"
                    placeholder="deine@email.ch"
                    autocomplete="email"
                    @blur="validate('email')"
                  />
                </div>
                <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
              </div>
  
              <!-- Password -->
              <div class="field" :class="{ 'field--error': errors.password }">
                <label for="password" class="label">Passwort</label>
                <div class="input-wrap">
                  <span class="input-icon">
                    <i class="fa-solid fa-lock" aria-hidden="true"></i>
                  </span>
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="input"
                    placeholder="Mindestens 8 Zeichen"
                    autocomplete="new-password"
                    @input="validate('password')"
                    @blur="validate('password')"
                  />
                  <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
                    <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" aria-hidden="true"></i>
                  </button>
                </div>
                <!-- Strength meter -->
                <div v-if="form.password" class="strength-bar">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="strength-segment"
                    :class="strengthSegmentClass(i)"
                  ></div>
                </div>
                <span v-if="form.password && !errors.password" class="strength-label" :class="`strength-label--${strengthLevel}`">
                  {{ strengthLabels[strengthLevel] }}
                </span>
                <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
              </div>
  
              <!-- Confirm password -->
              <div class="field" :class="{ 'field--error': errors.confirmPassword }">
                <label for="confirmPassword" class="label">Passwort bestätigen</label>
                <div class="input-wrap">
                  <span class="input-icon">
                    <i class="fa-solid fa-check" aria-hidden="true"></i>
                  </span>
                  <input
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    class="input"
                    placeholder="Passwort wiederholen"
                    autocomplete="new-password"
                    @blur="validate('confirmPassword')"
                  />
                </div>
                <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
              </div>
  
              <!-- Terms -->
              <label class="terms-label" :class="{ 'terms-label--error': errors.terms }">
                <input type="checkbox" v-model="form.terms" class="checkbox" @change="validate('terms')" />
                <span class="checkbox-custom"></span>
                <span>
                  Ich akzeptiere die
                  <a href="#" class="terms-link">Nutzungsbedingungen</a>
                  und
                  <a href="#" class="terms-link">Datenschutzerklärung</a>
                </span>
              </label>
              <span v-if="errors.terms" class="error-msg">{{ errors.terms }}</span>
  
              <div v-if="registerError" class="alert alert--error">
                <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                {{ registerError }}
              </div>
  
              <div v-if="success" class="alert alert--success">
                <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                Konto erfolgreich erstellt! Du wirst weitergeleitet…
              </div>
  
              <button type="submit" class="btn-primary" :class="{ 'btn--loading': loading }" :disabled="loading || success">
                <span v-if="!loading && !success">Konto erstellen</span>
                <span v-else-if="loading" class="loader"></span>
                <span v-else><i class="fa-solid fa-check" aria-hidden="true"></i> Erstellt!</span>
              </button>
            </form>
  
            <p class="switch-text">
              Schon ein Konto?
              <router-link to="/login" class="switch-link"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Anmelden</router-link>
            </p>
          </div>
        </div>
  
        <!-- Right: promo panel -->
        <div class="brand-panel">
          <div class="brand-inner">
            <div class="steps-title">So funktioniert's</div>
  
            <div class="steps">
              <div class="step" v-for="(step, i) in steps" :key="i">
                <div class="step-num">{{ i + 1 }}</div>
                <div class="step-content">
                  <div class="step-heading">{{ step.title }}</div>
                  <div class="step-desc">{{ step.desc }}</div>
                </div>
              </div>
            </div>
  
            <div class="stat-cards">
              <div class="stat-card">
                <div class="stat-value">100%</div>
                <div class="stat-label">Gratis</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">∞</div>
                <div class="stat-label">Decks</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">SRS</div>
                <div class="stat-label">Algorithmus</div>
              </div>
            </div>
  
            <div class="credit">
              Made with ❤️ von Gruppe 3
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { useRouter } from 'vue-router'

  defineOptions({ name: 'RegisterPage' })

  interface RegisterResponse {
    ok: boolean
    message: string
    data?: {
      token: string
      user: {
        user_id: number
        username: string
        email: string
      }
    }
  }
  
  const router = useRouter()
  
  const steps = [
    { title: 'Registrieren', desc: 'Erstelle deinen kostenlosen Account in Sekunden.' },
    { title: 'Decks anlegen', desc: 'Füge Karten für all deine Fächer hinzu.' },
    { title: 'Smart lernen', desc: 'Unser Algorithmus wählt die richtigen Karten für dich.' },
    { title: 'Fortschritt sehen', desc: 'Verfolge deinen Lernstand mit Statistiken.' },
  ]
  
  const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })
  const errors = reactive({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', terms: ''
  })
  const showPassword = ref(false)
  const loading = ref(false)
  const registerError = ref('')
  const success = ref(false)
  
  /* Password strength */
  const strengthScore = computed(() => {
    const p = form.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8) score++
    if (p.length >= 12) score++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return Math.min(score, 4)
  })
  const strengthLevel = computed(() => {
    const s = strengthScore.value
    if (s <= 1) return 'weak'
    if (s === 2) return 'fair'
    if (s === 3) return 'good'
    return 'strong'
  })
  const strengthLabels = { weak: 'Schwach', fair: 'Mittel', good: 'Gut', strong: 'Stark' }
  function strengthSegmentClass(i: number) {
    const active = i <= strengthScore.value
    return [
      active ? 'strength-segment--active' : '',
      active ? `strength-segment--${strengthLevel.value}` : ''
    ]
  }
  
  /* Validation */
  function validate(field: string) {
    switch (field) {
      case 'firstName':
        errors.firstName = form.firstName.trim() ? '' : 'Vorname ist erforderlich'
        break
      case 'lastName':
        errors.lastName = form.lastName.trim() ? '' : 'Nachname ist erforderlich'
        break
      case 'email':
        if (!form.email) errors.email = 'E-Mail ist erforderlich'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Ungültige E-Mail-Adresse'
        else errors.email = ''
        break
      case 'password':
        if (!form.password) errors.password = 'Passwort ist erforderlich'
        else if (form.password.length < 8) errors.password = 'Mindestens 8 Zeichen'
        else errors.password = ''
        break
      case 'confirmPassword':
        errors.confirmPassword = form.confirmPassword === form.password ? '' : 'Passwörter stimmen nicht überein'
        break
      case 'terms':
        errors.terms = form.terms ? '' : 'Bitte Nutzungsbedingungen akzeptieren'
        break
    }
  }
  
  function validateAll() {
    ;['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'terms'].forEach(validate)
    return Object.values(errors).every(e => !e)
  }
  
  async function handleRegister() {
    registerError.value = ''
    if (!validateAll()) return
  
    loading.value = true
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `${form.firstName.trim()} ${form.lastName.trim()}`,
          email: form.email.trim(),
          password: form.password,
        }),
      })
      const result = await response.json() as RegisterResponse

      if (!response.ok || !result.data?.token || !result.data.user) {
        throw new Error(
          response.status === 409
            ? 'Diese E-Mail-Adresse ist bereits registriert.'
            : result.message || 'Registrierung fehlgeschlagen',
        )
      }

      localStorage.setItem('authToken', result.data.token)
      localStorage.setItem('authUser', JSON.stringify(result.data.user))
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('authUser')
      success.value = true
      window.setTimeout(() => void router.push('/dashboard'), 900)
    } catch (error) {
      registerError.value = error instanceof TypeError
        ? 'Der Server ist nicht erreichbar.'
        : error instanceof Error
          ? error.message
          : 'Registrierung fehlgeschlagen.'
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
  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.45;
    pointer-events: none;
    z-index: 0;
  }
  .blob-1 { width: 480px; height: 480px; background: var(--color-periwinkle-light); top: -140px; right: -100px; animation: drift1 11s ease-in-out infinite alternate; }
  .blob-2 { width: 400px; height: 400px; background: var(--color-salmon-light); bottom: -100px; left: -80px; animation: drift2 13s ease-in-out infinite alternate; }
  .blob-3 { width: 220px; height: 220px; background: #ffe8c2; top: 45%; left: 45%; animation: drift1 15s ease-in-out infinite alternate-reverse; }
  @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(25px, 18px) scale(1.06); } }
  @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-18px, -25px) scale(1.05); } }
  
  .auth-container {
    position: relative;
    z-index: 1;
    display: flex;
    width: 100%;
    max-width: 960px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(185, 180, 255, 0.25), 0 24px 60px rgba(140, 100, 100, 0.12), 0 4px 16px rgba(0,0,0,0.06);
    background: var(--color-surface);
    animation: slideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
  
  /* ── Form panel ── */
  .form-panel {
    flex: 1.1;
    display: flex;
    align-items: flex-start;
    padding: 2.75rem 2.5rem;
    overflow-y: auto;
  }
  .form-inner {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    animation: fadeIn 0.6s 0.15s both;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  
  .form-header { margin-bottom: 1.75rem; }
  .logo {
    width: 48px; height: 48px;
    background: linear-gradient(135deg, var(--color-salmon-light), var(--color-periwinkle-light));
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    border: 1px solid var(--color-border-purple);
  }
  .form-title {
    font-family: 'Georgia', serif;
    font-size: 1.65rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 0.2rem;
  }
  .form-subtitle { font-size: 0.875rem; color: var(--color-text-muted); margin: 0; }
  
  /* ── Form ── */
  .form { display: flex; flex-direction: column; gap: 1rem; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .field { display: flex; flex-direction: column; gap: 0.35rem; }
  .label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .input-wrap { position: relative; display: flex; align-items: center; }
  .input-icon {
    position: absolute;
    left: 0.8rem;
    color: var(--color-text-muted);
    display: flex;
    pointer-events: none;
    z-index: 1;
  }
  .input {
    width: 100%;
    padding: 0.65rem 0.8rem 0.65rem 2.4rem;
    border: 1.5px solid var(--color-border-purple);
    border-radius: 11px;
    background: var(--color-bg-soft);
    color: var(--color-text);
    font-size: 0.9rem;
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
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
  .toggle-pw {
    position: absolute;
    right: 0.8rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: 0;
    display: flex;
    transition: color 0.2s;
  }
  .toggle-pw:hover { color: var(--color-periwinkle-dark); }
  .error-msg { font-size: 0.76rem; color: var(--color-error); padding-left: 0.2rem; }
  
  /* ── Strength ── */
  .strength-bar {
    display: flex;
    gap: 4px;
    margin-top: 0.35rem;
  }
  .strength-segment {
    flex: 1;
    height: 4px;
    border-radius: 4px;
    background: var(--color-border-purple);
    transition: background 0.3s;
  }
  .strength-segment--weak    { background: var(--color-error); }
  .strength-segment--fair    { background: var(--color-warning); }
  .strength-segment--good    { background: #84cc16; }
  .strength-segment--strong  { background: var(--color-success); }
  .strength-label {
    font-size: 0.74rem;
    font-weight: 600;
    margin-top: 0.15rem;
  }
  .strength-label--weak  { color: var(--color-error); }
  .strength-label--fair  { color: var(--color-warning); }
  .strength-label--good  { color: #65a30d; }
  .strength-label--strong { color: var(--color-success); }
  
  /* ── Terms ── */
  .terms-label {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    font-size: 0.84rem;
    color: var(--color-text-muted);
    cursor: pointer;
    user-select: none;
    line-height: 1.5;
    margin-top: -0.1rem;
  }
  .terms-label--error .checkbox-custom { border-color: var(--color-error); }
  .checkbox { display: none; }
  .checkbox-custom {
    width: 16px; height: 16px; min-width: 16px;
    border: 1.5px solid var(--color-border-purple);
    border-radius: 5px;
    background: var(--color-bg-soft);
    transition: all 0.2s;
    position: relative;
    margin-top: 2px;
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
  .terms-link { color: var(--color-periwinkle-dark); font-weight: 500; }
  .terms-link:hover { color: var(--color-salmon-dark); }
  
  /* ── Alert ── */
  .alert {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 0.9rem;
    border-radius: 10px;
    font-size: 0.84rem;
  }
  .alert--error  { background: #fef2f2; color: var(--color-error);   border: 1px solid #fecaca; }
  .alert--success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  
  /* ── Button ── */
  .btn-primary {
    padding: 0.78rem;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--color-periwinkle) 0%, var(--color-salmon) 100%);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(185, 180, 255, 0.4);
    margin-top: 0.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
  }
  .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(185, 180, 255, 0.5); }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .loader {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  /* ── Switch ── */
  .switch-text { text-align: center; margin-top: 1.25rem; font-size: 0.875rem; color: var(--color-text-muted); }
  .switch-link { color: var(--color-periwinkle-dark); font-weight: 600; margin-left: 0.25rem; transition: color 0.2s; }
  .switch-link:hover { color: var(--color-salmon-dark); }
  
  /* ── Brand panel ── */
  .brand-panel {
    flex: 0.9;
    background: linear-gradient(160deg, var(--color-periwinkle) 0%, var(--color-salmon) 100%);
    padding: 3rem 2.25rem;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  .brand-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.07'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .brand-inner { position: relative; color: white; width: 100%; }
  
  .steps-title {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.7;
    margin-bottom: 1.5rem;
  }
  .steps { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 2.5rem; }
  .step {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }
  .step-num {
    width: 28px; height: 28px; min-width: 28px;
    background: rgba(255,255,255,0.25);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    border: 1px solid rgba(255,255,255,0.35);
    backdrop-filter: blur(4px);
  }
  .step-heading { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.15rem; }
  .step-desc { font-size: 0.8rem; opacity: 0.8; line-height: 1.45; }
  
  .stat-cards {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }
  .stat-card {
    flex: 1;
    background: rgba(255,255,255,0.2);
    border-radius: 14px;
    padding: 0.9rem 0.75rem;
    text-align: center;
    border: 1px solid rgba(255,255,255,0.3);
    backdrop-filter: blur(6px);
  }
  .stat-value { font-size: 1.3rem; font-weight: 800; }
  .stat-label { font-size: 0.7rem; opacity: 0.75; margin-top: 0.15rem; text-transform: uppercase; letter-spacing: 0.05em; }
  
  .credit { font-size: 0.78rem; opacity: 0.6; text-align: center; }
  
  /* ── Responsive ── */
  @media (max-width: 720px) {
    .auth-container { flex-direction: column; }
    .brand-panel { order: -1; padding: 1.75rem 2rem; }
    .steps { display: none; }
    .form-panel { padding: 2rem 1.75rem; }
    .field-row { grid-template-columns: 1fr; }
  }
  </style>
