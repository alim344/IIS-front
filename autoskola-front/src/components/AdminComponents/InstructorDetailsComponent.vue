<template>
  <div class="instructor-details">
    <button class="back-button" @click="goBack">← Back to Instructors</button>

    <div v-if="loading" class="loading">Loading instructor details...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="instructor" class="details-container">
      <h1 class="page-title">Instructor Details</h1>

      <div class="details-card">

        <div class="personal-info">
          <h2>Personal Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Name:</span>
              <div class="value-container">
                <div v-if="!editMode.name" class="display-value">
                  <span class="full-name">{{ instructor.name }} {{ instructor.lastName }}</span>
                  <button class="icon-btn edit-btn" @click="toggleEdit('name')" title="Edit name">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <div v-else class="edit-mode">
                  <div class="input-group">
                    <div class="input-wrapper">
                      <input v-model="editedInstructor.name" placeholder="First name" class="modern-input" />
                    </div>
                    <div class="input-wrapper">
                      <input v-model="editedInstructor.lastname" placeholder="Last name" class="modern-input" />
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
              <span class="value">{{ instructor.email }}</span>
            </div>

            <div class="info-item">
              <span class="label">Username:</span>
              <span class="value">{{ instructor.username }}</span>
            </div>
          </div>
        </div>

        <div class="vehicle-info">
          <h2>Vehicle Assignment</h2>
          <div class="current-vehicle">
            <h3>Current Vehicle</h3>
            <div v-if="instructor.vehicle" class="vehicle-details">
              <p><span class="label">Registration:</span> {{ instructor.vehicle.registrationNumber }}</p>
              <p><span class="label">Mileage:</span> {{ instructor.vehicle.currentMileage }} km</p>
              <p><span class="label">Reg. Expiry:</span> {{ formatDate(instructor.vehicle.registrationExpiryDate) }}</p>
              <button class="remove-vehicle-btn" @click="removeVehicle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z" fill="currentColor"/>
                </svg>
                Remove Vehicle
              </button>
            </div>
            <div v-else class="no-vehicle">
              <p>No vehicle assigned</p>
            </div>
          </div>

          <div class="assign-vehicle">
            <h3>Assign New Vehicle</h3>
            <div class="assign-form">
              <select v-model="selectedVehicleId" class="vehicle-select">
                <option value="" disabled>Select a vehicle</option>
                <option v-for="vehicle in availableVehicles" :key="vehicle.id" :value="vehicle.id">
                  {{ vehicle.registrationNumber }} - ({{ vehicle.currentMileage }} km)
                </option>
              </select>
              <button class="assign-btn" @click="assignVehicle" :disabled="!selectedVehicleId">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                </svg>
                Assign Vehicle
              </button>
            </div>
          </div>
        </div>

        <div class="documents-info">
          <h2>Licenses & Documents</h2>
          <div class="documents-grid">
            <div v-for="doc in instructor.documents" :key="doc.documentType" class="document-card">
              <div class="document-header">
                <span class="doc-type">{{ formatDocumentType(doc.documentType) }}</span>
              </div>
              <div class="document-body">
                <div class="info-row">
                  <span class="label">Expiry Date: </span>
                  <span v-if="!editMode[doc.documentType]">{{ formatDate(doc.expiryDate) }}</span>
                  <input v-else type="date" v-model="editedDocuments[doc.documentType]" class="date-input" />
                </div>
              </div>
              <div class="document-actions">
                <button v-if="!editMode[doc.documentType]" class="edit-doc-btn" @click="toggleEditDocument(doc.documentType, doc.expiryDate)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                  </svg>
                  Edit
                </button>
                <template v-else>
                  <button class="save-doc-btn" @click="saveDocument(doc.documentType)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                    </svg>
                    Save
                  </button>
                  <button class="cancel-doc-btn" @click="cancelEditDocument(doc.documentType)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                    </svg>
                    Cancel
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="calendar-section">
          <h2>Instructor Schedule</h2>
          <div class="calendar-wrapper">
            <WeeklyCalendar
                :events="calendarEvents"
                @event-click="selectCalendarEvent"
            >
              <template #event="{ event }">
                <div :class="['event-content', getEventStatus(event)]">
                  <div class="event-title">{{ event.candidateName }}</div>
                  <div class="event-time">{{ formatEventTime(event) }}</div>
                  <div class="event-category">{{ event.category || 'Practical Class' }}</div>
                  <div class="event-status">{{ getEventStatusText(event) }}</div>
                </div>
              </template>
            </WeeklyCalendar>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEventModal && selectedEvent" class="modal-overlay" @click="closeEventModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Class Details</h3>
          <button class="modal-close-btn" @click="closeEventModal">×</button>
        </div>

        <div class="modal-body">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">Student:</span>
              <span class="detail-value">{{ selectedEvent.candidateName }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">{{ formatDetailedDate(selectedEvent) }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">{{ formatEventTime(selectedEvent) }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">{{ selectedEvent.location || 'Driving range' }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value status-badge" :class="getEventStatus(selectedEvent)">
                {{ getEventStatusText(selectedEvent) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import WeeklyCalendar from '../WeeklyCalendar.vue';

export default {
  components: {
    WeeklyCalendar
  },
  data() {
    return {
      instructor: null,
      availableVehicles: [],
      selectedVehicleId: '',
      loading: true,
      error: null,
      editMode: {
        name: false
      },
      editedInstructor: {
        name: '',
        lastname: ''
      },
      editedDocuments: {},
      calendarEvents: [],
      showEventModal: false,
      selectedEvent: null
    }
  },

  mounted() {
    this.fetchInstructorDetails();
    this.fetchAvailableVehicles();
  },

  methods: {
    async fetchInstructorDetails() {
      try {
        this.loading = true;
        const instructorId = this.$route.params.id;
        const response = await axios.get(`http://localhost:8080/instructors/${instructorId}`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.instructor = response.data;
        this.cancelNameEdit();

        await this.fetchInstructorSchedule(instructorId);
      } catch (error) {
        console.error("Error fetching instructor details:", error);
        this.error = "Failed to load instructor details.";
      } finally {
        this.loading = false;
      }
    },

    async fetchInstructorSchedule(instructorId) {
      try {
        const response = await axios.get(`http://localhost:8080/practicalclass/admin/instructor/${instructorId}/schedule`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });

        console.log("Schedule data:", response.data);

        this.calendarEvents = response.data.map(event => ({
          id: event.id,
          candidateName: `${event.name || ''} ${event.lastname || ''}`.trim() || 'Unknown',
          startTime: event.startTime,
          endTime: event.endTime,
          accepted: event.accepted || false,
          location: event.preferredLocation || 'Driving range',
          instructorId: instructorId
        }));

      } catch (error) {
        console.error("Error fetching instructor schedule:", error);
        this.calendarEvents = [];
      }
    },

    async fetchAvailableVehicles() {
      try {
        const response = await axios.get("http://localhost:8080/vehicles/available", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        this.availableVehicles = response.data;
      } catch (error) {
        console.error("Error fetching available vehicles:", error);
      }
    },

    async assignVehicle() {
      if (!this.selectedVehicleId) return;
      try {
        await axios.put(
            `http://localhost:8080/instructors/${this.instructor.id}/vehicle/${this.selectedVehicleId}`,
            {},
            { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );
        this.fetchInstructorDetails();
        this.fetchAvailableVehicles();
        this.selectedVehicleId = '';
      } catch (error) {
        console.error("Error assigning vehicle:", error);
        alert("Failed to assign vehicle.");
      }
    },

    async removeVehicle() {
      try {
        await axios.put(
            `http://localhost:8080/instructors/${this.instructor.id}/remove-vehicle`,
            {},
            { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );
        this.fetchInstructorDetails();
        this.fetchAvailableVehicles();
      } catch (error) {
        console.error("Error removing vehicle:", error);
        alert("Failed to remove vehicle.");
      }
    },

    toggleEdit(field) {
      if (field === 'name') {
        this.editMode.name = true;
        this.editedInstructor = {
          name: this.instructor.name || '',
          lastname: this.instructor.lastName || ''
        };
      }
    },

    cancelNameEdit() {
      this.editMode.name = false;
      this.editedInstructor = {
        name: this.instructor?.name || '',
        lastname: this.instructor?.lastName || ''
      };
    },

    async saveNameChanges() {
      if (!this.editedInstructor.name.trim() || !this.editedInstructor.lastname.trim()) {
        alert("Both first name and last name are required.");
        return;
      }
      try {
        const updateData = {
          name: this.editedInstructor.name,
          lastname: this.editedInstructor.lastname
        };
        await axios.put(
            `http://localhost:8080/instructors/update/${this.instructor.id}`,
            updateData,
            { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );
        this.editMode.name = false;
        this.fetchInstructorDetails();
      } catch (error) {
        console.error("Error updating instructor name:", error);
        alert("Failed to update instructor name.");
      }
    },

    toggleEditDocument(docType, currentDate) {
      this.editMode[docType] = true;
      this.editedDocuments[docType] = currentDate;
    },

    cancelEditDocument(docType) {
      this.editMode[docType] = false;
      delete this.editedDocuments[docType];
    },

    async saveDocument(docType) {
      try {
        const newDate = this.editedDocuments[docType];
        const updateData = {
          documents: [{ documentType: docType, expiryDate: newDate }]
        };
        await axios.put(
            `http://localhost:8080/instructors/update/${this.instructor.id}`,
            updateData,
            { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
        );
        this.cancelEditDocument(docType);
        this.fetchInstructorDetails();
      } catch (error) {
        console.error("Error updating document:", error);
        alert("Failed to update document.");
      }
    },

    selectCalendarEvent(event) {
      this.selectedEvent = event;
      this.showEventModal = true;
    },

    closeEventModal() {
      this.showEventModal = false;
      this.selectedEvent = null;
    },

    formatEventTime(event) {
      const options = { hour: 'numeric', minute: '2-digit', hour12: true };
      const start = new Date(event.startTime).toLocaleTimeString([], options);
      const end = new Date(event.endTime).toLocaleTimeString([], options);
      return `${start} - ${end}`;
    },

    formatDetailedDate(event) {
      const start = new Date(event.startTime);
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return start.toLocaleDateString('en-US', dateOptions);
    },

    getEventStatus(event) {
      const now = new Date();
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      if (now > end) return 'passed';
      if (now >= start && now <= end) return 'ongoing';
      if (event.accepted) return 'future-accepted';
      return 'future-pending';
    },

    getEventStatusText(event) {
      const now = new Date();
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      if (now > end) return 'Passed';
      if (now >= start && now <= end) return 'In session';
      if (event.accepted) return 'Accepted';
      return 'Pending';
    },

    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-GB');
    },

    formatDocumentType(type) {
      const types = {
        'DRIVING_LICENSE': 'Driving License',
        'INSTRUCTOR_LICENSE': 'Instructor license',
        'MEDICAL_CERTIFICATE': 'Medical Certificate'
      };
      return types[type] || type;
    },

    goBack() {
      this.$router.push('/adminHome/instructors');
    }
  }
}
</script>

<style scoped>
.instructor-details {
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

.personal-info,
.vehicle-info,
.documents-info {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e9e1f5;
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
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.input-group {
  display: flex;
  gap: 10px;
  width: 100%;
}

.input-wrapper {
  flex: 1;
}

.modern-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e9e1f5;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: white;
  color: #2c1f2d;
  height: 36px;
}

.modern-input:focus {
  border-color: #be8fe9;
  outline: none;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.1);
}

.action-buttons {
  display: flex;
  gap: 10px;
  width: 100%;
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
  transition: all 0.2s ease;
  border: none;
  color: white;
  flex: 1;
}

.action-btn.save {
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
}

.action-btn.save:hover {
  background: linear-gradient(135deg, #a06bc0, #8a5bb0);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
}

.action-btn.cancel {
  background: linear-gradient(135deg, #d9c2f0, #c4a8e6);
  color: #4a3a5c;
}

.action-btn.cancel:hover {
  background: linear-gradient(135deg, #c4a8e6, #b392d9);
}

/* VEHICLE SECTION */
.current-vehicle {
  background: #f8f4fc;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.vehicle-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.no-vehicle {
  color: #999;
  font-style: italic;
  padding: 15px;
  background: #f0f0f0;
  border-radius: 6px;
}

.remove-vehicle-btn {
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 15px;
  width: fit-content;
  font-weight: 600;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.remove-vehicle-btn:hover {
  background: linear-gradient(135deg, #a06bc0, #8a5bb0);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
}

.assign-form {
  display: flex;
  gap: 15px;
  align-items: center;
  background: #f8f4fc;
  padding: 20px;
  border-radius: 10px;
}

.vehicle-select {
  flex: 1;
  padding: 12px;
  border: 2px solid #e9e1f5;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.vehicle-select:focus {
  border-color: #be8fe9;
  outline: none;
  box-shadow: 0 0 0 3px rgba(190, 143, 233, 0.1);
}

.assign-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
}

.assign-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #a06bc0, #8a5bb0);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(190, 143, 233, 0.4);
}

.assign-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.document-card {
  background: #f8f4fc;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.document-card:hover {
  border-color: #be8fe9;
  box-shadow: 0 5px 15px rgba(190, 143, 233, 0.2);
  transform: translateY(-2px);
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
  margin-bottom: 15px;
}

.date-input {
  padding: 6px 10px;
  border: 2px solid #e9e1f5;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 140px;
  background: white;
}

.document-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.edit-doc-btn,
.save-doc-btn,
.cancel-doc-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.edit-doc-btn,
.save-doc-btn {
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
  color: white;
}

.cancel-doc-btn {
  background: linear-gradient(135deg, #d9c2f0, #c4a8e6);
  color: #4a3a5c;
}

.edit-doc-btn:hover,
.save-doc-btn:hover {
  background: linear-gradient(135deg, #a06bc0, #8a5bb0);
  transform: translateY(-2px);
}

.cancel-doc-btn:hover {
  background: linear-gradient(135deg, #c4a8e6, #b392d9);
}

.calendar-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #e9e1f5;
}

.calendar-wrapper {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  min-height: 500px;
}

.event-content {
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-content:hover {
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.event-content.future-accepted {
  background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
  border-left: 3px solid #2e7d32;
  color: #1b5e20;
}

.event-content.future-pending {
  background: linear-gradient(135deg, #fff9c4, #fff59d);
  border-left: 3px solid #f57f17;
  color: #bf360c;
}

.event-content.ongoing {
  background: linear-gradient(135deg, #e1bee7, #ce93d8);
  border-left: 3px solid #6a1b9a;
  color: #4a148c;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}

.event-content.passed {
  background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
  border-left: 3px solid #616161;
  color: #424242;
  opacity: 0.8;
}

.event-title {
  font-weight: 700;
  font-size: 0.75rem;
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  font-size: 0.65rem;
  opacity: 0.9;
  margin-bottom: 1px;
}

.event-category {
  font-size: 0.65rem;
  font-weight: 600;
  margin-bottom: 1px;
  text-transform: uppercase;
}

.event-status {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.9;
}

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
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
}

.detail-label {
  font-weight: 600;
  color: #555;
  width: 100px;
  flex-shrink: 0;
  font-size: 0.9rem;
}

.detail-value {
  flex: 1;
  color: #333;
  font-size: 0.95rem;
  line-height: 1.4;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.future-accepted {
  background: #e8f5e9;
  color: #1b5e20;
}

.status-badge.future-pending {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.ongoing {
  background: #f3e5f5;
  color: #4a148c;
}

.status-badge.passed {
  background: #f5f5f5;
  color: #393939;
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
  }

  .assign-form {
    flex-direction: column;
  }

  .vehicle-select, .assign-btn, .remove-vehicle-btn {
    width: 100%;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .document-actions {
    flex-direction: column;
  }

  .edit-doc-btn, .save-doc-btn, .cancel-doc-btn {
    width: 100%;
  }
}
</style>