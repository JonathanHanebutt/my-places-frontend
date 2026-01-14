<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Neuen Ort erstellen</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <form class="create-form" @submit.prevent="submitPlace">
        <!-- Image Preview / Upload -->
        <div class="image-upload" @click="triggerFileInput">
          <img v-if="imagePreview" :src="imagePreview" alt="Vorschau" class="preview-image" />
          <div v-else class="upload-placeholder">
            <span class="upload-icon">📷</span>
            <span>Bild hinzufügen</span>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="onFileChange"
            hidden
          />
        </div>

        <!-- Name -->
        <div class="field">
          <label>Name *</label>
          <input
            v-model.trim="form.name"
            type="text"
            placeholder="z.B. Brandenburger Tor"
            required
          />
        </div>

        <!-- Description -->
        <div class="field">
          <label>Beschreibung</label>
          <textarea
            v-model.trim="form.description"
            placeholder="Beschreibe diesen Ort..."
            rows="3"
          ></textarea>
        </div>

        <!-- Image Link (alternative to upload) -->
        <div class="field">
          <label>Bild-URL (optional)</label>
          <input
            v-model.trim="form.imageLink"
            type="url"
            placeholder="https://example.com/image.jpg"
            @input="onImageLinkChange"
          />
        </div>

        <!-- Rating -->
        <div class="field">
          <label>Bewertung</label>
          <div class="rating-input">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="star-btn"
              :class="{ active: form.rating >= star }"
              @click="form.rating = star"
            >
              ★
            </button>
            <span class="rating-value">{{ form.rating || 0 }}/5</span>
          </div>
        </div>

        <!-- Error / Success -->
        <p v-if="error" class="msg error">{{ error }}</p>
        <p v-if="success" class="msg success">{{ success }}</p>

        <!-- Submit -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="submitting || !form.name"
        >
          {{ submitting ? 'Wird erstellt...' : 'Ort erstellen' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "CreatePlaceModal",
  props: {
    open: { type: Boolean, default: false },
    authToken: { type: String, default: null },
    backendBase: { type: String, required: true }
  },
  emits: ["close", "created"],
  data() {
    return {
      form: {
        name: "",
        description: "",
        imageLink: "",
        rating: 0
      },
      imageFile: null,
      imagePreview: null,
      submitting: false,
      error: null,
      success: null
    };
  },
  watch: {
    open(val) {
      if (val) {
        this.resetForm();
      }
    }
  },
  methods: {
    resetForm() {
      this.form = {
        name: "",
        description: "",
        imageLink: "",
        rating: 0
      };
      this.imageFile = null;
      this.imagePreview = null;
      this.error = null;
      this.success = null;
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.imageFile = file;
        this.imagePreview = URL.createObjectURL(file);
        this.form.imageLink = ""; // Clear URL if file is selected
      }
    },

    onImageLinkChange() {
      if (this.form.imageLink) {
        this.imagePreview = this.form.imageLink;
        this.imageFile = null;
      }
    },

    async submitPlace() {
      if (!this.form.name || this.submitting) return;

      this.submitting = true;
      this.error = null;
      this.success = null;

      try {
        // Build the place data
        const placeData = {
          name: this.form.name,
          description: this.form.description || null,
          imageLink: this.form.imageLink || null,
          rating: this.form.rating || null
        };

        // If we have a file, we'd need multipart - for now, just use imageLink
        // You could extend this to support file uploads via FormData

        const res = await fetch(`${this.backendBase}/places`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.authToken}`
          },
          body: JSON.stringify(placeData)
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Fehler: HTTP ${res.status}`);
        }

        const newPlace = await res.json();
        this.success = "Ort erfolgreich erstellt!";
        this.$emit("created", newPlace);

        // Close after short delay
        setTimeout(() => {
          this.$emit("close");
        }, 1000);

      } catch (err) {
        console.error(err);
        this.error = err.message || "Fehler beim Erstellen";
      } finally {
        this.submitting = false;
      }
    }
  }
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
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  background: var(--surface-strong);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 24px;
  border: 1px solid var(--border-glass);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 32px 64px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-glass);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: var(--surface-glass);
  color: var(--muted);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--surface-strong);
  color: var(--text);
}

/* Form */
.create-form {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Image Upload */
.image-upload {
  width: 100%;
  height: 180px;
  border-radius: 16px;
  border: 2px dashed var(--border-glass);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-upload:hover {
  border-color: var(--accent);
  background: var(--surface-glass);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--muted);
  font-size: 0.95rem;
}

.upload-icon {
  font-size: 32px;
}

/* Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

input, textarea {
  padding: 12px 16px;
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  font-size: 0.95rem;
  color: var(--text);
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

input:focus, textarea:focus {
  background: var(--surface-strong);
  border-color: var(--accent);
}

input::placeholder, textarea::placeholder {
  color: var(--muted);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

/* Rating */
.rating-input {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 1.6rem;
  color: var(--border-glass);
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.star-btn:hover,
.star-btn.active {
  color: #fbbf24;
  transform: scale(1.1);
}

.rating-value {
  margin-left: 12px;
  font-size: 0.9rem;
  color: var(--muted);
  font-weight: 600;
}

/* Messages */
.msg {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  text-align: center;
}

.msg.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.msg.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

/* Submit Button */
.submit-btn {
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px var(--glow);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--glow);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-backdrop {
    padding: 10px;
    align-items: flex-end;
  }

  .modal-content {
    max-height: 90vh;
    border-radius: 24px 24px 0 0;
  }

  .image-upload {
    height: 140px;
  }
}
</style>

