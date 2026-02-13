<template>
  <div class="schedule-container">
    <h1 class="page-title">My Class Schedule</h1>

    <div v-if="loading" class="loading">Loading schedule...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <!-- Kalendar - možeš koristiti sličan kao za instruktora -->
      <div class="classes-list">
        <h2>Upcoming Classes</h2>
        
        <div v-if="upcomingClasses.length === 0" class="no-classes">
          No upcoming classes scheduled.
        </div>

        <div v-else class="class-cards">
          <div v-for="classItem in upcomingClasses" :key="classItem.id" class="class-card">
            <div class="class-header">
              <span class="class-type">{{ classItem.classType }}</span>
              <span class="class-status" :class="classItem.status">{{ classItem.status }}</span>
            </div>
            <div class="class-body">
              <div class="class-info">
                <span class="label">Date:</span>
                <span>{{ formatDate(classItem.dateTime) }}</span>
              </div>
              <div class="class-info">
                <span class="label">Time:</span>
                <span>{{ formatTime(classItem.dateTime) }}</span>
              </div>
              <div class="class-info" v-if="classItem.instructor">
                <span class="label">Instructor:</span>
                <span>{{ classItem.instructor.name }} {{ classItem.instructor.lastName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      upcomingClasses: [],
      loading: true,
      error: null
    }
  },

  mounted() {
    this.fetchSchedule();
  },

  methods: {
    async fetchSchedule() {
      try {
        this.loading = true;
        const response = await axios.get("http://localhost:8080/api/candidate/schedule", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.upcomingClasses = response.data;
      } catch (error) {
        console.error("Error fetching schedule:", error);
        this.error = "Failed to load schedule.";
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateTime) {
      return new Date(dateTime).toLocaleDateString('en-GB');
    },

    formatTime(dateTime) {
      return new Date(dateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
  }
}
</script>

<style scoped>
/* Koristi isti stil kao InstructorProfileComponent */
</style>