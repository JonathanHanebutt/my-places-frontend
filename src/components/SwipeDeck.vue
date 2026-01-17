<template>
  <div class="swipe-container">
    <!-- Card Stack -->
    <div class="card-stack" v-if="stack.length">
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

    <!-- Action Buttons -->
    <div class="action-buttons" v-if="stack.length">
      <button class="action-btn dislike" @click="fakeSwipe(false)">
        <span class="btn-icon">👎</span>
        <span class="btn-label">Nope</span>
      </button>

      <button class="action-btn like" @click="fakeSwipe(true)">
        <span class="btn-icon">👍</span>
        <span class="btn-label">Like</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <span class="empty-icon">🎉</span>
      <h3>Geschafft!</h3>
      <p>Du hast alle Orte bewertet.</p>
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
.swipe-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 0 20px;
}

.card-stack {
  position: relative;
  width: 100%;
  max-width: 380px;
  aspect-ratio: 3 / 4;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 32px;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: var(--shadow);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn.dislike {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  color: var(--error);
}

.action-btn.dislike:hover {
  background: rgba(255, 59, 48, 0.15);
}

.action-btn.like {
  background: var(--primary);
  color: var(--text-on-primary);
}

.action-btn.like:hover {
  background: var(--primary-hover);
}

.btn-icon {
  font-size: 32px;
}

.btn-label {
  font-size: 14px;
  font-weight: 600;
}

/* Empty State - Liquid Glass */
.empty-state {
  text-align: center;
  padding: 60px 40px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-xl);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
}

.empty-state::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--glass-shine);
  pointer-events: none;
  border-radius: inherit;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.empty-state p {
  margin: 0;
  font-size: 17px;
  color: var(--text-secondary);
}
</style>
