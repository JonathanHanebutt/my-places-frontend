<template>
  <nav class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-item"
      :class="{ active: currentView === tab.id }"
      @click="$emit('navigate', tab.id)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
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
        { id: "swipe", icon: "👆", label: "Entdecken" },
        { id: "likes", icon: "❤️", label: "Favoriten" }
      ]
    };
  }
};
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px));
  background: var(--surface);
  border-top: 1px solid var(--border);
  z-index: 1000;
}

.tab-item {
  flex: 1;
  max-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-item:hover {
  background: var(--surface-secondary);
}

.tab-item.active {
  background: var(--surface-secondary);
}

.tab-icon {
  font-size: 24px;
  transition: transform var(--transition-fast);
}

.tab-item.active .tab-icon {
  transform: scale(1.1);
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.tab-item.active .tab-label {
  color: var(--primary);
  font-weight: 600;
}
</style>

