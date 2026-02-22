<template>
  <div class="theory-schedule-section">
    <div class="header-with-back">
      <button class="back-home-btn" @click="goToAdminHome">
        ← Back to Dashboard
      </button>
      <h1 class="page-title">Theory Schedule</h1>
    </div>

    <!-- MODE SELECTOR -->
    <div class="mode-tabs">
      <button
          :class="['mode-tab', { active: mode === 'generate' }]"
          @click="mode = 'generate'"
      >Auto Generate</button>
      <button
          :class="['mode-tab', { active: mode === 'view' }]"
          @click="mode = 'view'; fetchSchedule()"
      >View Schedule</button>
    </div>

    <!-- ==================== AUTO GENERATE MODE ==================== -->
    <div v-if="mode === 'generate'">
      <div class="info-card">
        <div class="info-icon">⚡</div>
        <div class="info-text">
          <h3>Automatic Scheduling</h3>
          <p>The algorithm will group candidates by time preference and category, assign lessons in order, and distribute professors evenly. Each candidate gets max 2 classes per week.</p>
        </div>
      </div>

      <div class="action-row">
        <button class="generate-btn" @click="generate" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Generate Schedule</span>
        </button>

        <button class="manual-btn" @click="goToManualCreate">
          ✏️ Create Manually
        </button>
      </div>

      <!-- RESULT AFTER GENERATION -->
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
        <button class="view-btn" @click="mode = 'view'; fetchSchedule()">
          View Generated Schedule →
        </button>
      </div>

      <div v-if="error" class="error-card">
        ⚠ {{ error }}
      </div>
    </div>

    <!-- ==================== VIEW SCHEDULE MODE ==================== -->
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
        <!-- CLASS CARDS -->
        <h2 class="section-subtitle" v-if="schedule.length > 0">All Classes</h2>
        <div class="classes-grid">
          <div
              class="class-card"
              v-for="cls in schedule"
              :key="cls.id"
              @click="openClassDetails(cls)"
          >
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

    <!-- CLASS DETAIL MODAL WITH DELETE BUTTON -->
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
          <div v-if="!selectedClass.students?.length" class="empty-students">
            No students enrolled yet
          </div>
        </div>

        <!-- DELETE BUTTON -->
        <button class="delete-btn" @click="deleteClass(selectedClass.id)">
          🗑️ Delete Class
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  components: {
    // WeeklyCalendar removed
  },

  data() {
    return {
      mode: "generate",         // 'generate' | 'view'
      weekView: "next",         // 'this' | 'next'
      loading: false,
      loadingSchedule: false,
      result: null,
      error: null,
      schedule: [],
      selectedClass: null,
    };
  },

  methods: {
    goToAdminHome() {
      window.location.href = "http://localhost:8081/adminHome";
    },

    async generate() {
      this.loading = true;
      this.result = null;
      this.error = null;
      try {
        const response = await axios.post(
            "http://localhost:8080/theoryclass/auto-generate",
            {},
            { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );
        this.result = response.data;
      } catch (e) {
        this.error = e.response?.data?.message || "An error occurred during generation.";
      } finally {
        this.loading = false;
      }
    },
    goToManualCreate() {
      this.$router.push('/manual-theory-class');
    },

    async fetchSchedule() {
      this.loadingSchedule = true;
      this.schedule = [];
      try {
        const endpoint = this.weekView === "next"
            ? "http://localhost:8080/theoryclass/next-week"
            : "http://localhost:8080/theoryclass/this-week";
        const response = await axios.get(endpoint, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        
        // DEBUG
        console.log("Response:", response.data);
        console.log("Is array?", Array.isArray(response.data));
        
        // Proveri da li je niz
        if (Array.isArray(response.data)) {
          this.schedule = response.data;
        } else {
          console.error("Response is not an array:", response.data);
          this.schedule = [];
        }
      } catch (e) {
        console.error("Error fetching schedule:", e);
        this.schedule = []; // Obavezno postavi prazan niz
      } finally {
        this.loadingSchedule = false;
      }
    },

    async deleteClass(classId) {
      if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
        return;
      }
      
      try {
        await axios.delete(`http://localhost:8080/theoryclass/${classId}`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        
        // Close the modal
        this.selectedClass = null;
        
        // Refresh the schedule
        await this.fetchSchedule();
        
        // Show success message (optional)
        alert("Class deleted successfully!");
      } catch (e) {
        console.error("Error deleting class:", e);
        alert(e.response?.data?.message || "Error deleting class. Please try again.");
      }
    },

    openClassDetails(cls) {
      this.selectedClass = this.schedule.find(c => c.id === cls.id) || cls;
    },

    formatDate(dt) {
      if (!dt) return "";
      return new Date(dt).toLocaleDateString("en-GB", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric"
      });
    },

    formatTime(dt) {
      if (!dt) return "";
      return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    },

    getSlotLabel(dt) {
      if (!dt) return "";
      const hour = new Date(dt).getHours();
      if (hour === 8) return "Morning";
      if (hour === 14) return "Afternoon";
      if (hour === 18) return "Evening";
      return "";
    }
  }
};
</script>

<style scoped>
.theory-schedule-section {
  padding: 0 40px 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-with-back {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
}

.back-home-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.back-home-btn:hover {
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #5a6268, #343a40);
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  color: #4f364b;
  margin: 0;
  flex-grow: 1;
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
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.mode-tab.active {
  background: #be8fe9;
  color: white;
}

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

.info-icon {
  font-size: 2.5rem;
}

.info-text h3 {
  margin: 0 0 8px 0;
  color: #4f364b;
  font-size: 1.2rem;
}

.info-text p {
  margin: 0;
  color: #6e5570;
  line-height: 1.6;
}

/* ACTION ROW */
.action-row {
  margin-bottom: 25px;
}

.generate-btn {
  padding: 14px 40px;
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(156, 39, 176, 0.4);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* RESULT CARD */
.result-card {
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
  border: 2px solid #4CAF50;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 25px;
}

.result-title {
  color: #2e7d32;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
}

.result-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-box {
  background: white;
  border-radius: 12px;
  padding: 20px 30px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  min-width: 130px;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  color: #4f364b;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #888;
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-message {
  color: #388e3c;
  margin-bottom: 20px;
}

.view-btn {
  padding: 10px 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn:hover {
  background: #388e3c;
  transform: translateX(4px);
}

/* ERROR */
.error-card {
  background: #fdecea;
  border: 2px solid #f44336;
  border-radius: 10px;
  padding: 20px;
  color: #c62828;
  font-weight: 600;
}

/* WEEK SELECTOR */
.week-selector {
  display: flex;
  gap: 0;
  margin-bottom: 25px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #be8fe9;
  width: fit-content;
}

.week-btn {
  padding: 10px 28px;
  border: none;
  background: white;
  color: #4f364b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.week-btn.active {
  background: #be8fe9;
  color: white;
}

/* SECTION SUBTITLE */
.section-subtitle {
  color: #4f364b;
  font-size: 1.4rem;
  margin: 0 0 15px 0;
}

/* CLASSES GRID */
.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.class-card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.class-card:hover {
  transform: translateY(-6px);
  border-color: #be8fe9;
  box-shadow: 0 15px 40px rgba(106, 13, 173, 0.15);
}

.class-card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.lesson-badge {
  background: #9C27B0;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}

.slot-badge {
  background: #e9e1f5;
  color: #4f364b;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.lesson-name {
  font-size: 1rem;
  color: #4f364b;
  margin: 0 0 15px 0;
  font-weight: 700;
  line-height: 1.3;
}

.class-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #555;
}

.meta-label {
  font-weight: 600;
  color: #4f364b;
}

.progress-bar {
  height: 4px;
  background: #e9e1f5;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #be8fe9, #9C27B0);
  border-radius: 2px;
  transition: width 0.5s ease;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 60px;
  color: #888;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.loading-text {
  text-align: center;
  color: #888;
  padding: 40px;
  font-size: 1.1rem;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  border-radius: 20px;
  padding: 35px;
  width: 550px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 60px rgba(0,0,0,0.2);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: #888;
}

.modal-title {
  color: #4f364b;
  font-size: 1.3rem;
  margin: 0 0 20px 0;
  padding-right: 30px;
  line-height: 1.4;
}

.modal-info {
  background: #f9f5fd;
  border-radius: 12px;
  padding: 15px 20px;
  margin-bottom: 20px;
}

.modal-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.9rem;
  color: #555;
  border-bottom: 1px solid #ede8f5;
}

.modal-row:last-child { border-bottom: none; }

.modal-label {
  font-weight: 600;
  color: #4f364b;
}

.students-title {
  color: #4f364b;
  font-size: 1rem;
  margin: 0 0 12px 0;
}

.students-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.student-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f0f9;
  border-radius: 8px;
  font-size: 0.9rem;
}

.student-name { color: #4f364b; font-weight: 600; }

.student-category {
  background: #be8fe9;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.empty-students {
  text-align: center;
  padding: 20px;
  color: #888;
  font-style: italic;
}

/* DELETE BUTTON STYLES */
.delete-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

.delete-btn:active {
  transform: translateY(0);
}
.manual-btn {
  padding: 14px 40px;
  background: linear-gradient(135deg, #596aa1, #7b9bc8);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(74, 78, 153, 0.3);
}

.manual-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(143, 153, 243, 0.4);
}
</style>