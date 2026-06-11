<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

type Variant = 'salmon' | 'peri' | 'acc'

interface NavLink { label: string; href: string }
interface Feature { title: string; desc: string; variant: Variant; icon: string }
interface Benefit { title: string; desc: string }
interface ActiveSet { title: string; meta: string; pct: number; variant: Variant; icon: string }
interface StudyStat { num: string; label: string; variant: Variant; icon: string }

/* Inner SVG markup (24x24, stroke-based). Wrapped by a consistent <svg> in the template. */
const ICON = {
  cardStack: '<rect x="3" y="6" width="14" height="12" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v10"/>',
  cardLines: '<rect x="3" y="7" width="13" height="14" rx="2"/><path d="M7 4h11a2 2 0 0 1 2 2v11"/><path d="M7 12h5M7 16h7"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  chart: '<path d="M4 19V5M4 19h16"/><path d="M8 16l3-4 3 2 5-7"/>',
  list: '<path d="M4 4h16v4H4zM4 12h10v4H4z"/><path d="M4 4v16"/>',
  clock: '<path d="M12 2v6l4 2"/><circle cx="12" cy="13" r="8"/>',
  warning: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0z"/>',
} as const

const navLinks: NavLink[] = [
  { label: 'Funktionen', href: '#funktionen' },
  { label: 'Vorteile', href: '#vorteile' },
  { label: 'Lernmodus', href: '#lernmodus' },
]

const features: Feature[] = [
  { title: 'Lernsets erstellen', desc: 'Erstelle eigene Themen, Fächer und Karteikarten in wenigen Sekunden.', variant: 'salmon', icon: ICON.cardLines },
  { title: 'Personalisierter Lernmodus', desc: 'Wiederhole schwierige Karten häufiger und lerne gezielter.', variant: 'peri', icon: ICON.target },
  { title: 'Fortschritt verfolgen', desc: 'Sieh jederzeit, welche Themen du bereits gut beherrschst.', variant: 'acc', icon: ICON.chart },
]

const benefits: Benefit[] = [
  { title: 'Keine verlorenen Karteikarten', desc: 'Alle Karten sicher an einem Ort, jederzeit abrufbar.' },
  { title: 'Strukturierte Lernsets', desc: 'Nach Fach, Thema und Schwierigkeit klar geordnet.' },
  { title: 'Wiederholung nach Lernfortschritt', desc: 'Schwierige Karten kommen automatisch häufiger dran.' },
  { title: 'Kostenlos nutzbar', desc: 'Starte ohne Kosten und lerne so viel du willst.' },
]

const activeSets: ActiveSet[] = [
  { title: 'Datenbanken Grundlagen', meta: '48 Karten · Informatik', pct: 72, variant: 'salmon', icon: ICON.cardStack },
  { title: 'Englisch Vokabeln B2', meta: '120 Karten · Sprachen', pct: 54, variant: 'peri', icon: ICON.list },
  { title: 'Geschichte Neuzeit', meta: '36 Karten · Geschichte', pct: 91, variant: 'acc', icon: ICON.clock },
]

const studyStats: StudyStat[] = [
  { num: '12', label: 'Karten heute gelernt', variant: 'salmon', icon: ICON.cardStack },
  { num: '85%', label: 'Fortschritt im Set', variant: 'peri', icon: ICON.chart },
  { num: '3', label: 'Schwierige Karten', variant: 'acc', icon: ICON.warning },
]

const footerLinks: string[] = ['Datenschutz', 'Impressum', 'Kontakt']

/* Flip card */
const isFlipped = ref(false)
const toggleFlip = (): void => { isFlipped.value = !isFlipped.value }

/* Scroll reveal */
const root = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const els = Array.from(root.value?.querySelectorAll<HTMLElement>('.reveal') ?? [])
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'))
    return
  }
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in')
        observer?.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  els.forEach((el) => observer?.observe(el))
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="root" class="hawktalk">
    <!-- ===================== NAVIGATION ===================== -->
    <header class="navbar">
      <div class="container nav-inner">
        <a href="#" class="brand" aria-label="HawkTalk Startseite">
          <span class="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3c-3.5 0-6 2.2-6 5.5 0 1.6.6 2.9 1.6 4L5 19l5.2-1.6c.6.1 1.2.2 1.8.2 3.5 0 6-2.4 6-5.6" />
              <path d="M18 6.5c1.2 0 2-.9 2-2-1 .2-1.6.6-2 1.2" />
              <circle cx="10" cy="9" r="1" fill="currentColor" stroke="none" />
            </svg>
          </span>
          HawkTalk
        </a>

        <nav class="nav-links" aria-label="Hauptnavigation">
          <a v-for="link in navLinks" :key="link.href" :href="link.href">{{ link.label }}</a>
        </nav>

        <div class="nav-actions">
          <a href="#" class="btn btn-ghost">Einloggen</a>
          <a href="#" class="btn btn-primary">Kostenlos starten</a>
        </div>
      </div>
    </header>

    <!-- ===================== HERO ===================== -->
    <section class="hero">
      <div class="hero-deco" aria-hidden="true">
        <span class="blob b1" />
        <span class="blob b2" />
        <svg class="spark s1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>
        <svg class="spark s2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>
        <svg class="spark s3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>
      </div>

      <div class="container hero-grid">
        <div class="hero-copy reveal">
          <span class="eyebrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>
            Digitale Karteikarten
          </span>
          <h1>Lerne smarter mit <span class="grad">digitalen Karteikarten</span></h1>
          <p class="sub">Erstelle eigene Lernsets, wiederhole Inhalte personalisiert und behalte deinen Lernfortschritt im Blick.</p>

          <div class="hero-cta">
            <a href="#" class="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              Jetzt Lernset erstellen
            </a>
            <a href="#lernmodus" class="btn btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4l13 8-13 8z" /></svg>
              Demo ansehen
            </a>
          </div>

          <div class="hero-trust">
            <div class="dots">
              <span>SM</span><span>LB</span><span>NK</span><span>+</span>
            </div>
            Über 12'000 Lernende üben bereits mit HawkTalk
          </div>
        </div>

        <!-- App Preview Mockup -->
        <div class="preview reveal" aria-label="HawkTalk App-Vorschau">
          <div class="preview-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            Gespeichert
          </div>

          <div class="preview-bar">
            <div class="left">
              <span class="brand-mark sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-3.5 0-6 2.2-6 5.5 0 1.6.6 2.9 1.6 4L5 19l5.2-1.6c.6.1 1.2.2 1.8.2 3.5 0 6-2.4 6-5.6" /><circle cx="10" cy="9" r="1" fill="currentColor" stroke="none" /></svg>
              </span>
              Mein Lernset
            </div>
            <div class="dot-row"><i class="dot-salmon" /><i class="dot-peri" /><i class="dot-acc" /></div>
          </div>

          <div class="lernset-card">
            <div class="lernset-head">
              <div class="lernset-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="ICON.cardStack" />
              </div>
              <div>
                <h4>Datenbanken Grundlagen</h4>
                <span>Informatik · 48 Karten</span>
              </div>
            </div>
            <div class="progress-row"><span>Fortschritt</span><span>72%</span></div>
            <div class="progress-track"><div class="progress-fill" /></div>
          </div>

          <div class="mini-card">
            <div class="q-label">Frage</div>
            <div class="q-text">Was ist ein Primärschlüssel?</div>
            <div class="a-divider" />
            <div class="a-label">Antwort</div>
            <div class="a-text">Ein Attribut, das jeden Datensatz einer Tabelle eindeutig identifiziert.</div>
          </div>

          <div class="stat-row">
            <div class="stat">
              <div class="stat-ico peri">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" v-html="ICON.chart" />
              </div>
              <div><div class="num">24</div><div class="lbl">Heute gelernt</div></div>
            </div>
            <div class="stat">
              <div class="stat-ico succ">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v5h-5" /></svg>
              </div>
              <div><div class="num">85%</div><div class="lbl">Trefferquote</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== FEATURES ===================== -->
    <section id="funktionen" class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow purple">Funktionen</span>
          <h2 class="section-title">Alles, was du zum effizienten Lernen brauchst</h2>
          <p class="section-lead">Von der ersten Karteikarte bis zum vollständig beherrschten Thema – HawkTalk begleitet dich durch jeden Schritt.</p>
        </div>

        <div class="feature-grid">
          <article v-for="feature in features" :key="feature.title" class="feature-card reveal">
            <div class="feature-ico" :class="feature.variant">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="feature.icon" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ===================== VORTEILE ===================== -->
    <section id="vorteile" class="section vorteile">
      <div class="container vorteile-grid">
        <div class="reveal">
          <span class="eyebrow">Vorteile</span>
          <h2 class="section-title vorteile-title">Warum HawkTalk besser ist als Papierkarteikarten</h2>
          <p class="section-lead vorteile-lead">Schluss mit losen Zetteln und unstrukturiertem Lernen. HawkTalk hält deine Inhalte geordnet und passt sich deinem Tempo an.</p>

          <div class="benefit-list">
            <div v-for="benefit in benefits" :key="benefit.title" class="benefit-item">
              <span class="benefit-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              </span>
              <div class="b-text"><strong>{{ benefit.title }}</strong><span>{{ benefit.desc }}</span></div>
            </div>
          </div>
        </div>

        <div class="vorteile-visual reveal">
          <div class="vv-head">
            <h4>Aktive Lernsets</h4>
            <span class="pill">Diese Woche</span>
          </div>

          <div v-for="set in activeSets" :key="set.title" class="vv-set">
            <div class="vv-ico" :class="`ico--${set.variant}`">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="set.icon" />
            </div>
            <div class="vv-body">
              <strong>{{ set.title }}</strong>
              <div class="vv-meta">{{ set.meta }}</div>
              <div class="vv-track"><i :class="`fill--${set.variant}`" :style="{ width: set.pct + '%' }" /></div>
            </div>
            <span class="vv-pct" :class="`pct--${set.variant}`">{{ set.pct }}%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== LERNMODUS PREVIEW ===================== -->
    <section id="lernmodus" class="section lernmodus">
      <span class="blob lm1" aria-hidden="true" />
      <span class="blob lm2" aria-hidden="true" />

      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow purple">Lernmodus</span>
          <h2 class="section-title">So fühlt sich gezieltes Wiederholen an</h2>
          <p class="section-lead">Karte aufdecken, ehrlich bewerten, weiterlernen. HawkTalk merkt sich, was dir schwerfällt.</p>
        </div>

        <div class="lm-grid">
          <div class="reveal">
            <div
              class="flip-card"
              :class="{ flipped: isFlipped }"
              tabindex="0"
              role="button"
              :aria-pressed="isFlipped"
              aria-label="Karteikarte umdrehen"
              @click="toggleFlip"
              @keydown.enter.prevent="toggleFlip"
              @keydown.space.prevent="toggleFlip"
            >
              <div class="flip-inner">
                <div class="flip-face flip-front">
                  <div class="flip-tag">Frage</div>
                  <div class="flip-q">Was ist eine relationale Datenbank?</div>
                  <div class="flip-hint">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
                    Karte umdrehen
                  </div>
                </div>
                <div class="flip-face flip-back">
                  <div class="flip-tag">Antwort</div>
                  <div class="flip-a">Eine Datenbank, die Daten in Tabellen aus Zeilen und Spalten organisiert. Tabellen sind über Schlüssel miteinander verknüpft und lassen sich mit SQL abfragen.</div>
                </div>
              </div>
            </div>

            <div class="rate-row">
              <button type="button" class="rate-btn no">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                Nicht gewusst
              </button>
              <button type="button" class="rate-btn almost">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /></svg>
                Fast
              </button>
              <button type="button" class="rate-btn yes">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                Gewusst
              </button>
            </div>
          </div>

          <div class="lm-info">
            <div v-for="stat in studyStats" :key="stat.label" class="info-card">
              <div class="info-ico" :class="stat.variant">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="stat.icon" />
              </div>
              <div><div class="i-num">{{ stat.num }}</div><div class="i-lbl">{{ stat.label }}</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== ABSCHLUSS-CTA ===================== -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-block reveal">
          <div class="cta-deco" aria-hidden="true">
            <span class="cta-ring r1" />
            <span class="cta-ring r2" />
            <svg class="cd1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>
            <svg class="cd2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="ICON.cardStack" />
            <svg class="cd3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>
            <svg class="cd4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <div class="cta-content">
            <h2>Bereit, effizienter zu lernen?</h2>
            <p>Starte jetzt kostenlos und erstelle dein erstes Lernset.</p>
            <a href="#" class="btn btn-light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              Kostenlos starten
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== FOOTER ===================== -->
    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <a href="#" class="brand">
              <span class="brand-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-3.5 0-6 2.2-6 5.5 0 1.6.6 2.9 1.6 4L5 19l5.2-1.6c.6.1 1.2.2 1.8.2 3.5 0 6-2.4 6-5.6" /><path d="M18 6.5c1.2 0 2-.9 2-2-1 .2-1.6.6-2 1.2" /><circle cx="10" cy="9" r="1" fill="currentColor" stroke="none" /></svg>
              </span>
              HawkTalk
            </a>
            <p>Digitale Karteikarten für Schüler und Lernende. Erstelle eigene Lernsets, wiederhole personalisiert und behalte deinen Fortschritt im Blick.</p>
          </div>

          <nav class="footer-links" aria-label="Footer-Navigation">
            <a v-for="link in footerLinks" :key="link" href="#">{{ link }}</a>
          </nav>
        </div>

        <div class="footer-divider" />

        <div class="footer-bottom">
          <span>© 2026 HawkTalk. Alle Rechte vorbehalten.</span>
          <span>Mit Sorgfalt entwickelt für besseres Lernen.</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.hawktalk {
  --color-salmon: #ff9189;
  --color-periwinkle: #b9b4ff;

  --color-salmon-light: #ffd6d2;
  --color-periwinkle-light: #e4e2ff;

  --color-salmon-dark: #e66f68;
  --color-periwinkle-dark: #8f89e8;

  --color-bg: #fff7f6;
  --color-bg-soft: #f4f3ff;
  --color-surface: #ffffff;

  --color-text: #1f2937;
  --color-text-muted: #6b7280;
  --color-text-light: #ffffff;

  --color-border-salmon: #ffc2bd;
  --color-border-purple: #d6d3ff;

  --color-accent: #ffb86b;
  --color-success: #22c55e;

  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 999px;

  --shadow-soft: 0 10px 30px -12px rgba(143, 137, 232, 0.28);
  --shadow-card: 0 18px 50px -24px rgba(143, 137, 232, 0.35);
  --shadow-salmon: 0 14px 32px -14px rgba(230, 111, 104, 0.5);
  --shadow-lift: 0 26px 60px -28px rgba(143, 137, 232, 0.5);

  --maxw: 1180px;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  font-family: 'Nunito', system-ui, -apple-system, sans-serif;
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.hawktalk *,
.hawktalk *::before,
.hawktalk *::after { box-sizing: border-box; }

.hawktalk a { text-decoration: none; color: inherit; }
.hawktalk button { font-family: inherit; cursor: pointer; border: none; background: none; }

.container { width: 100%; max-width: var(--maxw); margin: 0 auto; padding: 0 28px; }

.eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.82rem; font-weight: 800; letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-salmon-dark);
  background: var(--color-salmon-light);
  padding: 7px 14px; border-radius: var(--radius-pill);
}
.eyebrow.purple { color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); }

.section-title {
  font-size: clamp(1.9rem, 3.4vw, 2.75rem);
  font-weight: 900; line-height: 1.15; letter-spacing: -0.02em;
}
.section-lead {
  color: var(--color-text-muted); font-size: 1.08rem; max-width: 560px;
  font-weight: 500;
}
.vorteile-title { margin-top: 16px; }
.vorteile-lead { margin-top: 14px; }

/* ---------- Buttons ---------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  font-weight: 800; font-size: 1rem;
  padding: 13px 24px; border-radius: var(--radius-sm);
  transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease), background 0.25s var(--ease), color 0.25s var(--ease);
  white-space: nowrap;
}
.btn svg { width: 18px; height: 18px; }
.btn-primary {
  color: var(--color-text-light);
  background: linear-gradient(135deg, var(--color-salmon) 0%, var(--color-salmon-dark) 100%);
  box-shadow: var(--shadow-salmon);
}
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 22px 40px -16px rgba(230, 111, 104, 0.6); }
.btn-secondary {
  color: var(--color-text);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-purple);
  box-shadow: var(--shadow-soft);
}
.btn-secondary:hover { transform: translateY(-3px); border-color: var(--color-periwinkle); color: var(--color-periwinkle-dark); }
.btn-ghost { color: var(--color-text); padding: 10px 18px; border-radius: var(--radius-sm); font-weight: 700; }
.btn-ghost:hover { background: var(--color-bg-soft); color: var(--color-periwinkle-dark); }
.btn-light {
  color: var(--color-salmon-dark); background: var(--color-surface);
  box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.35);
}
.btn-light:hover { transform: translateY(-3px); }

/* ---------- Navigation ---------- */
.navbar {
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(14px);
  background: rgba(255, 255, 255, 0.78);
  border-bottom: 1px solid rgba(214, 211, 255, 0.6);
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; height: 76px; }
.brand { display: flex; align-items: center; gap: 11px; font-weight: 900; font-size: 1.32rem; letter-spacing: -0.02em; }
.brand-mark {
  width: 42px; height: 42px; border-radius: 13px;
  display: grid; place-items: center;
  background: linear-gradient(140deg, var(--color-salmon) 0%, var(--color-periwinkle) 100%);
  box-shadow: var(--shadow-soft); flex-shrink: 0;
}
.brand-mark svg { width: 24px; height: 24px; color: #fff; }
.brand-mark.sm { width: 30px; height: 30px; border-radius: 9px; }
.brand-mark.sm svg { width: 17px; height: 17px; }
.nav-links { display: flex; align-items: center; gap: 4px; }
.nav-links a {
  font-weight: 700; font-size: 0.98rem; color: var(--color-text-muted);
  padding: 9px 15px; border-radius: var(--radius-sm);
  transition: color 0.2s, background 0.2s;
}
.nav-links a:hover { color: var(--color-text); background: var(--color-bg-soft); }
.nav-actions { display: flex; align-items: center; gap: 12px; }

/* ---------- Hero ---------- */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(165deg, var(--color-bg) 0%, var(--color-bg-soft) 100%);
  padding: 84px 0 96px;
}
.hero-deco { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.5; }
.blob.b1 { width: 360px; height: 360px; background: var(--color-salmon-light); top: -120px; right: 8%; }
.blob.b2 { width: 320px; height: 320px; background: var(--color-periwinkle-light); bottom: -110px; left: -60px; }
.spark { position: absolute; color: var(--color-periwinkle); opacity: 0.55; }
.spark.s1 { top: 120px; left: 6%; width: 30px; height: 30px; animation: float 7s ease-in-out infinite; }
.spark.s2 { bottom: 130px; right: 40%; width: 22px; height: 22px; color: var(--color-salmon); animation: float 9s ease-in-out infinite 1s; }
.spark.s3 { top: 250px; right: 4%; width: 26px; height: 26px; color: var(--color-accent); animation: float 8s ease-in-out infinite 0.5s; }

.hero-grid {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1.02fr; gap: 56px; align-items: center;
}
.hero-copy h1 {
  font-size: clamp(2.5rem, 4.6vw, 3.7rem); font-weight: 900;
  line-height: 1.08; letter-spacing: -0.03em; margin: 22px 0 18px;
}
.hero-copy h1 .grad {
  background: linear-gradient(120deg, var(--color-salmon-dark), var(--color-periwinkle-dark));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.hero-copy p.sub { font-size: 1.18rem; color: var(--color-text-muted); max-width: 480px; font-weight: 500; }
.hero-cta { display: flex; gap: 14px; margin-top: 32px; flex-wrap: wrap; }
.hero-trust { display: flex; align-items: center; gap: 18px; margin-top: 30px; color: var(--color-text-muted); font-weight: 600; font-size: 0.92rem; }
.hero-trust .dots { display: flex; }
.hero-trust .dots span {
  width: 32px; height: 32px; border-radius: 50%; margin-left: -10px;
  border: 2.5px solid var(--color-bg); display: grid; place-items: center;
  font-size: 0.78rem; font-weight: 800; color: #fff;
}
.hero-trust .dots span:nth-child(1) { background: var(--color-salmon); margin-left: 0; }
.hero-trust .dots span:nth-child(2) { background: var(--color-periwinkle); }
.hero-trust .dots span:nth-child(3) { background: var(--color-accent); }
.hero-trust .dots span:nth-child(4) { background: var(--color-periwinkle-dark); }

/* ---------- Hero preview mockup ---------- */
.preview {
  position: relative; background: var(--color-surface);
  border: 1px solid var(--color-border-purple);
  border-radius: var(--radius-xl); padding: 22px;
  box-shadow: var(--shadow-lift);
}
.preview-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.preview-bar .left { display: flex; align-items: center; gap: 9px; font-weight: 800; font-size: 0.95rem; }
.preview-bar .dot-row { display: flex; gap: 6px; }
.preview-bar .dot-row i { width: 10px; height: 10px; border-radius: 50%; display: block; }
.dot-salmon { background: var(--color-salmon); }
.dot-peri { background: var(--color-periwinkle); }
.dot-acc { background: var(--color-accent); }

.lernset-card {
  border: 1px solid var(--color-border-purple); border-radius: var(--radius-md);
  padding: 18px; background: var(--color-bg-soft); margin-bottom: 16px;
}
.lernset-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.lernset-ico {
  width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
  display: grid; place-items: center; color: #fff;
  background: linear-gradient(140deg, var(--color-salmon), var(--color-salmon-dark));
}
.lernset-ico svg { width: 22px; height: 22px; }
.lernset-head h4 { font-size: 1.02rem; font-weight: 800; }
.lernset-head span { font-size: 0.84rem; color: var(--color-text-muted); font-weight: 600; }
.progress-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px; font-size: 0.82rem; font-weight: 700; color: var(--color-text-muted); }
.progress-track { height: 9px; border-radius: var(--radius-pill); background: var(--color-periwinkle-light); overflow: hidden; }
.progress-fill {
  height: 100%; border-radius: var(--radius-pill); width: 72%;
  background: linear-gradient(90deg, var(--color-salmon), var(--color-periwinkle));
}

.mini-card {
  border: 1px solid var(--color-border-salmon); border-radius: var(--radius-md);
  padding: 16px 18px; background: var(--color-surface); margin-bottom: 16px;
}
.mini-card .q-label { font-size: 0.74rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-salmon-dark); }
.mini-card .q-text { font-weight: 800; font-size: 1.02rem; margin: 4px 0 12px; }
.mini-card .a-divider { height: 1px; background: var(--color-border-purple); margin-bottom: 12px; }
.mini-card .a-label { font-size: 0.74rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-periwinkle-dark); }
.mini-card .a-text { color: var(--color-text-muted); font-weight: 600; font-size: 0.95rem; }

.stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat {
  border: 1px solid var(--color-border-purple); border-radius: var(--radius-md);
  padding: 14px; background: var(--color-surface);
  display: flex; align-items: center; gap: 11px;
}
.stat-ico { width: 36px; height: 36px; border-radius: 11px; display: grid; place-items: center; flex-shrink: 0; }
.stat-ico svg { width: 18px; height: 18px; }
.stat-ico.peri { background: var(--color-periwinkle-light); color: var(--color-periwinkle-dark); }
.stat-ico.succ { background: #dcfce7; color: var(--color-success); }
.stat .num { font-weight: 900; font-size: 1.18rem; line-height: 1; }
.stat .lbl { font-size: 0.76rem; color: var(--color-text-muted); font-weight: 700; }

.preview-badge {
  position: absolute; top: -16px; right: -14px;
  background: var(--color-surface); border: 1px solid var(--color-border-salmon);
  border-radius: var(--radius-pill); padding: 8px 15px;
  display: flex; align-items: center; gap: 7px; font-weight: 800; font-size: 0.84rem;
  box-shadow: var(--shadow-card); color: var(--color-success);
}
.preview-badge svg { width: 16px; height: 16px; }

/* ---------- Generic section spacing ---------- */
.section { padding: 96px 0; }
.section-head { max-width: 640px; margin: 0 auto 56px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }

/* ---------- Features ---------- */
.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
.feature-card {
  background: var(--color-surface); border: 1px solid var(--color-border-purple);
  border-radius: var(--radius-lg); padding: 32px 28px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s var(--ease);
}
.feature-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-card); border-color: var(--color-periwinkle); }
.feature-ico {
  width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center;
  margin-bottom: 22px; color: #fff;
}
.feature-ico svg { width: 28px; height: 28px; }
.feature-ico.salmon { background: linear-gradient(140deg, var(--color-salmon), var(--color-salmon-dark)); box-shadow: var(--shadow-salmon); }
.feature-ico.peri { background: linear-gradient(140deg, var(--color-periwinkle), var(--color-periwinkle-dark)); box-shadow: var(--shadow-soft); }
.feature-ico.acc { background: linear-gradient(140deg, var(--color-accent), #f59e3c); box-shadow: 0 14px 32px -14px rgba(245, 158, 60, 0.5); }
.feature-card h3 { font-size: 1.32rem; font-weight: 800; margin-bottom: 10px; letter-spacing: -0.01em; }
.feature-card p { color: var(--color-text-muted); font-weight: 500; }

/* ---------- Vorteile ---------- */
.vorteile { background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg-soft) 100%); }
.vorteile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.benefit-list { display: flex; flex-direction: column; gap: 16px; margin-top: 30px; }
.benefit-item { display: flex; align-items: flex-start; gap: 14px; }
.benefit-check {
  width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0; margin-top: 2px;
  display: grid; place-items: center; color: #fff;
  background: linear-gradient(140deg, var(--color-success), #16a34a);
}
.benefit-check svg { width: 17px; height: 17px; }
.benefit-item .b-text strong { font-weight: 800; font-size: 1.05rem; display: block; }
.benefit-item .b-text span { color: var(--color-text-muted); font-weight: 500; font-size: 0.95rem; }

.vorteile-visual {
  background: var(--color-surface); border: 1px solid var(--color-border-purple);
  border-radius: var(--radius-xl); padding: 26px; box-shadow: var(--shadow-card);
}
.vv-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.vv-head h4 { font-weight: 800; font-size: 1.08rem; }
.vv-head .pill { font-size: 0.78rem; font-weight: 800; color: var(--color-periwinkle-dark); background: var(--color-periwinkle-light); padding: 5px 12px; border-radius: var(--radius-pill); }
.vv-set { display: flex; align-items: center; gap: 14px; padding: 15px; border: 1px solid var(--color-border-purple); border-radius: var(--radius-md); margin-bottom: 12px; transition: border-color 0.2s; }
.vv-set:hover { border-color: var(--color-periwinkle); }
.vv-set .vv-ico { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; color: #fff; }
.vv-set .vv-ico svg { width: 20px; height: 20px; }
.vv-set .vv-body { flex: 1; }
.vv-set .vv-body strong { font-weight: 800; font-size: 0.98rem; }
.vv-set .vv-body .vv-meta { font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600; }
.vv-set .vv-track { height: 7px; border-radius: var(--radius-pill); background: var(--color-periwinkle-light); margin-top: 8px; overflow: hidden; }
.vv-set .vv-track i { display: block; height: 100%; border-radius: var(--radius-pill); }
.vv-pct { font-weight: 900; font-size: 1.05rem; }

/* variant helpers */
.ico--salmon { background: linear-gradient(140deg, var(--color-salmon), var(--color-salmon-dark)); }
.ico--peri { background: linear-gradient(140deg, var(--color-periwinkle), var(--color-periwinkle-dark)); }
.ico--acc { background: linear-gradient(140deg, var(--color-accent), #f59e3c); }
.fill--salmon { background: linear-gradient(90deg, var(--color-salmon), var(--color-salmon-dark)); }
.fill--peri { background: linear-gradient(90deg, var(--color-periwinkle), var(--color-periwinkle-dark)); }
.fill--acc { background: linear-gradient(90deg, var(--color-accent), #f59e3c); }
.pct--salmon { color: var(--color-salmon-dark); }
.pct--peri { color: var(--color-periwinkle-dark); }
.pct--acc { color: #d97a2a; }

/* ---------- Lernmodus Preview ---------- */
.lernmodus { background: var(--color-bg); position: relative; overflow: hidden; }
.lernmodus .blob.lm1 { width: 320px; height: 320px; background: var(--color-salmon-light); top: -90px; left: -80px; }
.lernmodus .blob.lm2 { width: 300px; height: 300px; background: var(--color-periwinkle-light); bottom: -100px; right: -70px; }
.lm-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1.3fr 0.95fr; gap: 48px; align-items: center; }

.flip-card { perspective: 1400px; height: 320px; cursor: pointer; }
.flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.7s var(--ease); transform-style: preserve-3d; }
.flip-card.flipped .flip-inner { transform: rotateY(180deg); }
.flip-face {
  position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  border-radius: var(--radius-xl); padding: 40px;
  display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;
  box-shadow: var(--shadow-lift);
}
.flip-front { background: var(--color-surface); border: 1px solid var(--color-border-purple); }
.flip-back { background: linear-gradient(150deg, var(--color-periwinkle) 0%, var(--color-periwinkle-dark) 100%); color: #fff; transform: rotateY(180deg); }
.flip-tag { font-size: 0.76rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-salmon-dark); margin-bottom: 16px; }
.flip-back .flip-tag { color: rgba(255, 255, 255, 0.85); }
.flip-q { font-size: clamp(1.4rem, 2.6vw, 1.85rem); font-weight: 900; line-height: 1.2; letter-spacing: -0.02em; }
.flip-a { font-size: 1.08rem; font-weight: 600; line-height: 1.55; max-width: 440px; }
.flip-hint { margin-top: 22px; font-size: 0.84rem; font-weight: 700; color: var(--color-text-muted); display: inline-flex; align-items: center; gap: 7px; }
.flip-hint svg { width: 15px; height: 15px; }

.rate-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 22px; }
.rate-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-weight: 800; font-size: 0.95rem; padding: 14px 10px; border-radius: var(--radius-md);
  background: var(--color-surface); border: 1.5px solid var(--color-border-purple);
  transition: transform 0.2s var(--ease), border-color 0.2s, background 0.2s, color 0.2s;
}
.rate-btn svg { width: 18px; height: 18px; }
.rate-btn:hover { transform: translateY(-3px); }
.rate-btn.no:hover { border-color: var(--color-salmon); color: var(--color-salmon-dark); background: var(--color-salmon-light); }
.rate-btn.almost:hover { border-color: var(--color-accent); color: #d97a2a; background: #fff0dd; }
.rate-btn.yes:hover { border-color: var(--color-success); color: #16a34a; background: #dcfce7; }

.lm-info { display: flex; flex-direction: column; gap: 16px; }
.info-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-purple);
  border-radius: var(--radius-lg); padding: 20px 22px; box-shadow: var(--shadow-soft);
  transition: transform 0.25s var(--ease);
}
.info-card:hover { transform: translateX(6px); }
.info-ico { width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; flex-shrink: 0; color: #fff; }
.info-ico svg { width: 24px; height: 24px; }
.info-ico.salmon { background: linear-gradient(140deg, var(--color-salmon), var(--color-salmon-dark)); }
.info-ico.peri { background: linear-gradient(140deg, var(--color-periwinkle), var(--color-periwinkle-dark)); }
.info-ico.acc { background: linear-gradient(140deg, var(--color-accent), #f59e3c); }
.info-card .i-num { font-weight: 900; font-size: 1.5rem; line-height: 1; }
.info-card .i-lbl { color: var(--color-text-muted); font-weight: 600; font-size: 0.92rem; }

/* ---------- CTA ---------- */
.cta-section { padding: 96px 0; }
.cta-block {
  position: relative; overflow: hidden; text-align: center;
  border-radius: var(--radius-xl); padding: 72px 40px;
  background: linear-gradient(130deg, var(--color-salmon) 0%, var(--color-periwinkle) 100%);
  box-shadow: var(--shadow-lift);
}
.cta-block .cta-deco { position: absolute; inset: 0; pointer-events: none; opacity: 0.5; }
.cta-block .cta-deco svg { position: absolute; color: rgba(255, 255, 255, 0.9); }
.cta-block .cd1 { width: 60px; height: 60px; top: 30px; left: 8%; }
.cta-block .cd2 { width: 42px; height: 42px; bottom: 40px; left: 22%; }
.cta-block .cd3 { width: 54px; height: 54px; top: 50px; right: 12%; }
.cta-block .cd4 { width: 36px; height: 36px; bottom: 34px; right: 26%; }
.cta-ring { position: absolute; border: 2px solid rgba(255, 255, 255, 0.25); border-radius: 50%; }
.cta-ring.r1 { width: 280px; height: 280px; top: -120px; right: -60px; }
.cta-ring.r2 { width: 200px; height: 200px; bottom: -90px; left: -40px; }
.cta-content { position: relative; z-index: 1; color: #fff; }
.cta-content h2 { font-size: clamp(2rem, 3.6vw, 2.9rem); font-weight: 900; letter-spacing: -0.02em; margin-bottom: 14px; }
.cta-content p { font-size: 1.18rem; font-weight: 500; opacity: 0.95; max-width: 480px; margin: 0 auto 30px; }

/* ---------- Footer ---------- */
.footer { background: var(--color-surface); border-top: 1px solid var(--color-border-purple); padding: 56px 0 32px; }
.footer-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 40px; flex-wrap: wrap; }
.footer-brand { max-width: 340px; }
.footer-brand .brand { margin-bottom: 14px; }
.footer-brand p { color: var(--color-text-muted); font-weight: 500; font-size: 0.96rem; }
.footer-links { display: flex; gap: 28px; }
.footer-links a { color: var(--color-text-muted); font-weight: 700; font-size: 0.96rem; transition: color 0.2s; }
.footer-links a:hover { color: var(--color-salmon-dark); }
.footer-divider { height: 1px; background: var(--color-border-purple); margin: 32px 0 22px; }
.footer-bottom { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: var(--color-text-muted); font-weight: 600; font-size: 0.9rem; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-14px) rotate(8deg); }
}

/* ---------- Reveal on scroll ---------- */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
.reveal.in { opacity: 1; transform: none; }

.hawktalk :focus-visible { outline: 3px solid var(--color-periwinkle-dark); outline-offset: 3px; border-radius: 6px; }

@media (prefers-reduced-motion: reduce) {
  .hawktalk *, .hawktalk *::before, .hawktalk *::after { animation: none !important; }
  .reveal { opacity: 1; transform: none; transition: none; }
  .flip-inner { transition: none; }
}

/* ---------- Responsive ---------- */
@media (max-width: 980px) {
  .hero-grid, .vorteile-grid, .lm-grid { grid-template-columns: 1fr; gap: 40px; }
  .feature-grid { grid-template-columns: 1fr; }
  .hero { padding: 60px 0 72px; }
  .section, .cta-section { padding: 72px 0; }
  .nav-links { display: none; }
}
@media (max-width: 560px) {
  .container { padding: 0 18px; }
  .nav-actions .btn-ghost { display: none; }
  .hero-cta .btn, .cta-content .btn { width: 100%; }
  .stat-row { grid-template-columns: 1fr; }
  .footer-top { flex-direction: column; }
  .cta-block { padding: 52px 24px; }
}
</style>
