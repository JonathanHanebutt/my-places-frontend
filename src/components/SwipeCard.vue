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
  top: 0; left: 0; right: 0; margin: 0 auto;
  width: min(580px, 94vw);
  background: var(--surface-strong, rgba(255, 255, 255, 0.75));
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 24px;
  border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.6));
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 12px 24px rgba(0, 0, 0, 0.06),
    0 24px 48px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  user-select: none;
}

.hero {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-bottom: 1px solid var(--border-glass, rgba(255, 255, 255, 0.3));
}

.content {
  padding: 18px 20px 22px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--surface-glass, rgba(255, 255, 255, 0.1)) 100%
  );
}

h3 {
  margin: 0 0 8px;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, var(--accent, #6366f1) 0%, var(--accent-soft, #818cf8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.desc {
  color: var(--muted, #475569);
  margin-bottom: 10px;
  line-height: 1.5;
  font-size: 0.95rem;
}

.meta {
  color: var(--text, #1e293b);
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  gap: 12px;
  padding: 10px 14px;
  background: var(--surface-glass, rgba(255, 255, 255, 0.35));
  border-radius: 12px;
  border: 1px solid var(--border-glass, rgba(255, 255, 255, 0.4));
  width: fit-content;
}

.badge {
  position: absolute;
  top: 16px;
  padding: 8px 14px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.85rem;
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
  color: var(--accent, #e11d48);
  background: rgba(225, 29, 72, 0.12);
  border: 2px solid rgba(225, 29, 72, 0.35);
  box-shadow: 0 4px 16px rgba(225, 29, 72, 0.2);
}

.info-btn {
  position: absolute;
  top: 16px;
  right: 60px;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: var(--surface-strong, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  z-index: 10;
}

.info-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Dark mode adjustments */
:root[data-theme="dark"] .swipe-card {
  background: var(--surface-strong, rgba(51, 65, 85, 0.7));
  border-color: var(--border-glass, rgba(148, 163, 184, 0.2));
}

:root[data-theme="dark"] .hero {
  border-color: var(--border-glass, rgba(148, 163, 184, 0.15));
}

:root[data-theme="dark"] .meta {
  background: var(--surface-glass, rgba(30, 41, 59, 0.45));
  border-color: var(--border-glass, rgba(148, 163, 184, 0.15));
}
</style>
