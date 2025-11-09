<template>
  <div class="page">
    <div class="shell">
      <header class="hdr">
        <h1>Berlin Places</h1>
        <button
          class="theme-toggle"
          @click="toggleTheme"
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
        >
          🌓
        </button>
      </header>

      <SwipeDeck :items="places" @rate="onRate" />

      <footer class="stats">
        Gesamt 👍 {{ totalLikes }} • 👎 {{ totalDislikes }}
      </footer>
    </div>
  </div>
</template>

<script>
import SwipeDeck from "./components/SwipeDeck.vue";

export default {
  name: "App",
  components: { SwipeDeck },
  data() {
    return {
      theme: "light", // aktuelles Theme
      places: [
        {
          name: "HTW Berlin",
          description: "Campus Wilhelminenhof an der Spree",
          rating: 5,
          like: 42,
          dislike: 1,
          imageLink: "/images/campus-wilhelminenhof.jpg",
        },
        {
          name: "Tempelhofer Feld",
          description: "Ehemaliger Flughafen, heute Freizeitfläche",
          rating: 4,
          like: 30,
          dislike: 2,
          imageLink: "/images/tempelhoferfeld.jpg",
        },
        {
          name: "Tiergarten",
          description: "Großer Park im Herzen von Berlin",
          rating: 5,
          like: 60,
          dislike: 3,
          imageLink: "/images/Tiergarten.jepg",
        },
      ],
      totalLikes: 0,
      totalDislikes: 0,
    };
  },
  mounted() {
    // Dark Mode aus LocalStorage oder System übernehmen
    const saved = localStorage.getItem("theme");
    if (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      this.theme = "dark";
    }
    document.documentElement.setAttribute("data-theme", this.theme);
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", this.theme);
      localStorage.setItem("theme", this.theme);
    },
    onRate({ item, like }) {
      const found = this.places.find((p) => p.name === item.name);
      if (found) {
        if (like) {
          found.like = (found.like || 0) + 1;
          this.totalLikes++;
        } else {
          found.dislike = (found.dislike || 0) + 1;
          this.totalDislikes++;
        }
      }
    },
  },
};
</script>

<style>
/* ---------- Theme Variables ---------- */
:root {
  --bg1: #eef2f3;
  --bg2: #8e9eab;
  --surface: rgba(255, 255, 255, 0.88);
  --surface-strong: #ffffff;
  --text: #111;
  --muted: #333;
  --accent: #0a66ff;
  --shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  --radius: 20px;
}

:root[data-theme="dark"] {
  --bg1: #0f172a;
  --bg2: #1f2937;
  --surface: rgba(17, 24, 39, 0.85);
  --surface-strong: #111827;
  --text: #e5e7eb;
  --muted: #cbd5e1;
  --accent: #60a5fa;
  --shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

/* ---------- Global Layout ---------- */
* {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Inter, sans-serif;
}

body {
  background: linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100svh;
  transition: background 0.4s ease;
}

.page {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-left: 60px; /* kleiner horizontaler Puffer */
  padding-right: 40px;
}

.shell {
  width: min(960px, 96vw);
  background: var(--surface);
  backdrop-filter: blur(10px);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2rem 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ---------- Header ---------- */
.hdr {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.hdr h1 {
  margin: 0;
  font-size: 2.2rem;
  color: var(--accent);
}

/* ---------- Theme Toggle ---------- */
.theme-toggle {
  margin-left: auto;
  border: none;
  cursor: pointer;
  border-radius: 999px;
  width: 40px;
  height: 40px;
  font-size: 18px;
  background: var(--surface-strong);
  color: var(--text);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transition: transform 0.15s ease, background 0.3s ease;
}

.theme-toggle:hover {
  transform: translateY(-2px);
}

/* ---------- Footer ---------- */
.stats {
  margin-top: 1.2rem;
  color: var(--muted);
  font-weight: 600;
  text-align: center;
  background: var(--surface-strong);
  padding: 0.6rem 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

/* ---------- Responsive ---------- */
@media (min-width: 1200px) {
  .shell {
    padding: 2.5rem 3rem;
  }

  .hdr h1 {
    font-size: 2.6rem;
  }
}
</style>
