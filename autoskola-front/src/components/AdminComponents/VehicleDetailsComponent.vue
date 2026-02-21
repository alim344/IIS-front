<template>
  <div class="vehicle-details">
    <button class="back-button" @click="goBack">← Back to Vehicles</button>

    <div v-if="loading" class="loading">Loading vehicle details...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="vehicle" class="details-container">
      <h1 class="page-title">Vehicle Details</h1>

      <div class="details-card">

        <div class="info-section">
          <h2>Vehicle Information</h2>

          <div class="info-grid">

            <div class="info-item">
              <span class="label">Registration:</span>
              <div class="value-container">
                <div v-if="!editMode.registrationNumber" class="display-value">
                  <span class="value">{{ vehicle.registrationNumber }}</span>
                  <button class="icon-btn edit-btn" @click="toggleEdit('registrationNumber')" title="Edit registration">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <div v-else class="edit-mode">
                  <input
                      v-model="editedVehicle.registrationNumber"
                      type="text"
                      class="modern-input"
                      placeholder="Registration number"
                  />
                  <div class="action-buttons">
                    <button class="action-btn save" @click="saveChanges('registrationNumber')">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                      </svg>
                      Save
                    </button>
                    <button class="action-btn cancel" @click="cancelEdit('registrationNumber')">
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
              <span class="label">Status:</span>
              <div class="value-container">
                <div v-if="!editMode.status" class="display-value">
                  <span class="status-badge" :class="getStatusClass(vehicle.status)">
                    {{ formatStatus(vehicle.status) }}
                  </span>
                  <button class="icon-btn edit-btn" @click="toggleEdit('status')" title="Edit status">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <div v-else class="edit-mode">
                  <select v-model="editedVehicle.status" class="modern-select">
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In use</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                  </select>
                  <div class="action-buttons">
                    <button class="action-btn save" @click="saveChanges('status')">Save</button>
                    <button class="action-btn cancel" @click="cancelEdit('status')">Cancel</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-item">
              <span class="label">Current Mileage:</span>
              <div class="value-container">
                <div v-if="!editMode.currentMileage" class="display-value">
                  <span class="value">{{ vehicle.currentMileage }} km</span>
                  <button class="icon-btn edit-btn" @click="toggleEdit('currentMileage')" title="Edit mileage">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <div v-else class="edit-mode">
                  <input
                      v-model="editedVehicle.currentMileage"
                      type="number"
                      class="modern-input"
                      placeholder="Mileage (km)"
                      min="0"
                  />
                  <div class="action-buttons">
                    <button class="action-btn save" @click="saveChanges('currentMileage')">Save</button>
                    <button class="action-btn cancel" @click="cancelEdit('currentMileage')">Cancel</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-item">
              <span class="label">Reg. Expiry Date:</span>
              <div class="value-container">
                <div v-if="!editMode.registrationExpiryDate" class="display-value">
                  <span class="value" :class="{ 'expiry-warning': isExpiringSoon(vehicle.registrationExpiryDate) }">
                    {{ formatDate(vehicle.registrationExpiryDate) }}
                  </span>
                  <button class="icon-btn edit-btn" @click="toggleEdit('registrationExpiryDate')" title="Edit expiry date">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <div v-else class="edit-mode">
                  <input
                      v-model="editedVehicle.registrationExpiryDate"
                      type="date"
                      class="modern-input"
                  />
                  <div class="action-buttons">
                    <button class="action-btn save" @click="saveChanges('registrationExpiryDate')">Save</button>
                    <button class="action-btn cancel" @click="cancelEdit('registrationExpiryDate')">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="actions-section">
          <h2>Vehicle Actions</h2>

          <div class="action-cards">

            <div class="action-card" v-if="vehicle.status !== 'OUT_OF_SERVICE'">
              <h3>Report Vehicle Out of Service</h3>
              <p>Mark this vehicle as out of service. This will unassign it from any instructor.</p>
              <button class="action-btn danger" @click="reportOutOfService" :disabled="actionLoading">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
                Report Out of Service
              </button>
            </div>

            <div class="action-card" v-if="vehicle.status === 'OUT_OF_SERVICE'">
              <h3>Return Vehicle to Service</h3>
              <p>Mark this vehicle as available again.</p>
              <button class="action-btn success" @click="returnToService" :disabled="actionLoading">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
                Return to Service
              </button>
            </div>
          </div>
        </div>

        <div class="statistics-section">
          <div class="section-header">
            <h2>Monthly Statistics</h2>
            <div class="header-actions">
              <select v-model="selectedMonth" @change="fetchVehicleStats" class="month-select">
                <option v-for="month in availableMonths" :key="month.value" :value="month.value">
                  {{ month.label }}
                </option>
              </select>
              <button class="pdf-btn" @click="downloadPdf" :disabled="!vehicleStats || pdfLoading">
                <span v-if="pdfLoading" class="spinner-small"></span>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
                  <path d="M6 9h12v2H6zm0 4h8v2H6z" fill="white"/>
                </svg>
                PDF Report
              </button>
            </div>
          </div>

          <div v-if="statsLoading" class="loading-small">
            <div class="spinner"></div>
            <p>Loading statistics...</p>
          </div>

          <div v-else-if="vehicleStats" class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📏</div>
              <div class="stat-content">
                <div class="stat-label">Distance Traveled</div>
                <div class="stat-value">{{ vehicleStats.distanceTraveled }} km</div>
                <div v-if="vehicleStats.startingMileage" class="stat-sub">
                  from {{ vehicleStats.startingMileage }} to {{ vehicleStats.endingMileage }} km
                </div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">⛽</div>
              <div class="stat-content">
                <div class="stat-label">Fuel Consumption</div>
                <div class="stat-value">{{ vehicleStats.totalLiters.toFixed(2) }} L</div>
                <div class="stat-sub">{{ vehicleStats.avgConsumption.toFixed(2) }} L/100km</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-label">Fuel Cost</div>
                <div class="stat-value">{{ vehicleStats.totalCost.toFixed(2) }} RSD</div>
                <div class="stat-sub">{{ vehicleStats.avgCostPerLiter.toFixed(2) }} RSD/L</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-label">Fuel Records</div>
                <div class="stat-value">{{ vehicleStats.fuelRecordCount }}</div>
                <div class="stat-sub">this month</div>
              </div>
            </div>
          </div>

          <div v-else-if="!statsLoading" class="no-stats">
            <p>No statistics available for this period</p>
          </div>
        </div>

        <div class="fuel-records-section">
          <div class="section-header">
            <h2>Fuel Refill History</h2>
            <span class="records-count" v-if="fuelRecords.length > 0">{{ fuelRecords.length }} records</span>
          </div>

          <div v-if="fuelRecordsLoading" class="loading-small">
            <div class="spinner"></div>
            <p>Loading fuel records...</p>
          </div>

          <div v-else-if="fuelRecords.length === 0" class="no-records">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.6; margin-bottom: 15px;">
              <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 13.5V19H6v-7h6v1.5zm0-3.5H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="currentColor"/>
            </svg>
            <p>No fuel records found for this vehicle.</p>
            <p class="hint">Fuel refills will appear here when instructors add them.</p>
          </div>

          <div v-else class="fuel-records-table-container">
            <table class="fuel-records-table">
              <thead>
              <tr>
                <th>Date</th>
                <th>Liters</th>
                <th>Total Cost</th>
                <th>Price/Liter</th>
                <th>Mileage</th>
                <th>Instructor</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="record in sortedFuelRecords" :key="record.refuelDate + record.mileageAtRefuel">
                <td>{{ formatDate(record.refuelDate) }}</td>
                <td><strong>{{ record.liters.toFixed(2) }}</strong> L</td>
                <td>{{ record.totalCost.toFixed(2) }} RSD</td>
                <td>{{ (record.totalCost / record.liters).toFixed(2) }} RSD/L</td>
                <td>{{ record.mileageAtRefuel }} km</td>
                <td>
            <span v-if="record.instructorId" class="instructor-link" @click.stop="goToInstructor(record.instructorId)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
              </svg>
              View Instructor →
            </span>
                  <span v-else class="unknown">N/A</span>
                </td>
              </tr>
              </tbody>
            </table>
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
      vehicle: null,
      fuelRecords: [],
      fuelRecordsLoading: false,
      vehicleStats: null,
      statsLoading: false,
      loading: true,
      actionLoading: false,
      error: null,
      editMode: {
        registrationNumber: false,
        status: false,
        currentMileage: false,
        registrationExpiryDate: false
      },
      editedVehicle: {
        registrationNumber: '',
        status: '',
        currentMileage: null,
        registrationExpiryDate: ''
      },
      selectedMonth: this.getCurrentYearMonth(),
      availableMonths: this.generateLast12Months(),
      pdfLoading: false
    }
  },

  mounted() {
    this.fetchVehicleDetails();
  },

  computed: {
    sortedFuelRecords() {
      if (!this.fuelRecords || this.fuelRecords.length === 0) return [];
      return [...this.fuelRecords].sort((a, b) =>
          new Date(b.refuelDate) - new Date(a.refuelDate)
      );
    }
  },

  watch: {
    vehicle: {
      handler(newVal) {
        if (newVal?.id) {
          this.fetchVehicleStats();
        }
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    getCurrentYearMonth() {
      const date = new Date();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    },

    generateLast12Months() {
      const months = [];
      const date = new Date();

      for (let i = 0; i < 12; i++) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const value = `${year}-${String(month).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

        months.push({ value, label });
        date.setMonth(date.getMonth() - 1);
      }

      return months;
    },

    async fetchVehicleDetails() {
      try {
        this.loading = true;
        const vehicleId = this.$route.params.id;
        const response = await axios.get(`http://localhost:8080/vehicles/${vehicleId}`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.vehicle = response.data;
        this.resetEditedVehicle();

        await this.fetchFuelRecords(vehicleId);
      } catch (error) {
        console.error("Error fetching vehicle details:", error);
        this.error = "Failed to load vehicle details.";
      } finally {
        this.loading = false;
      }
    },

    async fetchFuelRecords(vehicleId) {
      try {
        this.fuelRecordsLoading = true;
        const response = await axios.get(`http://localhost:8080/fuel-records/vehicle/${vehicleId}`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.fuelRecords = response.data;
      } catch (error) {
        console.error("Error fetching fuel records:", error);
        this.fuelRecords = [];
      } finally {
        this.fuelRecordsLoading = false;
      }
    },

    async fetchVehicleStats() {
      if (!this.vehicle?.id || !this.selectedMonth) return;

      try {
        this.statsLoading = true;
        const [year, month] = this.selectedMonth.split('-');
        const response = await axios.get(
            `http://localhost:8080/vehicles/${this.vehicle.id}/stats`,
            {
              params: { year, month },
              headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            }
        );
        this.vehicleStats = response.data;
      } catch (error) {
        console.error("Error fetching vehicle stats:", error);
        this.vehicleStats = null;
      } finally {
        this.statsLoading = false;
      }
    },

    resetEditedVehicle() {
      if (this.vehicle) {
        this.editedVehicle = {
          registrationNumber: this.vehicle.registrationNumber || '',
          status: this.vehicle.status || '',
          currentMileage: this.vehicle.currentMileage || null,
          registrationExpiryDate: this.vehicle.registrationExpiryDate || ''
        };
      }
    },

    toggleEdit(field) {
      this.editMode[field] = true;
      this.resetEditedVehicle();
    },

    cancelEdit(field) {
      this.editMode[field] = false;
      this.resetEditedVehicle();
    },

    async saveChanges(field) {
      try {
        const updateData = {};

        switch(field) {
          case 'registrationNumber':
            updateData.registrationNumber = this.editedVehicle.registrationNumber;
            break;
          case 'status':
            updateData.status = this.editedVehicle.status;
            break;
          case 'currentMileage':
            updateData.currentMileage = parseInt(this.editedVehicle.currentMileage);
            break;
          case 'registrationExpiryDate':
            updateData.registrationExpiryDate = this.editedVehicle.registrationExpiryDate;
            break;
        }

        await axios.put(
            `http://localhost:8080/vehicles/${this.vehicle.id}`,
            updateData,
            {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
              }
            }
        );

        this.editMode[field] = false;
        await this.fetchVehicleDetails();
      } catch (error) {
        console.error(`Error updating ${field}:`, error);
        alert(error.response?.data?.message || `Failed to update ${field}.`);
      }
    },

    async reportOutOfService() {
      try {
        this.actionLoading = true;
        await axios.put(
            `http://localhost:8080/vehicles/${this.vehicle.id}/out-of-service`,
            {},
            {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
              }
            }
        );
        await this.fetchVehicleDetails();
      } catch (error) {
        console.error("Error reporting vehicle out of service:", error);
        alert("Failed to report vehicle out of service.");
      } finally {
        this.actionLoading = false;
      }
    },

    async returnToService() {
      try {
        this.actionLoading = true;
        await axios.put(
            `http://localhost:8080/vehicles/${this.vehicle.id}/return-to-service`,
            {},
            {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
              }
            }
        );
        await this.fetchVehicleDetails();
      } catch (error) {
        console.error("Error returning vehicle to service:", error);
        alert("Failed to return vehicle to service.");
      } finally {
        this.actionLoading = false;
      }
    },

    goToInstructor(instructorId) {
      this.$router.push(`/adminHome/instructors/${instructorId}`);
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-GB');
    },

    formatStatus(status) {
      const statuses = {
        'AVAILABLE': 'Available',
        'IN_USE': 'In use',
        'OUT_OF_SERVICE': 'Out of Service'
      };
      return statuses[status] || status;
    },

    getStatusClass(status) {
      return {
        'status-available': status === 'AVAILABLE',
        'status-in-use': status === 'IN_USE',
        'status-out-of-service': status === 'OUT_OF_SERVICE'
      };
    },

    isExpiringSoon(date) {
      if (!date) return false;
      const expiryDate = new Date(date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30;
    },

    goBack() {
      this.$router.push('/adminHome/vehicles');
    },

    async downloadPdf() {
      if (!this.vehicleStats || !this.selectedMonth) return;

      this.pdfLoading = true;
      try {
        const [year, month] = this.selectedMonth.split('-');
        const response = await axios.get(
            `http://localhost:8080/vehicles/${this.vehicle.id}/report`,
            {
              params: { year, month },
              headers: { Authorization: "Bearer " + localStorage.getItem("token") },
              responseType: 'blob' // Važno za PDF
            }
        );

        // Kreiraj link za preuzimanje
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `vehicle_${this.vehicle.registrationNumber}_${this.selectedMonth}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Failed to download PDF report.');
      } finally {
        this.pdfLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.vehicle-details {
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

.details-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.info-section,
.actions-section,
.statistics-section,
.fuel-records-section,
.assigned-info {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e9e1f5;
}

.info-section:last-child,
.actions-section:last-child,
.statistics-section:last-child,
.fuel-records-section:last-child,
.assigned-info:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

h2 {
  color: #4f364b;
  margin-bottom: 20px;
  font-size: 1.8rem;
  text-align: center;
}

h3 {
  color: #6b4a67;
  margin-bottom: 10px;
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

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-available {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  border: 1px solid #a3cfb1;
}

.status-in-use {
  background: linear-gradient(135deg, #fff3cd, #ffe69c);
  color: #856404;
  border: 1px solid #e6d6a2;
}

.status-out-of-service {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
  border: 1px solid #e2a3a7;
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

.icon-btn:hover {
  background: #be8fe9;
  border-color: #be8fe9;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
}

.edit-mode {
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.modern-input,
.modern-select {
  padding: 8px 12px;
  border: 2px solid #e9e1f5;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  color: #2c1f2d;
  flex: 1;
  min-width: 200px;
}

.modern-input:focus,
.modern-select:focus {
  border-color: #be8fe9;
  outline: none;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.1);
}

.action-buttons {
  display: flex;
  gap: 8px;
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
}

.action-btn.cancel:hover {
  background: linear-gradient(135deg, #c4a8e6, #b392d9);
  transform: translateY(-2px);
  color: #2c1f2d;
}

.action-btn.danger {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
  border: 1px solid #f1b0b7;
}

.action-btn.danger:hover {
  background: linear-gradient(135deg, #f5c6cb, #f1b0b7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.2);
}

.action-btn.success {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  border: 1px solid #a3cfb1;
}

.action-btn.success:hover {
  background: linear-gradient(135deg, #c3e6cb, #b1dbbb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.action-card {
  background: #f8f4fc;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-card:hover {
  border-color: #be8fe9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(190, 143, 233, 0.2);
}

.action-card p {
  color: #6b5b7a;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

/* STATISTICS SECTION */
.statistics-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e9e1f5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  text-align: center;
}

.section-header h2 {
  margin-bottom: 0;
  text-align: center;
  flex: 1;  
}

.month-selector {
  margin-left: auto;
}

.month-select {
  padding: 8px 15px;
  border: 2px solid #e9e1f5;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  color: #2c1f2d;
  cursor: pointer;
  min-width: 200px;
}

.month-select:focus {
  border-color: #be8fe9;
  outline: none;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f4fc, #f0e8fa);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  border-color: #be8fe9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(190, 143, 233, 0.2);
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #6b5b7a;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #4f364b;
  line-height: 1.2;
}

.stat-sub {
  font-size: 0.85rem;
  color: #be8fe9;
  font-weight: 600;
  margin-top: 3px;
}

.no-stats {
  text-align: center;
  padding: 40px;
  background: #f8f4fc;
  border-radius: 12px;
  color: #6b5b7a;
  font-style: italic;
}

/* FUEL RECORDS */
.fuel-records-table-container {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.fuel-records-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.95rem;
}

.fuel-records-table th {
  background: linear-gradient(135deg, #4f364b, #6b4a67);
  color: white;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.fuel-records-table th:first-child {
  border-top-left-radius: 12px;
}

.fuel-records-table th:last-child {
  border-top-right-radius: 12px;
}

.fuel-records-table td {
  padding: 12px;
  border-bottom: 1px solid #e9e1f5;
  color: #2c1f2d;
}

.fuel-records-table tr {
  transition: all 0.2s ease;
}

.fuel-records-table tbody tr:hover {
  background: #f8f4fc;
}

.fuel-records-table tbody tr:last-child td {
  border-bottom: none;
}

.records-count {
  background: #be8fe9;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.instructor-link {
  color: #be8fe9;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.instructor-link:hover {
  color: #8a5bb0;
  transform: translateX(3px);
}

.unknown {
  color: #999;
  font-style: italic;
}

.no-records {
  text-align: center;
  padding: 50px 30px;
  background: #f8f4fc;
  border-radius: 12px;
  color: #6b5b7a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-records p {
  margin: 5px 0;
}

.no-records .hint {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-top: 10px;
}

.loading-small {
  text-align: center;
  padding: 40px;
  color: #6b5b7a;
  font-style: italic;
  background: #f8f4fc;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e9e1f5;
  border-top: 3px solid #be8fe9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info-card {
  background: #f8f4fc;
  border-radius: 12px;
  padding: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e9e1f5;
}

.info-row:last-child {
  border-bottom: none;
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
  .vehicle-details {
    padding: 15px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .label {
    min-width: auto;
  }

  .value-container {
    width: 100%;
  }

  .edit-mode {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: row;
    justify-content: stretch;
  }

  .action-btn {
    flex: 1;
  }

  .action-cards {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .month-select {
    width: 100%;
  }

  .fuel-records-table {
    font-size: 0.85rem;
  }

  .fuel-records-table th,
  .fuel-records-table td {
    padding: 12px 8px;
  }

  .info-row {
    flex-direction: column;
    gap: 5px;
  }

  .instructor-link {
    padding: 6px 10px;
    font-size: 0.85rem;
  }
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.pdf-btn {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  white-space: nowrap;
}

.pdf-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #c82333, #bd2130);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(220, 53, 69, 0.4);
}

.pdf-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .pdf-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>