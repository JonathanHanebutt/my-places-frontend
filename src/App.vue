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
  padding: var(--container-padding, 20px);
  padding-bottom: 100px;
}

.shell {
  position: relative;
  width: 100%;
  max-width: var(--container-max, 1200px);
  min-height: calc(100vh - 140px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all var(--transition-slow, 0.3s ease);
}

/* Landing Page Shell */
.shell-landing {
  justify-content: flex-start;
  padding-top: 20px;
}

/* ---------- Floating Header ---------- */
.hdr {
  width: 100%;
  max-width: 800px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  padding: 12px 20px;
  background: var(--surface);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
}

.hdr h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
}

.hdr-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-badge {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  background: var(--surface-secondary);
  padding: 8px 14px;
  border-radius: var(--radius-full);
}

.guest-badge {
  font-weight: 500;
  font-size: 13px;
  color: var(--text-tertiary);
  background: var(--surface-secondary);
  padding: 8px 14px;
  border-radius: var(--radius-full);
}

/* ---------- Buttons ---------- */
.btn {
  border: none;
  cursor: pointer;
  border-radius: var(--radius);
  height: 40px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 600;
  background: var(--surface-secondary);
  color: var(--text);
  box-shadow: var(--shadow);
  transition: all var(--transition);
}

.btn.primary-btn {
  background: var(--primary);
  color: var(--text-on-primary);
}

.btn.primary-btn:hover {
  background: var(--primary-hover);
}

.btn:hover {
  background: var(--border);
}

.btn:active {
  transform: scale(0.96);
}

/* ---------- Loading & Error States ---------- */
.loading-text {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  font-size: 17px;
  color: var(--text-secondary);
}

.error {
  color: var(--error);
  font-weight: 600;
  text-align: center;
  background: rgba(255, 59, 48, 0.1);
  padding: 16px 20px;
  border-radius: var(--radius);
}

/* Swipe View */
.swipe-view {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.swipe-done {
  text-align: center;
  padding: 40px 20px;
  font-size: 17px;
  color: var(--text-secondary);
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
