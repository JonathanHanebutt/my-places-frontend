<template>
  <div class="likes-page">
    <!-- Header -->
    <div class="likes-header">
      <h2>Meine Likes</h2>
      <p v-if="likedPlaces.length">{{ likedPlaces.length }} Lieblingsorte</p>
      <p v-else>Noch keine Likes gespeichert</p>
    </div>

    <!-- Empty State -->
    <div v-if="likedPlaces.length === 0" class="empty-state">
      <div class="empty-icon">💔</div>
      <h3>Keine Likes bisher</h3>
      <p>Swipe nach rechts um Orte zu deinen Favoriten hinzuzufügen!</p>
      <button class="action-btn" @click="$emit('navigate', 'swipe')">
        Jetzt entdecken
      </button>
    </div>

    <!-- Liked Places Grid -->
    <div v-else class="likes-grid">
      <article
        v-for="place in likedPlaces"
        :key="place.id"
        class="like-card"
        @click="$emit('view-place', place)"
      >
        <img
          v-if="place.imageLink"
          :src="place.imageLink"
          :alt="place.name"
          class="like-image"
        />
        <div v-else class="like-image-placeholder">📍</div>

        <div class="like-content">
          <h3>{{ place.name }}</h3>
          <p v-if="place.description" class="like-desc">{{ place.description }}</p>
          <div class="like-meta">
            <span>⭐ {{ place.rating }}</span>
            <span>👍 {{ place.likeCount ?? 0 }}</span>
            <span class="comment-hint">💬 Kommentare</span>
          </div>
        </div>

        <button
          class="remove-btn"
          @click.stop="$emit('unlike', place)"
          title="Aus Likes entfernen"
        >
          ✕
        </button>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  name: "LikesPage",
  props: {
    likedPlaces: { type: Array, default: () => [] }
  },
  emits: ["navigate", "unlike", "view-place"]
};
</script>

<style scoped>
.likes-page {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.likes-header {
  text-align: center;
  padding: 20px;
}

.likes-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: var(--text, #000000);
}

.likes-header p {
  margin: 0;
  color: var(--text-tertiary, #8E8E93);
  font-size: 15px;
}

/* Empty State - Liquid Glass */
.empty-state {
  text-align: center;
  padding: 60px 32px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text, #000000);
}

.empty-state p {
  margin: 0 0 24px;
  color: var(--text-secondary, #3C3C43);
  font-size: 15px;
  max-width: 280px;
}

.action-btn {
  padding: 14px 28px;
  background: var(--primary, #34C759);
  color: var(--text-on-primary, #FFFFFF);
  border: none;
  border-radius: var(--radius, 16px);
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition, 0.2s ease);
}

.action-btn:hover {
  background: var(--primary-hover, #30B350);
}

.action-btn:active {
  transform: scale(0.98);
}

/* Likes Grid */
.likes-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Like Card - Liquid Glass */
.like-card {
  position: relative;
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 12px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow);
  transition: all var(--transition, 0.2s ease);
  cursor: pointer;
}

.like-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.like-card:active {
  transform: scale(0.98);
}

.comment-hint {
  color: var(--primary, #34C759);
  font-size: 13px;
}

.like-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius, 16px);
  flex-shrink: 0;
}

.like-image-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: var(--surface-secondary, #F2F2F7);
  border-radius: var(--radius, 16px);
  flex-shrink: 0;
}

.like-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.like-content h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text, #000000);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.like-desc {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary, #3C3C43);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.like-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-tertiary, #8E8E93);
}

.remove-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-secondary, #F2F2F7);
  border: none;
  border-radius: var(--radius-full, 9999px);
  color: var(--text-tertiary, #8E8E93);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
  flex-shrink: 0;
}

.remove-btn:hover {
  background: rgba(255, 59, 48, 0.15);
  color: var(--error, #FF3B30);
}

/* Responsive */
@media (max-width: 640px) {
  .like-image,
  .like-image-placeholder {
    width: 64px;
    height: 64px;
  }
}
</style>


