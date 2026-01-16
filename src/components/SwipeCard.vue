<template>
  <div
    class="swipe-card"
    :style="cardStyle"
    @pointerdown="onPointerDown"
  >
    <!-- Badges -->
    <div class="badge like" :style="{ opacity: likeOpacity }">LIKE</div>
    <div class="badge nope" :style="{ opacity: nopeOpacity }">NOPE</div>

    <!-- Info Button -->
    <button
      class="info-btn"
      @click.stop="$emit('view-details', item)"
      @pointerdown.stop
      title="Details & Kommentare"
    >
      💬
    </button>

    <!-- Inhalt -->
    <img v-if="item.imageLink" class="hero" :src="item.imageLink" :alt="item.name" />
    <div class="content">
      <h3>{{ item.name }}</h3>
      <p class="desc" v-if="item.description">{{ item.description }}</p>
      <p class="meta">
        ⭐ {{ item.rating }} • 👍 {{ item.likeCount ?? 0 }} • 👎 {{ item.dislikeCount ?? 0 }}
      </p>

    </div>
  </div>
</template>

<script>
export default {
  name: "SwipeCard",
  props: {
    item: { type: Object, required: true },
    interactive: { type: Boolean, default: true }, // nur Top-Karte dragbar
    stackIndex: { type: Number, default: 0 }       // für optischen Stack
  },
  emits: ["swipe", "view-details"], // { like: boolean }
  data() {
    return {
      x: 0, y: 0, rot: 0,
      startX: 0, startY: 0,
      dragging: false,
      releaseAnim: false
    };
  },
  computed: {
    likeOpacity() { return Math.min(Math.max(this.x, 0) / 140, 1); },
    nopeOpacity() { return Math.min(Math.max(-this.x, 0) / 140, 1); },
    cardStyle() {
      const base = `translate(${this.x}px, ${this.y}px) rotate(${this.rot}deg)`;
      const stackOffset = ` translateY(${this.stackIndex * 6}px) scale(${1 - this.stackIndex * 0.02})`;
      return {
        transform: base + stackOffset,
        transition: this.releaseAnim ? "transform .25s ease" : "none",
        cursor: this.interactive ? "grab" : "default",
        pointerEvents: this.interactive ? "auto" : "none",
        zIndex: 100 - this.stackIndex
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
      this.rot = dx / 15; // kleiner Tilt
    },
    onPointerUp() {
      this.dragging = false;
      const threshold = 120;
      if (this.x > threshold) {
        // like: fliegt nach rechts raus
        this.flyOut(1);
        setTimeout(() => this.$emit("swipe", { like: true }), 220);
      } else if (this.x < -threshold) {
        // dislike: links raus
        this.flyOut(-1);
        setTimeout(() => this.$emit("swipe", { like: false }), 220);
      } else {
        // reset zur Mitte
        this.releaseAnim = true;
        this.x = 0; this.y = 0; this.rot = 0;
        setTimeout(() => (this.releaseAnim = false), 260);
      }
      window.removeEventListener("pointermove", this.onPointerMove);
    },
    flyOut(dir) {
      this.releaseAnim = true;
      this.x = dir * 500;
      this.y = this.y; // behalte y für natürliche Flugbahn
      this.rot = dir * 20;
    }
  }
};
</script>

<style scoped>
.swipe-card {
  position: absolute;
  inset: 0;
  background: var(--surface-strong, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: var(--radius, 20px);
  border: 1px solid var(--border, rgba(22, 163, 74, 0.15));
  box-shadow: var(--shadow);
  overflow: hidden;
  user-select: none;
  display: flex;
  flex-direction: column;
}

.hero {
  width: 100%;
  height: 55%;
  object-fit: cover;
  border-bottom: 1px solid var(--border, rgba(22, 163, 74, 0.1));
}

.content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text, #1a1a1a);
}

.desc {
  color: var(--text-muted, #4b5563);
  margin: 0;
  line-height: 1.5;
  font-size: 0.95rem;
  flex: 1;
}

.meta {
  color: var(--text, #1a1a1a);
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  gap: 12px;
  padding: 10px 14px;
  background: var(--surface-glass, rgba(255, 255, 255, 0.5));
  border-radius: var(--radius-sm, 12px);
  border: 1px solid var(--border, rgba(22, 163, 74, 0.1));
  width: fit-content;
}

.badge {
  position: absolute;
  top: 16px;
  padding: 10px 16px;
  border-radius: var(--radius-sm, 12px);
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: .08em;
  opacity: 0;
  pointer-events: none;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: opacity 0.15s ease;
}

.badge.like {
  left: 16px;
  color: #16a34a;
  background: rgba(22, 163, 74, 0.15);
  border: 2px solid rgba(22, 163, 74, 0.4);
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.2);
}

.badge.nope {
  right: 16px;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.12);
  border: 2px solid rgba(220, 38, 38, 0.35);
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.2);
}

.info-btn {
  position: absolute;
  top: 16px;
  right: 60px;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full, 9999px);
  border: none;
  background: var(--surface-strong, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  transition: all var(--transition, 0.25s ease);
  z-index: 10;
}

.info-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-glow);
}

.info-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

/* Dark mode */
[data-theme="dark"] .swipe-card {
  background: var(--surface-strong, rgba(30, 45, 38, 0.9));
  border-color: var(--border, rgba(74, 222, 128, 0.15));
}

[data-theme="dark"] .badge.like {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.15);
  border-color: rgba(74, 222, 128, 0.4);
}

[data-theme="dark"] .badge.nope {
  color: #f87171;
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.35);
}
</style>
