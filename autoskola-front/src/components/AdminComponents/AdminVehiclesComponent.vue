<template>
  <div class="vehicles-section">
    <h1 class="page-title">Vehicles</h1>

    <div class="vehicles-grid">
      <div
          class="vehicle-card"
          v-for="vehicle in vehicles"
          :key="vehicle.registrationNumber"
          @click="openVehicleDetails(vehicle.id)"
      >
        <div class="card-header">
          <h2>{{ vehicle.registrationNumber }}</h2>
          <span class="status-badge" :class="getStatusClass(vehicle.status)">
            {{ formatStatus(vehicle.status) }}
          </span>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">Mileage:</span>
            <span>{{ vehicle.currentMileage }} km</span>
          </div>

          <div class="info-row">
            <span class="label">Reg. Expiry:</span>
            <span :class="{ 'expiry-warning': isExpiringSoon(vehicle.registrationExpiryDate) }">
              {{ formatDate(vehicle.registrationExpiryDate) }}
            </span>
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
      vehicles: []
    }
  },

  mounted() {
    this.fetchVehicles();
  },

  methods: {
    async fetchVehicles() {
      try {
        const response = await axios.get("http://localhost:8080/vehicles/all", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.vehicles = response.data;
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    },

    openVehicleDetails(vehicleId) {
      this.$router.push(`/adminHome/vehicles/${vehicleId}`);
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
      return daysUntilExpiry <= 30; // upozorenje ako ističe za manje od 30 dana
    }
  }
}
</script>

<style scoped>
.vehicles-section {
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

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.vehicle-card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid transparent;
  cursor: pointer;
}

.vehicle-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 15px 40px rgba(106, 13, 173, 0.2), 0 0 25px rgba(190, 143, 233, 0.3);
  border-color: #be8fe9;
  background: linear-gradient(145deg, #fef9fb, #f5f0f9);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e9e1f5;
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.card-header h2 {
  margin: 0;
  color: #4f364b;
  font-size: 1.5rem;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
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

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.label {
  font-weight: 600;
  color: #4f364b;
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

@media (max-width: 768px) {
  .vehicles-section {
    padding: 20px;
  }

  .vehicles-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .status-badge {
    align-self: flex-start;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>