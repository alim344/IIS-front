<template>
  <div class="progress-container">
    <h1 class="page-title">My Learning Progress</h1>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your progress...</p>
    </div>

    <div v-else class="progress-cards">
      <!-- THEORY PROGRESS -->
      <div class="progress-card">
        <div class="card-icon">📚</div>
        <h3>Theory Classes</h3>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill theory" :style="{ width: theoryProgress + '%' }"></div>
          </div>
          <span class="percentage">{{ Math.round(theoryProgress) }}%</span>
        </div>
        <p class="progress-text">
          <strong>{{ theoryAttended }}</strong> / <strong>{{ theoryTotal }}</strong> lessons completed
        </p>
        <div v-if="theoryProgress >= 100" class="status-badge completed">
          ✓ Theory Completed
        </div>
        <div v-else class="status-badge in-progress">
          In Progress
        </div>
      </div>

      <!-- PRACTICAL PROGRESS -->
      <div class="progress-card">
        <div class="card-icon">🚗</div>
        <h3>Practical Classes</h3>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill practical" :style="{ width: practicalProgress + '%' }"></div>
          </div>
          <span class="percentage">{{ Math.round(practicalProgress) }}%</span>
        </div>
        <p class="progress-text">
          <strong>{{ practicalAttended }}</strong> / <strong>{{ practicalTotal }}</strong> classes completed
        </p>
        <div v-if="practicalProgress >= 100" class="status-badge completed">
          ✓ Practical Completed
        </div>
        <div v-else-if="theoryProgress >= 100" class="status-badge in-progress">
          In Progress
        </div>
        <div v-else class="status-badge locked">
          🔒 Complete theory first
        </div>
      </div>

      <!-- OVERALL STATUS -->
      <div class="progress-card overall">
        <div class="card-icon">🎓</div>
        <h3>Overall Status</h3>
        <div class="status-info">
          <div class="status-row">
            <span class="label">Current Status:</span>
            <span class="value status-value" :class="statusClass">{{ currentStatus }}</span>
          </div>
          <div class="status-row">
            <span class="label">Category:</span>
            <span class="value">{{ category }}</span>
          </div>
          <div v-if="isReadyForExam" class="exam-ready">
            <div class="exam-icon">✨</div>
            <p>You're ready to take the exam!</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-card">
      ⚠ {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      theoryAttended: 0,
      theoryTotal: 40,
      practicalAttended: 0,
      practicalTotal: 40,
      currentStatus: '',
      category: '',
      loading: true,
      error: null
    };
  },

  computed: {
    theoryProgress() {
      return (this.theoryAttended / this.theoryTotal) * 100;
    },

    practicalProgress() {
      return (this.practicalAttended / this.practicalTotal) * 100;
    },

    isReadyForExam() {
      return this.currentStatus === 'PENDING';
    },

    statusClass() {
      const statusMap = {
        'THEORY': 'status-theory',
        'PRACTICAL': 'status-practical',
        'PENDING': 'status-pending',
        'COMPLETED': 'status-completed'
      };
      return statusMap[this.currentStatus] || '';
    }
  },

  methods: {
    async fetchProgress() {
      this.loading = true;
      this.error = null;

      try {
        // Fetch theory progress
        const theoryResponse = await axios.get(
          'http://localhost:8080/candidates/progress/theory',
          {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token')
            }
          }
        );

        this.theoryAttended = theoryResponse.data.attended;
        this.theoryTotal = theoryResponse.data.total;

        // Fetch practical progress
        const practicalResponse = await axios.get(
          'http://localhost:8080/candidates/progress/practical',
          {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token')
            }
          }
        );

        this.practicalAttended = practicalResponse.data.attended;
        this.practicalTotal = practicalResponse.data.total;

        // Fetch profile for status and category
        const profileResponse = await axios.get(
          'http://localhost:8080/candidates/myprofile',
          {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token')
            }
          }
        );

        this.currentStatus = profileResponse.data.status || 'THEORY';
        this.category = profileResponse.data.category || 'B';

      } catch (error) {
        console.error('Error fetching progress:', error);
        this.error = 'Failed to load progress data. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  },

  mounted() {
    this.fetchProgress();
  }
};
</script>

<style scoped>
.progress-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  color: #4f364b;
  margin-bottom: 40px;
}

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

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
}

.progress-card {
  background: linear-gradient(145deg, #ffffff, #f8f4fc);
  border: 2px solid #e9e1f5;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.progress-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(190, 143, 233, 0.15);
}

.progress-card.overall {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #f5f0f9, #fef9fb);
}

.card-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 15px;
}

.progress-card h3 {
  text-align: center;
  font-size: 1.5rem;
  color: #4f364b;
  margin: 0 0 20px 0;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 15px 0;
}

.progress-bar {
  flex: 1;
  height: 24px;
  background: #e9e1f5;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.6s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill.theory {
  background: linear-gradient(90deg, #be8fe9, #9C27B0);
}

.progress-fill.practical {
  background: linear-gradient(90deg, #4CAF50, #2e7d32);
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.percentage {
  font-size: 1.2rem;
  font-weight: 700;
  color: #4f364b;
  min-width: 60px;
  text-align: right;
}

.progress-text {
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  margin: 10px 0 20px 0;
}

.progress-text strong {
  color: #4f364b;
  font-size: 1.3rem;
}

.status-badge {
  text-align: center;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 0.95rem;
  margin-top: 15px;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #2e7d32;
  border: 2px solid #4CAF50;
}

.status-badge.in-progress {
  background: #fff3e0;
  color: #e65100;
  border: 2px solid #FF9800;
}

.status-badge.locked {
  background: #f5f5f5;
  color: #888;
  border: 2px solid #ccc;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-radius: 12px;
  border: 2px solid #e9e1f5;
}

.status-row .label {
  font-weight: 600;
  color: #666;
  font-size: 1rem;
}

.status-row .value {
  font-weight: 700;
  color: #4f364b;
  font-size: 1.1rem;
}

.status-value {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.95rem;
}

.status-theory {
  background: #e3f2fd;
  color: #1976d2;
}

.status-practical {
  background: #e8f5e9;
  color: #388e3c;
}

.status-pending {
  background: #fff3e0;
  color: #f57c00;
}

.status-completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.exam-ready {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  border: 2px solid #ffd54f;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
}

.exam-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.exam-ready p {
  margin: 0;
  font-weight: 700;
  color: #f57c00;
  font-size: 1.1rem;
}

.error-card {
  background: #ffebee;
  border: 2px solid #f44336;
  border-radius: 15px;
  padding: 20px;
  color: #c62828;
  font-weight: 600;
  text-align: center;
  margin-top: 20px;
}
</style>