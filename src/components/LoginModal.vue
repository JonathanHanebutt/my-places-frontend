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
      // robust: funktioniert in Vite, und fällt sonst sauber zurück
      const fromEnv =
          (typeof import.meta !== "undefined" &&
              import.meta.env &&
              import.meta.env.VITE_BACKEND_URL) ||
          null;

      return fromEnv || "https://places-webtech-backend.onrender.com";
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
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 140px;
  z-index: 9999;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 10px 16px;
}

.head h2 {
  margin: 0;
  font-size: 18px;
}

.x {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 16px 12px 16px;
}

.tab {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
  background: #fafafa;
  cursor: pointer;
}

.tab.active {
  background: #fff;
  border-color: #cfcfcf;
  font-weight: 700;
}

.form {
  padding: 0 16px 16px 16px;
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

label {
  font-size: 13px;
  color: #333;
}

input {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #ddd;
  outline: none;
}

input:focus {
  border-color: #bdbdbd;
}

.primary {
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 800;
}

.primary:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.msg {
  margin: 0;
  font-size: 13px;
  padding: 10px 12px;
  border-radius: 12px;
  line-height: 1.3;
}

.err {
  background: #ffe8e8;
  color: #8a1f1f;
  border: 1px solid #ffd0d0;
}

.ok {
  background: #eaffea;
  color: #1f6f2a;
  border: 1px solid #c9f3cf;
}

.hint {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style>
