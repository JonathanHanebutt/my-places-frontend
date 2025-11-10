<template>
  <div
    class="swipe-card"
    :style="cardStyle"
    @pointerdown="onPointerDown"
  >
    <!-- Badges -->
    <div class="badge like" :style="{ opacity: likeOpacity }">LIKE</div>
    <div class="badge nope" :style="{ opacity: nopeOpacity }">NOPE</div>

    <!-- Inhalt -->
    <img v-if="item.imageLink" class="hero" :src="item.imageLink" :alt="item.name" />
    <div class="content">
      <h3>{{ item.name }}</h3>
      <p class="desc" v-if="item.description">{{ item.description }}</p>
      <p class="meta">⭐ {{ item.rating }} • 👍 {{ item.like }} • 👎 {{ item.dislike }}</p>
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
  emits: ["swipe"], 
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
  width: min(520px, 92vw);
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(0,0,0,.12);
  overflow: hidden;
  user-select: none;
}

.hero {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.content { padding: 16px 18px 18px; }
h3 { margin: 0 0 6px; color: #0a66ff; font-size: 1.25rem; }
.desc { color: #555; margin-bottom: 8px; }
.meta { color: #333; font-weight: 600; }

.badge {
  position: absolute;
  top: 14px;
  padding: 6px 10px;
  border-radius: 10px;
  font-weight: 800;
  letter-spacing: .06em;
  opacity: 0;
  pointer-events: none;
}
.badge.like { left: 14px; color: #18a558; background: #e7f7ee; border: 2px solid #18a558; }
.badge.nope { right: 14px; color: #e04f4f; background: #fdeeee; border: 2px solid #e04f4f; }
</style>
