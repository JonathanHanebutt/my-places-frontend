<template>
  <div class="landing">
    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-icon">🏙️</div>
      <h1 class="hero-title">Berlin Places</h1>
      <p class="hero-subtitle">
        Entdecke die besten Orte Berlins, bewerte sie und erstelle deine persönliche Favoritenliste.
      </p>
    </div>

    <!-- Features -->
    <div class="features-grid">
      <div class="feature">
        <span class="feature-icon">👆</span>
        <h3>Swipe & Entdecke</h3>
        <p>Swipe durch hunderte Orte und finde deine neuen Lieblingsplätze</p>
      </div>
      <div class="feature">
        <span class="feature-icon">❤️</span>
        <h3>Speichere Favoriten</h3>
        <p>Alle deine Likes werden in deinem Profil gespeichert</p>
      </div>
      <div class="feature">
        <span class="feature-icon">💬</span>
        <h3>Kommentiere</h3>
        <p>Teile deine Erfahrungen und lies Bewertungen anderer</p>
      </div>
      <div class="feature">
        <span class="feature-icon">📍</span>
        <h3>Erstelle Orte</h3>
        <p>Füge eigene Geheimtipps hinzu und teile sie mit der Community</p>
      </div>
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
export default {
  name: "LandingPage",
  emits: ["login", "browse"]
};
</script>

<style scoped>
.landing {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  padding: 40px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hero */
.hero {
  text-align: center;
  padding: 20px;
}

.hero-icon {
  font-size: 100px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.hero-title {
  margin: 0 0 20px;
  font-size: 4rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin: 0;
  font-size: 1.4rem;
  color: var(--muted);
  line-height: 1.6;
  max-width: 600px;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
}

.feature {
  padding: 32px 28px;
  background: var(--surface-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid var(--border-glass);
  text-align: center;
  transition: all 0.3s ease;
}

.feature:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-glow);
}

.feature-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.feature h3 {
  margin: 0 0 10px;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
}

.feature p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.5;
}

/* CTA Section */
.cta-section {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.cta-btn {
  padding: 18px 40px;
  border-radius: 999px;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.cta-btn.primary {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  color: white;
  box-shadow: 0 4px 24px var(--glow);
}

.cta-btn.primary:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 8px 36px var(--glow);
}

.cta-btn.secondary {
  background: var(--surface-strong);
  color: var(--text);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.cta-btn.secondary:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
}

.cta-btn:active {
  transform: translateY(0) scale(0.98);
}

/* Info Note */
.info-note {
  margin: 0;
  padding: 18px 28px;
  background: var(--surface-glass);
  border-radius: 16px;
  border: 1px solid var(--border-glass);
  font-size: 1rem;
  color: var(--muted);
  text-align: center;
}

/* Responsive */
@media (max-width: 1200px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .landing {
    padding: 20px;
    gap: 32px;
  }

  .hero-icon {
    font-size: 64px;
  }

  .hero-title {
    font-size: 2.4rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
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
    padding: 16px 32px;
  }
}
</style>

