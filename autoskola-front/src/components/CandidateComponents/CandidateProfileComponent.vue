<template>
  <div class="profile-container">
    <h1 class="page-title">My Profile</h1>

    <div v-if="loading" class="loading">Loading profile...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="candidate" class="profile-card">
      
      <div class="info-section">
        <h2>Personal Information</h2>

        <div class="info-grid">
          <div class="info-item">
            <span class="label">First Name:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value">{{ candidate.firstName }}</span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <span class="label">Last Name:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value">{{ candidate.lastName }}</span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <span class="label">Email:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value">{{ candidate.email }}</span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <span class="label">Username:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value">{{ candidate.username }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="edit-button-container">
          <button class="edit-btn" @click="showEditModal = true">
            <span class="btn-icon">✏️</span> Edit Profile
          </button>
        </div>
      </div>

      <!-- DIVIDER -->
      <div class="section-divider">
        <span class="divider-text">Training Information</span>
      </div>

      <div class="info-section">
        <h2>Training Details</h2>

        <div class="info-grid">
          <div class="info-item">
            <span class="label">Category:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value">{{ candidate.category || 'Not assigned' }}</span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <span class="label">Status:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value status-badge" :class="statusClass">
                  {{ candidate.status || 'PENDING' }}
                </span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <span class="label">Instructor:</span>
            <div class="value-container">
              <div class="display-value">
                <span v-if="candidate.instructor" class="value">
                  {{ candidate.instructor }}
                </span>
                <span v-else class="value not-assigned">
                  <span class="icon">⏳</span> Not yet assigned
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <h2>Learning Progress</h2>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ candidate.theoryClassesAttended || 0 }}</div>
            <div class="stat-label">Theory Classes Attended</div>
            <div class="stat-detail">of 40 required</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: theoryProgress + '%' }"></div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-value">{{ candidate.practicalClassesAttended || 0 }}</div>
            <div class="stat-label">Practical Classes Attended</div>
            <div class="stat-detail">of 40 required</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: practicalProgress + '%' }"></div>
            </div>
          </div>

          <div class="stat-card" v-if="candidate.category">
            <div class="stat-value">🚘</div>
            <div class="stat-label">Category</div>
            <div class="stat-detail">{{ candidate.category }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Profile</h3>
          <button class="modal-close-btn" @click="closeEditModal">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label>First Name</label>
              <input 
                v-model="editForm.firstName" 
                type="text" 
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label>Last Name</label>
              <input 
                v-model="editForm.lastName" 
                type="text" 
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input 
                v-model="editForm.email" 
                type="email" 
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label>Username</label>
              <input 
                v-model="editForm.username" 
                type="text" 
                class="form-input"
                required
              />
            </div>

            <div class="modal-actions">
              <button type="button" class="cancel-btn" @click="closeEditModal">Cancel</button>
              <button type="submit" class="save-btn" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>

          <div v-if="updateError" class="error-message">{{ updateError }}</div>
          <div v-if="updateSuccess" class="success-message">{{ updateSuccess }}</div>
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
      candidate: null,
      loading: true,
      error: null,
      showEditModal: false,
      saving: false,
      updateError: null,
      updateSuccess: null,
      editForm: {
        firstName: '',
        lastName: '',
        email: '',
        username: ''
      }
    }
  },

  computed: {
    theoryProgress() {
      return Math.min(((this.candidate?.theoryClassesAttended || 0) / 40) * 100, 100);
    },
    practicalProgress() {
      return Math.min(((this.candidate?.practicalClassesAttended || 0) / 40) * 100, 100);
    },
    statusClass() {
      const status = this.candidate?.status?.toUpperCase();
      return {
        'status-active': status === 'ACTIVE',
        'status-pending': status === 'PENDING',
        'status-completed': status === 'COMPLETED'
      };
    }
  },

  mounted() {
    this.fetchMyProfile();
  },

  methods: {
    async fetchMyProfile() {
      try {
        this.loading = true;
        const response = await axios.get("http://localhost:8080/candidates/myprofile", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.candidate = response.data;
        
        // Populate edit form
        this.editForm = {
          firstName: this.candidate.firstName,
          lastName: this.candidate.lastName,
          email: this.candidate.email,
          username: this.candidate.username
        };
        
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

    async updateProfile() {
      try {
        this.saving = true;
        this.updateError = null;
        this.updateSuccess = null;

        const token = localStorage.getItem("token");

        const response = await axios.put(
          `http://localhost:8080/candidates/myprofile`,
          this.editForm,
          {
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json"
            }
          }
        );

        this.candidate = { ...this.candidate, ...response.data };
        this.updateSuccess = "Profile updated successfully!";
        
        setTimeout(() => {
          this.closeEditModal();
        }, 1500);

      } catch (error) {
        console.error("Error updating profile:", error);
        this.updateError = error.response?.data?.message || "Failed to update profile.";
      } finally {
        this.saving = false;
      }
    },

    closeEditModal() {
      this.showEditModal = false;
      this.updateError = null;
      this.updateSuccess = null;
      this.editForm = {
        firstName: this.candidate.firstName,
        lastName: this.candidate.lastName,
        email: this.candidate.email,
        username: this.candidate.username
      };
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

/* Section Divider */
.section-divider {
  display: flex;
  align-items: center;
  margin: 40px 0;
  position: relative;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  border-bottom: 3px solid #e9e1f5;
}

.divider-text {
  padding: 0 20px;
  color: #be8fe9;
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-section,
.stats-section {
  margin-bottom: 40px;
}

h2 {
  color: #4f364b;
  margin-bottom: 20px;
  font-size: 1.8rem;
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
  min-width: 150px;
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
  width: 100%;
}

.value {
  font-size: 1rem;
  color: #2c1f2d;
  font-weight: 500;
}

/* Status Badge */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-pending {
  background: #fff3e0;
  color: #e65100;
}

.status-completed {
  background: #e3f2fd;
  color: #1565c0;
}

/* Not Assigned */
.not-assigned {
  color: #999;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}

.not-assigned .icon {
  font-size: 1.2rem;
}

/* Edit Button */
.edit-button-container {
  margin-top: 25px;
  text-align: right;
}

.edit-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(190, 143, 233, 0.4);
}

.btn-icon {
  font-size: 1.1rem;
}

/* Stats Section */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
  margin-bottom: 10px;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #be8fe9, #9C27B0);
  transition: width 0.6s ease;
  border-radius: 10px;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f2fb;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #3a283c;
  font-size: 1.3rem;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #9C27B0;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.modal-close-btn:hover {
  background-color: rgba(156, 39, 176, 0.1);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4f364b;
}

.form-input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e9e1f5;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #be8fe9;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn, .save-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border: none;
}

.cancel-btn {
  background: #f0f0f0;
  color: #333;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.save-btn {
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(190, 143, 233, 0.4);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background: #ffebee;
  color: #c62828;
  border-radius: 6px;
  font-size: 0.9rem;
}

.success-message {
  margin-top: 15px;
  padding: 10px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 6px;
  font-size: 0.9rem;
}

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
    padding: 16px;
  }

  .label {
    min-width: auto;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
  }
}
</style>