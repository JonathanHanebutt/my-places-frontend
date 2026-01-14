<template>
  <div v-if="open" class="backdrop" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true">
      <div class="head">
        <h2>{{ activeTab === "login" ? "Anmelden" : "Account erstellen" }}</h2>
        <button class="x" @click="$emit('close')" aria-label="Schließen">✕</button>
      </div>

      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'login' }" @click="switchTab('login')">
          Login
        </button>
        <button class="tab" :class="{ active: activeTab === 'signup' }" @click="switchTab('signup')">
          Registrieren
        </button>
      </div>

      <form class="form" @submit.prevent="onSubmit">
        <!-- Username: bei Login + Signup -->
        <div class="field">
          <label>Username</label>
          <input
              v-model.trim="username"
              type="text"
              placeholder="z.B. keanu123"
              autocomplete="username"
              required
          />
        </div>

        <!-- E-Mail: nur bei Registrierung -->
        <div v-if="activeTab === 'signup'" class="field">
          <label>E-Mail</label>
          <input
              v-model.trim="email"
              type="email"
              placeholder="name@mail.de"
              autocomplete="email"
              required
          />
        </div>

        <!-- Passwort: bei Login + Signup -->
        <div class="field">
          <label>Passwort</label>
          <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              :autocomplete="activeTab === 'login' ? 'current-password' : 'new-password'"
              required
          />
        </div>

        <!-- Feedback -->
        <p v-if="errorMsg" class="msg err">{{ errorMsg }}</p>
        <p v-if="successMsg" class="msg ok">{{ successMsg }}</p>

        <button class="primary" type="submit" :disabled="loading">
          {{ loading ? "Bitte warten..." : (activeTab === "login" ? "Login" : "Registrieren") }}
        </button>

        <p class="hint">
          {{ activeTab === "login"
            ? "Mit deinem Account anmelden"
            : "Neuen Account erstellen" }}
        </p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginModal",
  props: {
    open: { type: Boolean, default: false }
  },
  data() {
    return {
      activeTab: "login",
      username: "",
      email: "",
      password: "",

      loading: false,
      errorMsg: null,
      successMsg: null
    };
  },
  watch: {
    open(val) {
      if (val) this.resetForm();
    }
  },
  methods: {
    getBackendBase() {
      if (import.meta?.env?.DEV) {
        return import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
      }
      return import.meta.env.VITE_BACKEND_URL || "https://places-webtech-backend.onrender.com";
    },

    resetMessages() {
      this.errorMsg = null;
      this.successMsg = null;
    },

    resetForm() {
      this.activeTab = "login";
      this.username = "";
      this.email = "";
      this.password = "";
      this.loading = false;
      this.resetMessages();
    },

    switchTab(tab) {
      this.activeTab = tab;
      this.resetMessages();
      // Optional: Passwort nicht löschen beim Tab wechseln
      // this.password = "";
    },

    async safeReadBody(res) {
      // Falls Backend mal text/plain liefert, nicht crashen
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) return await res.json();
      return await res.text();
    },

    async onSubmit() {
      this.resetMessages();
      this.loading = true;

      const backendBase = this.getBackendBase();

      try {
        if (this.activeTab === "signup") {
          // Register
          const res = await fetch(`${backendBase}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: this.username,
              email: this.email,
              password: this.password
            })
          });

          if (!res.ok) {
            const body = await this.safeReadBody(res);
            throw new Error(
                typeof body === "string"
                    ? body
                    : (body?.message || `Register failed (HTTP ${res.status})`)
            );
          }

          this.successMsg = "Registrierung erfolgreich. Bitte jetzt einloggen.";
          this.activeTab = "login";
          // optional: Passwort drin lassen oder leeren
          // this.password = "";
          return;
        }

        // Login
        const res = await fetch(`${backendBase}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });

        if (!res.ok) {
          const body = await this.safeReadBody(res);
          throw new Error(
              typeof body === "string"
                  ? body
                  : (body?.message || `Login failed (HTTP ${res.status})`)
          );
        }

        const body = await this.safeReadBody(res);

        // Erwartet: { username, token } – fallback wenn doch nur Text kommt
        const data =
            typeof body === "string"
                ? { username: this.username, token: body }
                : body;

        if (!data?.token) {
          throw new Error("Login erfolgreich, aber kein Token erhalten.");
        }

        // speichern (Key-Namen bewusst eindeutig)
        localStorage.setItem("auth_username", data.username || this.username);
        localStorage.setItem("auth_token", data.token);

        // App informieren + schließen
        this.$emit("logged-in", data);
        this.$emit("close");
      } catch (err) {
        this.errorMsg = err?.message || String(err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 120px;
  z-index: 9999;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal {
  width: 100%;
  max-width: 420px;
  background: var(--surface-strong, rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 24px;
  border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.6));
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 12px 24px rgba(0, 0, 0, 0.08),
    0 32px 64px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 14px 20px;
  border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.4));
}

.head h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, var(--accent, #6366f1) 0%, var(--accent-soft, #818cf8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.x {
  border: none;
  background: var(--surface-glass, rgba(255, 255, 255, 0.35));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 999px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  color: var(--muted, #475569);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.x:hover {
  background: var(--surface-strong, rgba(255, 255, 255, 0.6));
  transform: scale(1.1);
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 16px 20px;
  background: var(--surface-glass, rgba(255, 255, 255, 0.2));
}

.tab {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.4));
  background: var(--surface-glass, rgba(255, 255, 255, 0.35));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--muted, #475569);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab:hover {
  background: var(--surface-strong, rgba(255, 255, 255, 0.5));
}

.tab.active {
  background: var(--surface-strong, rgba(255, 255, 255, 0.75));
  border-color: var(--accent, #6366f1);
  font-weight: 700;
  color: var(--text, #1e293b);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.form {
  padding: 16px 20px 24px 20px;
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 8px;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text, #1e293b);
}

input {
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.4));
  background: var(--surface-glass, rgba(255, 255, 255, 0.5));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  outline: none;
  font-size: 15px;
  color: var(--text, #1e293b);
  transition: all 0.2s ease;
}

input::placeholder {
  color: var(--muted, #94a3b8);
}

input:focus {
  border-color: var(--accent, #6366f1);
  background: var(--surface-strong, rgba(255, 255, 255, 0.7));
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.primary {
  padding: 14px 16px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  background: linear-gradient(135deg, var(--accent, #6366f1) 0%, var(--accent-soft, #818cf8) 100%);
  color: white;
  box-shadow:
    0 4px 12px rgba(99, 102, 241, 0.3),
    0 8px 24px rgba(99, 102, 241, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 16px rgba(99, 102, 241, 0.35),
    0 12px 32px rgba(99, 102, 241, 0.25);
}

.primary:active {
  transform: translateY(0) scale(0.98);
}

.primary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.msg {
  margin: 0;
  font-size: 13px;
  padding: 12px 14px;
  border-radius: 12px;
  line-height: 1.4;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.err {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.ok {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.hint {
  margin: 0;
  font-size: 12px;
  color: var(--muted, #64748b);
  text-align: center;
}

/* Dark mode adjustments */
:root[data-theme="dark"] .modal {
  background: var(--surface-strong, rgba(51, 65, 85, 0.85));
  border-color: var(--border-glass, rgba(148, 163, 184, 0.2));
}

:root[data-theme="dark"] .head {
  border-color: var(--border-glass, rgba(148, 163, 184, 0.15));
}

:root[data-theme="dark"] .tabs {
  background: var(--surface-glass, rgba(30, 41, 59, 0.3));
}

:root[data-theme="dark"] .tab {
  background: var(--surface-glass, rgba(30, 41, 59, 0.45));
  border-color: var(--border-glass, rgba(148, 163, 184, 0.15));
}

:root[data-theme="dark"] .tab.active {
  background: var(--surface-strong, rgba(51, 65, 85, 0.8));
}

:root[data-theme="dark"] input {
  background: var(--surface-glass, rgba(30, 41, 59, 0.5));
  border-color: var(--border-glass, rgba(148, 163, 184, 0.2));
}

:root[data-theme="dark"] input:focus {
  background: var(--surface-strong, rgba(51, 65, 85, 0.7));
}

:root[data-theme="dark"] .x {
  background: var(--surface-glass, rgba(30, 41, 59, 0.45));
}
</style>
