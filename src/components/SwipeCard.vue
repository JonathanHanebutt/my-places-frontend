<template>
  <div
    class="swipe-card"
    :style="cardStyle"
    @pointerdown="onPointerDown"
  >
    <!-- Swipe Indicators -->
    <div class="indicator like" :style="{ opacity: likeOpacity }">LIKE</div>
    <div class="indicator nope" :style="{ opacity: nopeOpacity }">NOPE</div>

    <!-- Info Button -->
    <button
      class="info-btn"
      @click.stop="$emit('view-details', item)"
      @pointerdown.stop
    >
      💬
    </button>

    <!-- Image -->
    <img v-if="item.imageLink" class="card-image" :src="item.imageLink" :alt="item.name" />
    <div v-else class="card-image placeholder">📍</div>

    <!-- Content -->
    <div class="card-content">
      <h3 class="card-title">{{ item.name }}</h3>
      <p class="card-desc" v-if="item.description">{{ item.description }}</p>
      <div class="card-stats">
        <span>⭐ {{ item.rating || '-' }}</span>
        <span>👍 {{ item.likeCount ?? 0 }}</span>
        <span>👎 {{ item.dislikeCount ?? 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SwipeCard",
  props: {
    item: { type: Object, required: true },
    interactive: { type: Boolean, default: true },
    stackIndex: { type: Number, default: 0 }
  },
  emits: ["swipe", "view-details"],
  data() {
    return {
      x: 0, y: 0, rot: 0,
      startX: 0, startY: 0,
      dragging: false,
      releaseAnim: false
    };
  },
  computed: {
    likeOpacity() { return Math.min(Math.max(this.x, 0) / 120, 1); },
    nopeOpacity() { return Math.min(Math.max(-this.x, 0) / 120, 1); },
    cardStyle() {
      const base = `translate(${this.x}px, ${this.y}px) rotate(${this.rot}deg)`;
      const stackOffset = ` translateY(${this.stackIndex * 8}px) scale(${1 - this.stackIndex * 0.03})`;
      return {
        transform: base + stackOffset,
        transition: this.releaseAnim ? "transform .25s ease" : "none",
        cursor: this.interactive ? "grab" : "default",
        pointerEvents: this.interactive ? "auto" : "none",
        zIndex: 100 - this.stackIndex,
        opacity: this.stackIndex > 2 ? 0 : 1
      };
    }
  },
  methods: {
    onPointerDown(e) {
      if (!this.interactive) return;
      this.dragging = true;
      this.releaseAnim = false;
      this.startX = e.clientX;
      this.startY = e.clientY;
      window.addEventListener("pointermove", this.onPointerMove);
      window.addEventListener("pointerup", this.onPointerUp, { once: true });
    },
    onPointerMove(e) {
      if (!this.dragging) return;
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      this.x = dx;
      this.y = dy;
      this.rot = dx / 18;
    },
    onPointerUp() {
      this.dragging = false;
      const threshold = 100;
      if (this.x > threshold) {
        this.flyOut(1);
        setTimeout(() => this.$emit("swipe", { like: true }), 200);
      } else if (this.x < -threshold) {
        this.flyOut(-1);
        setTimeout(() => this.$emit("swipe", { like: false }), 200);
      } else {
        this.releaseAnim = true;
        this.x = 0; this.y = 0; this.rot = 0;
        setTimeout(() => (this.releaseAnim = false), 260);
      }
      window.removeEventListener("pointermove", this.onPointerMove);
    },
    flyOut(dir) {
      this.releaseAnim = true;
      this.x = dir * 400;
      this.rot = dir * 25;
    }
  }
};
</script>

<style scoped>
.swipe-card {
  position: absolute;
  inset: 0;
  background: var(--surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-float);
  overflow: hidden;
  user-select: none;
  display: flex;
  flex-direction: column;
}

.card-image {
  width: 100%;
  height: 60%;
  object-fit: cover;
}

.card-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-secondary);
  font-size: 64px;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.card-desc {
  margin: 0;
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.4;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-tertiary);
}

/* Indicators */
.indicator {
  position: absolute;
  top: 20px;
  padding: 10px 20px;
  border-radius: var(--radius);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 1px;
  opacity: 0;
  pointer-events: none;
  z-index: 10;
}

.indicator.like {
  left: 20px;
  background: var(--success);
  color: white;
}

.indicator.nope {
  right: 20px;
  background: var(--error);
  color: white;
}

/* Info Button */
.info-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--surface);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  transition: transform var(--transition);
  z-index: 20;
}

.info-btn:hover {
  transform: scale(1.1);
}

.info-btn:active {
  transform: scale(0.95);
}
</style>
