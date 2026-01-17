<template>
  <div class="comments-section">
    <div class="comments-header">
      <h4>💬 Kommentare ({{ comments.length }})</h4>
    </div>

    <!-- Add Comment Form (if authenticated) -->
    <form v-if="isAuthenticated" class="comment-form" @submit.prevent="submitComment">
      <div class="comment-input-wrapper">
        <input
          v-model.trim="newComment"
          type="text"
          placeholder="Schreibe einen Kommentar..."
          :disabled="submitting"
          class="comment-input"
        />
        <button
          type="submit"
          class="send-btn"
          :disabled="!newComment || submitting"
        >
          {{ submitting ? '...' : '➤' }}
        </button>
      </div>
    </form>
    <p v-else class="login-hint">
      <button class="link-btn" @click="$emit('request-login')">Anmelden</button>
      um zu kommentieren
    </p>

    <!-- Comments List -->
    <div class="comments-list" v-if="comments.length > 0">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="comment-avatar">{{ getInitial(comment.username) }}</div>
        <div class="comment-body">
          <div class="comment-meta">
            <span class="comment-author">{{ comment.username }}</span>
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          </div>

          <!-- Edit mode -->
          <div v-if="editingId === comment.id" class="edit-form">
            <input
              v-model="editContent"
              class="edit-input"
              @keyup.enter="saveEdit(comment.id)"
              @keyup.escape="cancelEdit"
            />
            <div class="edit-actions">
              <button class="save-btn" @click="saveEdit(comment.id)">Speichern</button>
              <button class="cancel-btn" @click="cancelEdit">Abbrechen</button>
            </div>
          </div>

          <!-- Display mode -->
          <p v-else class="comment-content">{{ comment.content }}</p>

          <!-- Actions (only for own comments) -->
          <div v-if="comment.username === currentUsername && editingId !== comment.id" class="comment-actions">
            <button class="action-btn" @click="startEdit(comment)">Bearbeiten</button>
            <button class="action-btn delete" @click="deleteComment(comment.id)">Löschen</button>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="no-comments">Noch keine Kommentare. Sei der Erste!</p>

    <!-- Error message -->
    <p v-if="error" class="error-msg">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: "CommentSection",
  props: {
    placeId: { type: [Number, String], required: true },
    isAuthenticated: { type: Boolean, default: false },
    currentUsername: { type: String, default: null },
    authToken: { type: String, default: null },
    backendBase: { type: String, required: true }
  },
  emits: ["request-login"],
  data() {
    return {
      comments: [],
      newComment: "",
      submitting: false,
      loading: false,
      error: null,
      editingId: null,
      editContent: ""
    };
  },
  mounted() {
    this.loadComments();
  },
  watch: {
    placeId() {
      this.loadComments();
    }
  },
  methods: {
    async loadComments() {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetch(`${this.backendBase}/api/comments/place/${this.placeId}`);
        if (!res.ok) throw new Error("Fehler beim Laden der Kommentare");
        this.comments = await res.json();
      } catch (err) {
        console.error(err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async submitComment() {
      if (!this.newComment || this.submitting) return;

      this.submitting = true;
      this.error = null;

      try {
        const res = await fetch(`${this.backendBase}/api/comments/place/${this.placeId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.authToken}`
          },
          body: JSON.stringify({ content: this.newComment })
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Fehler beim Senden");
        }

        const newCommentData = await res.json();
        this.comments.unshift(newCommentData);
        this.newComment = "";
      } catch (err) {
        console.error(err);
        this.error = err.message;
      } finally {
        this.submitting = false;
      }
    },

    startEdit(comment) {
      this.editingId = comment.id;
      this.editContent = comment.content;
    },

    cancelEdit() {
      this.editingId = null;
      this.editContent = "";
    },

    async saveEdit(commentId) {
      if (!this.editContent.trim()) return;

      try {
        const res = await fetch(`${this.backendBase}/api/comments/${commentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.authToken}`
          },
          body: JSON.stringify({ content: this.editContent })
        });

        if (!res.ok) throw new Error("Fehler beim Aktualisieren");

        const updated = await res.json();
        const idx = this.comments.findIndex(c => c.id === commentId);
        if (idx !== -1) {
          this.comments[idx] = updated;
        }
        this.cancelEdit();
      } catch (err) {
        console.error(err);
        this.error = err.message;
      }
    },

    async deleteComment(commentId) {
      if (!confirm("Kommentar wirklich löschen?")) return;

      try {
        const res = await fetch(`${this.backendBase}/api/comments/${commentId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${this.authToken}`
          }
        });

        if (!res.ok) throw new Error("Fehler beim Löschen");

        this.comments = this.comments.filter(c => c.id !== commentId);
      } catch (err) {
        console.error(err);
        this.error = err.message;
      }
    },

    getInitial(username) {
      return username ? username.charAt(0).toUpperCase() : "?";
    },

    formatTime(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;

      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "Gerade eben";
      if (mins < 60) return `vor ${mins} Min.`;

      const hours = Math.floor(mins / 60);
      if (hours < 24) return `vor ${hours} Std.`;

      const days = Math.floor(hours / 24);
      if (days < 7) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;

      return date.toLocaleDateString('de-DE');
    }
  }
};
</script>

<style scoped>
.comments-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comments-header h4 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text, #000000);
}

/* Comment Form */
.comment-form {
  width: 100%;
}

.comment-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.comment-input {
  flex: 1;
  padding: 12px 16px;
  background: var(--surface-secondary, #F2F2F7);
  border: 1px solid transparent;
  border-radius: var(--radius-full, 9999px);
  font-size: 15px;
  color: var(--text, #000000);
  outline: none;
  transition: all var(--transition-fast, 0.15s ease);
}

.comment-input:focus {
  background: var(--surface, #FFFFFF);
  border-color: var(--primary, #34C759);
  box-shadow: var(--focus-ring);
}

.comment-input::placeholder {
  color: var(--text-tertiary, #8E8E93);
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full, 9999px);
  border: none;
  background: var(--primary, #34C759);
  color: var(--text-on-primary, #FFFFFF);
  font-size: 18px;
  cursor: pointer;
  transition: all var(--transition, 0.2s ease);
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-hover, #30B350);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Login hint */
.login-hint {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary, #3C3C43);
  text-align: center;
  padding: 12px;
  background: var(--surface-secondary, #F2F2F7);
  border-radius: var(--radius, 16px);
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary, #34C759);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--surface-secondary, #F2F2F7);
  border-radius: var(--radius, 16px);
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full, 9999px);
  background: var(--primary, #34C759);
  color: var(--text-on-primary, #FFFFFF);
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
  color: var(--text, #000000);
}

.comment-time {
  font-size: 12px;
  color: var(--text-tertiary, #8E8E93);
}

.comment-content {
  margin: 0;
  font-size: 15px;
  color: var(--text, #000000);
  line-height: 1.4;
  word-wrap: break-word;
}

.comment-actions {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}

.comment-actions .action-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--text-tertiary, #8E8E93);
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast, 0.15s ease);
}

.comment-actions .action-btn:hover {
  color: var(--primary, #34C759);
}

.comment-actions .action-btn.delete:hover {
  color: var(--error, #FF3B30);
}

/* Edit Form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-input {
  padding: 8px 12px;
  background: var(--surface, #FFFFFF);
  border: 1px solid var(--primary, #34C759);
  border-radius: var(--radius-sm, 12px);
  font-size: 15px;
  color: var(--text, #000000);
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.save-btn, .cancel-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm, 12px);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast, 0.15s ease);
}

.save-btn {
  background: var(--primary, #34C759);
  color: var(--text-on-primary, #FFFFFF);
}

.save-btn:hover {
  background: var(--primary-hover, #30B350);
}

.cancel-btn {
  background: var(--surface-secondary, #F2F2F7);
  color: var(--text-secondary, #3C3C43);
}

.cancel-btn:hover {
  background: var(--border, rgba(60, 60, 67, 0.12));
}

/* States */
.no-comments {
  margin: 0;
  text-align: center;
  color: var(--text-tertiary, #8E8E93);
  font-size: 14px;
  padding: 20px;
}

.error-msg {
  margin: 0;
  padding: 10px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: var(--radius-sm, 12px);
  color: var(--error, #FF3B30);
  font-size: 14px;
  text-align: center;
}
</style>

