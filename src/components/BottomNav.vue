<template>
  <nav class="bottom-nav">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="nav-item"
      :class="{ active: currentView === tab.id }"
      @click="$emit('navigate', tab.id)"
    >
      <span class="nav-icon">{{ tab.icon }}</span>
      <span class="nav-label">{{ tab.label }}</span>
      <span v-if="currentView === tab.id" class="nav-indicator"></span>
    </button>
  </nav>
</template>

<script>
export default {
  name: "BottomNav",
  props: {
    currentView: { type: String, default: "home" }
  },
  emits: ["navigate"],
  data() {
    return {
      tabs: [
        { id: "home", icon: "🏠", label: "Home" },
        { id: "swipe", icon: "👆", label: "Swipe" },
        { id: "likes", icon: "❤️", label: "Likes" }
      ]
    };
  }
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  background: var(--surface-strong);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 999px;
  border: 1px solid var(--border-glass);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 12px 24px rgba(0, 0, 0, 0.08),
    0 24px 48px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
  background: var(--surface-glass);
}

.nav-item.active {
  background: var(--surface-glass);
}

.nav-icon {
  font-size: 22px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item.active .nav-icon {
  transform: scale(1.15);
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  transition: color 0.2s ease;
}

.nav-item.active .nav-label {
  color: var(--accent);
}

.nav-indicator {
  position: absolute;
  bottom: 6px;
  width: 4px;
  height: 4px;
  background: var(--accent);
  border-radius: 999px;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

/* Responsive */
@media (max-width: 480px) {
  .bottom-nav {
    bottom: 16px;
    padding: 8px 12px;
    gap: 4px;
  }

  .nav-item {
    padding: 8px 16px;
  }

  .nav-icon {
    font-size: 20px;
  }

  .nav-label {
    font-size: 10px;
  }
}
</style>

