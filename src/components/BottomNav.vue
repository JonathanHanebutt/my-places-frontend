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
  background: var(--surface-strong, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: var(--radius-full, 9999px);
  border: 1px solid var(--border, rgba(22, 163, 74, 0.15));
  box-shadow: var(--shadow-lg);
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
  border-radius: var(--radius, 20px);
  cursor: pointer;
  transition: all var(--transition, 0.25s ease);
}

.nav-item:hover {
  background: var(--surface-glass, rgba(255, 255, 255, 0.5));
}

.nav-item.active {
  background: var(--surface-glass, rgba(255, 255, 255, 0.5));
}

.nav-item:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring, 0 0 0 3px rgba(22, 163, 74, 0.5));
}

.nav-icon {
  font-size: 22px;
  transition: transform var(--transition, 0.25s ease);
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
  color: var(--text-muted, #4b5563);
  transition: color var(--transition-fast, 0.15s ease);
}

.nav-item.active .nav-label {
  color: var(--primary, #16a34a);
}

.nav-indicator {
  position: absolute;
  bottom: 6px;
  width: 4px;
  height: 4px;
  background: var(--primary, #16a34a);
  border-radius: var(--radius-full, 9999px);
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

