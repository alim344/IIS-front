<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Theory Class Details</h3>
        <button class="modal-close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <div class="detail-section">
          <div class="detail-row">
            <span class="detail-label">Professor:</span>
            <span class="detail-value">{{ event.professorName }} {{ event.professorLastName }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Title:</span>
            <span class="detail-value">{{ event.title }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">{{ formatDate(event.startTime) }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">{{ formatTime(event) }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value status-badge" :class="statusClass">
              {{ statusText }}
            </span>
          </div>

          <div class="modal-actions">
            <button 
              class="enroll-btn" 
              :class="{ 'passed-btn': isPassed, 'leave-btn': event.enrolled }"
              @click="handleAction" 
              :disabled="isPassed || (!event.enrolled && !event.available)"
            >
              {{ buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    event: { type: Object, required: true },
    statusText: { type: String, required: true },
    statusClass: { type: String, required: true }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    },
    formatTime(event) {
      const options = { hour: 'numeric', minute: '2-digit', hour12: true };
      const start = new Date(event.startTime).toLocaleTimeString([], options);
      const end = new Date(event.endTime).toLocaleTimeString([], options);
      return `${start} - ${end}`;
    },
    handleAction() {
      if (this.event.enrolled) {
        this.$emit('leave', this.event.id);
      } else {
        this.$emit('enroll', this.event.id);
      }
    },
  },
  computed: {
    isPassed() {
        return new Date() > new Date(this.event.endTime);
    },
    buttonText() {
      if (this.isPassed) return 'CLASS PASSED';
      if (this.event.enrolled) return 'LEAVE CLASS';
      return 'ENROLL IN CLASS';
    }
}
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(2px);
}

.modal-content {
  background: white; border-radius: 12px;
  width: 90%; max-width: 500px; 
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid #e0e0e0;
  background: #f2f6fb; 
  border-radius: 12px 12px 0 0;
}

.modal-header h3 { margin: 0; color: #3a283c; font-size: 1.3rem; }

.modal-close-btn {
  background: none; border: none; font-size: 28px; color: #2196F3; cursor: pointer;
}

.modal-body { padding: 24px; }

.detail-section { display: flex; flex-direction: column; gap: 16px; }

.detail-row { display: flex; align-items: flex-start; }

.detail-label { font-weight: 600; color: #555; width: 100px; flex-shrink: 0; font-size: 0.9rem; }

.detail-value { flex: 1; color: #333; font-size: 0.95rem; }

.status-badge {
  display: inline-block; padding: 4px 12px; border-radius: 20px;
  font-size: 0.8rem; font-weight: 600; text-transform: uppercase;
}


.status-badge.enrolled { background: #cfdbe6; color: #0c247b; }
.status-badge.available { background: #ebedef; color: #818d26; }

.modal-actions {
  display: flex; justify-content: flex-end;
  padding-top: 20px; border-top: 1px solid #f0f0f0; margin-top: 16px;
}

.enroll-btn {
  background-color: #e3f2fd;
  color: #1976d2;
  border: 1px solid #90caf9;
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}



.enroll-btn:disabled {
  background-color: #eee;
  color: #999;
  cursor: not-allowed;
}

.enroll-btn:disabled {
  background-color: #f0f0f0;
  color: #999;
  border-color: #ddd;
  cursor: not-allowed;
  transform: none !important; 
  box-shadow: none !important;
}

.enroll-btn.leave-btn {
  background-color: #fff3e0;
  color: #e65100;
  border-color: #ffb74d;
}

.enroll-btn.leave-btn:hover {
  background-color: #ffe0b2;
}


</style>