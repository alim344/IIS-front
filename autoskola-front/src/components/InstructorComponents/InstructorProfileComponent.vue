<template>
  <div class="profile-container">
    <h1 class="page-title">My Profile</h1>

    <div v-if="loading" class="loading">Loading profile...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="instructor" class="profile-card">


      <div class="info-section">
        <h2>Personal Information</h2>

        <div class="info-grid">

          <div class="info-item">
            <span class="label">Name:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value">{{ instructor.name }} {{ instructor.lastName }}</span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <span class="label">Email:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value">{{ instructor.email }}</span>
              </div>
            </div>
          </div>


          <div class="info-item">
            <span class="label">Username:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value">{{ instructor.username }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="documents-section">
        <h2>My Licenses & Documents</h2>

        <div class="documents-grid">
          <div v-for="doc in instructor.documents" :key="doc.documentType" class="document-card">
            <div class="document-header">
              <span class="doc-type">{{ formatDocumentType(doc.documentType) }}</span>
            </div>
            <div class="document-body">
              <div class="info-row">
                <span class="label">Expiry Date:</span>
                <span :class="{ 'expiry-warning': isExpiringSoon(doc.expiryDate) }">
                  {{ formatDate(doc.expiryDate) }}
                </span>
              </div>
              <div class="info-row" v-if="doc.issuedDate">
                <span class="label">Issued Date:</span>
                <span>{{ formatDate(doc.issuedDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <h2>Quick Overview</h2>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ instructor.documents?.length || 0 }}</div>
            <div class="stat-label">Active Documents</div>
          </div>

          <div class="stat-card" v-if="instructor.vehicle">
            <div class="stat-value">🚗</div>
            <div class="stat-label">Vehicle Assigned</div>
            <div class="stat-detail">{{ instructor.vehicle.registrationNumber }}</div>
          </div>

          <div class="stat-card" v-else>
            <div class="stat-value">❌</div>
            <div class="stat-label">No Vehicle Assigned</div>
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
      instructor: null,
      loading: true,
      error: null
    }
  },

  mounted() {
    this.fetchMyProfile();
  },

  methods: {
    async fetchMyProfile() {
      try {
        this.loading = true;
        const response = await axios.get("http://localhost:8080/instructors/me", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.instructor = response.data;
      } catch (error) {
        console.error("Error fetching profile:", error);
        this.error = "Failed to load profile.";

        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          this.$router.push("/login");
        }
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-GB');
    },

    formatDocumentType(type) {
      const types = {
        'DRIVING_LICENSE': 'Driving License',
        'INSTRUCTOR_LICENSE': 'Instructor License',
        'MEDICAL_CERTIFICATE': 'Medical Certificate',
        'ID_CARD': 'ID Card',
        'PASSPORT': 'Passport'
      };
      return types[type] || type;
    },

    isExpiringSoon(date) {
      if (!date) return false;
      const expiryDate = new Date(date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30;
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 1200px;
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

.profile-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.info-section,
.documents-section,
.stats-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e9e1f5;
}

.info-section:last-child,
.documents-section:last-child,
.stats-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

h2 {
  color: #4f364b;
  margin-bottom: 20px;
  font-size: 1.8rem;
}

h3 {
  color: #6b4a67;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 20px;
  background: #f8f4fc;
  border-radius: 12px;
  transition: all 0.3s ease;
  min-height: 44px;
}

.info-item:hover {
  background: #f0e8fa;
  transform: translateX(5px);
}

.label {
  font-weight: 600;
  color: #4f364b;
  min-width: 100px;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.value-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.display-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.value {
  font-size: 1rem;
  color: #2c1f2d;
  font-weight: 500;
  flex: 1;
  text-align: left;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.document-card {
  background: #f8f4fc;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.document-card:hover {
  border-color: #be8fe9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(190, 143, 233, 0.2);
}

.document-header {
  border-bottom: 2px solid #e9e1f5;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.doc-type {
  font-weight: 600;
  color: #4f364b;
  font-size: 1.1rem;
}

.document-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expiry-warning {
  color: #dc3545;
  font-weight: 600;
  position: relative;
}

.expiry-warning::after {
  content: "⚠️";
  margin-left: 5px;
  font-size: 0.9rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #f8f4fc, #f0e8fa);
  border-radius: 12px;
  padding: 25px 20px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  border-color: #be8fe9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(190, 143, 233, 0.2);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4f364b;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1rem;
  color: #6b5b7a;
  margin-bottom: 5px;
}

.stat-detail {
  font-size: 0.9rem;
  color: #be8fe9;
  font-weight: 600;
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

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    padding: 15px;
  }

  .profile-card {
    padding: 20px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    min-height: auto;
    padding: 16px;
  }

  .label {
    min-width: auto;
  }

  .value-container {
    width: 100%;
  }

  .display-value {
    flex-direction: row;
    align-items: center;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  h2 {
    font-size: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
  }
}
</style>