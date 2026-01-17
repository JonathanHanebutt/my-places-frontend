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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 100px;
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
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-lg, 20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.modal::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--glass-shine);
  pointer-events: none;
  border-radius: inherit;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 14px 20px;
  border-bottom: 1px solid var(--border, rgba(60, 60, 67, 0.12));
}

.head h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--primary, #34C759);
}

.x {
  border: none;
  background: var(--surface-secondary, #F2F2F7);
  border-radius: var(--radius-full, 9999px);
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  color: var(--text-secondary, #3C3C43);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.x:hover {
  background: var(--border, rgba(60, 60, 67, 0.12));
  transform: scale(1.1);
}

.x:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 16px 20px;
  background: var(--surface-secondary, #F2F2F7);
}

.tab {
  padding: 12px 14px;
  border-radius: var(--radius, 16px);
  border: 1px solid var(--border, rgba(60, 60, 67, 0.12));
  background: var(--surface, #FFFFFF);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #3C3C43);
  transition: all var(--transition, 0.2s ease);
}

.tab:hover {
  background: var(--surface-secondary, #F2F2F7);
}

.tab:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.tab.active {
  background: var(--primary, #34C759);
  border-color: var(--primary, #34C759);
  font-weight: 700;
  color: var(--text-on-primary, #FFFFFF);
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
  color: var(--text, #000000);
}

input {
  padding: 12px 16px;
  border-radius: var(--radius, 16px);
  border: 1px solid var(--border, rgba(60, 60, 67, 0.12));
  background: var(--surface-secondary, #F2F2F7);
  outline: none;
  font-size: 15px;
  color: var(--text, #000000);
  transition: all var(--transition-fast, 0.15s ease);
}

input::placeholder {
  color: var(--text-tertiary, #8E8E93);
}

input:focus {
  border-color: var(--primary, #34C759);
  background: var(--surface, #FFFFFF);
  box-shadow: var(--focus-ring, 0 0 0 3px rgba(52, 199, 89, 0.3));
}

.primary {
  padding: 14px 16px;
  border-radius: var(--radius, 16px);
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 15px;
  background: var(--primary, #34C759);
  color: var(--text-on-primary, #FFFFFF);
  transition: all var(--transition, 0.2s ease);
}

.primary:hover {
  background: var(--primary-hover, #30B350);
}

.primary:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.primary:active {
  transform: scale(0.98);
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
  border-radius: var(--radius, 16px);
  line-height: 1.4;
}

.err {
  background: rgba(255, 59, 48, 0.12);
  color: var(--error, #FF3B30);
  border: 1px solid rgba(255, 59, 48, 0.25);
}

.ok {
  background: rgba(52, 199, 89, 0.12);
  color: var(--success, #34C759);
  border: 1px solid rgba(52, 199, 89, 0.25);
}

.hint {
  margin: 0;
  font-size: 12px;
  color: var(--text-tertiary, #8E8E93);
  text-align: center;
}
</style>
