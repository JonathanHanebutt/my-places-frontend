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
  background: var(--surface, #FFFFFF);
  border-radius: var(--radius-xl, 28px);
  box-shadow: var(--shadow-float);
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
  border-bottom: 1px solid var(--border, rgba(60, 60, 67, 0.12));
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text, #000000);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full, 9999px);
  border: none;
  background: var(--surface-secondary, #F2F2F7);
  color: var(--text-secondary, #3C3C43);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition, 0.2s ease);
}

.close-btn:hover {
  background: var(--border, rgba(60, 60, 67, 0.12));
  color: var(--text, #000000);
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
  border-radius: var(--radius, 16px);
  border: 2px dashed var(--border, rgba(60, 60, 67, 0.12));
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition, 0.2s ease);
}

.image-upload:hover {
  border-color: var(--primary, #34C759);
  background: var(--surface-secondary, #F2F2F7);
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
  color: var(--text-tertiary, #8E8E93);
  font-size: 15px;
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
  font-size: 14px;
  font-weight: 600;
  color: var(--text, #000000);
}

input, textarea {
  padding: 12px 16px;
  background: var(--surface-secondary, #F2F2F7);
  border: 1px solid transparent;
  border-radius: var(--radius, 16px);
  font-size: 15px;
  color: var(--text, #000000);
  outline: none;
  transition: all var(--transition-fast, 0.15s ease);
  font-family: inherit;
}

input:focus, textarea:focus {
  background: var(--surface, #FFFFFF);
  border-color: var(--primary, #34C759);
  box-shadow: var(--focus-ring);
}

input::placeholder, textarea::placeholder {
  color: var(--text-tertiary, #8E8E93);
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
  font-size: 24px;
  color: var(--text-tertiary, #8E8E93);
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
  font-size: 14px;
  color: var(--text-tertiary, #8E8E93);
  font-weight: 600;
}

/* Messages */
.msg {
  margin: 0;
  padding: 12px 16px;
  border-radius: var(--radius, 16px);
  font-size: 14px;
  text-align: center;
}

.msg.error {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: var(--error, #FF3B30);
}

.msg.success {
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.2);
  color: var(--success, #34C759);
}

/* Submit Button */
.submit-btn {
  padding: 14px 24px;
  background: var(--primary, #34C759);
  color: var(--text-on-primary, #FFFFFF);
  border: none;
  border-radius: var(--radius, 16px);
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition, 0.2s ease);
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover, #30B350);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
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
    border-radius: var(--radius-xl, 28px) var(--radius-xl, 28px) 0 0;
  }

  .image-upload {
    height: 140px;
  }
}
</style>

