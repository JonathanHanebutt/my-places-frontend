<template>
  <button
    class="theme-toggle"
    @click="toggle"
    :aria-label="isDark ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'"
  >
    <span class="toggle-icon">{{ isDark ? '☀️' : '🌙' }}</span>
  </button>
</template>

<script>
export default {
  name: "ThemeToggle",
  data() {
    return {
      isDark: false
    };
  },
  mounted() {
    this.initTheme();
  },
  methods: {
    initTheme() {
      const saved = localStorage.getItem("theme");
      if (saved) {
        this.isDark = saved === "dark";
      } else {
        this.isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      this.applyTheme();
    },
    toggle() {
      this.isDark = !this.isDark;
      localStorage.setItem("theme", this.isDark ? "dark" : "light");
      this.applyTheme();
    },
    applyTheme() {
      document.documentElement.dataset.theme = this.isDark ? "dark" : "light";
    }
  }
};
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius, 16px);
  border: none;
  background: var(--surface-secondary);
  cursor: pointer;
  transition: all var(--transition);
}

.theme-toggle:hover {
  background: var(--border);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.toggle-icon {
  font-size: 20px;
}
</style>

