<template>
  <div class="assignments-container">
    <h1 class="page-title">Candidate Assignment</h1>

    <div v-if="loading" class="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="assignment-content">

      <div class="candidates-panel">
        <div class="panel-header">
          <h2>Pending Candidates</h2>
          <span class="count-badge">{{ pendingCandidates.length }}</span>
        </div>

        <div v-if="pendingCandidates.length === 0" class="empty-state">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.5;">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
          </svg>
          <p>No candidates waiting for assignment</p>
          <p class="hint">Candidates who completed theory will appear here</p>
        </div>

        <div v-else class="candidates-list">
          <div
              v-for="candidate in pendingCandidates"
              :key="candidate.candidateId"
              class="candidate-item"
              :class="{ 'selected': selectedCandidates.some(c => c.candidateId === candidate.candidateId) }"
              @click="selectCandidate(candidate)"
          >
            <div class="candidate-info">
              <strong>{{ candidate.firstName }} {{ candidate.lastName }}</strong>
            </div>
            <div class="candidate-status">
              <span class="status-pending">Pending</span>
            </div>
          </div>
        </div>
      </div>

      <div class="assignment-panel">
        <div class="panel-header">
          <h2>Instructors Workload</h2>
          <button
              v-if="!optimalProposalVisible && selectedCandidates.length > 0"
              class="action-btn propose-btn"
              @click="proposeAssignment"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
            </svg>
            Propose Optimal Assignment
          </button>
        </div>

        <div v-if="showError" class="error-message">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <h4>Assignment Error</h4>
            <p>{{ assignmentError }}</p>
          </div>
          <button class="error-close" @click="showError = false">×</button>
        </div>

        <div class="instructors-table-container">
          <table class="instructors-table">
            <thead>
            <tr>
              <th>Instructor</th>
              <th>Current Students</th>
              <th>Max Capacity</th>
              <th>Workload</th>
              <th v-if="optimalProposalVisible">Assigned Candidate</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="instr in instructors" :key="instr.instructorId">
              <td>{{ instr.name }} {{ instr.lastName }}</td>
              <td>{{ instr.currentStudentCount }}</td>
              <td>{{ instr.maxCapacity }}</td>
              <td>
                <div class="workload-bar">
                  <div
                      class="workload-fill"
                      :style="{ width: instr.workloadPercentage + '%' }"
                      :class="workloadClass(instr.workloadPercentage)"
                  ></div>
                  <span>{{ instr.workloadPercentage.toFixed(0) }}%</span>
                </div>
              </td>
              <td v-if="optimalProposalVisible">
                <div v-if="getCandidateForInstructor(instr.instructorId)" class="assigned-candidate">
                  <span class="candidate-badge">
                    {{ getCandidateForInstructor(instr.instructorId) }}
                  </span>
                </div>
                <span v-else class="no-assignment">—</span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="optimalProposalVisible" class="optimal-actions">
          <button class="action-btn cancel" @click="cancelOptimalProposal">Cancel Optimal</button>
          <button class="action-btn save" @click="saveOptimalAssignment" :disabled="saving">
            {{ saving ? 'Saving...' : 'Confirm Optimal Assignment' }}
          </button>
        </div>

        <div v-if="selectedCandidates.length > 0" class="manual-section">
          <div class="section-header">
            <h3>Manual Assignment</h3>
          </div>

          <div class="manual-list">
            <div
                v-for="candidate in selectedCandidates"
                :key="candidate.candidateId"
                class="manual-item"
            >
              <div class="candidate-info-row">
                <span class="candidate-name">{{ candidate.firstName }} {{ candidate.lastName }}</span>
              </div>

              <div class="assignment-row">
                <span class="arrow">→</span>

                <select
                    v-model="manualAssignments[candidate.candidateId]"
                    class="instructor-select-dropdown"
                >
                  <option
                      v-for="instr in instructors"
                      :key="instr.instructorId"
                      :value="instr.instructorId"
                  >
                    {{ instr.name }} {{ instr.lastName }} ({{ instr.currentStudentCount }} students)
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="proposal-actions">
            <button class="action-btn cancel" @click="resetManual">Clear</button>
            <button class="action-btn save" @click="saveManualAssignment" :disabled="saving">
              {{ saving ? 'Saving...' : 'Confirm Manual Assignment' }}
            </button>
          </div>
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
      pendingCandidates: [],
      instructors: [],
      selectedCandidates: [],
      selectedCandidate: null,
      proposedAssignments: new Map(),
      manualAssignments: {},
      optimalProposalVisible: false,
      loading: true,
      saving: false,
      error: null,
      assignmentError: null,
      showError: false
    }
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      try {
        this.loading = true;

        const candidatesRes = await axios.get('http://localhost:8080/assignments/pending', {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        this.pendingCandidates = candidatesRes.data;

        const instructorsRes = await axios.get('http://localhost:8080/assignments/instructor-workload', {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        this.instructors = instructorsRes.data;

      } catch (error) {
        console.error('Error fetching data:', error);
        this.error = 'Failed to load data.';

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },

    selectCandidate(candidate) {
      this.selectedCandidate = candidate;

      const index = this.selectedCandidates.findIndex(c => c.candidateId === candidate.candidateId);
      if (index === -1) {
        this.selectedCandidates.push(candidate);
      } else {
        this.selectedCandidates.splice(index, 1);
      }
    },

    async proposeAssignment() {
      if (this.selectedCandidates.length === 0) return;

      try {
        const candidateIds = this.selectedCandidates.map(c => c.candidateId);

        const response = await axios.post(
            'http://localhost:8080/assignments/propose',
            candidateIds,
            { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );

        this.proposedAssignments = new Map(Object.entries(response.data));
        this.optimalProposalVisible = true;

      } catch (error) {
        console.error('Error proposing assignment:', error);
        alert('Failed to propose assignment.');
      }
    },

    cancelOptimalProposal() {
      this.optimalProposalVisible = false;
      this.proposedAssignments.clear();
    },

    getCandidateForInstructor(instructorId) {
      if (!this.proposedAssignments || this.proposedAssignments.size === 0) return null;

      for (let [candidateId, instId] of this.proposedAssignments.entries()) {
        if (instId == instructorId || instId === Number(instructorId)) {
          return this.getCandidateName(candidateId);
        }
      }
      return null;
    },

    async saveOptimalAssignment() {
      try {
        this.saving = true;
        this.showError = false;

        const candidateIds = Array.from(this.proposedAssignments.keys()).map(id => parseInt(id));

        const requestData = {
          candidateIds: candidateIds,
          algorithm: 'OPTIMAL',
          manualAssignments: {},
          confirmAssignment: true
        };

        await axios.post(
            'http://localhost:8080/assignments/save',
            requestData,
            { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );

        this.cancelOptimalProposal();
        this.selectedCandidates = [];
        this.selectedCandidate = null;
        await this.fetchData();

      } catch (error) {
        console.error('Error saving optimal assignment:', error);

        this.assignmentError = error.response?.data || 'Failed to save optimal assignment.';
        this.showError = true;

      } finally {
        this.saving = false;
      }
    },

    resetManual() {
      this.manualAssignments = {};
      this.selectedCandidates = [];
      this.selectedCandidate = null;
    },

    async saveManualAssignment() {
      try {
        this.saving = true;
        this.showError = false;

        const candidateIds = Object.keys(this.manualAssignments).map(id => parseInt(id));

        const requestData = {
          candidateIds: candidateIds,
          algorithm: 'MANUAL',
          manualAssignments: this.manualAssignments,
          confirmAssignment: true
        };

        await axios.post(
            'http://localhost:8080/assignments/save',
            requestData,
            { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );

        this.resetManual();
        this.cancelOptimalProposal();
        await this.fetchData();

      } catch (error) {
        console.error('Error saving manual assignment:', error);

        this.assignmentError = error.response?.data || 'Failed to save manual assignment.';
        this.showError = true;

      } finally {
        this.saving = false;
      }
    },

    getCandidateName(candidateId) {
      if (!candidateId) return 'Unknown';

      const candidate = this.pendingCandidates.find(c =>
          c.candidateId == candidateId || c.candidateId === Number(candidateId)
      );

      return candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown';
    },

    getInstructorName(instructorId) {
      if (!instructorId) return 'Unknown';

      const instructor = this.instructors.find(i =>
          i.instructorId == instructorId || i.instructorId === Number(instructorId)
      );

      return instructor ? `${instructor.name} ${instructor.lastName}` : 'Unknown';
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
.assignments-container {
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

.assignment-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.candidates-panel {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 2px solid #e9e1f5;
  padding-bottom: 15px;
}

.panel-header h2 {
  color: #4f364b;
  font-size: 1.5rem;
  margin: 0;
}

.count-badge {
  background: #be8fe9;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8a7a99;
  background: #f8f4fc;
  border-radius: 12px;
}

.empty-state p {
  margin: 10px 0 5px;
  font-size: 1.1rem;
}

.empty-state .hint {
  font-size: 0.9rem;
  opacity: 0.7;
}

.candidates-list {
  max-height: 500px;
  overflow-y: auto;
}

.candidate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background: #f8f4fc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.candidate-item:hover {
  background: #f0e8fa;
  transform: translateX(3px);
  border-bottom: none;
}

.candidate-item.selected {
  background: #e9d9ff;
  border-color: #be8fe9;
  box-shadow: 0 2px 8px rgba(190, 143, 233, 0.2);
}

.candidate-info {
  display: flex;
  flex-direction: column;
}

.status-pending {
  font-size: 0.8rem;
  padding: 4px 8px;
  background: #fff3cd;
  color: #856404;
  border-radius: 12px;
  font-weight: 600;
}

.assignment-panel {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.instructors-table-container {
  overflow-x: auto;
  margin: 20px 0;
}

.instructors-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.instructors-table th {
  background: linear-gradient(135deg, #4f364b, #6b4a67);
  color: white;
  padding: 12px;
  text-align: left;
}

.instructors-table td {
  padding: 12px;
  border-bottom: 1px solid #e9e1f5;
  color: #2c1f2d;
}

.instructors-table tr:hover {
  background: #f8f4fc;
}

.workload-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 120px;
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

.optimal-section,
.manual-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e9e1f5;
}

.section-header h3 {
  color: #4f364b;
  margin-bottom: 15px;
}

.propose-button-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.propose-btn {
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
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

.proposal-list,
.manual-list {
  background: #f8f4fc;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
}

.proposal-item,
.manual-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  border-bottom: 1px solid #e9e1f5;
}

.proposal-item:last-child,
.manual-item:last-child {
  border-bottom: none;
}

.candidate-info-row {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.candidate-name {
  font-weight: 600;
  color: #2c1f2d;
}

.assignment-row {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.arrow {
  color: #be8fe9;
  font-size: 1.2rem;
  font-weight: 600;
}

.instructor-name {
  color: #6b4a67;
  font-weight: 500;
  min-width: 200px;
}

.instructor-select-dropdown {
  padding: 10px 15px;
  border: 2px solid #be8fe9;
  border-radius: 30px;
  background: white;
  color: #4f364b;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  min-width: 250px;
  transition: all 0.2s ease;
}

.instructor-select-dropdown:hover {
  border-color: #8a5bb0;
  box-shadow: 0 2px 8px rgba(190, 143, 233, 0.2);
}

.instructor-select-dropdown:focus {
  outline: none;
  border-color: #8a5bb0;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.3);
}

.proposal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
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

.action-btn.save:hover {
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

.optimal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin: 20px 0;
  padding-top: 15px;
  border-top: 2px solid #e9e1f5;
}

.assigned-candidate {
  display: flex;
  align-items: center;
  gap: 8px;
}

.candidate-badge {
  background: #e9d9ff;
  color: #4f364b;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.no-assignment {
  color: #ccc;
  font-size: 1.2rem;
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
  .assignment-content {
    grid-template-columns: 1fr;
  }

  .proposal-item,
  .manual-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .assignment-row {
    width: 100%;
    flex-wrap: wrap;
  }

  .instructor-select-dropdown {
    flex: 1;
    min-width: 200px;
  }
}

.error-message {
  background: #fff3f3;
  border: 2px solid #ff6b6b;
  border-radius: 12px;
  padding: 20px 25px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-icon {
  font-size: 2rem;
  line-height: 1;
}

.error-content {
  flex: 1;
}

.error-content h4 {
  color: #721c24;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.error-content p {
  color: #842029;
  font-size: 0.95rem;
  margin: 0;
  white-space: pre-line;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #ff6b6b;
  padding: 0 5px;
  transition: all 0.2s ease;
}

.error-close:hover {
  color: #dc3545;
  transform: scale(1.2);
}
</style>