<template>
  <div class="landing">
    <!-- Floating Header -->
    <header class="floating-header">
      <span class="logo">🏙️ Berlin Places</span>
      <ThemeToggle />
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-badge">Entdecke Berlin</div>
      <h1 class="hero-title">Finde deine<br/>Lieblingsorte</h1>
      <p class="hero-subtitle">
        Swipe durch die besten Locations, speichere Favoriten und teile deine Erfahrungen.
      </p>
    </section>

    <!-- Feature Dashboard -->
    <section class="dashboard">
      <button class="feature-widget large" @click="$emit('browse'); $emit('navigate', 'swipe')">
        <div class="widget-icon">👆</div>
        <div class="widget-content">
          <h3>Swipe & Entdecke</h3>
          <p>Finde neue Orte durch intuitives Swipen</p>
        </div>
        <span class="widget-arrow">→</span>
      </button>

      <button class="feature-widget" @click="$emit('browse'); $emit('navigate', 'likes')">
        <div class="widget-icon">❤️</div>
        <div class="widget-content">
          <h3>Favoriten</h3>
          <p>Deine gespeicherten Orte</p>
        </div>
        <span class="widget-arrow">→</span>
      </button>

      <button class="feature-widget" @click="$emit('browse'); $emit('navigate', 'swipe')">
        <div class="widget-icon">💬</div>
        <div class="widget-content">
          <h3>Kommentare</h3>
          <p>Lies und teile Bewertungen</p>
        </div>
        <span class="widget-arrow">→</span>
      </button>

      <button class="feature-widget accent" @click="$emit('login')">
        <div class="widget-icon">📍</div>
        <div class="widget-content">
          <h3>Ort erstellen</h3>
          <p>Teile deine Geheimtipps</p>
        </div>
        <span class="widget-arrow">→</span>
      </button>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <button class="cta-primary" @click="$emit('login')">
        Jetzt anmelden
      </button>
      <button class="cta-secondary" @click="$emit('browse')">
        Als Gast stöbern
      </button>
    </section>

    <!-- Info Banner -->
    <div class="info-banner">
      <span class="info-icon">💡</span>
      <span>Als angemeldeter Nutzer werden deine Likes gespeichert.</span>
    </div>
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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Floating Header - Liquid Glass */
.floating-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-full);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
}

.floating-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--glass-shine);
  pointer-events: none;
  border-radius: inherit;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 40px 20px;
}

.hero-badge {
  display: inline-block;
  padding: 8px 16px;
  background: var(--primary);
  color: var(--text-on-primary);
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-full);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.1;
  letter-spacing: -1px;
  margin: 0 0 16px;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto;
}

/* Dashboard Grid */
.dashboard {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-widget {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition);
  position: relative;
  overflow: hidden;
}

.feature-widget::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--glass-shine);
  pointer-events: none;
  border-radius: inherit;
}

.feature-widget.large {
  grid-column: span 2;
  padding: 24px;
}

.feature-widget.accent {
  background: var(--primary);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-color: transparent;
}

.feature-widget.accent::before {
  display: none;
}

.feature-widget.accent .widget-content h3,
.feature-widget.accent .widget-content p,
.feature-widget.accent .widget-arrow {
  color: var(--text-on-primary);
}

.feature-widget:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.feature-widget:active {
  transform: scale(0.98);
}

.widget-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.feature-widget.large .widget-icon {
  font-size: 40px;
}

.widget-content {
  flex: 1;
  min-width: 0;
}

.widget-content h3 {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px;
}

.widget-content p {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.widget-arrow {
  font-size: 20px;
  color: var(--text-tertiary);
  transition: transform var(--transition);
}

.feature-widget:hover .widget-arrow {
  transform: translateX(4px);
}

/* CTA Section */
.cta-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px;
}

.cta-primary {
  width: 100%;
  padding: 18px 24px;
  background: var(--primary);
  color: var(--text-on-primary);
  font-size: 17px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: var(--shadow);
}

.cta-primary:hover {
  background: var(--primary-hover);
  transform: scale(1.02);
}

.cta-primary:active {
  transform: scale(0.98);
}

.cta-secondary {
  width: 100%;
  padding: 18px 24px;
  background: var(--surface);
  color: var(--primary);
  font-size: 17px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: var(--shadow);
}

.cta-secondary:hover {
  background: var(--surface-secondary);
}

/* Info Banner */
.info-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--surface-secondary);
  border-radius: var(--radius);
  font-size: 14px;
  color: var(--text-secondary);
}

.info-icon {
  font-size: 20px;
}

/* Responsive */
@media (max-width: 600px) {
  .hero-title {
    font-size: 32px;
  }

  .dashboard {
    grid-template-columns: 1fr;
  }

  .feature-widget.large {
    grid-column: span 1;
  }
}
</style>

