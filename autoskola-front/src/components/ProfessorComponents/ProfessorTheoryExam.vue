<template>
  <div class="exam-section">
    <h1 class="page-title">Theory Exam Registration</h1>

    <div class="eligibility-card" :class="eligibility.canRegister ? 'eligible' : 'not-eligible'">
      <div class="elig-icon">{{ eligibility.canRegister ? '✓' : '⚠' }}</div>
      <div class="elig-info">
        <div class="elig-title">
          {{ eligibility.canRegister ? 'Exam can be organized' : 'Not enough candidates yet' }}
        </div>
        <div class="elig-sub">
          {{ eligibility.totalEligible }} / {{ eligibility.minimumRequired }} candidates ready
        </div>
      </div>
      <div class="elig-bar-wrap">
        <div class="elig-bar">
          <div class="elig-fill" :style="{ width: Math.min((eligibility.totalEligible / eligibility.minimumRequired) * 100, 100) + '%',
            background: eligibility.canRegister ? '#4CAF50' : '#be8fe9' }"></div>
        </div>
      </div>
    </div>

    <div class="section-block">
      <h2 class="section-title">My Submitted Exam Requests</h2>

      <div v-if="myExams.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>You have not submitted any exam requests yet.</p>
      </div>

      <div v-else class="exams-grid">
        <div class="exam-card" v-for="exam in myExams" :key="exam.id">
          <div class="exam-card-top">
            <span class="status-badge" :class="statusClass(exam.status)">{{ exam.status }}</span>
            <span class="exam-id">#{{ exam.id }}</span>
          </div>
          <div class="exam-detail-row">
            <span class="exam-label">Registered</span>
            <span>{{ formatDate(exam.registrationDate) }}</span>
          </div>
          <div class="exam-detail-row">
            <span class="exam-label">Exam Date</span>
            <span>{{ exam.examDate ? formatDateSimple(exam.examDate) : 'Not set yet' }}</span>
          </div>
          <div class="exam-detail-row">
            <span class="exam-label">Candidates</span>
            <span>{{ exam.totalCandidates }}</span>
          </div>
          <button
            v-if="exam.status === 'REQUESTED'"
            class="cancel-btn"
            @click="cancelExam(exam.id)"
          >Cancel</button>
        </div>
      </div>
    </div>

    <div class="section-block" v-if="eligibility.canRegister">
      <h2 class="section-title">Register New Exam Group</h2>
      <p class="section-desc">Select at least 20 candidates with PENDING status to register them for the theory exam.</p>

      <div class="search-row">
        <input v-model="search" class="search-input" placeholder="Search by name..." />
        <button class="sel-all-btn" @click="selectAll">Select All</button>
        <button class="sel-all-btn deselect" @click="deselectAll">Deselect All</button>
      </div>

      <div class="candidates-list">
        <div
          v-for="candidate in filteredCandidates"
          :key="candidate.id"
          class="candidate-row"
          :class="{ selected: selectedIds.includes(candidate.id) }"
          @click="toggleCandidate(candidate.id)"
        >
          <div class="candidate-info">
            <span class="candidate-name">{{ candidate.name }} {{ candidate.lastname }}</span>
            <span class="candidate-cat">{{ candidate.category }}</span>
          </div>
          <span class="candidate-lessons">{{ candidate.completedLessons }} / 40 lessons</span>
          <div class="check-box" :class="{ checked: selectedIds.includes(candidate.id) }">
            <span v-if="selectedIds.includes(candidate.id)">✓</span>
          </div>
        </div>
      </div>

      <div class="register-footer">
        <span class="selected-count">{{ selectedIds.length }} candidates selected
          <span v-if="selectedIds.length < 20" class="need-more">(need {{ 20 - selectedIds.length }} more)</span>
        </span>
        <button
          class="register-btn"
          :disabled="selectedIds.length < 20 || submitting"
          @click="registerExam"
        >
          <span v-if="submitting" class="spinner"></span>
          <span v-else>Submit Exam Request</span>
        </button>
      </div>

      <div v-if="successMsg" class="success-msg">✓ {{ successMsg }}</div>
      <div v-if="errorMsg" class="error-msg">⚠ {{ errorMsg }}</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      eligibility: { canRegister: false, totalEligible: 0, minimumRequired: 20 },
      candidates: [],
      myExams: [],
      selectedIds: [],
      search: '',
      submitting: false,
      successMsg: null,
      errorMsg: null,
    };
  },

  computed: {
    filteredCandidates() {
      if (!this.search) return this.candidates;
      const q = this.search.toLowerCase();
      return this.candidates.filter(c =>
        (c.name + ' ' + c.lastname).toLowerCase().includes(q)
      );
    }
  },

  mounted() {
    this.fetchEligibility();
    this.fetchCandidates();
    this.fetchMyExams();
  },

  methods: {
    async fetchEligibility() {
      try {
        const res = await axios.get('http://localhost:8080/professor/theory-exam/check-eligibility', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.eligibility = res.data;
      } catch (e) { console.error(e); }
    },

    async fetchCandidates() {
      try {
        const res = await axios.get('http://localhost:8080/professor/theory-exam/eligible-candidates', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.candidates = res.data;
      } catch (e) { console.error(e); }
    },

    async fetchMyExams() {
      try {
        const res = await axios.get('http://localhost:8080/professor/theory-exam/my-exams', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.myExams = res.data;
      } catch (e) { console.error(e); }
    },

    toggleCandidate(id) {
      if (this.selectedIds.includes(id)) {
        this.selectedIds = this.selectedIds.filter(i => i !== id);
      } else {
        this.selectedIds.push(id);
      }
    },

    selectAll() { this.selectedIds = this.candidates.map(c => c.id); },
    deselectAll() { this.selectedIds = []; },

    async registerExam() {
      this.submitting = true;
      this.successMsg = null;
      this.errorMsg = null;
      try {
        await axios.post('http://localhost:8080/professor/theory-exam/register',
          { candidateIds: this.selectedIds },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        this.successMsg = 'Exam request submitted successfully!';
        this.selectedIds = [];
        await this.fetchMyExams();
        await this.fetchEligibility();
      } catch (e) {
        this.errorMsg = e.response?.data?.message || e.response?.data || 'Error submitting request.';
      } finally {
        this.submitting = false;
      }
    },

    async cancelExam(examId) {
      if (!confirm('Are you sure you want to cancel this exam request?')) return;
      try {
        await axios.delete(`http://localhost:8080/professor/theory-exam/${examId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        await this.fetchMyExams();
      } catch (e) {
        alert(e.response?.data?.message || 'Error cancelling exam.');
      }
    },

    statusClass(status) {
      return {
        'REQUESTED': 'status-requested',
        'SCHEDULED': 'status-scheduled',
        'CANCELLED': 'status-cancelled',
        'COMPLETED': 'status-completed',
      }[status] || '';
    },

    formatDate(dt) {
      if (!dt) return '—';
      return new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    formatDateSimple(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  }
};
</script>

<style scoped>
.exam-section {
  padding: 0 40px 40px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  color: #4f364b;
  margin-bottom: 30px;
}

.eligibility-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 28px;
  border-radius: 14px;
  margin-bottom: 35px;
  border: 2px solid;
  flex-wrap: wrap;
}
.eligibility-card.eligible { background: #e8f5e9; border-color: #4CAF50; }
.eligibility-card.not-eligible { background: #f5f0f9; border-color: #be8fe9; }

.elig-icon { font-size: 2rem; }

.elig-title { font-weight: 700; color: #4f364b; font-size: 1.05rem; }
.elig-sub { color: #666; font-size: 0.88rem; margin-top: 2px; }

.elig-bar-wrap { flex: 1; min-width: 150px; }
.elig-bar { height: 8px; background: #e0d6ea; border-radius: 4px; overflow: hidden; }
.elig-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }

/* SECTIONS */
.section-block {
  margin-bottom: 40px;
}
.section-title {
  font-size: 1.4rem;
  color: #4f364b;
  margin-bottom: 8px;
}
.section-desc {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

/* MY EXAMS GRID */
.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.exam-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 2px solid #e9e1f5;
  transition: all 0.3s;
}
.exam-card:hover { transform: translateY(-4px); border-color: #be8fe9; }

.exam-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.exam-id { color: #aaa; font-size: 0.8rem; }

.status-badge {
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.status-requested { background: #fff3e0; color: #e65100; }
.status-scheduled { background: #e8f5e9; color: #2e7d32; }
.status-cancelled { background: #fdecea; color: #c62828; }
.status-completed { background: #e3f2fd; color: #1565c0; }

.exam-detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  color: #555;
  padding: 5px 0;
  border-bottom: 1px solid #f0eaf8;
}
.exam-label { font-weight: 600; color: #4f364b; }

.cancel-btn {
  margin-top: 14px;
  width: 100%;
  padding: 8px;
  border: 2px solid #f44336;
  background: white;
  color: #f44336;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.cancel-btn:hover { background: #fdecea; }

/* SEARCH */
.search-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.search-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 14px;
  border: 2px solid #e9e1f5;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #be8fe9; }

.sel-all-btn {
  padding: 8px 16px;
  border: 2px solid #be8fe9;
  background: white;
  color: #4f364b;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.sel-all-btn:hover { background: #be8fe9; color: white; }
.sel-all-btn.deselect { border-color: #ccc; color: #888; }
.sel-all-btn.deselect:hover { background: #eee; color: #444; }

/* CANDIDATES LIST */
.candidates-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 16px;
}

.candidate-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  background: #f9f5fd;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.candidate-row:hover { border-color: #be8fe9; }
.candidate-row.selected { background: #e8f5e9; border-color: #4CAF50; }

.candidate-info { display: flex; align-items: center; gap: 10px; }
.candidate-name { font-weight: 600; color: #4f364b; font-size: 0.9rem; }
.candidate-cat {
  background: #be8fe9; color: white;
  font-size: 0.7rem; font-weight: 700;
  padding: 2px 8px; border-radius: 10px;
}
.candidate-lessons { font-size: 0.82rem; color: #888; }

.check-box {
  width: 22px; height: 22px;
  border: 2px solid #ccc;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; color: #2e7d32; font-weight: 700;
  transition: all 0.2s;
}
.check-box.checked { background: #4CAF50; border-color: #4CAF50; color: white; }

/* REGISTER FOOTER */
.register-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.selected-count { font-size: 0.9rem; color: #666; font-weight: 600; }
.need-more { color: #be8fe9; margin-left: 6px; }

.register-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white; border: none; border-radius: 10px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(156,39,176,0.3);
  display: flex; align-items: center; gap: 8px;
}
.register-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(156,39,176,0.4); }
.register-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.8s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 40px; color: #aaa; }
.empty-icon { font-size: 2.5rem; margin-bottom: 10px; }

.success-msg {
  margin-top: 16px; padding: 12px 16px;
  background: #e8f5e9; border: 2px solid #4CAF50;
  border-radius: 10px; color: #2e7d32; font-weight: 600;
}
.error-msg {
  margin-top: 16px; padding: 12px 16px;
  background: #fdecea; border: 2px solid #f44336;
  border-radius: 10px; color: #c62828; font-weight: 600;
}
</style>