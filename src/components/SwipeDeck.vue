<template>
  <div class="deck">
    <div class="stack">
      <SwipeCard
        v-for="(it, i) in stack"
        :key="it.name + '-' + i"
        :item="it"
        :interactive="i === stack.length - 1"
        :stackIndex="(stack.length - 1) - i"
        @swipe="onSwipe"
        @view-details="$emit('view-place', $event)"
      />
    </div>

    <!-- Fallback-Buttons -->
    <div class="actions" v-if="stack.length">
      <button class="btn nope" @click="fakeSwipe(false)">👎</button>
      <button class="btn like" @click="fakeSwipe(true)">👍</button>
    </div>

    <p v-else class="empty">Keine weiteren Einträge – danke fürs Bewerten! 🎉</p>
  </div>
</template>

<script>
import SwipeCard from "./SwipeCard.vue";

export default {
  name: "SwipeDeck",
  components: { SwipeCard },
  props: {
    items: { type: Array, required: true }
  },
  emits: ["rate", "view-place"], // { item, like }
  data() {
    return { stack: [] };
  },
  created() {
    // lokale Kopie, damit wir pop/push machen können
    this.stack = [...this.items];
  },
  watch: {
    items(newVal) { this.stack = [...newVal]; }
  },
  methods: {
    onSwipe({ like }) {
      const item = this.stack.pop();
      this.$emit("rate", { item, like });
    },
    fakeSwipe(like) {
      // Klick-Buttons: emitte wie ein Swipe (wir entfernen manuell die Top-Karte)
      const item = this.stack.pop();
      this.$emit("rate", { item, like });
    }
  }
};
</script>

<style scoped>
.deck {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.stack {
  position: relative;
  width: min(580px, 94vw);
  height: 420px;
  margin: 0 auto;
}

.actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn {
  border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.6));
  border-radius: 999px;
  padding: 14px 22px;
  font-size: 1.4rem;
  cursor: pointer;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.12),
    0 16px 40px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}

.btn.like {
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
  border-color: rgba(22, 163, 74, 0.25);
}

.btn.like:hover {
  background: rgba(22, 163, 74, 0.22);
  box-shadow:
    0 8px 20px rgba(22, 163, 74, 0.2),
    0 16px 40px rgba(22, 163, 74, 0.15);
}

.btn.nope {
  background: rgba(225, 29, 72, 0.1);
  color: var(--accent, #e11d48);
  border-color: rgba(225, 29, 72, 0.2);
}

.btn.nope:hover {
  background: rgba(225, 29, 72, 0.18);
  box-shadow:
    0 8px 20px rgba(225, 29, 72, 0.2),
    0 16px 40px rgba(225, 29, 72, 0.15);
}

.empty {
  color: var(--muted, #475569);
  font-weight: 500;
  text-align: center;
  padding: 2rem;
  background: var(--surface-glass, rgba(255, 255, 255, 0.35));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.4));
}

/* Dark mode adjustments */
:root[data-theme="dark"] .btn.like {
  background: rgba(22, 163, 74, 0.18);
  border-color: rgba(22, 163, 74, 0.3);
}

:root[data-theme="dark"] .btn.nope {
  background: rgba(251, 113, 133, 0.15);
  border-color: rgba(251, 113, 133, 0.25);
  color: var(--accent-soft, #fb7185);
}

:root[data-theme="dark"] .empty {
  background: var(--surface-glass, rgba(30, 41, 59, 0.45));
  border-color: var(--border-glass, rgba(148, 163, 184, 0.2));
}
</style>
