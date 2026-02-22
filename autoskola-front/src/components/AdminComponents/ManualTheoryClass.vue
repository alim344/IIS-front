<template>
  <div class="manual-theory-class">
    <div class="header-with-back">
      <button class="back-btn" @click="goBack">← Back</button>
      <h1 class="page-title">Create Theory Class Manually</h1>
    </div>

    <div class="form-container">
      <!-- STEP INDICATOR -->
      <div class="steps-indicator">
        <div :class="['step', { active: currentStep >= 1, completed: currentStep > 1 }]">
          <div class="step-number">1</div>
          <span>Date & Time</span>
        </div>
        <div class="step-line" :class="{ completed: currentStep > 1 }"></div>
        <div :class="['step', { active: currentStep >= 2, completed: currentStep > 2 }]">
          <div class="step-number">2</div>
          <span>Lesson & Professor</span>
        </div>
        <div class="step-line" :class="{ completed: currentStep > 2 }"></div>
        <div :class="['step', { active: currentStep >= 3, completed: currentStep > 3 }]">
          <div class="step-number">3</div>
          <span>Select Students</span>
        </div>
      </div>

      <!-- STEP 1: DATE & TIME SLOT -->
      <div v-if="currentStep === 1" class="step-content">
        <h2>Select Date and Time Slot</h2>
        
        <div class="form-group">
          <label>Date</label>
          <input 
            type="date" 
            v-model="form.date" 
            :min="minDate"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Time Slot</label>
          <div class="slot-selector">
            <div 
              v-for="slot in slots" 
              :key="slot.value"
              :class="['slot-card', { selected: form.slot === slot.value }]"
              @click="form.slot = slot.value"
            >
              <div class="slot-icon">{{ slot.icon }}</div>
              <div class="slot-name">{{ slot.name }}</div>
              <div class="slot-time">{{ slot.time }}</div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="next-btn" @click="nextStep" :disabled="!form.date || !form.slot">
            Next →
          </button>
        </div>
      </div>

      <!-- STEP 2: LESSON & PROFESSOR -->
      <div v-if="currentStep === 2" class="step-content">
        <h2>Select Lesson and Professor</h2>

        <div class="form-group">
          <label>Lesson</label>
          <select v-model="form.lessonId" class="form-input" @change="loadAvailableCandidates">
            <option :value="null">Select a lesson</option>
            <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
              Lesson {{ lesson.orderNumber }}: {{ lesson.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Professor</label>
          <select v-model="form.professorId" class="form-input">
            <option :value="null">Select a professor</option>
            <option v-for="prof in professors" :key="prof.id" :value="prof.id">
              {{ prof.name }} {{ prof.lastname }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button class="back-step-btn" @click="prevStep">← Back</button>
          <button class="next-btn" @click="nextStep" :disabled="!form.lessonId || !form.professorId">
            Next →
          </button>
        </div>
      </div>

      <!-- STEP 3: SELECT STUDENTS -->
      <div v-if="currentStep === 3" class="step-content">
        <h2>Select Students (Max 20)</h2>

        <div v-if="loadingCandidates" class="loading-state">
          <div class="spinner"></div>
          <p>Loading available candidates...</p>
        </div>

        <div v-else>
          <div class="selection-summary">
            <span class="selected-count">
              {{ form.candidateIds.length }} / 20 students selected
            </span>
            <button 
              v-if="form.candidateIds.length > 0" 
              class="clear-selection-btn" 
              @click="form.candidateIds = []"
            >
              Clear All
            </button>
          </div>

          <div v-if="availableCandidates.length === 0" class="empty-state">
            <p>No candidates available for this time slot and lesson.</p>
          </div>

          <div v-else class="candidates-grid">
            <div 
              v-for="candidate in availableCandidates" 
              :key="candidate.id"
              :class="['candidate-card', { selected: form.candidateIds.includes(candidate.id) }]"
              @click="toggleCandidate(candidate.id)"
            >
              <div class="candidate-header">
                <div class="candidate-name">{{ candidate.name }} {{ candidate.lastname }}</div>
                <div class="candidate-category">{{ candidate.category }}</div>
              </div>
              <div class="candidate-info">
                <span class="info-label">Lessons Completed:</span>
                <span class="info-value">{{ candidate.attendedLessons }}</span>
              </div>
              <div v-if="candidate.hasPreference" class="candidate-preference">
                ⏰ {{ formatTime(candidate.preferenceStart) }} - {{ formatTime(candidate.preferenceEnd) }}
              </div>
              <div v-else class="candidate-preference">
                📅 No time preference
              </div>
              <div v-if="form.candidateIds.includes(candidate.id)" class="selected-checkmark">✓</div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="back-step-btn" @click="prevStep">← Back</button>
          <button 
            class="submit-btn" 
            @click="createClass" 
            :disabled="form.candidateIds.length === 0 || submitting"
          >
            <span v-if="submitting">Creating...</span>
            <span v-else>✓ Create Class</span>
          </button>
        </div>
      </div>

      <!-- ERROR MESSAGE -->
      <div v-if="errorMessage" class="error-banner">
        ⚠ {{ errorMessage }}
      </div>
    </div>

    <!-- SUCCESS MODAL -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal success-modal" @click.stop>
        <div class="success-icon">✓</div>
        <h2>Class Created Successfully!</h2>
        <p>The theory class has been added to the schedule.</p>
        <button class="ok-btn" @click="closeSuccessModal">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      currentStep: 1,
      form: {
        date: null,
        slot: null,
        lessonId: null,
        professorId: null,
        candidateIds: []
      },
      slots: [
        { value: 'MORNING', name: 'Morning', time: '08:00 - 10:00', icon: '🌅' },
        { value: 'AFTERNOON', name: 'Afternoon', time: '14:00 - 16:00', icon: '☀️' },
        { value: 'EVENING', name: 'Evening', time: '18:00 - 20:00', icon: '🌙' }
      ],
      lessons: [],
      professors: [],
      availableCandidates: [],
      loadingCandidates: false,
      submitting: false,
      errorMessage: null,
      showSuccessModal: false
    };
  },

  computed: {
    minDate() {
      return new Date().toISOString().split('T')[0];
    }
  },

  mounted() {
    this.loadLessons();
    this.loadProfessors();
  },

  methods: {
    async loadLessons() {
      try {
        const response = await axios.get('http://localhost:8080/theoryclass/theory-lessons', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        this.lessons = response.data;
      } catch (error) {
        console.error('Error loading lessons:', error);
        this.errorMessage = 'Failed to load lessons';
      }
    },

    async loadProfessors() {
      try {
        const response = await axios.get('http://localhost:8080/professors/all', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        this.professors = response.data;
      } catch (error) {
        console.error('Error loading professors:', error);
        this.errorMessage = 'Failed to load professors';
      }
    },

    async loadAvailableCandidates() {
      if (!this.form.slot) return;

      this.loadingCandidates = true;
      this.errorMessage = null;

      try {
        const response = await axios.get('http://localhost:8080/theoryclass/candidates/available', {
          params: { slot: this.form.slot },
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        this.availableCandidates = response.data;
      } catch (error) {
        console.error('Error loading candidates:', error);
        this.errorMessage = 'Failed to load available candidates';
      } finally {
        this.loadingCandidates = false;
      }
    },

    toggleCandidate(candidateId) {
      const index = this.form.candidateIds.indexOf(candidateId);
      if (index > -1) {
        this.form.candidateIds.splice(index, 1);
      } else {
        if (this.form.candidateIds.length >= 20) {
          this.errorMessage = 'Maximum 20 students per class';
          return;
        }
        this.form.candidateIds.push(candidateId);
        this.errorMessage = null;
      }
    },

    nextStep() {
      if (this.currentStep === 2) {
        this.loadAvailableCandidates();
      }
      this.currentStep++;
    },

    prevStep() {
      this.currentStep--;
      this.errorMessage = null;
    },

    async createClass() {
      this.submitting = true;
      this.errorMessage = null;

      try {
        await axios.post(
          'http://localhost:8080/theoryclass/manual',
          this.form,
          { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
        );

        this.showSuccessModal = true;
      } catch (error) {
        console.error('Error creating class:', error);
        this.errorMessage = error.response?.data?.error || 'Failed to create class. Please try again.';
      } finally {
        this.submitting = false;
      }
    },

    closeSuccessModal() {
      this.showSuccessModal = false;
      this.$router.push('/adminHome/theory-schedule');
    },

    goBack() {
      this.$router.push('/adminHome/theory-schedule');
    },

    formatTime(time) {
      if (!time) return '';
      return time.substring(0, 5);
    }
  }
};
</script>

<style scoped>
.manual-theory-class {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-with-back {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.back-btn {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #5a6268;
  transform: translateX(-4px);
}

.page-title {
  font-size: 2rem;
  color: #4f364b;
  margin: 0;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

/* STEPS INDICATOR */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 50px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  opacity: 0.4;
  transition: all 0.3s;
}

.step.active {
  opacity: 1;
}

.step.completed {
  opacity: 1;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e9e1f5;
  color: #4f364b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  transition: all 0.3s;
}

.step.active .step-number {
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white;
  transform: scale(1.1);
}

.step.completed .step-number {
  background: #4CAF50;
  color: white;
}

.step span {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4f364b;
}

.step-line {
  width: 100px;
  height: 3px;
  background: #e9e1f5;
  margin: 0 20px;
  transition: all 0.3s;
}

.step-line.completed {
  background: #4CAF50;
}

/* STEP CONTENT */
.step-content {
  max-width: 800px;
  margin: 0 auto;
}

.step-content h2 {
  color: #4f364b;
  font-size: 1.5rem;
  margin-bottom: 30px;
  text-align: center;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #4f364b;
  margin-bottom: 10px;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9e1f5;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #be8fe9;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.1);
}

/* SLOT SELECTOR */
.slot-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.slot-card {
  background: #f8f4fc;
  border: 3px solid #e9e1f5;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.slot-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.slot-card.selected {
  background: linear-gradient(135deg, #f5f0f9, #fef9fb);
  border-color: #be8fe9;
  box-shadow: 0 8px 25px rgba(190, 143, 233, 0.3);
}

.slot-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.slot-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #4f364b;
  margin-bottom: 5px;
}

.slot-time {
  font-size: 0.9rem;
  color: #888;
}

/* CANDIDATES GRID */
.selection-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: #f8f4fc;
  border-radius: 10px;
}

.selected-count {
  font-weight: 700;
  color: #4f364b;
  font-size: 1.1rem;
}

.clear-selection-btn {
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.clear-selection-btn:hover {
  background: #d32f2f;
}

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
}

.candidate-card {
  background: white;
  border: 2px solid #e9e1f5;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.candidate-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

.candidate-card.selected {
  border-color: #4CAF50;
  background: #e8f5e9;
}

.candidate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.candidate-name {
  font-weight: 700;
  color: #4f364b;
}

.candidate-category {
  background: #be8fe9;
  color: white;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.candidate-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.info-label {
  color: #888;
}

.info-value {
  font-weight: 600;
  color: #4f364b;
}

.candidate-preference {
  font-size: 0.8rem;
  color: #888;
  margin-top: 5px;
}

.selected-checkmark {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
}

/* FORM ACTIONS */
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 40px;
}

.back-step-btn, .next-btn, .submit-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.back-step-btn {
  background: #6c757d;
  color: white;
}

.back-step-btn:hover {
  background: #5a6268;
}

.next-btn {
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white;
  margin-left: auto;
}

.next-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4);
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn {
  background: linear-gradient(135deg, #4CAF50, #388e3c);
  color: white;
  margin-left: auto;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* LOADING & EMPTY STATES */
.loading-state {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e9e1f5;
  border-top-color: #be8fe9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 60px;
  color: #888;
  font-size: 1.1rem;
}

/* ERROR BANNER */
.error-banner {
  background: #ffebee;
  border: 2px solid #f44336;
  border-radius: 10px;
  padding: 15px 20px;
  margin-top: 20px;
  color: #c62828;
  font-weight: 600;
  text-align: center;
}

/* SUCCESS MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto 20px;
}

.success-modal h2 {
  color: #4f364b;
  margin: 0 0 15px 0;
}

.success-modal p {
  color: #888;
  margin-bottom: 30px;
}

.ok-btn {
  padding: 12px 40px;
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.ok-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4);
}
</style>