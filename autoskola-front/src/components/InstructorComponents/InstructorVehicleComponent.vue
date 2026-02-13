<template>
  <div class="my-vehicle-container">
    <h1 class="page-title">My Vehicle</h1>

    <div v-if="loading" class="loading">Loading vehicle info...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="!vehicle" class="no-vehicle-card">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.5; margin-bottom: 20px;">
        <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 13.5V19H6v-7h6v1.5zm0-3.5H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="currentColor"/>
      </svg>
      <h2>No Vehicle Assigned</h2>
      <p>You don't have a vehicle assigned yet. Contact the admin for assignment.</p>
    </div>

    <div v-else class="vehicle-card">

      <div class="info-section">
        <h2>Vehicle Information</h2>

        <div class="info-grid">
          <div class="info-item">
            <span class="label">Registration:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value">{{ vehicle.registrationNumber }}</span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <span class="label">Status:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="status-badge" :class="getStatusClass(vehicle.status)">
                  {{ formatStatus(vehicle.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <span class="label">Current Mileage:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value">{{ vehicle.currentMileage }} km</span>
              </div>
            </div>
          </div>

          <div class="info-item">
            <span class="label">Reg. Expiry Date:</span>
            <div class="value-container">
              <div class="display-value">
                <span class="value" :class="{ 'expiry-warning': isExpiringSoon(vehicle.registrationExpiryDate) }">
                  {{ formatDate(vehicle.registrationExpiryDate) }}
                </span>
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
            <p>Report that your vehicle is out of service. This will unassign it from you.</p>
            <button class="action-btn danger" @click="reportOutOfService" :disabled="actionLoading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
              Report Out of Service
            </button>
          </div>

          <div class="action-card" v-if="vehicle.status !== 'OUT_OF_SERVICE'">
            <h3>Add Fuel Refill</h3>
            <p>Record a new fuel refill for this vehicle.</p>
            <button class="action-btn primary" @click="openFuelModal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
              </svg>
              Add Fuel Record
            </button>
          </div>
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
          <p class="hint">Click "Add Fuel Record" to add your first refill.</p>
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
            </tr>
            </thead>
            <tbody>
            <tr v-for="record in sortedFuelRecords" :key="record.refuelDate + record.mileageAtRefuel">
              <td>{{ formatDate(record.refuelDate) }}</td>
              <td><strong>{{ record.liters.toFixed(2) }}</strong> L</td>
              <td>{{ record.totalCost.toFixed(2) }} RSD</td>
              <td>{{ (record.totalCost / record.liters).toFixed(2) }} RSD/L</td>
              <td>{{ record.mileageAtRefuel }} km</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showFuelModal" class="modal-overlay" @click.self="closeFuelModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add Fuel Refill</h2>
          <button class="close-btn" @click="closeFuelModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Date:</label>
            <input type="date" v-model="newFuelRecord.refuelDate" class="modern-input" required>
          </div>

          <div class="form-group">
            <label>Liters:</label>
            <input type="number" step="0.01" v-model="newFuelRecord.liters" class="modern-input" placeholder="e.g. 45.5" required>
          </div>

          <div class="form-group">
            <label>Total Cost (RSD):</label>
            <input type="number" step="0.01" v-model="newFuelRecord.totalCost" class="modern-input" placeholder="e.g. 4500" required>
          </div>

          <div class="form-group">
            <label>Mileage at Refuel (km):</label>
            <input type="number" v-model="newFuelRecord.mileageAtRefuel" class="modern-input" placeholder="e.g. 12500" required>
          </div>

          <div class="form-hint" v-if="vehicle">
            <p>Vehicle: {{ vehicle.registrationNumber }} | Current mileage: {{ vehicle.currentMileage }} km</p>
            <p class="warning" v-if="newFuelRecord.mileageAtRefuel && newFuelRecord.mileageAtRefuel < vehicle.currentMileage">
              ⚠️ Mileage cannot be lower than current mileage!
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="action-btn cancel" @click="closeFuelModal">Cancel</button>
          <button class="action-btn save" @click="submitFuelRecord" :disabled="!isFuelFormValid || fuelSubmitting">
            {{ fuelSubmitting ? 'Saving...' : 'Save Record' }}
          </button>
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
      loading: true,
      actionLoading: false,
      fuelSubmitting: false,
      error: null,
      showFuelModal: false,
      newFuelRecord: {
        refuelDate: new Date().toISOString().split('T')[0],
        liters: null,
        totalCost: null,
        mileageAtRefuel: null
      }
    }
  },

  mounted() {
    this.fetchMyVehicle();
  },

  computed: {
    sortedFuelRecords() {
      if (!this.fuelRecords || this.fuelRecords.length === 0) return [];
      return [...this.fuelRecords].sort((a, b) =>
          new Date(b.refuelDate) - new Date(a.refuelDate)
      );
    },

    isFuelFormValid() {
      return this.newFuelRecord.refuelDate &&
          this.newFuelRecord.liters > 0 &&
          this.newFuelRecord.totalCost > 0 &&
          this.newFuelRecord.mileageAtRefuel > 0 &&
          (!this.vehicle || this.newFuelRecord.mileageAtRefuel >= this.vehicle.currentMileage);
    }
  },

  methods: {
    async fetchMyVehicle() {
      try {
        this.loading = true;

        try {
          const vehicleResponse = await axios.get("http://localhost:8080/instructors/my-vehicle", {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            }
          });

          this.vehicle = vehicleResponse.data;

          if (this.vehicle && this.vehicle.id) {
            await this.fetchFuelRecords(this.vehicle.id);
          }

        } catch (vehicleError) {
          if (vehicleError.response?.status === 404) {
            console.log("No vehicle assigned");
            this.vehicle = null;
          }
          else if (vehicleError.response?.status === 401 || vehicleError.response?.status === 403) {
            console.log("Auth error - redirecting");
            localStorage.removeItem("token");
            this.$router.push("/login");
          }
          else {
            console.error("Error fetching vehicle:", vehicleError);
            this.error = "Failed to load vehicle info.";
          }
        }

      } catch (error) {
        console.error("Error in fetchMyVehicle:", error);
        this.error = "Failed to load vehicle info.";
      } finally {
        this.loading = false;
      }
    },

    async fetchFuelRecords(vehicleId) {
      if (!vehicleId) return;

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

    async reportOutOfService() {
      if (!confirm('Are you sure you want to report this vehicle as out of service? This will unassign it from you.')) {
        return;
      }

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

        this.vehicle = null;
        this.fuelRecords = [];

      } catch (error) {
        console.error("Error reporting vehicle out of service:", error);
        alert("Failed to report vehicle out of service.");
      } finally {
        this.actionLoading = false;
      }
    },

    openFuelModal() {
      this.newFuelRecord = {
        refuelDate: new Date().toISOString().split('T')[0],
        liters: null,
        totalCost: null,
        mileageAtRefuel: this.vehicle ? this.vehicle.currentMileage : null
      };
      this.showFuelModal = true;
    },

    closeFuelModal() {
      this.showFuelModal = false;
    },

    async submitFuelRecord() {
      if (!this.isFuelFormValid) return;

      try {
        this.fuelSubmitting = true;

        const fuelData = {
          refuelDate: this.newFuelRecord.refuelDate,
          liters: parseFloat(this.newFuelRecord.liters),
          totalCost: parseFloat(this.newFuelRecord.totalCost),
          mileageAtRefuel: parseInt(this.newFuelRecord.mileageAtRefuel),
          vehicleId: this.vehicle.id
        };

        await axios.post("http://localhost:8080/fuel-records/create", fuelData, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });

        this.closeFuelModal();

        await this.fetchMyVehicle();

      } catch (error) {
        console.error("Error saving fuel record:", error);
        alert(error.response?.data?.message || "Failed to save fuel record.");
      } finally {
        this.fuelSubmitting = false;
      }
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
    }
  }
}
</script>

<style scoped>
.my-vehicle-container {
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

/* No vehicle card */
.no-vehicle-card {
  background: white;
  border-radius: 15px;
  padding: 60px 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  color: #6b5b7a;
}

.no-vehicle-card h2 {
  color: #4f364b;
  margin-bottom: 10px;
}

.no-vehicle-card p {
  color: #8a7a99;
  font-size: 1.1rem;
}

.vehicle-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.info-section,
.actions-section,
.fuel-records-section {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e9e1f5;
}

.info-section:last-child,
.actions-section:last-child,
.fuel-records-section:last-child {
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

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: none;
  color: white;
  width: 100%;
}

.action-btn.primary {
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #a06bc0, #8a5bb0);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(190, 143, 233, 0.4);
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

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin-bottom: 0;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 2px solid #e9e1f5;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #6b5b7a;
  padding: 0 10px;
}

.close-btn:hover {
  color: #be8fe9;
}

.modal-body {
  padding: 25px;
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

.modern-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e9e1f5;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  color: #2c1f2d;
}

.modern-input:focus {
  border-color: #be8fe9;
  outline: none;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.1);
}

.form-hint {
  background: #f8f4fc;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #6b5b7a;
}

.form-hint .warning {
  color: #dc3545;
  margin-top: 5px;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 25px;
  border-top: 2px solid #e9e1f5;
}

.modal-footer .action-btn {
  width: auto;
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-footer .action-btn.save {
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
  color: white;
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
}

.modal-footer .action-btn.save:hover {
  background: linear-gradient(135deg, #a06bc0, #8a5bb0);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(190, 143, 233, 0.4);
}

.modal-footer .action-btn.save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.modal-footer .action-btn.cancel {
  background: white;
  color: #4f364b;
  border: 2px solid #e9e1f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.modal-footer .action-btn.cancel:hover {
  background: #f8f4fc;
  border-color: #be8fe9;
  color: #342a3c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.15);
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

@media (max-width: 768px) {
  .my-vehicle-container {
    padding: 15px;
  }

  .vehicle-card {
    padding: 20px;
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

  .action-cards {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .fuel-records-table {
    font-size: 0.85rem;
  }

  .fuel-records-table th,
  .fuel-records-table td {
    padding: 12px 8px;
  }

  .modal-content {
    width: 95%;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .action-btn {
    width: 100%;
  }
}
</style>