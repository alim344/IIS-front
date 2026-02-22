<template>
  <div class="theory-schedule-section">
    <h1 class="page-title">Theory Schedule</h1>

    <!-- MODE SELECTOR -->
    <div class="mode-tabs">
      <button :class="['mode-tab', { active: mode === 'generate' }]" @click="mode = 'generate'">
        ⚡ Auto Generate
      </button>
      <button :class="['mode-tab', { active: mode === 'manual' }]" @click="mode = 'manual'; initManual()">
        ✏️ Manual Create
      </button>
      <button :class="['mode-tab', { active: mode === 'view' }]" @click="mode = 'view'; fetchSchedule()">
        📅 View Schedule
      </button>
    </div>

    <!-- ==================== AUTO GENERATE ==================== -->
    <div v-if="mode === 'generate'">
      <div class="info-card">
        <div class="info-icon">⚡</div>
        <div class="info-text">
          <h3>Automatic Scheduling</h3>
          <p>The algorithm groups candidates by time preference, assigns lessons in order, and distributes professors evenly. Each candidate gets max 2 classes per week.</p>
        </div>
      </div>
      <div class="action-row">
        <button class="generate-btn" @click="generate" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>⚡ Generate Schedule</span>
        </button>
        <button class="manual-btn" @click="mode = 'manual'; initManual()">
          ✏️ Create Manually
        </button>
      </div>
      <div v-if="result" class="result-card">
        <h2 class="result-title">Generation Complete ✓</h2>
        <div class="result-stats">
          <div class="stat-box">
            <span class="stat-number">{{ result.totalClasses }}</span>
            <span class="stat-label">Classes Created</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ result.candidatesScheduled }}</span>
            <span class="stat-label">Candidates Scheduled</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ result.uniqueLessons }}</span>
            <span class="stat-label">Unique Lessons</span>
          </div>
        </div>
        <p class="result-message">{{ result.message }}</p>
        <button class="view-btn" @click="mode = 'view'; fetchSchedule()">View Generated Schedule →</button>
      </div>
      <div v-if="error" class="error-card">⚠ {{ error }}</div>
    </div>

    <!-- ==================== MANUAL CREATE ==================== -->
    <div v-if="mode === 'manual'">
      <div class="info-card">
        <div class="info-icon">✏️</div>
        <div class="info-text">
          <h3>Manual Class Creation</h3>
          <p>Pick a date, time slot, professor and lesson. Candidates are filtered by their time preference to match the selected slot. Max 20 candidates per class.</p>
        </div>
      </div>

      <div class="manual-form">

        <!-- STEP 1: DATE & SLOT -->
        <div class="form-section">
          <div class="form-section-title">
            <span class="step-badge">1</span> Date & Time Slot
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" v-model="manual.date" class="form-input" :min="todayDate" @change="onSlotOrDateChange" />
            </div>
            <div class="form-group">
              <label class="form-label">Time Slot</label>
              <div class="slot-selector">
                <button
                  v-for="slot in slots"
                  :key="slot.value"
                  class="slot-btn"
                  :class="{ active: manual.slot === slot.value }"
                  @click="manual.slot = slot.value; onSlotOrDateChange()"
                >
                  <span class="slot-icon">{{ slot.icon }}</span>
                  <span class="slot-label">{{ slot.label }}</span>
                  <span class="slot-time">{{ slot.time }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2: PROFESSOR & LESSON -->
        <div class="form-section">
          <div class="form-section-title">
            <span class="step-badge">2</span> Professor & Lesson
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Professor</label>
              <select v-model="manual.professorId" class="form-input" :disabled="loadingProfessors">
                <option value="" disabled>Select professor...</option>
                <option v-for="p in professors" :key="p.id" :value="p.id">
                  {{ p.name }} {{ p.lastname }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Lesson</label>
              <select v-model="manual.lessonId" class="form-input" :disabled="loadingLessons">
                <option value="" disabled>Select lesson...</option>
                <option v-for="l in lessons" :key="l.id" :value="l.id">
                  {{ l.orderNumber }}. {{ l.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- STEP 3: CANDIDATES -->
        <div class="form-section">
          <div class="form-section-title">
            <span class="step-badge">3</span> Candidates
            <span class="step-hint">
              {{ manual.slot ? `Showing candidates who prefer ${manual.slot} slot` : 'Select a slot first' }}
            </span>
          </div>

          <div v-if="!manual.slot" class="slot-hint-box">
            Select a time slot above to load available candidates.
          </div>

          <div v-else-if="loadingCandidates" class="loading-text">Loading candidates...</div>

          <div v-else-if="availableCandidates.length === 0" class="empty-state small">
            <div class="empty-icon">👤</div>
            <p>No candidates available for this slot.</p>
          </div>

          <div v-else>
            <div class="candidate-toolbar">
              <input v-model="candidateSearch" class="search-input" placeholder="Search by name..." />
              <button class="sel-btn" @click="selectAllCandidates">Select All</button>
              <button class="sel-btn desel" @click="manual.candidateIds = []">Deselect All</button>
              <span class="sel-count" :class="{ 'over-limit': manual.candidateIds.length > 20 }">
                {{ manual.candidateIds.length }} / 20 selected
              </span>
            </div>

            <div class="candidates-grid">
              <div
                v-for="c in filteredCandidates"
                :key="c.id"
                class="candidate-tile"
                :class="{
                  selected: manual.candidateIds.includes(c.id),
                  'pref-match': c.hasPreference,
                  disabled: !manual.candidateIds.includes(c.id) && manual.candidateIds.length >= 20
                }"
                @click="toggleCandidate(c.id)"
              >
                <div class="tile-check">
                  <span v-if="manual.candidateIds.includes(c.id)">✓</span>
                </div>
                <div class="tile-info">
                  <span class="tile-name">{{ c.name }} {{ c.lastname }}</span>
                  <div class="tile-meta">
                    <span class="tile-cat">{{ c.category }}</span>
                    <span class="tile-pref" v-if="c.hasPreference" title="Has matching preference">⏰ {{ c.preferenceStart }} – {{ c.preferenceEnd }}</span>
                    <span class="tile-nopref" v-else>No preference</span>
                  </div>
                  <div class="tile-lessons">{{ c.attendedLessons }}/40 lessons</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SUMMARY & SUBMIT -->
        <div class="form-section submit-section">
          <div class="summary-box" v-if="manual.date && manual.slot && manual.professorId && manual.lessonId">
            <div class="summary-row">
              <span>📅 Date & Time</span>
              <strong>{{ manual.date }} at {{ slotTime(manual.slot) }}</strong>
            </div>
            <div class="summary-row">
              <span>👨‍🏫 Professor</span>
              <strong>{{ professorName(manual.professorId) }}</strong>
            </div>
            <div class="summary-row">
              <span>📖 Lesson</span>
              <strong>{{ lessonName(manual.lessonId) }}</strong>
            </div>
            <div class="summary-row">
              <span>👥 Candidates</span>
              <strong :class="{ 'text-red': manual.candidateIds.length === 0 }">
                {{ manual.candidateIds.length }} selected
              </strong>
            </div>
          </div>

          <div class="submit-row">
            <button class="reset-btn" @click="resetManual">Reset Form</button>
            <button
              class="create-btn"
              @click="createManualClass"
              :disabled="!canSubmit || submittingManual"
            >
              <span v-if="submittingManual" class="spinner"></span>
              <span v-else>✓ Create Class</span>
            </button>
          </div>

          <div v-if="manualSuccess" class="success-card">
            ✓ {{ manualSuccess }}
            <button class="view-created-btn" @click="mode = 'view'; weekView = 'this'; fetchSchedule()">View in Schedule →</button>
          </div>
          <div v-if="manualError" class="error-card">⚠ {{ manualError }}</div>
        </div>
      </div>
    </div>

    <!-- ==================== VIEW SCHEDULE ==================== -->
    <div v-if="mode === 'view'">
      <div class="week-selector">
        <button class="week-btn" :class="{active: weekView === 'this'}" @click="weekView = 'this'; fetchSchedule()">This Week</button>
        <button class="week-btn" :class="{active: weekView === 'next'}" @click="weekView = 'next'; fetchSchedule()">Next Week</button>
      </div>

      <div v-if="loadingSchedule" class="loading-text">Loading schedule...</div>

      <div v-else-if="schedule.length === 0" class="empty-state">
        <div class="empty-icon">📅</div>
        <p>No classes scheduled for this week.</p>
      </div>

      <div v-else>
        <h2 class="section-subtitle">{{ schedule.length }} Classes</h2>
        <div class="classes-grid-view">
          <div class="class-card" v-for="cls in schedule" :key="cls.id" @click="openClassDetails(cls)">
            <div class="class-card-header">
              <span class="lesson-badge">Lesson {{ cls.theoryLesson?.orderNumber }}</span>
              <span class="slot-badge">{{ getSlotLabel(cls.startTime) }}</span>
            </div>
            <h3 class="lesson-name">{{ cls.theoryLesson?.name }}</h3>
            <div class="class-meta">
              <div class="meta-row">
                <span class="meta-label">📅 Date</span>
                <span>{{ formatDate(cls.startTime) }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">🕐 Time</span>
                <span>{{ formatTime(cls.startTime) }} – {{ formatTime(cls.endTime) }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">👨‍🏫 Professor</span>
                <span>{{ cls.professor?.name }} {{ cls.professor?.lastname }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">👥 Students</span>
                <span>{{ cls.enrolledStudents }} / {{ cls.capacity }}</span>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (cls.enrolledStudents / cls.capacity * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CLASS DETAIL MODAL -->
    <div v-if="selectedClass" class="modal-overlay" @click.self="selectedClass = null">
      <div class="modal">
        <button class="modal-close" @click="selectedClass = null">✕</button>
        <h2 class="modal-title">Lesson {{ selectedClass.theoryLesson?.orderNumber }}: {{ selectedClass.theoryLesson?.name }}</h2>
        <div class="modal-info">
          <div class="modal-row">
            <span class="modal-label">📅 Date</span>
            <span>{{ formatDate(selectedClass.startTime) }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-label">🕐 Time</span>
            <span>{{ formatTime(selectedClass.startTime) }} – {{ formatTime(selectedClass.endTime) }}</span>
          </div>
          <div class="modal-row">
            <span class="modal-label">👨‍🏫 Professor</span>
            <span>{{ selectedClass.professor?.name }} {{ selectedClass.professor?.lastname }}</span>
          </div>
        </div>
        <h3 class="students-title">Students ({{ selectedClass.students?.length || 0 }})</h3>
        <div class="students-list">
          <div class="student-row" v-for="s in selectedClass.students" :key="s.id">
            <span class="student-name">{{ s.name }} {{ s.lastname }}</span>
            <span class="student-category">{{ s.category }}</span>
          </div>
          <div v-if="!selectedClass.students?.length" class="empty-students">No students enrolled</div>
        </div>
        <button class="delete-btn" @click="deleteClass(selectedClass.id)">🗑️ Delete Class</button>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";

const API = "http://localhost:8080";
const headers = () => ({ Authorization: "Bearer " + localStorage.getItem("token") });

export default {
  data() {
    return {
      mode: "generate",
      weekView: "next",

      // Auto generate
      loading: false,
      result: null,
      error: null,

      // View schedule
      loadingSchedule: false,
      schedule: [],
      selectedClass: null,

      // Manual create
      manual: {
        date: "",
        slot: "",
        professorId: "",
        lessonId: "",
        candidateIds: [],
      },
      professors: [],
      lessons: [],
      availableCandidates: [],
      candidateSearch: "",
      loadingCandidates: false,
      loadingProfessors: false,
      loadingLessons: false,
      submittingManual: false,
      manualSuccess: null,
      manualError: null,

      slots: [
        { value: "MORNING",   label: "Morning",   icon: "🌅", time: "08:00 – 09:00" },
        { value: "AFTERNOON", label: "Afternoon", icon: "☀️",  time: "14:00 – 15:00" },
        { value: "EVENING",   label: "Evening",   icon: "🌙", time: "18:00 – 19:00" },
      ],
    };
  },

  computed: {
    todayDate() {
      return new Date().toISOString().split("T")[0];
    },

    filteredCandidates() {
      if (!this.candidateSearch) return this.availableCandidates;
      const q = this.candidateSearch.toLowerCase();
      return this.availableCandidates.filter(c =>
        (c.name + " " + c.lastname).toLowerCase().includes(q)
      );
    },

    canSubmit() {
      return this.manual.date &&
             this.manual.slot &&
             this.manual.professorId &&
             this.manual.lessonId &&
             this.manual.candidateIds.length > 0 &&
             this.manual.candidateIds.length <= 20;
    },
  },

  methods: {
    // ===== AUTO GENERATE =====
    async generate() {
      this.loading = true;
      this.result = null;
      this.error = null;
      try {
        const res = await axios.post(`${API}/theoryclass/auto-generate`, {}, { headers: headers() });
        this.result = res.data;
      } catch (e) {
        this.error = e.response?.data?.message || "An error occurred during generation.";
      } finally {
        this.loading = false;
      }
    },

    // ===== VIEW SCHEDULE =====
    async fetchSchedule() {
      this.loadingSchedule = true;
      this.schedule = [];
      try {
        const endpoint = this.weekView === "next" ? `${API}/theoryclass/next-week` : `${API}/theoryclass/this-week`;
        const res = await axios.get(endpoint, { headers: headers() });
        this.schedule = Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        console.error("Error fetching schedule:", e);
        this.schedule = [];
      } finally {
        this.loadingSchedule = false;
      }
    },

    openClassDetails(cls) {
      this.selectedClass = this.schedule.find(c => c.id === cls.id) || cls;
    },

    async deleteClass(classId) {
      if (!confirm("Are you sure you want to delete this class?")) return;
      try {
        await axios.delete(`${API}/theoryclass/${classId}`, { headers: headers() });
        this.selectedClass = null;
        await this.fetchSchedule();
      } catch (e) {
        alert(e.response?.data?.message || "Error deleting class.");
      }
    },

    // ===== MANUAL CREATE =====
    async initManual() {
      this.fetchProfessors();
      this.fetchLessons();
    },

    async fetchProfessors() {
      this.loadingProfessors = true;
      try {
        // Koristi bilo koji endpoint koji vraća profesore
        const res = await axios.get(`${API}/professor`, { headers: headers() });
        this.professors = res.data;
      } catch (e) {
        console.error("Error loading professors:", e);
      } finally {
        this.loadingProfessors = false;
      }
    },

    async fetchLessons() {
      this.loadingLessons = true;
      try {
        // Dohvati listu lekcija iz bilo kog rasporeda ili dedicated endpointa
        const res = await axios.get(`${API}/theoryclass/fullschedule`, { headers: headers() });
        // Izvuci unique lekcije
        const seen = new Set();
        const uniqueLessons = [];
        for (const cls of res.data) {
          if (cls.theoryLesson && !seen.has(cls.theoryLesson.id)) {
            seen.add(cls.theoryLesson.id);
            uniqueLessons.push(cls.theoryLesson);
          }
        }
        // Sortiraj po orderNumber
        this.lessons = uniqueLessons.sort((a, b) => a.orderNumber - b.orderNumber);
      } catch (e) {
        console.error("Error loading lessons:", e);
      } finally {
        this.loadingLessons = false;
      }
    },

    async onSlotOrDateChange() {
      if (!this.manual.slot) return;
      this.loadingCandidates = true;
      this.availableCandidates = [];
      this.manual.candidateIds = [];
      try {
        const res = await axios.get(
          `${API}/theoryclass/candidates/available?slot=${this.manual.slot}`,
          { headers: headers() }
        );
        this.availableCandidates = res.data;
      } catch (e) {
        console.error("Error loading candidates:", e);
      } finally {
        this.loadingCandidates = false;
      }
    },

    toggleCandidate(id) {
      if (this.manual.candidateIds.includes(id)) {
        this.manual.candidateIds = this.manual.candidateIds.filter(i => i !== id);
      } else if (this.manual.candidateIds.length < 20) {
        this.manual.candidateIds.push(id);
      }
    },

    selectAllCandidates() {
      this.manual.candidateIds = this.filteredCandidates.slice(0, 20).map(c => c.id);
    },

    async createManualClass() {
      this.submittingManual = true;
      this.manualSuccess = null;
      this.manualError = null;
      try {
        const payload = {
          date: this.manual.date,
          slot: this.manual.slot,
          professorId: this.manual.professorId,
          lessonId: this.manual.lessonId,
          candidateIds: this.manual.candidateIds,
        };
        await axios.post(`${API}/theoryclass/manual`, payload, { headers: headers() });
        this.manualSuccess = `Class created successfully! ${this.manual.candidateIds.length} candidates enrolled for ${this.manual.date} at ${this.slotTime(this.manual.slot)}.`;
        this.resetManual();
      } catch (e) {
        this.manualError = e.response?.data?.error || e.response?.data?.message || "Error creating class.";
      } finally {
        this.submittingManual = false;
      }
    },

    resetManual() {
      this.manual = { date: "", slot: "", professorId: "", lessonId: "", candidateIds: [] };
      this.availableCandidates = [];
      this.candidateSearch = "";
    },

    // ===== HELPERS =====
    slotTime(slot) {
      const map = { MORNING: "08:00", AFTERNOON: "14:00", EVENING: "18:00" };
      return map[slot] || slot;
    },

    professorName(id) {
      const p = this.professors.find(p => p.id === id);
      return p ? `${p.name} ${p.lastname}` : "—";
    },

    lessonName(id) {
      const l = this.lessons.find(l => l.id === id);
      return l ? `${l.orderNumber}. ${l.name}` : "—";
    },

    formatDate(dt) {
      if (!dt) return "";
      return new Date(dt).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
    },

    formatTime(dt) {
      if (!dt) return "";
      return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    },

    getSlotLabel(dt) {
      if (!dt) return "";
      const h = new Date(dt).getHours();
      if (h === 8) return "Morning";
      if (h === 14) return "Afternoon";
      if (h === 18) return "Evening";
      return "";
    },
  },
};
</script>

<style scoped>
.theory-schedule-section {
  padding: 0 40px 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #4f364b;
}

/* MODE TABS */
.mode-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 30px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #be8fe9;
  width: fit-content;
}

.mode-tab {
  padding: 12px 32px;
  border: none;
  background: white;
  color: #4f364b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.mode-tab.active { background: #be8fe9; color: white; }

/* INFO CARD */
.info-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: linear-gradient(135deg, #f5f0f9, #fef9fb);
  border: 2px solid #e9e1f5;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
}
.info-icon { font-size: 2.5rem; }
.info-text h3 { margin: 0 0 8px; color: #4f364b; font-size: 1.2rem; }
.info-text p { margin: 0; color: #6e5570; line-height: 1.6; }

/* AUTO GENERATE */
.action-row {
  display: flex;
  gap: 16px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.generate-btn {
  padding: 14px 36px;
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white; border: none; border-radius: 12px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(156,39,176,0.3);
  display: flex; align-items: center; gap: 10px;
}
.generate-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(156,39,176,0.4); }
.generate-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.manual-btn {
  padding: 14px 36px;
  background: linear-gradient(135deg, #5c8fd6, #2962b8);
  color: white; border: none; border-radius: 12px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(41,98,184,0.3);
  display: flex; align-items: center; gap: 10px;
}
.manual-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(41,98,184,0.4); }

.spinner {
  width: 18px; height: 18px;
  border: 3px solid rgba(255,255,255,0.4);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.8s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.result-card {
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
  border: 2px solid #4CAF50;
  border-radius: 15px; padding: 30px; margin-bottom: 25px;
}
.result-title { color: #2e7d32; margin: 0 0 20px; font-size: 1.5rem; }
.result-stats { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
.stat-box {
  background: white; border-radius: 12px;
  padding: 20px 30px; text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08); min-width: 130px;
}
.stat-number { display: block; font-size: 2.5rem; font-weight: 800; color: #4f364b; }
.stat-label { display: block; font-size: 0.8rem; color: #888; margin-top: 6px; text-transform: uppercase; }
.result-message { color: #388e3c; margin-bottom: 20px; }

.view-btn {
  padding: 10px 24px; background: #4CAF50; color: white;
  border: none; border-radius: 8px; font-size: 0.95rem;
  font-weight: 600; cursor: pointer; transition: all 0.3s;
}
.view-btn:hover { background: #388e3c; transform: translateX(4px); }

/* MANUAL FORM */
.manual-form { display: flex; flex-direction: column; gap: 0; }

.form-section {
  background: white;
  border: 2px solid #e9e1f5;
  border-radius: 14px;
  padding: 24px 28px;
  margin-bottom: 20px;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #4f364b;
  margin-bottom: 20px;
}

.step-badge {
  width: 28px; height: 28px;
  background: #be8fe9; color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 800;
  flex-shrink: 0;
}

.step-hint {
  font-size: 0.82rem;
  font-weight: 400;
  color: #888;
  margin-left: auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group { display: flex; flex-direction: column; gap: 8px; }

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #4f364b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  padding: 10px 14px;
  border: 2px solid #e9e1f5;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  color: #333;
  background: white;
}
.form-input:focus { border-color: #be8fe9; }

/* SLOT SELECTOR */
.slot-selector { display: flex; gap: 10px; flex-wrap: wrap; }

.slot-btn {
  flex: 1; min-width: 120px;
  display: flex; flex-direction: column; align-items: center;
  padding: 14px 10px;
  border: 2px solid #e9e1f5;
  border-radius: 12px;
  background: white; cursor: pointer;
  transition: all 0.25s;
}
.slot-btn:hover { border-color: #be8fe9; background: #faf5ff; }
.slot-btn.active { border-color: #9C27B0; background: #f5e9ff; }

.slot-icon { font-size: 1.5rem; margin-bottom: 4px; }
.slot-label { font-size: 0.88rem; font-weight: 700; color: #4f364b; }
.slot-time { font-size: 0.75rem; color: #888; margin-top: 2px; }

/* CANDIDATES */
.slot-hint-box {
  padding: 20px; text-align: center;
  background: #faf5ff; border-radius: 10px;
  color: #888; font-style: italic;
}

.candidate-toolbar {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px; flex-wrap: wrap;
}

.search-input {
  flex: 1; min-width: 180px;
  padding: 8px 12px;
  border: 2px solid #e9e1f5; border-radius: 8px;
  font-size: 0.88rem; outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #be8fe9; }

.sel-btn {
  padding: 7px 14px;
  border: 2px solid #be8fe9; background: white;
  color: #4f364b; border-radius: 8px;
  font-size: 0.82rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.sel-btn:hover { background: #be8fe9; color: white; }
.sel-btn.desel { border-color: #ccc; color: #888; }
.sel-btn.desel:hover { background: #f0f0f0; color: #444; }

.sel-count {
  font-size: 0.88rem; font-weight: 700; color: #4f364b;
  margin-left: auto;
  padding: 5px 12px;
  background: #f5f0f9; border-radius: 8px;
}
.sel-count.over-limit { color: #f44336; background: #fdecea; }

/* CANDIDATES GRID */
.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.candidate-tile {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 2px solid #e9e1f5;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}
.candidate-tile:hover:not(.disabled) { border-color: #be8fe9; background: #faf5ff; }
.candidate-tile.selected { border-color: #4CAF50; background: #e8f5e9; }
.candidate-tile.pref-match { border-left: 3px solid #be8fe9; }
.candidate-tile.disabled { opacity: 0.45; cursor: not-allowed; }

.tile-check {
  width: 20px; height: 20px;
  border: 2px solid #ccc; border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; color: white; font-weight: 800;
  flex-shrink: 0; margin-top: 1px;
  background: transparent; transition: all 0.2s;
}
.candidate-tile.selected .tile-check { background: #4CAF50; border-color: #4CAF50; }

.tile-name { display: block; font-weight: 700; font-size: 0.88rem; color: #4f364b; }
.tile-meta { display: flex; align-items: center; gap: 6px; margin-top: 3px; flex-wrap: wrap; }
.tile-cat {
  background: #be8fe9; color: white;
  font-size: 0.68rem; font-weight: 700;
  padding: 1px 6px; border-radius: 8px;
}
.tile-pref { font-size: 0.72rem; color: #888; }
.tile-nopref { font-size: 0.72rem; color: #bbb; font-style: italic; }
.tile-lessons { font-size: 0.72rem; color: #aaa; margin-top: 2px; }

/* SUBMIT SECTION */
.submit-section { background: #faf5ff; }

.summary-box {
  background: white;
  border: 2px solid #e9e1f5;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 18px;
  display: flex; flex-direction: column; gap: 8px;
}
.summary-row {
  display: flex; justify-content: space-between;
  font-size: 0.9rem; color: #555;
  padding: 4px 0; border-bottom: 1px solid #f0eaf8;
}
.summary-row:last-child { border-bottom: none; }
.text-red { color: #f44336; }

.submit-row {
  display: flex; justify-content: flex-end; gap: 12px; align-items: center;
}

.reset-btn {
  padding: 11px 24px;
  border: 2px solid #ccc; background: white;
  color: #666; border-radius: 10px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.reset-btn:hover { background: #f5f5f5; border-color: #999; }

.create-btn {
  padding: 12px 36px;
  background: linear-gradient(135deg, #4CAF50, #2e7d32);
  color: white; border: none; border-radius: 10px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(76,175,80,0.3);
  display: flex; align-items: center; gap: 8px;
}
.create-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(76,175,80,0.4); }
.create-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.success-card {
  margin-top: 16px; padding: 16px 20px;
  background: #e8f5e9; border: 2px solid #4CAF50;
  border-radius: 10px; color: #2e7d32; font-weight: 600;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  flex-wrap: wrap;
}

.view-created-btn {
  padding: 6px 16px;
  background: #4CAF50; color: white; border: none;
  border-radius: 8px; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.view-created-btn:hover { background: #388e3c; }

.error-card {
  margin-top: 14px; padding: 14px 18px;
  background: #fdecea; border: 2px solid #f44336;
  border-radius: 10px; color: #c62828; font-weight: 600;
}

/* VIEW SCHEDULE */
.week-selector {
  display: flex; gap: 0; margin-bottom: 25px;
  border-radius: 10px; overflow: hidden;
  border: 2px solid #be8fe9; width: fit-content;
}
.week-btn {
  padding: 10px 28px; border: none; background: white;
  color: #4f364b; font-size: 0.95rem; font-weight: 600;
  cursor: pointer; transition: all 0.3s;
}
.week-btn.active { background: #be8fe9; color: white; }

.section-subtitle { color: #4f364b; font-size: 1.3rem; margin: 0 0 15px; }

.classes-grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.class-card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 15px; padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.class-card:hover { transform: translateY(-6px); border-color: #be8fe9; box-shadow: 0 15px 40px rgba(106,13,173,0.15); }

.class-card-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.lesson-badge { background: #9C27B0; color: white; font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.slot-badge { background: #e9e1f5; color: #4f364b; font-size: 0.75rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
.lesson-name { font-size: 1rem; color: #4f364b; margin: 0 0 15px; font-weight: 700; line-height: 1.3; }
.class-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.meta-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #555; }
.meta-label { font-weight: 600; color: #4f364b; }
.progress-bar { height: 4px; background: #e9e1f5; border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #be8fe9, #9C27B0); border-radius: 2px; transition: width 0.5s ease; }

/* SHARED */
.empty-state { text-align: center; padding: 60px; color: #888; }
.empty-state.small { padding: 30px; }
.empty-icon { font-size: 3rem; margin-bottom: 15px; }
.loading-text { text-align: center; color: #888; padding: 40px; font-size: 1.1rem; }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  z-index: 100; display: flex; align-items: center; justify-content: center;
}
.modal {
  background: white; border-radius: 20px; padding: 35px;
  width: 550px; max-width: 90vw; max-height: 80vh;
  overflow-y: auto; position: relative;
  box-shadow: 0 25px 60px rgba(0,0,0,0.2);
}
.modal-close { position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #888; }
.modal-title { color: #4f364b; font-size: 1.3rem; margin: 0 0 20px; padding-right: 30px; line-height: 1.4; }
.modal-info { background: #f9f5fd; border-radius: 12px; padding: 15px 20px; margin-bottom: 20px; }
.modal-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.9rem; color: #555; border-bottom: 1px solid #ede8f5; }
.modal-row:last-child { border-bottom: none; }
.modal-label { font-weight: 600; color: #4f364b; }
.students-title { color: #4f364b; font-size: 1rem; margin: 0 0 12px; }
.students-list { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; margin-bottom: 20px; }
.student-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f5f0f9; border-radius: 8px; font-size: 0.9rem; }
.student-name { color: #4f364b; font-weight: 600; }
.student-category { background: #be8fe9; color: white; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
.empty-students { text-align: center; padding: 20px; color: #888; font-style: italic; }

.delete-btn {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white; border: none; border-radius: 10px;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.delete-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(244,67,54,0.4); }
</style>