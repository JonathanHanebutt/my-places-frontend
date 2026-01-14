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
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
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
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
  border-radius: 999px;
  font-size: 0.95rem;
  color: var(--text);
  outline: none;
  transition: all 0.2s ease;
}

.comment-input:focus {
  background: var(--surface-strong);
  border-color: var(--accent);
}

.comment-input::placeholder {
  color: var(--muted);
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 16px var(--glow);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Login hint */
.login-hint {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
  text-align: center;
  padding: 12px;
  background: var(--surface-glass);
  border-radius: 12px;
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.comments-list::-webkit-scrollbar {
  width: 4px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: var(--border-glass);
  border-radius: 2px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--surface-glass);
  border-radius: 16px;
  border: 1px solid var(--border-glass);
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
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
  font-size: 0.9rem;
  color: var(--text);
}

.comment-time {
  font-size: 0.75rem;
  color: var(--muted);
}

.comment-content {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
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
  font-size: 0.75rem;
  color: var(--muted);
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.comment-actions .action-btn:hover {
  color: var(--accent);
}

.comment-actions .action-btn.delete:hover {
  color: #ef4444;
}

/* Edit Form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-input {
  padding: 8px 12px;
  background: var(--surface-strong);
  border: 1px solid var(--accent);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text);
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.save-btn, .cancel-btn {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.save-btn {
  background: var(--accent);
  color: white;
}

.cancel-btn {
  background: var(--surface-glass);
  color: var(--muted);
  border: 1px solid var(--border-glass);
}

/* States */
.no-comments {
  margin: 0;
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
  padding: 20px;
}

.error-msg {
  margin: 0;
  padding: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.85rem;
  text-align: center;
}
</style>

