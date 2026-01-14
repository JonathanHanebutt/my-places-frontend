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
          </div>
        </div>

        <button
          class="remove-btn"
          @click="$emit('unlike', place)"
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
  emits: ["navigate", "unlike"]
};
</script>

<style scoped>
.likes-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  margin: 0 0 10px;
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.likes-header p {
  margin: 0;
  color: var(--muted);
  font-size: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 32px;
  background: var(--surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid var(--border-glass);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 12px;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text);
}

.empty-state p {
  margin: 0 0 28px;
  color: var(--muted);
  font-size: 1rem;
  max-width: 300px;
}

.action-btn {
  padding: 16px 32px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px var(--glow);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 28px var(--glow);
}

.action-btn:active {
  transform: translateY(0) scale(0.98);
}

/* Likes Grid */
.likes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
  flex: 1;
  align-content: start;
  max-height: none;
  overflow-y: auto;
  padding-right: 4px;
}

.likes-grid::-webkit-scrollbar {
  width: 6px;
}

.likes-grid::-webkit-scrollbar-track {
  background: transparent;
}

.likes-grid::-webkit-scrollbar-thumb {
  background: var(--border-glass);
  border-radius: 3px;
}

/* Like Card */
.like-card {
  position: relative;
  display: grid;
  grid-template-columns: 90px 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 16px;
  background: var(--surface-strong);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-radius: 20px;
  border: 1px solid var(--border-glass);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.like-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-glow);
}

.like-image {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 14px;
}

.like-image-placeholder {
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  background: var(--surface-glass);
  border-radius: 14px;
  border: 1px solid var(--border-glass);
}

.like-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.like-content h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.like-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.like-meta {
  display: flex;
  gap: 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
}

.remove-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
  border-radius: 999px;
  color: var(--muted);
  font-size: 14px;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.like-card:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: rgba(225, 29, 72, 0.15);
  border-color: rgba(225, 29, 72, 0.3);
  color: var(--accent);
}

/* Responsive */
@media (max-width: 640px) {
  .likes-grid {
    grid-template-columns: 1fr;
  }

  .like-card {
    grid-template-columns: 72px 1fr auto;
    gap: 14px;
    padding: 14px;
  }

  .like-image,
  .like-image-placeholder {
    width: 72px;
    height: 72px;
  }

  .remove-btn {
    opacity: 1;
  }
}
</style>

