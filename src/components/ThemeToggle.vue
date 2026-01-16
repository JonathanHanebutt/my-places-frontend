<template>
  <button
    class="theme-toggle"
    @click="toggle"
    :aria-label="isDark ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'"
    :title="isDark ? 'Heller Modus' : 'Dunkler Modus'"
  >
    <span class="theme-toggle-icon">{{ isDark ? '☀️' : '🌙' }}</span>
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
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full, 9999px);
  border: 1px solid var(--border, rgba(22, 163, 74, 0.15));
  background: var(--surface-strong, rgba(255, 255, 255, 0.9));
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle:hover {
  transform: translateY(-2px) rotate(15deg);
  box-shadow: var(--shadow-glow, 0 8px 32px rgba(22, 163, 74, 0.2));
}

.theme-toggle:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring, 0 0 0 3px rgba(22, 163, 74, 0.5));
}

.theme-toggle:active {
  transform: translateY(0) scale(0.95);
}

.theme-toggle-icon {
  font-size: 20px;
  line-height: 1;
}
</style>

