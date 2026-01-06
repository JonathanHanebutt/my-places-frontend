<template>
  <div v-if="open" class="backdrop" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true">
      <div class="head">
        <h2>{{ activeTab === "login" ? "Anmelden" : "Account erstellen" }}</h2>
        <button class="x" @click="$emit('close')" aria-label="Schließen">✕</button>
      </div>

      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">
          Login
        </button>
        <button class="tab" :class="{ active: activeTab === 'signup' }" @click="activeTab = 'signup'">
          Registrieren
        </button>
      </div>

      <form class="form" @submit.prevent="onSubmit">
        <div v-if="activeTab === 'signup'" class="field">
          <label>Username</label>
          <input v-model.trim="username" type="text" placeholder="z.B. keanu123" />
        </div>

        <div class="field">
          <label>E-Mail</label>
          <input v-model.trim="email" type="email" placeholder="name@mail.de" />
        </div>

        <div class="field">
          <label>Passwort</label>
          <input v-model="password" type="password" placeholder="••••••••" />
        </div>

        <button class="primary" type="submit">
          {{ activeTab === "login" ? "Login" : "Registrieren" }}
        </button>

        <p class="hint">(Nur UI – Backend kommt später)</p>
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
      password: ""
    };
  },
  watch: {
    open(val) {
      if (val) {
        // reset beim Öffnen
        this.activeTab = "login";
        this.username = "";
        this.email = "";
        this.password = "";
      }
    }
  },
  methods: {
    onSubmit() {
      // später: API call
      console.log("submit", {
        mode: this.activeTab,
        username: this.username,
        email: this.email
      });
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

  padding-top: 140px; /* ← HIER steuerst du die Höhe */
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

.hint {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style>
