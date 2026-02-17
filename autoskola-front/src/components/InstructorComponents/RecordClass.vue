<template>
  <div class="record-overlay" @click.self="$emit('close')">
    <div class="record-modal">

      <div class="modal-stripe"></div>

      <div class="modal-inner">
        <header class="modal-head">
          <div class="head-left">
            <span class="pill">Session Report</span>
            <h2>Record Class</h2>
            <p class="subtitle" v-if="event">
              {{ event.name }} {{ event.lastname }} &mdash; {{ formatEventTime(event) }}
            </p>
          </div>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </header>

        <form class="record-form" @submit.prevent="submitRecord">

          <div class="field-group">
            <label class="field-label">Mileage (km)</label>
            <div class="input-wrap">
              <span class="input-icon">🚗</span>
              <input
                v-model.number="form.mileage"
                type="number"
                min="0"
                placeholder="e.g. 25"
                class="field-input"
                required
              />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Notes</label>
            <textarea
              v-model="form.notes"
              class="field-textarea"
              placeholder="Any observations, incidents, or feedback for the student..."
              rows="5"
            ></textarea>
          </div>

          <div v-if="errorMsg" class="error-banner">⚠ {{ errorMsg }}</div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span v-else>Save Record</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RecordClass',
  emits: ['close', 'recorded'],

  props: {
    event: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      form: {
        mileage: null,
        notes: ''
      },
      loading: false,
      errorMsg: null
    };
  },

  computed: {},

  methods: {
    formatEventTime(event) {
      const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
      const start = new Date(event.startTime).toLocaleTimeString([], opts);
      const end = new Date(event.endTime).toLocaleTimeString([], opts);
      return `${start} – ${end}`;
    },

    async submitRecord() {
        const token = localStorage.getItem('token');
        console.log('Token:', token);              // is it null?
        console.log('Event ID:', this.event.id);
      this.errorMsg = null;
      this.loading = true;

      try {
        const token = localStorage.getItem('token');
        const payload = {
          notes: this.form.notes,
          mileage: this.form.mileage
        };

        const response = await axios.put(
          `http://localhost:8080/practicalclass/${this.event.id}/record`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.$emit('recorded', response.data);
        this.$emit('close');
      } catch (err) {
        console.error('Failed to record class:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        } else {
          this.errorMsg = 'Failed to save record. Please try again.';
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.record-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 16, 35, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.record-modal {
  width: 92%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(58, 16, 75, 0.18);
  position: relative;
  animation: slideUp 0.28s cubic-bezier(.22,.68,0,1.2);
}

@keyframes slideUp {
  from { transform: translateY(28px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.modal-stripe {
  height: 5px;
  background: linear-gradient(90deg, #be8fe9, #9b5ec7, #d4a8f5);
  border-radius: 18px 18px 0 0;
}

.modal-inner {
  padding: 28px 32px 32px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.pill {
  display: inline-block;
  background: #f3e8fd;
  color: #7c3aad;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 6px;
}

.modal-head h2 {
  margin: 0 0 4px;
  font-size: 1.5rem;
  color: #2c1f2d;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: #9b7aab;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #b09abf;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}
.close-btn:hover { background: #f3e8fd; color: #7c3aad; }

.record-form { display: flex; flex-direction: column; gap: 22px; }

.field-group { display: flex; flex-direction: column; gap: 7px; }

.field-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #4f364b;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.input-wrap {
  display: flex;
  align-items: center;
  background: #faf7fd;
  border: 1.5px solid #e4d4f4;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.input-wrap:focus-within { border-color: #be8fe9; }

.input-icon {
  padding: 0 12px;
  font-size: 1rem;
  color: #be8fe9;
  user-select: none;
}

.field-input {
  flex: 1;
  padding: 11px 12px 11px 0;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #2c1f2d;
  outline: none;
}

.field-textarea {
  background: #faf7fd;
  border: 1.5px solid #e4d4f4;
  border-radius: 10px;
  padding: 12px;
  font-size: 0.93rem;
  color: #2c1f2d;
  resize: vertical;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}
.field-textarea:focus { border-color: #be8fe9; }

.error-banner {
  background: #fff0f0;
  border: 1.5px solid #fca5a5;
  color: #b91c1c;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88rem;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn-secondary {
  padding: 10px 22px;
  border-radius: 8px;
  border: 1.5px solid #e4d4f4;
  background: white;
  color: #6b5b7a;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover { background: #faf7fd; border-color: #be8fe9; }

.btn-primary {
  padding: 10px 28px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #c084fc, #9b5ec7);
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 130px;
  justify-content: center;
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #a855f7, #7c3aad);
  box-shadow: 0 4px 14px rgba(156, 94, 199, 0.4);
  transform: translateY(-1px);
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
