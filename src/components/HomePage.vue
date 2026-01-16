<template>
  <div class="home">
    <!-- Welcome Section -->
    <section class="welcome-card">
      <div class="welcome-icon">📍</div>
      <div class="welcome-content">
        <h2>Willkommen zurück!</h2>
        <p>Entdecke neue Orte in Berlin</p>
      </div>
      <button v-if="isAuthenticated" class="create-btn" @click="$emit('create-place')">
        + Neuer Ort
      </button>
      <button v-else class="login-btn" @click="$emit('request-login')">
        Anmelden
      </button>
    </section>

    <!-- Stats Dashboard -->
    <section class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ placesCount }}</span>
        <span class="stat-label">Orte</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ likesCount }}</span>
        <span class="stat-label">Deine Likes</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ totalLikes }}</span>
        <span class="stat-label">Community Likes</span>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="actions-section">
      <h3 class="section-title">Schnellzugriff</h3>
      <div class="action-list">
        <button class="action-item" @click="$emit('navigate', 'swipe')">
          <span class="action-icon">👆</span>
          <div class="action-content">
            <span class="action-title">Swipe Modus</span>
            <span class="action-desc">Entdecke neue Orte</span>
          </div>
          <span class="action-arrow">›</span>
        </button>

        <button class="action-item" @click="$emit('navigate', 'likes')">
          <span class="action-icon">❤️</span>
          <div class="action-content">
            <span class="action-title">Meine Favoriten</span>
            <span class="action-desc">{{ likesCount }} gespeichert</span>
          </div>
          <span class="action-arrow">›</span>
        </button>
      </div>
    </section>
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
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Welcome Card */
.welcome-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.welcome-icon {
  font-size: 40px;
}

.welcome-content {
  flex: 1;
}

.welcome-content h2 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.welcome-content p {
  margin: 0;
  font-size: 15px;
  color: var(--text-tertiary);
}

.create-btn,
.login-btn {
  padding: 10px 18px;
  background: var(--primary);
  color: var(--text-on-primary);
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}

.create-btn:hover,
.login-btn:hover {
  background: var(--primary-hover);
}

.create-btn:active,
.login-btn:active {
  transform: scale(0.96);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 16px;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Actions Section */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  padding-left: 4px;
}

.action-list {
  background: var(--surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.action-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--separator);
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
}

.action-item:last-child {
  border-bottom: none;
}

.action-item:hover {
  background: var(--surface-secondary);
}

.action-item:active {
  background: var(--border);
}

.action-icon {
  font-size: 28px;
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-title {
  font-size: 17px;
  font-weight: 500;
  color: var(--text);
}

.action-desc {
  font-size: 14px;
  color: var(--text-tertiary);
}

.action-arrow {
  font-size: 22px;
  color: var(--text-tertiary);
  font-weight: 300;
}

/* Responsive */
@media (max-width: 480px) {
  .welcome-card {
    flex-wrap: wrap;
  }

  .create-btn,
  .login-btn {
    width: 100%;
    text-align: center;
  }
}
</style>

