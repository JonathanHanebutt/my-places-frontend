<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- Close Button -->
      <button class="close-btn" @click="$emit('close')">✕</button>

      <!-- Image -->
      <div class="modal-image-wrapper">
        <img
          v-if="place.imageLink"
          :src="place.imageLink"
          :alt="place.name"
          class="modal-image"
        />
        <div v-else class="modal-image-placeholder">📍</div>
      </div>

      <!-- Content -->
      <div class="modal-body">
        <div class="place-info">
          <h2>{{ place.name }}</h2>
          <p v-if="place.uploaderUsername" class="uploader">
            Hochgeladen von <strong>{{ place.uploaderUsername }}</strong>
          </p>
          <p v-if="place.description" class="description">{{ place.description }}</p>

          <div class="stats-row">
            <span class="stat">⭐ {{ place.rating ?? '-' }}</span>
            <span class="stat">👍 {{ place.likeCount ?? 0 }}</span>
            <span class="stat">👎 {{ place.dislikeCount ?? 0 }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Comments Section -->
        <CommentSection
          :placeId="place.id"
          :isAuthenticated="isAuthenticated"
          :currentUsername="currentUsername"
          :authToken="authToken"
          :backendBase="backendBase"
          @request-login="$emit('request-login')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CommentSection from "./CommentSection.vue";

export default {
  name: "PlaceDetailModal",
  components: { CommentSection },
  props: {
    open: { type: Boolean, default: false },
    place: { type: Object, default: () => ({}) },
    isAuthenticated: { type: Boolean, default: false },
    currentUsername: { type: String, default: null },
    authToken: { type: String, default: null },
    backendBase: { type: String, required: true }
  },
  emits: ["close", "request-login"]
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 10000;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-xl, 28px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--glass-shine);
  pointer-events: none;
  border-radius: inherit;
  z-index: 0;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full, 9999px);
  border: none;
  background: var(--surface, #FFFFFF);
  color: var(--text, #000000);
  font-size: 14px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition, 0.2s ease);
  box-shadow: var(--shadow);
}

.close-btn:hover {
  background: var(--surface-secondary, #F2F2F7);
  transform: scale(1.1);
}

.close-btn:active {
  transform: scale(0.95);
}

.modal-image-wrapper {
  width: 100%;
  height: 280px;
  flex-shrink: 0;
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background: var(--surface-secondary, #F2F2F7);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.place-info h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--text, #000000);
  letter-spacing: -0.02em;
}

.uploader {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--text-secondary, #3C3C43);
}

.uploader strong {
  color: var(--primary, #34C759);
}

.description {
  margin: 0 0 16px;
  font-size: 15px;
  color: var(--text, #000000);
  line-height: 1.6;
}

.stats-row {
  display: flex;
  gap: 12px;
}

.stat {
  padding: 8px 14px;
  background: var(--surface-secondary, #F2F2F7);
  border-radius: var(--radius-full, 9999px);
  font-size: 14px;
  font-weight: 600;
  color: var(--text, #000000);
}

.divider {
  height: 1px;
  background: var(--border, rgba(60, 60, 67, 0.12));
}

/* Responsive */
@media (max-width: 640px) {
  .modal-backdrop {
    padding: 10px;
    align-items: flex-end;
  }

  .modal-content {
    max-height: 85vh;
    border-radius: var(--radius-xl, 28px) var(--radius-xl, 28px) 0 0;
  }

  .modal-image-wrapper {
    height: 200px;
  }

  .modal-body {
    padding: 20px;
  }

  .place-info h2 {
    font-size: 20px;
  }
}
</style>

