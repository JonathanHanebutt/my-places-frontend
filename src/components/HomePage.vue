<template>
  <div class="home">
    <!-- Hero Section -->
    <div class="hero">
      <div class="hero-icon">📍</div>
      <h2 class="hero-title">Entdecke Berlin</h2>
      <p class="hero-subtitle">
        Swipe durch die besten Orte der Stadt und erstelle deine persönliche Favoritenliste
      </p>

      <!-- Create Place Button -->
      <button
        v-if="isAuthenticated"
        class="create-btn"
        @click="$emit('create-place')"
      >
        ➕ Neuen Ort erstellen
      </button>
      <p v-else class="login-hint">
        <button class="link-btn" @click="$emit('request-login')">Anmelden</button>
        um eigene Orte zu erstellen
      </p>
    </div>

    <!-- Feature Cards -->
    <div class="features">
      <button class="feature-card" @click="$emit('navigate', 'swipe')">
        <div class="feature-icon">👆</div>
        <h3>Swipe Mode</h3>
        <p>Entdecke neue Orte durch Swipen</p>
        <span class="feature-badge">{{ placesCount }} Orte</span>
      </button>

      <button class="feature-card" @click="$emit('navigate', 'likes')">
        <div class="feature-icon">❤️</div>
        <h3>Meine Likes</h3>
        <p>Deine Lieblingsorte auf einen Blick</p>
        <span class="feature-badge">{{ likesCount }} gespeichert</span>
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat">
        <span class="stat-value">{{ totalLikes }}</span>
        <span class="stat-label">Gesamt Likes</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-value">{{ placesCount }}</span>
        <span class="stat-label">Orte</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-value">{{ totalDislikes }}</span>
        <span class="stat-label">Gesamt Dislikes</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  props: {
    placesCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalDislikes: { type: Number, default: 0 },
    isAuthenticated: { type: Boolean, default: false }
  },
  emits: ["navigate", "create-place", "request-login"]
};
</script>

<style scoped>
.home {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hero Section */
.hero {
  text-align: center;
  padding: 48px 32px;
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid var(--border-glass);
}

.hero-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-title {
  margin: 0 0 14px;
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin: 0 auto;
  color: var(--muted);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 400px;
}

.create-btn {
  margin-top: 20px;
  padding: 14px 28px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px var(--glow);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.create-btn:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 28px var(--glow);
}

.create-btn:active {
  transform: translateY(0) scale(0.98);
}

.login-hint {
  margin: 16px 0 0;
  font-size: 0.9rem;
  color: var(--muted);
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

/* Feature Cards */
.features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  flex: 1;
}

.feature-card {
  position: relative;
  padding: 36px 28px;
  background: var(--surface-strong);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 24px;
  border: 1px solid var(--border-glass);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  text-align: left;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.feature-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 24px;
  padding: 1.5px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    var(--accent-soft) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: var(--shadow-glow), 0 16px 40px rgba(0, 0, 0, 0.12);
}

.feature-card:active {
  transform: translateY(0) scale(0.98);
}

.feature-icon {
  font-size: 44px;
  margin-bottom: 18px;
}

.feature-card h3 {
  margin: 0 0 10px;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text);
}

.feature-card p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.5;
  flex: 1;
}

.feature-badge {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 14px;
  background: var(--accent-light, rgba(225, 29, 72, 0.1));
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent);
  border: 1px solid var(--border-glass);
}

/* Quick Stats */
.quick-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 24px 36px;
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid var(--border-glass);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text);
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-divider {
  width: 1px;
  height: 44px;
  background: var(--border-glass);
}

/* Responsive */
@media (max-width: 640px) {
  .hero {
    padding: 32px 20px;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .features {
    grid-template-columns: 1fr;
  }

  .feature-card {
    min-height: 160px;
    padding: 28px 24px;
  }

  .quick-stats {
    gap: 20px;
    padding: 20px 24px;
  }

  .stat-value {
    font-size: 1.4rem;
  }
}
</style>

