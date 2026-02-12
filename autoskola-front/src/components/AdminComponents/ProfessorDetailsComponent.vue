<template>
  <div class="professor-details">
    <button class="back-button" @click="goBack">← Back to Professors</button>

    <div v-if="loading" class="loading">Loading professor details...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="professor" class="details-container">
      <h1 class="page-title">Professor Details</h1>

      <div class="details-card">
        <div class="personal-info">
          <h2>Personal Information</h2>

          <div class="info-grid">
            <div class="info-item">
              <span class="label">Name:</span>
              <div class="value-container">
                <div v-if="!editMode.name" class="display-value">
                  <span class="full-name">{{ professor.name }} {{ professor.lastName }}</span>
                  <button class="icon-btn edit-btn" @click="toggleEdit('name')" title="Edit name">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <div v-else class="edit-mode">
                  <div class="input-group">
                    <div class="input-wrapper">
                      <input
                          v-model="editedProfessor.name"
                          placeholder="First name"
                          class="modern-input"
                      />
                    </div>
                    <div class="input-wrapper">
                      <input
                          v-model="editedProfessor.lastName"
                          placeholder="Last name"
                          class="modern-input"
                      />
                    </div>
                  </div>
                  <div class="action-buttons">
                    <button class="action-btn save" @click="saveNameChanges">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                      </svg>
                      Save
                    </button>
                    <button class="action-btn cancel" @click="cancelNameEdit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                      </svg>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-item">
              <span class="label">Email:</span>
              <span class="value">{{ professor.email }}</span>
            </div>

            <div class="info-item">
              <span class="label">Username:</span>
              <span class="value">{{ professor.username }}</span>
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
      professor: null,
      loading: true,
      error: null,
      editMode: {
        name: false
      },
      editedProfessor: {
        name: '',
        lastName: ''
      }
    }
  },

  mounted() {
    this.fetchProfessorDetails();
  },

  methods: {
    async fetchProfessorDetails() {
      try {
        this.loading = true;
        const professorId = this.$route.params.id;
        const response = await axios.get(`http://localhost:8080/professors/${professorId}`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.professor = response.data;
        this.cancelNameEdit();
      } catch (error) {
        console.error("Error fetching professor details:", error);
        this.error = "Failed to load professor details.";
      } finally {
        this.loading = false;
      }
    },

    toggleEdit(field) {
      if (field === 'name') {
        this.editMode.name = true;
        this.editedProfessor = {
          name: this.professor.name || '',
          lastName: this.professor.lastName || ''
        };
      }
    },

    cancelNameEdit() {
      this.editMode.name = false;
      this.editedProfessor = {
        name: this.professor?.name || '',
        lastName: this.professor?.lastName || ''
      };
    },

    async saveNameChanges() {
      if (!this.editedProfessor.name.trim() || !this.editedProfessor.lastName.trim()) {
        alert("Both first name and last name are required.");
        return;
      }

      try {
        const updateData = {
          name: this.editedProfessor.name,
          lastName: this.editedProfessor.lastName
        };

        await axios.put(
            `http://localhost:8080/professors/update/${this.professor.id}`,
            updateData,
            {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
              }
            }
        );

        this.editMode.name = false;
        await this.fetchProfessorDetails();
      } catch (error) {
        console.error("Error updating professor name:", error);
        alert("Failed to update professor name.");
      }
    },

    goBack() {
      this.$router.push('/adminHome/professors');
    }
  }
}
</script>

<style scoped>
.professor-details {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  background: none;
  border: none;
  color: #4f364b;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 10px 0;
  margin-bottom: 20px;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.back-button:hover {
  transform: translateX(-5px);
  color: #be8fe9;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #3a2a3c;
  position: relative;
  width: 100%;
  font-weight: 600;
  letter-spacing: 1px;
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

.details-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.personal-info {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e9e1f5;
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
  min-width: 100px;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  align-self: center;
  margin-top: 0px;
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

.full-name {
  font-size: 1rem;
  color: #2c1f2d;
  font-weight: 500;
  flex: 1;
  text-align: left;
}

.value {
  font-size: 0.95rem;
  color: #2c1f2d;
  flex: 1;
  text-align: left;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: white;
  border: 1.5px solid #e9e1f5;
  color: #6b4a67;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 0;
  flex-shrink: 0;
  margin-left: 10px;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

.icon-btn:hover {
  background: #be8fe9;
  border-color: #be8fe9;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
}

.icon-btn:hover svg {
  transform: rotate(15deg);
}

.edit-mode {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.input-group {
  display: flex;
  gap: 1px;
  width: auto;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.modern-input {
  width: 180px;
  padding: 8px 12px;
  border: 2px solid #e9e1f5;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: white;
  color: #2c1f2d;
  height: 30px;
}

.modern-input:focus {
  border-color: #be8fe9;
  outline: none;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.1);
}

.modern-input:hover {
  border-color: #a06bc0;
}

.modern-input::placeholder {
  color: #aaa;
  font-size: 0.85rem;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  width: auto;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none;
  color: white;
  min-width: 90px;
  height: 36px;
}

.action-btn svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.action-btn:hover svg {
  transform: scale(1.2);
}

.action-btn.save {
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
}

.action-btn.save:hover {
  background: linear-gradient(135deg, #a06bc0, #8a5bb0);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(190, 143, 233, 0.4);
}

.action-btn.cancel {
  background: linear-gradient(135deg, #d9c2f0, #c4a8e6);
  color: #4a3a5c;
  box-shadow: 0 4px 12px rgba(201, 173, 227, 0.2);
}

.action-btn.cancel:hover {
  background: linear-gradient(135deg, #c4a8e6, #b392d9);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(190, 143, 233, 0.3);
  color: #2c1f2d;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.error {
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .professor-details {
    padding: 15px;
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

  .input-group {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .display-value {
    flex-direction: row;
    align-items: center;
  }
}
</style>