<template>
  <div class="exam-section">
    <div class="top-bar">
      <button class="back-btn" @click="$router.push('/adminHome')">← Back to Home</button>
      <h1 class="page-title">Theory Exam Management</h1>
    </div>

    <!-- STATS -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-num">{{ exams.length }}</span>
        <span class="stat-lbl">Total Requests</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ exams.filter(e => e.status === 'REQUESTED').length }}</span>
        <span class="stat-lbl">Awaiting Date</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ exams.filter(e => e.status === 'SCHEDULED').length }}</span>
        <span class="stat-lbl">Scheduled</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ exams.filter(e => e.status === 'COMPLETED').length }}</span>
        <span class="stat-lbl">Completed</span>
      </div>
    </div>

    <!-- FILTER -->
    <div class="filter-row">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-btn"
        :class="{ active: activeFilter === f.value }"
        @click="activeFilter = f.value"
      >{{ f.label }}</button>
    </div>

    <!-- EXAMS LIST -->
    <div v-if="loading" class="loading-text">Loading exams...</div>

    <div v-else-if="filteredExams.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>No exam requests found.</p>
    </div>

    <div v-else class="exams-list">
      <div class="exam-card" v-for="exam in filteredExams" :key="exam.id" @click="openExam(exam)">
        <div class="exam-card-left">
          <div class="exam-top-row">
            <span class="status-badge" :class="statusClass(exam.status)">{{ exam.status }}</span>
            <span class="exam-id">#{{ exam.id }}</span>
          </div>
          <div class="exam-prof">Submitted by: <strong>{{ exam.registeredByName }}</strong></div>
          <div class="exam-meta-row">
            <span>📅 Registered: {{ formatDate(exam.registrationDate) }}</span>
            <span>👥 {{ exam.totalCandidates }} candidates</span>
          </div>
        </div>
        <div class="exam-card-right">
          <div class="exam-date-display" :class="{ 'no-date': !exam.examDate }">
            <div class="date-label">Exam Date</div>
            <div class="date-value">{{ exam.examDate ? formatDateSimple(exam.examDate) : 'Not set' }}</div>
          </div>
          <button
            v-if="exam.status === 'REQUESTED' || exam.status === 'SCHEDULED'"
            class="set-date-btn"
            @click.stop="openSetDate(exam)"
          >
            {{ exam.examDate ? '✏ Change Date' : '+ Set Date' }}
          </button>
        </div>
      </div>
    </div>

    <!-- EXAM DETAIL MODAL -->
    <div v-if="selectedExam" class="modal-overlay" @click.self="selectedExam = null">
      <div class="modal">
        <button class="modal-close" @click="selectedExam = null">✕</button>
        <div class="modal-header-row">
          <h2 class="modal-title">Exam Request #{{ selectedExam.id }}</h2>
          <span class="status-badge" :class="statusClass(selectedExam.status)">{{ selectedExam.status }}</span>
        </div>

        <div class="modal-info">
          <div class="modal-row">
            <span class="modal-label">Submitted by</span>
            <span>{{ selectedExam.registeredByName }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-label">Registered</span>
            <span>{{ formatDate(selectedExam.registrationDate) }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-label">Exam Date</span>
            <span>{{ selectedExam.examDate ? formatDateSimple(selectedExam.examDate) : 'Not assigned yet' }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-label">Candidates</span>
            <span>{{ selectedExam.totalCandidates }}</span>
          </div>
        </div>

        <h3 class="candidates-title">Candidate List</h3>
        <div class="candidates-list">
          <div class="cand-row" v-for="c in selectedExam.candidates" :key="c.id">
            <span class="cand-name">{{ c.name }} {{ c.lastname }}</span>
            <span class="cand-cat">{{ c.category }}</span>
          </div>
        </div>

        <button
          v-if="selectedExam.status === 'REQUESTED' || selectedExam.status === 'SCHEDULED'"
          class="set-date-btn-modal"
          @click="openSetDate(selectedExam)"
        >
          {{ selectedExam.examDate ? '✏ Change Exam Date' : '+ Set Exam Date' }}
        </button>
      </div>
    </div>

    <!-- SET DATE MODAL -->
    <div v-if="setDateModal" class="modal-overlay" @click.self="setDateModal = false">
      <div class="modal small-modal">
        <button class="modal-close" @click="setDateModal = false">✕</button>
        <h2 class="modal-title">Set Exam Date</h2>
        <p class="modal-desc">For exam request <strong>#{{ dateTargetExam?.id }}</strong> with <strong>{{ dateTargetExam?.totalCandidates }}</strong> candidates.</p>
        <p class="modal-desc">All candidates will be notified once the date is set.</p>

        <div class="date-input-wrap">
          <label class="date-label-txt">Select Date</label>
          <input type="date" v-model="selectedDate" class="date-input" :min="minDate" />
        </div>

        <div class="modal-actions">
          <button class="cancel-modal-btn" @click="setDateModal = false">Cancel</button>
          <button class="confirm-btn" @click="confirmSetDate" :disabled="!selectedDate || settingDate">
            <span v-if="settingDate" class="spinner"></span>
            <span v-else>Confirm & Notify Candidates</span>
          </button>
        </div>

        <div v-if="dateSuccess" class="success-msg">✓ {{ dateSuccess }}</div>
        <div v-if="dateError" class="error-msg">⚠ {{ dateError }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      exams: [],
      loading: false,
      activeFilter: 'ALL',
      filters: [
        { label: 'All', value: 'ALL' },
        { label: 'Awaiting Date', value: 'REQUESTED' },
        { label: 'Scheduled', value: 'SCHEDULED' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Cancelled', value: 'CANCELLED' },
      ],
      selectedExam: null,
      setDateModal: false,
      dateTargetExam: null,
      selectedDate: '',
      settingDate: false,
      dateSuccess: null,
      dateError: null,
    };
  },

  computed: {
    filteredExams() {
      if (this.activeFilter === 'ALL') return this.exams;
      return this.exams.filter(e => e.status === this.activeFilter);
    },

    minDate() {
      return new Date().toISOString().split('T')[0];
    }
  },

  mounted() {
    this.fetchExams();
  },

  methods: {
    async fetchExams() {
      this.loading = true;
      try {
        const res = await axios.get('http://localhost:8080/professor/theory-exam/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.exams = res.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    openExam(exam) {
      this.selectedExam = exam;
    },

    openSetDate(exam) {
      this.dateTargetExam = exam;
      this.selectedDate = exam.examDate || '';
      this.dateSuccess = null;
      this.dateError = null;
      this.setDateModal = true;
      this.selectedExam = null;
    },

    async confirmSetDate() {
      this.settingDate = true;
      this.dateSuccess = null;
      this.dateError = null;
      try {
        await axios.patch(
          `http://localhost:8080/professor/theory-exam/${this.dateTargetExam.id}/set-date`,
          { examDate: this.selectedDate },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        this.dateSuccess = 'Date set successfully! Candidates have been notified.';
        await this.fetchExams();
        setTimeout(() => { this.setDateModal = false; }, 2000);
      } catch (e) {
        this.dateError = e.response?.data?.message || e.response?.data || 'Error setting date.';
      } finally {
        this.settingDate = false;
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

.top-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.top-bar .page-title {
  margin-bottom: 0;
  flex: 1;
}

.back-btn {
  padding: 8px 18px;
  border: 2px solid #e9e1f5;
  background: white;
  color: #4f364b;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.back-btn:hover {
  background: #f5f0f9;
  border-color: #be8fe9;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  color: #4f364b;
  margin-bottom: 30px;
}

/* STATS */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.stat-card {
  background: linear-gradient(145deg, #fff, #f5f0f9);
  border-radius: 14px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.07);
  border: 2px solid #e9e1f5;
}
.stat-num { display: block; font-size: 2.2rem; font-weight: 800; color: #4f364b; }
.stat-lbl { display: block; font-size: 0.8rem; color: #888; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

/* FILTER */
.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 7px 18px;
  border-radius: 20px;
  border: 2px solid #e9e1f5;
  background: white;
  color: #4f364b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn:hover { border-color: #be8fe9; }
.filter-btn.active { background: #be8fe9; border-color: #be8fe9; color: white; }

/* EXAMS LIST */
.exams-list { display: flex; flex-direction: column; gap: 14px; }

.exam-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-radius: 14px;
  border: 2px solid #e9e1f5;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.3s;
  gap: 20px;
  flex-wrap: wrap;
}
.exam-card:hover { border-color: #be8fe9; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(106,13,173,0.12); }

.exam-top-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.exam-id { color: #bbb; font-size: 0.8rem; }
.exam-prof { font-size: 0.88rem; color: #555; margin-bottom: 8px; }
.exam-meta-row { display: flex; gap: 20px; font-size: 0.85rem; color: #777; flex-wrap: wrap; }

.exam-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }

.exam-date-display { text-align: right; }
.date-label { font-size: 0.75rem; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
.date-value { font-size: 1rem; font-weight: 700; color: #4f364b; }
.exam-date-display.no-date .date-value { color: #be8fe9; }

.status-badge {
  padding: 3px 12px; border-radius: 20px;
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
}
.status-requested { background: #fff3e0; color: #e65100; }
.status-scheduled { background: #e8f5e9; color: #2e7d32; }
.status-cancelled { background: #fdecea; color: #c62828; }
.status-completed { background: #e3f2fd; color: #1565c0; }

.set-date-btn {
  padding: 7px 18px;
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white; border: none; border-radius: 8px;
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.set-date-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(156,39,176,0.3); }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
}
.modal {
  background: white; border-radius: 20px;
  padding: 35px; width: 580px;
  max-width: 92vw; max-height: 85vh;
  overflow-y: auto; position: relative;
  box-shadow: 0 25px 60px rgba(0,0,0,0.2);
}
.small-modal { width: 460px; }

.modal-close {
  position: absolute; top: 15px; right: 20px;
  background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #888;
}
.modal-header-row {
  display: flex; align-items: center; gap: 14px; margin-bottom: 20px;
}
.modal-title { color: #4f364b; font-size: 1.3rem; margin: 0; }
.modal-desc { color: #666; font-size: 0.9rem; margin: 0 0 8px 0; }

.modal-info {
  background: #f9f5fd; border-radius: 12px;
  padding: 15px 20px; margin-bottom: 20px;
}
.modal-row {
  display: flex; justify-content: space-between;
  padding: 6px 0; font-size: 0.9rem; color: #555;
  border-bottom: 1px solid #ede8f5;
}
.modal-row:last-child { border-bottom: none; }
.modal-label { font-weight: 600; color: #4f364b; }

.candidates-title { color: #4f364b; font-size: 1rem; margin: 0 0 10px 0; }
.candidates-list {
  display: flex; flex-direction: column; gap: 6px;
  max-height: 240px; overflow-y: auto; margin-bottom: 20px;
}
.cand-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; background: #f5f0f9; border-radius: 8px;
}
.cand-name { font-weight: 600; color: #4f364b; font-size: 0.88rem; }
.cand-cat {
  background: #be8fe9; color: white;
  font-size: 0.7rem; font-weight: 700;
  padding: 2px 8px; border-radius: 10px;
}

.set-date-btn-modal {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white; border: none; border-radius: 10px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all 0.3s;
}
.set-date-btn-modal:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(156,39,176,0.4); }

/* DATE INPUT */
.date-input-wrap { margin: 20px 0; }
.date-label-txt { display: block; font-weight: 600; color: #4f364b; margin-bottom: 8px; }
.date-input {
  width: 100%; padding: 12px 14px;
  border: 2px solid #e9e1f5; border-radius: 10px;
  font-size: 1rem; outline: none; box-sizing: border-box;
  transition: border-color 0.2s;
}
.date-input:focus { border-color: #be8fe9; }

.modal-actions {
  display: flex; justify-content: flex-end; gap: 12px;
}
.cancel-modal-btn {
  padding: 10px 24px; border: 2px solid #ccc;
  background: white; color: #555;
  border-radius: 8px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.cancel-modal-btn:hover { background: #f5f5f5; }

.confirm-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white; border: none; border-radius: 8px;
  font-size: 0.95rem; font-weight: 700; cursor: pointer;
  transition: all 0.3s; display: flex; align-items: center; gap: 8px;
}
.confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.confirm-btn:hover:not(:disabled) { transform: translateY(-1px); }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.8s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.loading-text { text-align: center; color: #888; padding: 40px; }
.empty-state { text-align: center; padding: 50px; color: #aaa; }
.empty-icon { font-size: 2.5rem; margin-bottom: 10px; }

.success-msg {
  margin-top: 14px; padding: 10px 14px;
  background: #e8f5e9; border: 2px solid #4CAF50;
  border-radius: 8px; color: #2e7d32; font-weight: 600; font-size: 0.9rem;
}
.error-msg {
  margin-top: 14px; padding: 10px 14px;
  background: #fdecea; border: 2px solid #f44336;
  border-radius: 8px; color: #c62828; font-weight: 600; font-size: 0.9rem;
}
</style>