<template>
  <div class="page">
    <div class="shell" :class="{
      'shell-compact': currentView === 'swipe',
      'shell-landing': !auth.isAuthenticated && !isGuestMode
    }">
      <!-- Header nur anzeigen wenn eingeloggt oder im Gast-Modus -->
      <header v-if="auth.isAuthenticated || isGuestMode" class="hdr">
        <h1 @click="goHome" class="logo-link">Berlin Places</h1>

        <div class="hdr-actions">
          <!-- Gast-Modus Hinweis -->
          <span v-if="isGuestMode && !auth.isAuthenticated" class="guest-badge">
            👀 Gast-Modus
          </span>

          <!-- Eingeloggt -->
          <span v-if="auth.isAuthenticated" class="user-badge">
            Hi, {{ auth.username }}
          </span>

          <button v-if="auth.isAuthenticated" class="btn" @click="logout">
            Logout
          </button>

          <!-- Gast: Login Button -->
          <button v-if="isGuestMode && !auth.isAuthenticated" class="btn primary-btn" @click="isLoginOpen = true">
            Anmelden
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

      <!-- Login Modal -->
      <LoginModal
          :open="isLoginOpen"
          @close="isLoginOpen = false"
          @logged-in="onLoggedIn"
      />

      <!-- Create Place Modal -->
      <CreatePlaceModal
          :open="isCreatePlaceOpen"
          :authToken="auth.token"
          :backendBase="getBackendBase()"
          @close="isCreatePlaceOpen = false"
          @created="onPlaceCreated"
      />

      <!-- Place Detail Modal -->
      <PlaceDetailModal
          :open="isPlaceDetailOpen"
          :place="selectedPlace"
          :isAuthenticated="auth.isAuthenticated"
          :currentUsername="auth.username"
          :authToken="auth.token"
          :backendBase="getBackendBase()"
          @close="isPlaceDetailOpen = false"
          @request-login="isPlaceDetailOpen = false; isLoginOpen = true"
      />

      <!-- Lade- / Fehlermeldungen -->
      <p v-if="loading" class="loading-text">
        <span class="loading-spinner">⏳</span> Lade Orte vom Server...
      </p>
      <p v-else-if="error" class="error">
        Fehler beim Laden: {{ error }}
      </p>

      <!-- Landing Page für nicht angemeldete Nutzer (und nicht im Gast-Modus) -->
      <LandingPage
        v-else-if="!auth.isAuthenticated && !isGuestMode"
        @login="isLoginOpen = true"
        @browse="enterGuestMode"
      />

      <!-- Views (für angemeldete Nutzer oder Gast-Modus) -->
      <template v-else>
        <!-- Home Page -->
        <HomePage
          v-if="currentView === 'home'"
          :placesCount="places.length"
          :likesCount="likedPlaces.length"
          :totalLikes="totalLikes"
          :totalDislikes="totalDislikes"
          :isAuthenticated="auth.isAuthenticated"
          @navigate="currentView = $event"
          @create-place="isCreatePlaceOpen = true"
          @request-login="isLoginOpen = true"
        />

        <!-- Swipe Mode -->
        <div v-else-if="currentView === 'swipe'" class="swipe-view">
          <SwipeDeck
            :items="swipeStack"
            @rate="onRate"
            @view-place="openPlaceDetail"
          />
          <p v-if="swipeStack.length === 0" class="swipe-done">
            🎉 Alle Orte bewertet! Schau dir deine Likes an.
          </p>
        </div>

        <!-- Likes Page -->
        <LikesPage
          v-else-if="currentView === 'likes'"
          :likedPlaces="likedPlaces"
          @navigate="currentView = $event"
          @unlike="removeLike"
          @view-place="openPlaceDetail"
        />
      </template>
    </div>

    <!-- Bottom Navigation (nur für angemeldete Nutzer oder Gast-Modus) -->
    <BottomNav
      v-if="!loading && !error && (auth.isAuthenticated || isGuestMode)"
      :currentView="currentView"
      @navigate="currentView = $event"
    />
  </div>
</template>

<script>
import SwipeDeck from "./components/SwipeDeck.vue";
import LoginModal from "./components/LoginModal.vue";
import HomePage from "./components/HomePage.vue";
import LikesPage from "./components/LikesPage.vue";
import BottomNav from "./components/BottomNav.vue";
import CreatePlaceModal from "./components/CreatePlaceModal.vue";
import PlaceDetailModal from "./components/PlaceDetailModal.vue";
import LandingPage from "./components/LandingPage.vue";

export default {
  name: "App",
  components: {
    SwipeDeck,
    LoginModal,
    HomePage,
    LikesPage,
    BottomNav,
    CreatePlaceModal,
    PlaceDetailModal,
    LandingPage
  },

  data() {
    const token = localStorage.getItem("auth_token");
    const username = localStorage.getItem("auth_username");
    // Nur Likes laden wenn eingeloggt
    const savedLikes = token ? JSON.parse(localStorage.getItem("liked_places") || "[]") : [];
    const savedSwipedIds = token ? JSON.parse(localStorage.getItem("swiped_ids") || "[]") : [];

    return {
      /* ---------- UI ---------- */
      theme: "light",
      isLoginOpen: false,
      isCreatePlaceOpen: false,
      isPlaceDetailOpen: false,
      selectedPlace: {},
      currentView: "home", // "home" | "swipe" | "likes"
      isGuestMode: false, // Gast-Modus (browsen ohne Login)

      /* ---------- AUTH ---------- */
      auth: {
        username: username || null,
        token: token || null,
        isAuthenticated: !!token,
      },

      /* ---------- DATA ---------- */
      places: [],
      likedPlaces: savedLikes,
      swipedIds: new Set(savedSwipedIds),
      totalLikes: 0,
      totalDislikes: 0,
      loading: true,
      error: null,
    };
  },

  computed: {
    // Places that haven't been swiped yet
    swipeStack() {
      return this.places.filter(p => !this.swipedIds.has(p.id));
    }
  },

  mounted() {
    // Theme initialisieren
    const saved = localStorage.getItem("theme");
    if (
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      this.theme = "dark";
    }
    document.documentElement.setAttribute("data-theme", this.theme);

    // Places laden (lokal via .env.local oder Prod via Render)
    this.loadPlaces();
  },

  methods: {
    getBackendBase() {
      // DEV (npm run dev): nimm VITE_BACKEND_URL aus .env.local, sonst localhost
      if (import.meta?.env?.DEV) {
        return import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
      }
      // PROD: Render Backend
      return "https://places-webtech-backend.onrender.com";
    },

    async loadPlaces() {
      const backendBase = this.getBackendBase();
      try {
        const res = await fetch(`${backendBase}/places`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        this.places = data || [];
        this.totalLikes = this.places.reduce((sum, p) => sum + (p.likeCount ?? 0), 0);
        this.totalDislikes = this.places.reduce((sum, p) => sum + (p.dislikeCount ?? 0), 0);
        this.loading = false;
      } catch (err) {
        console.error(err);
        this.error = err.message || String(err);
        this.loading = false;
      }
    },

    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", this.theme);
      localStorage.setItem("theme", this.theme);
    },

    onLoggedIn({ username, token }) {
      this.auth.username = username;
      this.auth.token = token;
      this.auth.isAuthenticated = true;

      localStorage.setItem("auth_username", username);
      localStorage.setItem("auth_token", token);

      this.isLoginOpen = false;
    },

    logout() {
      this.auth.username = null;
      this.auth.token = null;
      this.auth.isAuthenticated = false;

      // Auth-Daten entfernen
      localStorage.removeItem("auth_username");
      localStorage.removeItem("auth_token");

      // Likes und Swipes zurücksetzen
      this.likedPlaces = [];
      this.swipedIds = new Set();
      localStorage.removeItem("liked_places");
      localStorage.removeItem("swiped_ids");

      // Zurück zur Landing Page
      this.isGuestMode = false;
      this.currentView = "home";
    },

    enterGuestMode() {
      this.isGuestMode = true;
      this.currentView = "home";
    },

    goHome() {
      this.currentView = "home";
    },

    async onRate({ item, like }) {
      const backendBase = this.getBackendBase();

      // Mark as swiped
      this.swipedIds.add(item.id);
      localStorage.setItem("swiped_ids", JSON.stringify([...this.swipedIds]));

      // Add to likes if liked
      if (like) {
        if (!this.likedPlaces.find(p => p.id === item.id)) {
          this.likedPlaces.push(item);
          localStorage.setItem("liked_places", JSON.stringify(this.likedPlaces));
        }
      }

      // optimistic UI
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
        await fetch(backendBase + path, { method: "POST" });
      } catch (e) {
        console.error("Fehler beim POST:", e);
      }
    },

    removeLike(place) {
      this.likedPlaces = this.likedPlaces.filter(p => p.id !== place.id);
      localStorage.setItem("liked_places", JSON.stringify(this.likedPlaces));
    },

    openPlaceDetail(place) {
      this.selectedPlace = place;
      this.isPlaceDetailOpen = true;
    },

    onPlaceCreated(newPlace) {
      // Add to places list
      this.places.unshift(newPlace);
      // Update totals
      this.totalLikes = this.places.reduce((sum, p) => sum + (p.likeCount ?? 0), 0);
      this.totalDislikes = this.places.reduce((sum, p) => sum + (p.dislikeCount ?? 0), 0);
    }
  },
};
</script>

<style>
/* ---------- Theme Variables (Liquid Glass with Green Accent) ---------- */
:root {
  --bg1: #f0fdf4;
  --bg2: #bbf7d0;
  --bg3: #4ade80;
  --surface: rgba(255, 255, 255, 0.55);
  --surface-strong: rgba(255, 255, 255, 0.8);
  --surface-glass: rgba(255, 255, 255, 0.35);
  --text: #1e293b;
  --muted: #64748b;
  --accent: #16a34a;
  --accent-soft: #4ade80;
  --accent-light: #dcfce7;
  --glow: rgba(22, 163, 74, 0.2);
  --border-glass: rgba(255, 255, 255, 0.6);
  --shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 12px 24px rgba(0, 0, 0, 0.06),
    0 24px 48px rgba(0, 0, 0, 0.08);
  --shadow-glow: 0 8px 32px rgba(22, 163, 74, 0.15);
  --radius: 28px;
  --radius-sm: 16px;
}

:root[data-theme="dark"] {
  --bg1: #052e16;
  --bg2: #14532d;
  --bg3: #166534;
  --surface: rgba(20, 40, 30, 0.7);
  --surface-strong: rgba(30, 60, 45, 0.8);
  --surface-glass: rgba(25, 50, 38, 0.5);
  --text: #f0fdf4;
  --muted: #86efac;
  --accent: #4ade80;
  --accent-soft: #86efac;
  --accent-light: rgba(74, 222, 128, 0.15);
  --glow: rgba(74, 222, 128, 0.3);
  --border-glass: rgba(134, 239, 172, 0.15);
  --shadow:
    0 4px 6px rgba(0, 0, 0, 0.15),
    0 12px 24px rgba(0, 0, 0, 0.25),
    0 24px 48px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 8px 32px rgba(74, 222, 128, 0.25);
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
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background:
    radial-gradient(ellipse at 10% 10%, var(--bg3) 0%, transparent 40%),
    radial-gradient(ellipse at 90% 90%, var(--bg2) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, var(--bg2) 0%, transparent 60%),
    linear-gradient(160deg, var(--bg1) 0%, var(--bg2) 50%, var(--bg1) 100%);
  background-attachment: fixed;
  display: flex;
  justify-content: center;
  min-height: 100svh;
  transition: background 0.5s ease;
  overflow-x: hidden;
}

.page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem;
  padding-bottom: 100px; /* Space for bottom nav */
}

.shell {
  position: relative;
  width: 100%;
  max-width: 1920px;
  min-height: calc(100vh - 120px);
  background: var(--surface);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: var(--radius);
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow);
  padding: 2rem 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Landing Page Shell - zentriert den Inhalt */
.shell-landing {
  justify-content: center;
  padding: 3rem;
}

.shell::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* ---------- Header ---------- */
.hdr {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-glass);
}

.hdr h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 20px var(--glow);
}

.hdr-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-badge {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  background: var(--surface-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid var(--border-glass);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.guest-badge {
  font-weight: 600;
  font-size: 14px;
  color: var(--muted);
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid var(--border-glass);
}

/* ---------- Buttons (Glass style) ---------- */
.btn {
  border: 1px solid var(--border-glass);
  cursor: pointer;
  border-radius: 999px;
  height: 42px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 600;
  background: var(--surface-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--text);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn.primary-btn {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 16px var(--glow);
}

.btn.primary-btn:hover {
  box-shadow: 0 6px 24px var(--glow);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: var(--surface-glass);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}

/* ---------- Theme Toggle ---------- */
.theme-toggle {
  border: 1px solid var(--border-glass);
  cursor: pointer;
  border-radius: 999px;
  width: 42px;
  height: 42px;
  font-size: 18px;
  background: var(--surface-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--text);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  transform: translateY(-2px) rotate(15deg);
  box-shadow: var(--shadow-glow);
}

.theme-toggle:active {
  transform: translateY(0) scale(0.95);
}

/* ---------- Footer ---------- */
.stats {
  margin-top: 1.5rem;
  color: var(--muted);
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-glass);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.error {
  color: #ef4444;
  font-weight: 600;
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Loading state */
p {
  color: var(--muted);
  font-weight: 500;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
}

.loading-spinner {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Swipe View */
.swipe-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.swipe-done {
  text-align: center;
  padding: 40px 20px;
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid var(--border-glass);
  font-size: 1.1rem;
}

/* Shell compact for swipe view */
.shell-compact {
  padding-bottom: 100px;
}

/* Logo link */
.logo-link {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo-link:hover {
  opacity: 0.8;
}

/* ---------- Responsive ---------- */
@media (min-width: 1200px) {
  .shell {
    padding: 2.5rem 3rem;
  }
  .hdr h1 {
    font-size: 2.4rem;
  }
}

@media (max-width: 640px) {
  .page {
    padding: 1rem;
  }
  .shell {
    padding: 1.5rem;
    border-radius: 24px;
  }
  .hdr {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .hdr h1 {
    font-size: 1.5rem;
    width: 100%;
    text-align: center;
  }
  .hdr-actions {
    margin: 0 auto;
  }
}
</style>
