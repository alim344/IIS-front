<template>
  <div class="instructors-section">
    <h1 class="page-title">Instructors</h1>

    <div class="instructors-grid">
      <div
          class="instructor-card"
          v-for="instructor in instructors"
          :key="instructor.username"
          @click="openInstructorDetails(instructor.id)"
      >
        <div class="card-header">
          <h2>{{ instructor.name }} {{ instructor.lastName }}</h2>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">Username:</span>
            <span>{{ instructor.username }}</span>
          </div>

          <div class="info-row">
            <span class="label">Email:</span>
            <span>{{ instructor.email }}</span>
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
      instructors: []
    }
  },

  mounted() {
    this.fetchInstructors();
  },

  methods: {
    async fetchInstructors() {
      try {
        const response = await axios.get("http://localhost:8080/instructors/all", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.instructors = response.data;
      } catch (error) {
        console.error("Error fetching instructors:", error);
      }
    },

    openInstructorDetails(instructorId) {
      this.$router.push(`/adminHome/instructors/${instructorId}`);
    }
  }
}
</script>

<style scoped>

.instructors-section {
  padding: -5px 40px 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #4f364b;
}

.instructors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.instructor-card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid transparent;
  cursor: pointer;
}

.instructor-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow:
      0 15px 40px rgba(106, 13, 173, 0.2),
      0 0 25px rgba(190, 143, 233, 0.3);
  border-color: #be8fe9;
  background: linear-gradient(145deg, #fef9fb, #f5f0f9);
}

.card-header {
  border-bottom: 2px solid #e9e1f5;
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.card-header h2 {
  margin: 0;
  color: #4f364b;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: 600;
  color: #4f364b;
}

</style>