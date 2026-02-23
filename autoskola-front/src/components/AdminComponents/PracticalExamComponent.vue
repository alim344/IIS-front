<template>
  <div class="exam-scheduling-container">
    <h1 class="page-title">Practical Exam Scheduling</h1>

    <div v-if="loading" class="loading">Loading data...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="exam-content">

      <div class="left-panel">
        <div class="panel-header">
          <h2>Select Candidate & Time</h2>
        </div>

        <div class="form-section">
          <div class="form-group">
            <label>Candidate:</label>
            <select v-model="selectedCandidateId" class="modern-select" @change="onCandidateChange">
              <option value="" disabled>Select a candidate</option>
              <option v-for="candidate in eligibleCandidates" :key="candidate.id" :value="candidate.id">
                {{ candidate.firstName }} {{ candidate.lastName }} ({{ candidate.jmbg }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Date:</label>
            <input type="date" v-model="examDate" class="modern-input" min="2026-01-01">
          </div>

          <div class="form-group">
            <label>Time:</label>
            <input type="time" v-model="examTime" class="modern-input">
          </div>

          <button
              class="action-btn propose-btn"
              @click="suggestProfessor"
              :disabled="!isFormValid"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
            </svg>
            Suggest Professor
          </button>
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-header">
          <h2>Exam Schedule</h2>
        </div>

        <!-- Informacija o instruktoru (samo za prikaz) -->
        <div v-if="assignedInstructor" class="info-card">
          <div class="info-header">
            <span class="info-icon">👨‍🏫</span>
            <h3>Assigned Instructor</h3>
          </div>
          <div class="info-content">
            <div class="info-name">{{ assignedInstructor.name }} {{ assignedInstructor.lastname }}</div>
            <div class="info-details" v-if="assignedInstructor.vehicle">
              Vehicle: {{ assignedInstructor.vehicle.registrationNumber }}
            </div>
          </div>
        </div>

        <!-- Predlog za profesora -->
        <div v-if="suggestedProfessorId" class="suggestion-card professor-suggestion">
          <div class="suggestion-header">
            <span class="suggestion-icon">👨‍🎓</span>
            <h3>Suggested Professor (Witness)</h3>
            <span class="badge suggested">System Suggestion</span>
          </div>
          <div class="suggestion-content">
            <div class="suggestion-name">{{ suggestedProfessorName }}</div>
            <div class="suggestion-workload">
              Weekly workload: {{ suggestedProfessorWorkload }}%
            </div>
          </div>
        </div>

        <div class="professors-section" v-if="professorsAvailability.length > 0">
          <h3>All Professors (select manually if needed)</h3>
          <div class="professors-table-container">
            <table class="professors-table">
              <thead>
              <tr>
                <th>Professor</th>
                <th>Weekly Exams</th>
                <th>Workload</th>
                <th>Status</th>
                <th>Select</th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="prof in professorsAvailability"
                  :key="prof.professorId"
                  :class="{
                    'suggested': prof.professorId === suggestedProfessorId,
                    'unavailable': !prof.available
                  }"
              >
                <td>{{ prof.name }} {{ prof.lastName }}</td>
                <td>{{ prof.currentExams }} / {{ prof.totalExams }}</td>
                <td>
                  <div class="workload-bar">
                    <div
                        class="workload-fill"
                        :style="{ width: prof.workloadPercentage + '%' }"
                        :class="workloadClass(prof.workloadPercentage)"
                    ></div>
                    <span>{{ prof.workloadPercentage.toFixed(0) }}%</span>
                  </div>
                </td>
                <td>
                  <span class="status-badge" :class="prof.available ? 'available' : 'unavailable'">
                    {{ prof.available ? 'Available' : 'Unavailable' }}
                  </span>
                </td>
                <td>
                  <input
                      type="radio"
                      name="professorSelect"
                      :value="prof.professorId"
                      v-model="selectedProfessorId"
                      :disabled="!prof.available"
                  >
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="selectedProfessorId" class="action-buttons">
          <button class="action-btn cancel" @click="resetSelection">Cancel</button>
          <button
              class="action-btn save"
              @click="scheduleExam"
              :disabled="scheduling"
          >
            {{ scheduling ? 'Scheduling...' : 'Confirm Exam' }}
          </button>
        </div>

        <div v-if="suggestionError" class="error-message">
          <span class="error-icon">⚠️</span>
          <span>{{ suggestionError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      eligibleCandidates: [],
      selectedCandidateId: '',

      examDate: '',
      examTime: '',

      assignedInstructor: null,

      professorsAvailability: [],
      suggestedProfessorId: null,
      suggestedProfessorName: '',
      suggestedProfessorWorkload: 0,
      selectedProfessorId: null,

      loading: true,
      scheduling: false,
      error: null,
      suggestionError: null
    }
  },

  mounted() {
    this.fetchEligibleCandidates();
  },

  computed: {
    isFormValid() {
      return this.selectedCandidateId && this.examDate && this.examTime;
    },

    selectedDateTime() {
      if (!this.examDate || !this.examTime) return null;
      return `${this.examDate}T${this.examTime}:00`;
    }
  },

  methods: {
    async fetchEligibleCandidates() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8080/candidates/eligible-for-exam', {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        this.eligibleCandidates = response.data;
      } catch (error) {
        console.error('Error fetching candidates:', error);
        this.error = 'Failed to load candidates';
      } finally {
        this.loading = false;
      }
    },

    async fetchCandidateInstructor() {
      if (!this.selectedCandidateId) return;

      try {
        const response = await axios.get(`http://localhost:8080/candidates/${this.selectedCandidateId}/instructor`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        this.assignedInstructor = response.data;
      } catch (error) {
        console.error('Error fetching instructor:', error);
        this.assignedInstructor = null;
      }
    },

    onCandidateChange() {
      this.assignedInstructor = null;
      this.suggestedProfessorId = null;
      this.selectedProfessorId = null;
      this.professorsAvailability = [];
      this.fetchCandidateInstructor();
    },

    async suggestProfessor() {
      if (!this.selectedDateTime || !this.selectedCandidateId) return;

      this.suggestionError = null;
      this.suggestedProfessorId = null;

      try {
        const response = await axios.get('http://localhost:8080/practical-exam/suggest-professor', {
          params: { dateTime: this.selectedDateTime },
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });

        const professor = response.data;
        this.suggestedProfessorId = professor.id;
        this.suggestedProfessorName = `${professor.name} ${professor.lastname}`.trim();
        this.selectedProfessorId = professor.id;

        const availabilityResponse = await axios.get('http://localhost:8080/practical-exam/professors-availability', {
          params: { dateTime: this.selectedDateTime },
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });

        this.professorsAvailability = availabilityResponse.data;

        const suggestedProf = this.professorsAvailability.find(p => p.professorId === professor.id);
        if (suggestedProf) {
          this.suggestedProfessorWorkload = suggestedProf.workloadPercentage;
        }

      } catch (error) {
        console.error('Error suggesting professor:', error);
        this.suggestionError = error.response?.data || 'No professors available at this time';
      }
    },

    async scheduleExam() {
      if (!this.selectedDateTime || !this.selectedProfessorId || !this.selectedCandidateId) return;

      this.scheduling = true;

      try {
        const requestData = {
          dateTime: this.selectedDateTime,
          candidateId: parseInt(this.selectedCandidateId),
          suggestedProfessorId: parseInt(this.selectedProfessorId),
          confirmSchedule: true
        };

        await axios.post(
            'http://localhost:8080/practical-exam/schedule',
            requestData,
            { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );

        alert('Exam scheduled successfully!');
        this.resetSelection();

      } catch (error) {
        console.error('Error scheduling exam:', error);
        alert(error.response?.data || 'Failed to schedule exam');
      } finally {
        this.scheduling = false;
      }
    },

    resetSelection() {
      this.selectedCandidateId = '';
      this.examDate = '';
      this.examTime = '';
      this.assignedInstructor = null;
      this.suggestedProfessorId = null;
      this.selectedProfessorId = null;
      this.professorsAvailability = [];
      this.suggestionError = null;
    },

    workloadClass(percentage) {
      if (percentage < 50) return 'low';
      if (percentage < 80) return 'medium';
      return 'high';
    }
  }
}
</script>

<style scoped>
/* Svi stilovi ostaju isti, samo dodajem za info-card */
.exam-scheduling-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #342a3c;
  position: relative;
  width: 100%;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 5px rgba(190, 143, 233, 0.15);
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 130px;
  height: 2px;
  background: #be8fe9;
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(190, 143, 233, 0.5);
  opacity: 0.8;
}

.exam-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.left-panel,
.right-panel {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.panel-header {
  border-bottom: 2px solid #e9e1f5;
  padding-bottom: 15px;
  margin-bottom: 25px;
}

.panel-header h2 {
  color: #4f364b;
  font-size: 1.5rem;
  margin: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #4f364b;
  font-size: 0.95rem;
}

.modern-select,
.modern-input {
  padding: 12px;
  border: 2px solid #e9e1f5;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  color: #2c1f2d;
}

.modern-select:focus,
.modern-input:focus {
  border-color: #be8fe9;
  outline: none;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.1);
}

.propose-btn {
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-top: 10px;
}

.propose-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #a06bc0, #8a5bb0);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
}

.propose-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Info card za instruktora */
.info-card {
  background: #f8f4fc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #4CAF50;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.info-icon {
  font-size: 1.5rem;
}

.info-header h3 {
  color: #4f364b;
  font-size: 1.1rem;
  margin: 0;
}

.info-content {
  padding-left: 35px;
}

.info-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c1f2d;
  margin-bottom: 5px;
}

.info-details {
  font-size: 0.9rem;
  color: #8a7a99;
}

.suggestion-card {
  background: #f8f4fc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid;
}

.professor-suggestion {
  border-left-color: #be8fe9;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.suggestion-icon {
  font-size: 1.5rem;
}

.suggestion-header h3 {
  color: #4f364b;
  font-size: 1.1rem;
  margin: 0;
  flex: 1;
}

.suggestion-content {
  padding-left: 35px;
}

.suggestion-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c1f2d;
  margin-bottom: 5px;
}

.suggestion-workload {
  font-size: 0.9rem;
  color: #8a7a99;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.suggested {
  background: #be8fe9;
  color: white;
}

.professors-section {
  margin-top: 30px;
}

.professors-section h3 {
  color: #4f364b;
  font-size: 1.1rem;
  margin-bottom: 15px;
}

.professors-table-container {
  overflow-x: auto;
}

.professors-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.professors-table th {
  background: linear-gradient(135deg, #4f364b, #6b4a67);
  color: white;
  padding: 12px;
  text-align: left;
}

.professors-table td {
  padding: 12px;
  border-bottom: 1px solid #e9e1f5;
  color: #2c1f2d;
}

.professors-table tr:hover {
  background: #f8f4fc;
}

.professors-table tr.suggested {
  background: rgba(190, 143, 233, 0.1);
  border-left: 4px solid #be8fe9;
}

.professors-table tr.unavailable {
  opacity: 0.6;
  background: #f5f5f5;
}

.workload-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100px;
  height: 20px;
  background: #e9e1f5;
  border-radius: 10px;
  overflow: hidden;
}

.workload-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.workload-fill.low {
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
}

.workload-fill.medium {
  background: linear-gradient(90deg, #FF9800, #FFC107);
}

.workload-fill.high {
  background: linear-gradient(90deg, #f44336, #FF7043);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.available {
  background: #d4edda;
  color: #155724;
}

.status-badge.unavailable {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.action-btn {
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-btn.save {
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
  color: white;
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
}

.action-btn.save:hover:not(:disabled) {
  background: linear-gradient(135deg, #a06bc0, #8a5bb0);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(190, 143, 233, 0.4);
}

.action-btn.cancel {
  background: white;
  color: #4f364b;
  border: 2px solid #e9e1f5;
}

.action-btn.cancel:hover {
  background: #f8f4fc;
  border-color: #be8fe9;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin-top: 20px;
  padding: 15px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading, .error {
  text-align: center;
  padding: 60px;
  font-size: 1.2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error {
  color: #ff6b6b;
}

@media (max-width: 1024px) {
  .exam-content {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>