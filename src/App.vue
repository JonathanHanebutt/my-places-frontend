<template>
  <div class="page">
    <div class="shell">
      <header class="hdr">
        <h1>Berlin Places</h1>

        <div class="hdr-actions">
          <!-- Eingeloggt -->
          <span
              v-if="auth.isAuthenticated"
              class="user-badge"
          >
      Hi, {{ auth.username }}
    </span>

          <button
              v-if="auth.isAuthenticated"
              class="login-btn"
              @click="logout"
          >
            Logout
          </button>

          <!-- Nicht eingeloggt -->
          <button
              v-else
              class="login-btn"
              @click="isLoginOpen = true"
          >
            Login
          </button>

          <!-- Theme Toggle bleibt immer -->
          <button
              class="theme-toggle"
              @click="toggleTheme"
              :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
          >
            🌓
          </button>
        </div>
      </header>


      <!-- Modal -->
      <LoginModal
          :open="isLoginOpen"
          @close="isLoginOpen = false"
          @logged-in="onLoggedIn"
      />



      <!-- Lade- / Fehlermeldungen -->
      <p v-if="loading">Lade Orte vom Server...</p>
      <p v-else-if="error" class="error">
        Fehler beim Laden: {{ error }}
      </p>

      <!-- Swipe-Deck nur zeigen, wenn Daten da und kein Fehler -->
      <SwipeDeck v-else :items="places" @rate="onRate" />

      <footer class="stats" v-if="!loading && !error">
        Gesamt 👍 {{ totalLikes }} • 👎 {{ totalDislikes }}
      </footer>
    </div>
  </div>
</template>

<script>
import SwipeDeck from "./components/SwipeDeck.vue";
import LoginModal from "./components/LoginModal.vue";

export default {
  name: "App",
  components: {SwipeDeck, LoginModal},
  data() {
    return {
      /* ---------- UI ---------- */
      theme: "light",
      isLoginOpen: false,

      /* ---------- AUTH ---------- */
      auth: {
        username: localStorage.getItem("auth_username"),
        token: localStorage.getItem("auth_token"),
        isAuthenticated: !!localStorage.getItem("auth_token"),
      },

      /* ---------- DATA ---------- */
      places: [],
      totalLikes: 0,
      totalDislikes: 0,
      loading: true,
      error: null
    };
  },

  mounted() {
    const saved = localStorage.getItem("theme");
    if (
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      this.theme = "dark";
    }
    document.documentElement.setAttribute("data-theme", this.theme);

    fetch("https://places-webtech-backend.onrender.com/places")
        .then((res) => {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then((data) => {
          this.places = data || [];

          this.totalLikes = this.places.reduce(
              (sum, p) => sum + (p.likeCount ?? 0),
              0
          );
          this.totalDislikes = this.places.reduce(
              (sum, p) => sum + (p.dislikeCount ?? 0),
              0
          );
          this.loading = false;
        })
        .catch((err) => {
          console.error(err);
          this.error = err.message;
          this.loading = false;
        });
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", this.theme);
      localStorage.setItem("theme", this.theme);
    },

    async onRate({item, like}) {
      const backendBase = "https://places-webtech-backend.onrender.com";

      const found = this.places.find((p) => p.id === item.id);
      if (found) {
        if (like) {
          found.likeCount = (found.likeCount ?? 0) + 1;
          this.totalLikes++;
        } else {
          found.dislikeCount = (found.dislikeCount ?? 0) + 1;
          this.totalDislikes++;
        }
      }

      const path = like ? `/places/${item.id}/like` : `/places/${item.id}/dislike`;

      try {
        await fetch(backendBase + path, {method: "POST"});
      } catch (e) {
        console.error("Fehler beim POST:", e);
      }
    },

    methods: {
      // ...
      onLoggedIn({username, token}) {
        this.authUsername = username;
        this.authToken = token;
        localStorage.setItem("auth_username", username);
        localStorage.setItem("auth_token", token);
      },

      logout() {
        this.authUsername = null;
        this.authToken = null;
        localStorage.removeItem("auth_username");
        localStorage.removeItem("auth_token");
      }
    }
  }
}
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
* { box-sizing: border-box; }

html, body, #app {
  height: 100%;
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Inter, sans-serif;
}

body {
  background: linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 100%);
  display: flex;
  justify-content: center;
  min-height: 100svh;
  transition: background 0.4s ease;
  transform: translateX(60px);
}

.page {
  position: relative; /* Referenz für Login-Button */
  width: 100%;
  display: flex;
  justify-content: center;
  padding-left: 80px;
  padding-right: 80px;
}

/* LOGIN AUF HINTERGRUND */
.login-btn {
  position: absolute;
  top: 24px;
  right: -300px;   /* oder 0px */

  z-index: 10;
  border: none;
  cursor: pointer;
  border-radius: 999px;
  height: 40px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 700;
  background: var(--surface-strong);
  color: var(--text);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}



.shell {
  position: relative; /* WICHTIG */
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

.hdr-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}


/* ---------- Theme Toggle ---------- */
.theme-toggle {
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

.error {
  color: #b91c1c;
  font-weight: 600;
  text-align: center;
}

/* ---------- Responsive ---------- */
@media (min-width: 1200px) {
  .shell { padding: 2.5rem 3rem; }
  .hdr h1 { font-size: 2.6rem; }
}

/* ---------- User Pill ---------- */
.user-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
}

/* ---------- Logout Mini Button ---------- */
.logout-mini {
  border: none;
  cursor: pointer;
  border-radius: 999px;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
  background: var(--accent);
  color: white;
}

</style>
