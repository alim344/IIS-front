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
            <span class="detail-label">Lesson:</span>
            <span class="detail-value">{{ event.lessonName }}</span>
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
            <span class="detail-label">Enrolled:</span>
            <span class="detail-value">{{ event.enrolledStudents }} / {{ event.capacity }}</span>
          </div>
        </div>

        <div v-if="!classStarted" class="not-started-warning">
          ⏳ This class has not started yet. Attendance can only be submitted once the class begins.
        </div>

        <!-- attendance -->
        <div v-else>
          <div v-if="loadingStudents" class="loading-text">Loading students...</div>

          <div v-else-if="students.length === 0" class="no-students">
            No students enrolled in this class.
          </div>

          <div v-else>
            <div class="attendance-title-row">
              <h4 class="attendance-title">Mark Attendance</h4>
              <div class="select-btns">
                <button class="sel-btn" @click="selectAll">All Present</button>
                <button class="sel-btn deselect" @click="deselectAll">All Absent</button>
              </div>
            </div>

            <div class="students-list">
              <div
                v-for="student in students"
                :key="student.id"
                class="student-row"
                :class="{ present: presentIds.includes(student.id) }"
                @click="togglePresent(student.id)"
              >
                <div class="student-info">
                  <span class="student-name">{{ student.name }} {{ student.lastname }}</span>
                  <span class="student-cat">{{ student.category }}</span>
                </div>
                <span v-if="presentIds.includes(student.id)" class="mark present-mark">✓ Present</span>
                <span v-else class="mark absent-mark">✗ Absent</span>
              </div>
            </div>

            <div class="submit-row">
              <span class="count-label">{{ presentIds.length }} / {{ students.length }} present</span>
              <button class="submit-btn" @click="submitAttendance" :disabled="submitting">
                <span v-if="submitting" class="spinner"></span>
                <span v-else>Submit Attendance</span>
              </button>
            </div>
          </div>

          <div v-if="successMsg" class="success-msg">✓ {{ successMsg }}</div>
          <div v-if="errorMsg" class="error-msg">⚠ {{ errorMsg }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    event: { type: Object, required: true }
  },
  data() {
    return {
      students: [],
      presentIds: [],
      loadingStudents: false,
      submitting: false,
      successMsg: '',
      errorMsg: ''
    };
  },
  computed: {
    classStarted() {
      return new Date(this.event.startTime) <= new Date();
    }
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
    selectAll() {
      this.presentIds = this.students.map(s => s.id);
    },
    deselectAll() {
      this.presentIds = [];
    },
    togglePresent(studentId) {
      if (this.presentIds.includes(studentId)) {
        this.presentIds = this.presentIds.filter(id => id !== studentId);
      } else {
        this.presentIds.push(studentId);
      }
    },
    async loadStudents() {
      this.loadingStudents = true;
      this.errorMsg = '';
      
      try {
        // TODO: Zameni sa pravim API pozivom
        // const response = await fetch(`/api/theory-classes/${this.event.id}/students`);
        // this.students = await response.json();
        
        // Mock podaci za testiranje
        setTimeout(() => {
          this.students = [
            { id: 1, name: 'Ana', lastname: 'Anic', category: 'B' },
            { id: 2, name: 'Milan', lastname: 'Milanovic', category: 'B' },
            { id: 3, name: 'Maja', lastname: 'Majic', category: 'B' },
            { id: 4, name: 'Petar', lastname: 'Petrovic', category: 'A' },
            { id: 5, name: 'Jovana', lastname: 'Jovanovic', category: 'B' }
          ];
          this.loadingStudents = false;
        }, 500);
      } catch (error) {
        this.errorMsg = 'Failed to load students';
        this.loadingStudents = false;
      }
    },
    async submitAttendance() {
      this.submitting = true;
      this.successMsg = '';
      this.errorMsg = '';
      
      try {
        // TODO: Zameni sa pravim API pozivom
        // const response = await fetch(`/api/theory-classes/${this.event.id}/attendance`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ presentIds: this.presentIds })
        // });
        
        // if (!response.ok) throw new Error('Submission failed');
        
        // Mock uspešna prijava
        setTimeout(() => {
          this.successMsg = 'Attendance submitted successfully!';
          this.submitting = false;
          
          // Opciono: zatvori modal nakon 2 sekunde
          setTimeout(() => {
            this.$emit('close');
          }, 2000);
        }, 1000);
      } catch (error) {
        this.errorMsg = error.message || 'Failed to submit attendance';
        this.submitting = false;
      }
    }
  },
  mounted() {
    if (this.classStarted) {
      this.loadStudents();
    }
  },
  watch: {
    'event.startTime': function() {
      if (this.classStarted) {
        this.loadStudents();
      }
    }
  }
};
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

.not-started-warning {
  background-color: #fff3cd;
  color: #856404;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  margin-top: 20px;
}

.loading-text {
  text-align: center;
  color: #666;
  padding: 30px;
}

.no-students {
  text-align: center;
  color: #666;
  padding: 30px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 20px;
}

.attendance-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 15px 0;
}

.attendance-title {
  margin: 0;
  color: #3a283c;
  font-size: 1.1rem;
}

.select-btns {
  display: flex;
  gap: 8px;
}

.sel-btn {
  background: #e3f2fd;
  border: 1px solid #2196F3;
  color: #2196F3;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.sel-btn:hover {
  background: #2196F3;
  color: white;
}

.sel-btn.deselect {
  background: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.sel-btn.deselect:hover {
  background: #f44336;
  color: white;
}

.students-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.student-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.student-row:last-child {
  border-bottom: none;
}

.student-row:hover {
  background-color: #f5f5f5;
}

.student-row.present {
  background-color: #e8f5e8;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 500;
  color: #333;
}

.student-cat {
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
}

.mark {
  font-weight: 600;
  font-size: 0.9rem;
}

.present-mark {
  color: #4caf50;
}

.absent-mark {
  color: #f44336;
}

.submit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.count-label {
  font-size: 0.95rem;
  color: #555;
  font-weight: 500;
}

.submit-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.submit-btn:hover:not(:disabled) {
  background: #1976D2;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-msg {
  margin-top: 16px;
  padding: 12px;
  background: #d4edda;
  color: #155724;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.error-msg {
  margin-top: 16px;
  padding: 12px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}
</style>