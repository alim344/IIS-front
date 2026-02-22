<template>
  <div class="analytics-dashboard">
    <h1 class="page-title">Analytics Dashboard</h1>

    <div class="controls-bar">
      <div class="date-inputs">
        <div class="input-group">
          <label>Start Date</label>
          <input type="date" v-model="startDate" @change="fetchAnalytics" />
        </div>
        <div class="input-group">
          <label>End Date</label>
          <input type="date" v-model="endDate" @change="fetchAnalytics" />
        </div>
      </div>
      <button class="export-btn" @click="exportPDF" :disabled="loading">
        <span v-if="exporting">Exporting...</span>
        <span v-else>📄 Export PDF</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading analytics...</p>
    </div>

    <div v-else-if="analytics" class="dashboard-grid">
      
      <div class="summary-cards">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ analytics.totalCandidates }}</h3>
            <p>Total Candidates</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <h3>{{ analytics.totalTheoryClasses }}</h3>
            <p>Theory Classes</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🚗</div>
          <div class="stat-info">
            <h3>{{ analytics.totalPracticalClasses }}</h3>
            <p>Practical Classes</p>
          </div>
        </div>

        <div class="stat-card highlight">
          <div class="stat-icon">🎓</div>
          <div class="stat-info">
            <h3>{{ analytics.candidatesReadyForExam }}</h3>
            <p>Ready for Exam</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <h3>{{ analytics.averageTheoryClassOccupancy }}%</h3>
            <p>Avg Occupancy</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <h3>{{ analytics.averageLessonsCompleted }}</h3>
            <p>Avg Lessons Done</p>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <h2>Candidate Time Preferences</h2>
        <BarChart :data="candidatePreferencesData" :options="chartOptions" />
      </div>

      <div class="chart-card">
        <h2>Theory Classes by Time Slot</h2>
        <BarChart :data="theoryClassesBySlotData" :options="chartOptions" />
      </div>

      <div class="chart-card">
        <h2>Theory Class Enrollement by Slot</h2>
        <LineChart :data="occupancyBySlotData" :options="percentChartOptions" />
      </div>

      <div class="chart-card">
        <h2>Practical Classes by Time Slot</h2>
        <BarChart :data="practicalClassesBySlotData" :options="chartOptions" />
      </div>

      <div class="chart-card">
        <h2>Practical Classes by Instructor</h2>
        <BarChart :data="practicalByInstructorData" :options="chartOptions" />
      </div>

      <div class="chart-card">
        <h2>Completed vs Total by Instructor</h2>
        <BarChart :data="completedVsTotalData" :options="chartOptions" />
      </div>

      <div class="chart-card">
        <h2>Candidates by Category</h2>
        <PieChart :data="candidatesByCategoryData" :options="pieChartOptions" />
      </div>

      <div class="chart-card">
        <h2>Candidates by Status</h2>
        <DoughnutChart :data="candidatesByStatusData" :options="pieChartOptions" />
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Bar as BarChart, Line as LineChart, Pie as PieChart, Doughnut as DoughnutChart } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default {
  components: { BarChart, LineChart, PieChart, DoughnutChart },

  data() {
    return {
      analytics: null,
      loading: true,
      exporting: false,
      startDate: this.getDefaultStartDate(),
      endDate: this.getDefaultEndDate(),

      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      },

      percentChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => value + '%'
            }
          }
        }
      },

      pieChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    };
  },

  computed: {
    candidatePreferencesData() {
      if (!this.analytics) return null;
      return {
        labels: Object.keys(this.analytics.candidatePreferences),
        datasets: [{
          label: 'Candidates',
          data: Object.values(this.analytics.candidatePreferences),
          backgroundColor: '#be8fe9'
        }]
      };
    },

    theoryClassesBySlotData() {
      if (!this.analytics) return null;
      return {
        labels: Object.keys(this.analytics.theoryClassesBySlot),
        datasets: [{
          label: 'Classes',
          data: Object.values(this.analytics.theoryClassesBySlot),
          backgroundColor: '#9C27B0'
        }]
      };
    },

    occupancyBySlotData() {
      if (!this.analytics) return null;
      return {
        labels: Object.keys(this.analytics.occupancyBySlot),
        datasets: [{
          label: 'Occupancy %',
          data: Object.values(this.analytics.occupancyBySlot),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }]
      };
    },

    practicalClassesBySlotData() {
      if (!this.analytics) return null;
      return {
        labels: Object.keys(this.analytics.practicalClassesBySlot),
        datasets: [{
          label: 'Classes',
          data: Object.values(this.analytics.practicalClassesBySlot),
          backgroundColor: '#FF9800'
        }]
      };
    },

    practicalByInstructorData() {
      if (!this.analytics) return null;
      return {
        labels: Object.keys(this.analytics.practicalClassesByInstructor),
        datasets: [{
          label: 'Total Classes',
          data: Object.values(this.analytics.practicalClassesByInstructor),
          backgroundColor: '#2196F3'
        }]
      };
    },

    completedVsTotalData() {
      if (!this.analytics) return null;
      const instructors = Object.keys(this.analytics.practicalClassesByInstructor);
      return {
        labels: instructors,
        datasets: [
          {
            label: 'Total',
            data: instructors.map(i => this.analytics.practicalClassesByInstructor[i]),
            backgroundColor: '#2196F3'
          },
          {
            label: 'Completed',
            data: instructors.map(i => this.analytics.completedPracticalByInstructor[i] || 0),
            backgroundColor: '#4CAF50'
          }
        ]
      };
    },

    candidatesByCategoryData() {
      if (!this.analytics) return null;
      return {
        labels: Object.keys(this.analytics.candidatesByCategory),
        datasets: [{
          data: Object.values(this.analytics.candidatesByCategory),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
        }]
      };
    },

    candidatesByStatusData() {
      if (!this.analytics) return null;
      return {
        labels: Object.keys(this.analytics.candidatesByStatus),
        datasets: [{
          data: Object.values(this.analytics.candidatesByStatus),
          backgroundColor: ['#9C27B0', '#FF9800', '#4CAF50', '#F44336']
        }]
      };
    }
  },

  mounted() {
    this.fetchAnalytics();
  },

  methods: {
    getDefaultStartDate() {
      const date = new Date();
      date.setMonth(date.getMonth() - 3);
      return date.toISOString().split('T')[0];
    },

    getDefaultEndDate() {
      return new Date().toISOString().split('T')[0];
    },

    async fetchAnalytics() {
      this.loading = true;
      try {
        const response = await axios.get('http://localhost:8080/analytics', {
          params: {
            startDate: this.startDate,
            endDate: this.endDate
          },
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        });
        this.analytics = response.data;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        alert('Failed to load analytics');
      } finally {
        this.loading = false;
      }
    },

    async exportPDF() {
      this.exporting = true;
      try {
        const response = await axios.get('http://localhost:8080/analytics/export-pdf', {
          params: {
            startDate: this.startDate,
            endDate: this.endDate
          },
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          },
          responseType: 'blob'
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF');
      } finally {
        this.exporting = false;
      }
    }
  }
};
</script>

<style scoped>
.analytics-dashboard {
  padding: 40px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  color: #4f364b;
  margin-bottom: 30px;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.date-inputs {
  display: flex;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-weight: 600;
  color: #4f364b;
  font-size: 0.9rem;
}

.input-group input {
  padding: 10px 15px;
  border: 2px solid #e9e1f5;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #be8fe9;
}

.export-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #4CAF50, #388e3c);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

@keyframes spin { to { transform: rotate(360deg); } }

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 25px;
}

.summary-cards {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(145deg, #ffffff, #f5f0f9);
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  border: 2px solid #e9e1f5;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(190, 143, 233, 0.15);
}

.stat-card.highlight {
  border-color: #4CAF50;
  background: linear-gradient(145deg, #e8f5e9, #f1f8e9);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info h3 {
  font-size: 2rem;
  color: #4f364b;
  margin: 0;
  font-weight: 800;
}

.stat-info p {
  margin: 5px 0 0 0;
  color: #888;
  font-size: 0.9rem;
}

.chart-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  border: 2px solid #e9e1f5;
  height: 400px;
}

.chart-card h2 {
  color: #4f364b;
  font-size: 1.2rem;
  margin: 0 0 20px 0;
}

.chart-card canvas {
  max-height: 320px;
}
</style>