<template>
    <div class="trends-container">
        <h1 class="trends-title">Exam Analytics Dashboard</h1>
        
        <!-- Summary Cards -->
        <div class="summary-cards">
            <div class="summary-card">
                <div class="card-content">
                    <span class="card-label">Total Exams</span>
                    <span class="card-value">{{ analyticsData.numberOfExams || 0 }}</span>
                </div>
            </div>
            
            <div class="summary-card passed">
                <div class="card-content">
                    <span class="card-label">Passed</span>
                    <span class="card-value">{{ analyticsData.numberOfPassedExams || 0 }}</span>
                    <span class="card-percentage">({{ analyticsData.passPercentage || 0 }}%)</span>
                </div>
            </div>
            
            <div class="summary-card failed">
                <div class="card-content">
                    <span class="card-label">Failed</span>
                    <span class="card-value">{{ analyticsData.numberOfFailedExams || 0 }}</span>
                    <span class="card-percentage">({{ analyticsData.failedPercentage || 0 }}%)</span>
                </div>
            </div>
        </div>

        
        <div class="progress-section">
            <div class="progress-label">
                <span>Pass Rate</span>
                <span class="progress-percentage">{{ analyticsData.passPercentage || 0 }}%</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" 
                     :style="{ width: (analyticsData.passPercentage || 0) + '%' }">
                </div>
            </div>
        </div>

        
        <div class="table-section" v-if="analyticsData.failed && analyticsData.failed.length > 0">
            <h2 class="section-title">Failed Candidates Details</h2>
            <div class="table-container">
                <table class="candidates-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Total Classes</th>
                            <th>Total Hours</th>
                            <th>Avg Classes/Week</th>
                            <th>Avg Hours/Week</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(candidate, index) in analyticsData.failed" :key="index">
                            <td>{{ candidate.candidate_name }} {{ candidate.candidate_lastName }}</td>
                            <td>{{ candidate.candidate_email }}</td>
                            <td>{{ candidate.totalClasses }}</td>
                            <td>{{ candidate.totalHours }}</td>
                            <td>{{ candidate.avgClassAWeek }}</td>
                            <td>{{ candidate.avgHourAWeek }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        
        <div v-else class="no-data">
            <p>No failed candidates data available</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'InstructorTrendsComponent',
    
    data() {
        return {
            analyticsData: {
                failed: [],
                failedPercentage: 0,
                numberOfExams: 0,
                numberOfFailedExams: 0,
                numberOfPassedExams: 0,
                passPercentage: 0
            }
        };
    },

    methods: {
        fetchAnalytics() {
            const token = localStorage.getItem('token');
            
            if (token) {
                axios.get('http://localhost:8080/instructors/getAnalytics', { 
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(response => {
                    this.analyticsData = response.data;
                })
                .catch(error => {
                    console.error('Error fetching analytics:', error);
                });
            }
        }
    },

    mounted() {
        this.fetchAnalytics();
    }
};
</script>

<style scoped>
.trends-container {
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.trends-title {
    color: #3a283c;
    margin-bottom: 30px;
    font-size: 2rem;
    font-weight: 600;
    border-bottom: 2px solid rgb(190, 143, 233);
    padding-bottom: 10px;
}

.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.summary-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    padding: 25px;
    display: flex;
    align-items: center;
    color: white;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.summary-card:hover {
    transform: translateY(-5px);
}

.summary-card.passed {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.summary-card.failed {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.card-icon {
    font-size: 2.5rem;
    margin-right: 20px;
}

.card-content {
    display: flex;
    flex-direction: column;
}

.card-label {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 5px;
}

.card-value {
    font-size: 2rem;
    font-weight: bold;
}

.card-percentage {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-left: 5px;
}

.progress-section {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    margin-bottom: 30px;
}

.progress-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-weight: 600;
    color: #333;
}

.progress-percentage {
    color: #28a745;
    font-size: 1.1rem;
}

.progress-bar-container {
    width: 100%;
    height: 20px;
    background-color: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
    border-radius: 10px;
    transition: width 0.3s ease;
}

.table-section {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.section-title {
    color: #3a283c;
    margin-bottom: 20px;
    font-size: 1.5rem;
    font-weight: 600;
}

.table-container {
    overflow-x: auto;
}

.candidates-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

.candidates-table th {
    background-color: #f8f9fa;
    color: #495057;
    font-weight: 600;
    padding: 15px;
    text-align: left;
    border-bottom: 2px solid #dee2e6;
}

.candidates-table td {
    padding: 15px;
    border-bottom: 1px solid #dee2e6;
    color: #212529;
}

.candidates-table tbody tr:hover {
    background-color: #f8f9fa;
    cursor: pointer;
}

.no-data {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 15px;
    color: #6c757d;
    font-size: 1.1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .summary-cards {
        grid-template-columns: 1fr;
    }
    
    .candidates-table {
        font-size: 0.9rem;
    }
    
    .candidates-table th,
    .candidates-table td {
        padding: 10px;
    }
}
</style>