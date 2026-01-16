<template>
  <div class="landing">
    <!-- Header with Theme Toggle -->
    <header class="landing-header">
      <div class="logo">🏙️ Berlin Places</div>
      <ThemeToggle />
    </header>

    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-icon">🏙️</div>
      <h1 class="hero-title">Berlin Places</h1>
      <p class="hero-subtitle">
        Entdecke die besten Orte Berlins, bewerte sie und erstelle deine persönliche Favoritenliste.
      </p>
    </div>

    <!-- Features - Clickable Cards -->
    <div class="features-grid">
      <button
        class="feature card-interactive"
        @click="$emit('browse'); $emit('navigate', 'swipe')"
        aria-label="Zum Swipe-Modus"
      >
        <span class="feature-icon">👆</span>
        <h3>Swipe & Entdecke</h3>
        <p>Swipe durch hunderte Orte und finde deine neuen Lieblingsplätze</p>
        <span class="feature-arrow">→</span>
      </button>

      <button
        class="feature card-interactive"
        @click="$emit('browse'); $emit('navigate', 'likes')"
        aria-label="Zu meinen Favoriten"
      >
        <span class="feature-icon">❤️</span>
        <h3>Speichere Favoriten</h3>
        <p>Alle deine Likes werden in deinem Profil gespeichert</p>
        <span class="feature-arrow">→</span>
      </button>

      <button
        class="feature card-interactive"
        @click="$emit('browse'); $emit('navigate', 'swipe')"
        aria-label="Orte kommentieren"
      >
        <span class="feature-icon">💬</span>
        <h3>Kommentiere</h3>
        <p>Teile deine Erfahrungen und lies Bewertungen anderer</p>
        <span class="feature-arrow">→</span>
      </button>

      <button
        class="feature card-interactive"
        @click="$emit('login')"
        aria-label="Neuen Ort erstellen"
      >
        <span class="feature-icon">📍</span>
        <h3>Erstelle Orte</h3>
        <p>Füge eigene Geheimtipps hinzu und teile sie mit der Community</p>
        <span class="feature-arrow">→</span>
      </button>
    </div>

    <!-- CTA Buttons -->
    <div class="cta-section">
      <button class="cta-btn primary" @click="$emit('login')">
        🔐 Anmelden / Registrieren
      </button>
      <button class="cta-btn secondary" @click="$emit('browse')">
        👀 Erst mal stöbern
      </button>
    </div>

    <!-- Info Note -->
    <p class="info-note">
      💡 Als Gast kannst du Orte ansehen, aber deine Likes werden nicht gespeichert.
    </p>
  </div>
</template>

<script>
import ThemeToggle from "./ThemeToggle.vue";

export default {
  name: "LandingPage",
  components: { ThemeToggle },
  emits: ["login", "browse", "navigate"]
};
</script>

<style scoped>
.landing {
  width: 100%;
  max-width: var(--container-max, 1400px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 0 var(--container-padding, 24px) 40px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Landing Header */
.landing-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary, #16a34a);
}

/* Hero */
.hero {
  text-align: center;
  padding: 20px;
}

.hero-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-title {
  margin: 0 0 16px;
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--primary, #16a34a) 0%, var(--primary-light, #4ade80) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-muted, #4b5563);
  line-height: 1.6;
  max-width: 550px;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
}

.feature {
  position: relative;
  padding: 28px 24px;
  background: var(--surface-strong, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius, 20px);
  border: 1px solid var(--border, rgba(22, 163, 74, 0.15));
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-glow, 0 8px 32px rgba(22, 163, 74, 0.2));
  border-color: var(--primary, #16a34a);
}

.feature:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring, 0 0 0 3px rgba(22, 163, 74, 0.5)), var(--shadow-glow);
}

.feature:active {
  transform: translateY(-2px) scale(0.98);
}

.feature-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 14px;
}

.feature h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text, #1a1a1a);
}

.feature p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted, #4b5563);
  line-height: 1.5;
}

.feature-arrow {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 1rem;
  color: var(--primary, #16a34a);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}

.feature:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* CTA Section */
.cta-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.cta-btn {
  padding: 16px 36px;
  border-radius: var(--radius-full, 9999px);
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.cta-btn.primary {
  background: linear-gradient(135deg, var(--primary, #16a34a) 0%, var(--primary-soft, #22c55e) 100%);
  color: var(--primary-contrast, #ffffff);
  box-shadow: 0 4px 20px var(--primary-glow, rgba(22, 163, 74, 0.25));
}

.cta-btn.primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 30px var(--primary-glow);
}

.cta-btn.secondary {
  background: var(--surface-strong, rgba(255, 255, 255, 0.9));
  color: var(--text, #1a1a1a);
  border: 1px solid var(--border, rgba(22, 163, 74, 0.15));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.cta-btn.secondary:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow, 0 4px 6px rgba(0, 0, 0, 0.04));
  border-color: var(--primary, #16a34a);
}

.cta-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.cta-btn:active {
  transform: translateY(0) scale(0.98);
}

/* Info Note */
.info-note {
  margin: 0;
  padding: 16px 24px;
  background: var(--surface-glass, rgba(255, 255, 255, 0.5));
  border-radius: var(--radius-sm, 12px);
  border: 1px solid var(--border, rgba(22, 163, 74, 0.15));
  font-size: 0.95rem;
  color: var(--text-muted, #4b5563);
  text-align: center;
}

/* Responsive */
@media (max-width: 1100px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .landing {
    gap: 28px;
  }

  .hero-icon {
    font-size: 56px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-section {
    flex-direction: column;
    width: 100%;
  }

  .cta-btn {
    width: 100%;
    padding: 14px 28px;
  }
}
</style>

