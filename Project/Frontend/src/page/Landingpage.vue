<script setup lang="ts">
defineOptions({
  name: 'LandingPage',
})
</script>

<template>
  <main class="landing-page">
    <nav class="navbar" aria-label="Hauptnavigation">
      <a class="brand" href="#home" aria-label="Karteikarten-System Home">
        <span class="brand-mark">K</span>
        <span>Karteikarten-System</span>
      </a>

      <div class="nav-links" aria-label="Landing Page Navigation">
        <a href="#features">Funktionen</a>
        <a href="#workflow">Ablauf</a>
        <a href="#project-goal">Projektziel</a>
      </div>

      <div class="auth-links" aria-label="Kontoaktionen">
        <a class="login-link" href="/login">Login</a>
        <a class="register-link" href="/registrieren">Registrieren</a>
      </div>
    </nav>

    <section id="home" class="hero-section">
      <div class="hero-content">
        <p class="eyebrow">Kostenlose Karteikarten-App</p>
        <h1>Lernen ohne Umwege.</h1>
        <p class="hero-copy">
          Karteikarten-System ist eine schlanke Quizlet-Alternative für Schüler. Die Landing Page
          stellt das Projekt vor; nach Login oder Registrierung geht es später in die eigentliche
          App-Ansicht.
        </p>

        <div class="hero-actions">
          <a class="primary-action" href="/registrieren">Kostenlos registrieren</a>
          <a class="secondary-action" href="/login">Einloggen</a>
        </div>
      </div>

      <aside class="hero-summary" aria-label="Kurzübersicht">
        <div>
          <span>Fokus</span>
          <strong>Eigene Lernsets</strong>
        </div>
        <div>
          <span>Ansatz</span>
          <strong>Gezielt wiederholen</strong>
        </div>
        <div>
          <span>Zielgruppe</span>
          <strong>Schüler</strong>
        </div>
      </aside>
    </section>

    <section id="features" class="features-section" aria-label="Wichtige Funktionen">
      <div class="section-heading">
        <p class="eyebrow">Funktionen</p>
        <h2>Was die App später können soll.</h2>
      </div>

      <div class="feature-grid">
        <article class="feature-card">
          <span>01</span>
          <h3>Lernsets organisieren</h3>
          <p>Karten werden nach Fach, Thema oder Prüfung geordnet und bleiben persönlich.</p>
        </article>

        <article class="feature-card">
          <span>02</span>
          <h3>Karteikarten erstellen</h3>
          <p>Benutzer können eigene Fragen und Antworten erfassen, bearbeiten und löschen.</p>
        </article>

        <article class="feature-card">
          <span>03</span>
          <h3>Smart wiederholen</h3>
          <p>Schwierige Karten sollen häufiger abgefragt werden als Inhalte, die bereits sitzen.</p>
        </article>
      </div>
    </section>

    <section id="workflow" class="workflow-section" aria-label="Geplanter Ablauf">
      <div class="section-heading">
        <p class="eyebrow">Ablauf</p>
        <h2>Von der Startseite in die Lern-App.</h2>
      </div>

      <ol class="workflow-list">
        <li>
          <span>01</span>
          <strong>Registrieren oder einloggen</strong>
          <p>Die Kontoansicht wird später separat umgesetzt.</p>
        </li>
        <li>
          <span>02</span>
          <strong>Lernsets anlegen</strong>
          <p>Die Lernset-Verwaltung wird eine eigene Seite.</p>
        </li>
        <li>
          <span>03</span>
          <strong>Lernen starten</strong>
          <p>Der Lernmodus kommt ebenfalls in eine eigene Ansicht.</p>
        </li>
      </ol>
    </section>

    <section id="project-goal" class="project-section">
      <div>
        <p class="eyebrow">Projektziel</p>
        <h2>Eine einfache Lernplattform für den Schulalltag.</h2>
      </div>
      <p>
        Das Projekt soll Lernenden helfen, Inhalte strukturiert zu erfassen und effizient zu
        wiederholen. Gute Grundfunktionen sollen kostenlos nutzbar sein und nicht hinter Premium-
        Funktionen verschwinden.
      </p>
    </section>

    <section class="cta-section" aria-label="Abschluss">
      <p class="eyebrow">Bereit für die App?</p>
      <h2>Der nächste Schritt ist dein Konto.</h2>
      <div class="hero-actions">
        <a class="primary-action" href="/registrieren">Registrieren</a>
        <a class="secondary-action" href="/login">Login</a>
      </div>
    </section>
  </main>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  overflow-x: hidden;
  background: linear-gradient(
    180deg,
    var(--color-bg) 0%,
    var(--color-surface) 42%,
    var(--color-bg-soft) 100%
  );
  color: var(--color-text);
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem clamp(1rem, 5vw, 4rem);
  border-bottom: 1px solid rgba(31, 41, 55, 0.08);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
}

.brand,
.nav-links,
.auth-links,
.hero-actions {
  display: flex;
  align-items: center;
}

.brand {
  gap: 0.7rem;
  width: max-content;
  color: var(--color-text);
  font-weight: 900;
}

.brand-mark {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-salmon), var(--color-periwinkle));
  color: var(--color-text-light);
  box-shadow: 0 10px 22px rgba(230, 111, 104, 0.2);
}

.nav-links {
  justify-content: center;
  gap: clamp(1rem, 4vw, 2.25rem);
  color: var(--color-text-muted);
  font-weight: 850;
}

.auth-links {
  justify-content: flex-end;
  gap: 0.65rem;
}

.nav-links a,
.login-link,
.register-link {
  border-radius: 8px;
  padding: 0.65rem 0.8rem;
  font-weight: 900;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-links a:hover,
.nav-links a:focus-visible {
  color: var(--color-salmon-dark);
}

.login-link {
  border: 1px solid var(--color-border-purple);
  background: var(--color-surface);
  color: var(--color-text);
}

.login-link:hover,
.login-link:focus-visible {
  transform: translateY(-2px);
  border-color: var(--color-salmon-dark);
  color: var(--color-salmon-dark);
  box-shadow: 0 6px 15px rgba(185, 180, 255, 0.2);
}

.register-link {
  background: var(--color-salmon-dark);
  color: var(--color-text-light);
  box-shadow: 0 10px 22px rgba(230, 111, 104, 0.2);
}

.register-link:hover,
.register-link:focus-visible {
  transform: translateY(-2px);
  background: var(--color-salmon);
  box-shadow: 0 12px 24px rgba(230, 111, 104, 0.35);
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 30rem);
  gap: clamp(2rem, 5vw, 5rem);
  align-items: center;
  min-height: calc(100vh - 4.5rem);
  padding: clamp(3.5rem, 8vw, 7rem) clamp(1rem, 5vw, 4rem);
}

.hero-content {
  max-width: 66rem;
}

.eyebrow {
  margin: 0 0 0.8rem;
  color: var(--color-salmon-dark);
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  max-width: 15ch;
  margin-bottom: 1.25rem;
  color: var(--color-text);
  font-size: clamp(3rem, 7vw, 5.5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
}

h2 {
  margin-bottom: 1rem;
  color: var(--color-text);
  font-size: clamp(2rem, 5vw, 4.2rem);
  line-height: 1;
  letter-spacing: 0;
}

h3 {
  margin-bottom: 0.65rem;
  color: var(--color-text);
  font-size: 1.3rem;
  line-height: 1.15;
}

.hero-copy,
.feature-card p,
.workflow-list p,
.project-section > p {
  color: var(--color-text-muted);
  font-size: 1.06rem;
}

.hero-copy {
  max-width: 43rem;
  font-size: clamp(1.12rem, 2vw, 1.3rem);
}

.hero-actions {
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 2rem;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0.8rem 1.05rem;
  font-weight: 900;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.primary-action {
  background: var(--color-salmon-dark);
  color: var(--color-text-light);
  box-shadow: 0 14px 28px rgba(230, 111, 104, 0.25);
}

.primary-action:hover,
.primary-action:focus-visible {
  transform: translateY(-2px);
  background: var(--color-salmon);
  box-shadow: 0 18px 36px rgba(230, 111, 104, 0.4);
}

.secondary-action {
  border: 1px solid var(--color-border-purple);
  background: var(--color-surface);
  color: var(--color-text);
}

.secondary-action:hover,
.secondary-action:focus-visible {
  transform: translateY(-2px);
  border-color: var(--color-salmon-dark);
  color: var(--color-salmon-dark);
  box-shadow: 0 8px 20px rgba(185, 180, 255, 0.25);
}

.hero-summary,
.feature-card,
.workflow-list li,
.project-section {
  border: 1px solid rgba(31, 41, 55, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover,
.workflow-list li:hover,
.hero-summary:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--color-salmon-light);
  box-shadow: 0 12px 30px rgba(230, 111, 104, 0.12);
}

.hero-summary {
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
  box-shadow: 0 24px 70px rgba(70, 65, 120, 0.08);
}

.hero-summary div {
  display: grid;
  gap: 0.25rem;
  border-radius: 8px;
  background: var(--color-bg-soft);
  padding: 1rem;
}

.hero-summary span,
.feature-card span,
.workflow-list span {
  color: var(--color-text-muted);
  font-weight: 900;
}

.hero-summary strong {
  color: var(--color-text);
  font-size: 1.25rem;
}

.features-section,
.workflow-section,
.project-section,
.cta-section {
  margin-inline: clamp(1rem, 5vw, 4rem);
}

.features-section,
.workflow-section {
  padding-block: clamp(4rem, 8vw, 7rem);
}

.section-heading {
  max-width: 58rem;
  margin-bottom: clamp(2rem, 5vw, 3rem);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.feature-card {
  padding: 1.25rem;
}

.feature-card span,
.workflow-list span {
  display: inline-flex;
  margin-bottom: 1.35rem;
  color: var(--color-salmon-dark);
}

.workflow-section {
  border-top: 1px solid rgba(31, 41, 55, 0.08);
}

.workflow-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.workflow-list li {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.5rem;
}

.project-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 34rem);
  gap: clamp(1.5rem, 4vw, 4rem);
  align-items: start;
  margin-bottom: clamp(3rem, 6vw, 5rem);
  padding: clamp(1.25rem, 4vw, 2rem);
}

.project-section > p {
  margin-bottom: 0;
}

.cta-section {
  border: 1px solid rgba(31, 41, 55, 0.08);
  border-radius: 20px;
  margin-bottom: clamp(3rem, 6vw, 5rem);
  padding: clamp(2rem, 5vw, 3.5rem);
  background: linear-gradient(135deg, rgba(255, 214, 210, 0.9), rgba(228, 226, 255, 0.9));
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(185, 180, 255, 0.12);
  transition: all 0.3s ease;
}

@media (max-width: 940px) {
  .navbar {
    grid-template-columns: 1fr auto;
  }

  .nav-links {
    order: 3;
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .hero-section,
  .feature-grid,
  .workflow-list,
  .project-section {
    grid-template-columns: 1fr;
  }

  .hero-section {
    min-height: auto;
  }
}

@media (max-width: 620px) {
  .navbar,
  .nav-links,
  .auth-links,
  .hero-actions {
    align-items: stretch;
  }

  .navbar {
    display: flex;
    flex-direction: column;
  }

  .brand,
  .login-link,
  .register-link,
  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .login-link,
  .register-link {
    justify-content: center;
    text-align: center;
  }

  .nav-links,
  .auth-links {
    width: 100%;
  }

  .nav-links a {
    flex: 1;
    text-align: center;
  }

  h1 {
    font-size: clamp(3.2rem, 16vw, 5rem);
  }
}
</style>
