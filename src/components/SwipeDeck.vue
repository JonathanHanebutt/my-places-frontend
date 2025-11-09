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
  emits: ["rate"], // { item, like }
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
  display: grid;
  place-items: center;
  gap: 14px;
}
.stack {
  position: relative;
  width: min(520px, 92vw);
  height: 360px; /* Platz für Karte(n) */
}
.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.btn {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
  transition: transform .15s ease;
}
.btn:hover { transform: translateY(-2px); }
.btn.like { background: #e7f7ee; color: #18a558; }
.btn.nope { background: #fdeeee; color: #e04f4f; }
.empty { color: #444; }
</style>
