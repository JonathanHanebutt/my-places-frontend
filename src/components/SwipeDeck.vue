<template>
  <div class="deck">
    <!-- Card Stack -->
    <div class="stack" v-if="stack.length">
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

    <!-- Action Bar -->
    <div class="action-bar" v-if="stack.length">
      <button class="action-btn nope" @click="fakeSwipe(false)">
        <span class="action-icon">👎</span>
        <span class="action-label">Nicht mein Ding</span>
      </button>
      <button class="action-btn like" @click="fakeSwipe(true)">
        <span class="action-icon">👍</span>
        <span class="action-label">Gefällt mir</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <span class="empty-icon">🎉</span>
      <h3>Alle bewertet!</h3>
      <p>Du hast alle Orte durchgeschaut. Schau dir deine Likes an!</p>
    </div>
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
  emits: ["rate", "view-place"],
  data() {
    return { stack: [] };
  },
  created() {
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
  gap: 28px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.stack {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  max-height: 500px;
}

/* Action Bar */
.action-bar {
  display: flex;
  gap: 16px;
  justify-content: center;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: var(--radius-full, 9999px);
  border: 1px solid var(--border, rgba(22, 163, 74, 0.15));
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all var(--transition, 0.25s ease);
}

.action-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring, 0 0 0 3px rgba(22, 163, 74, 0.5));
}

.action-btn:active {
  transform: scale(0.96);
}

.action-icon {
  font-size: 1.3rem;
}

.action-label {
  font-size: 0.95rem;
}

/* Like Button */
.action-btn.like {
  background: rgba(22, 163, 74, 0.1);
  color: var(--success, #16a34a);
  border-color: rgba(22, 163, 74, 0.2);
}

.action-btn.like:hover {
  background: rgba(22, 163, 74, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(22, 163, 74, 0.2);
}

/* Nope Button */
.action-btn.nope {
  background: rgba(220, 38, 38, 0.08);
  color: var(--error, #dc2626);
  border-color: rgba(220, 38, 38, 0.15);
}

.action-btn.nope:hover {
  background: rgba(220, 38, 38, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.15);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 32px;
  background: var(--surface-strong, rgba(255, 255, 255, 0.9));
  border-radius: var(--radius, 20px);
  border: 1px solid var(--border, rgba(22, 163, 74, 0.15));
}

.empty-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text, #1a1a1a);
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
  color: var(--text-muted, #4b5563);
}

/* Dark mode adjustments */
[data-theme="dark"] .action-btn.like {
  background: rgba(74, 222, 128, 0.15);
  border-color: rgba(74, 222, 128, 0.25);
  color: #4ade80;
}

[data-theme="dark"] .action-btn.nope {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.2);
  color: #f87171;
}

/* Responsive */
@media (max-width: 640px) {
  .action-bar {
    flex-direction: column;
    gap: 12px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
