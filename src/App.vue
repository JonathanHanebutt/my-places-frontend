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

          <!-- Theme Toggle -->
          <ThemeToggle />
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
        @navigate="navigateFromLanding"
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
import ThemeToggle from "./components/ThemeToggle.vue";

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
    LandingPage,
    ThemeToggle
  },

  data() {
    const token = localStorage.getItem("auth_token");
    const username = localStorage.getItem("auth_username");
    // Nur Likes laden wenn eingeloggt
    const savedLikes = token ? JSON.parse(localStorage.getItem("liked_places") || "[]") : [];
    const savedSwipedIds = token ? JSON.parse(localStorage.getItem("swiped_ids") || "[]") : [];

    return {
      /* ---------- UI ---------- */
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

    navigateFromLanding(view) {
      this.isGuestMode = true;
      this.currentView = view;
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
/* ============================================
   APP STYLES - Using Global Theme Variables
   ============================================ */

/* ---------- Page Layout ---------- */
.page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: var(--container-padding, 24px);
  padding-bottom: 100px;
}

.shell {
  position: relative;
  width: 100%;
  max-width: var(--container-max, 1400px);
  min-height: calc(100vh - 140px);
  background: var(--surface, rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: var(--radius-lg, 28px);
  border: 1px solid var(--border, rgba(22, 163, 74, 0.15));
  box-shadow: var(--shadow);
  padding: 24px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Landing Page Shell - zentriert den Inhalt */
.shell-landing {
  justify-content: center;
  padding: var(--container-padding);
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.shell-landing::before {
  display: none;
}

.shell::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(22, 163, 74, 0.1) 100%
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
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.hdr h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hdr-actions {
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
  color: var(--text-muted);
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 10px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
}

/* ---------- Buttons ---------- */
.btn {
  border: 1px solid var(--border);
  cursor: pointer;
  border-radius: var(--radius-full);
  height: 42px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 600;
  background: var(--surface-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--text);
  box-shadow: var(--shadow);
  transition: all var(--transition);
}

.btn.primary-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%);
  color: var(--primary-contrast);
  border: none;
  box-shadow: 0 4px 16px var(--primary-glow);
}

.btn.primary-btn:hover {
  box-shadow: 0 6px 24px var(--primary-glow);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}

/* ---------- Footer ---------- */
.stats {
  margin-top: 1.5rem;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  transition: all var(--transition);
}

.error {
  color: var(--error, #ef4444);
  font-weight: 600;
  text-align: center;
  background: rgba(220, 38, 38, 0.1);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

/* Loading state */
p {
  color: var(--text-muted);
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
