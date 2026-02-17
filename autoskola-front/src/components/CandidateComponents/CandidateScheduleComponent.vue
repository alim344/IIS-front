<template>
  <div >
    <div class="calendar-layout">
      <WeeklyCalendar
      :events="events"
      @event-click="selectEvent"
    >
      <template #event="{ event }">


         <div v-if="candidateStatus === 'PRACTICAL'">
            <div>PRACTICAL CLASS</div>
            <div class="event-time">{{ formatEventTime(event) }}</div>
            <div class="event-status">{{ getEventStatusText(event) }}</div>
            <button class="event-button">SEE MORE</button>
        </div>

         <div v-else-if="candidateStatus === 'THEORY'">
          <div>THEORY CLASS</div>
         </div>
      </template>
    </WeeklyCalendar>

    


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
              <span class="detail-label">Instructor:</span>
              <span class="detail-value">{{ selectedEvent.instructorName }} {{ selectedEvent.instructorLastName }}</span>
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
              <span class="detail-value">{{ selectedEvent.preferredLocation }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value status-badge" :class="getEventStatus(selectedEvent)">
                {{ getEventStatusText(selectedEvent) }}
              </span>
            </div>

           <div class="modal-actions">
            <button class="accept-btn" @click="acceptClass"  :disabled="selectedEvent.accepted">ACCEPT CLASS</button>
            <button class="decline-btn" @click="declineClass">DECLINE CLASS</button>
          </div>
            
           
          </div>
          </div>
      </div>
    </div>


      <div v-if="declineModal" class="modal-overlay" @click="closeDeclineModal">
        <div class="modal-content decline-modal" @click.stop>
          <div class="modal-header">
            <h3>Decline Class</h3>
            <button class="modal-close-btn" @click="closeDeclineModal">×</button>
          </div>
          
          <div class="modal-body">
            <p class="decline-instruction">Please select one of the options below for rescheduling the class</p>
            
            <div class="decline-options">
              <div class="decline-option">
                <label class="option-label">
                  <input 
                    type="radio" 
                    v-model="declineReason" 
                    value="postpone"
                    class="option-radio"
                  >
                  <span class="option-text">I would like to decline this class and continue next week</span>
                </label>
              </div>

              <div class="decline-option">
                <label class="option-label">
                  <input 
                    type="radio" 
                    v-model="declineReason" 
                    value="suggest"
                    class="option-radio"
                  >
                  <span class="option-text">I want to propose alternative days and time slots within the current week</span>
                </label>
              </div>

              <div v-if="declineReason === 'suggest'" class="suggestion-area">
                <label class="suggestion-label">Please suggest alternative days and times:</label>
                <textarea 
                  v-model="suggestionText"
                  class="suggestion-input"
                
                  placeholder="E.g., Monday at 10am, Wednesday at 2pm, Friday at 4pm..."
                ></textarea>
              </div>
            </div>

            <div class="decline-modal-actions">
              <button class="cancel-btn" @click="closeDeclineModal">CANCEL</button>
              <button 
                class="confirm-decline-btn" 
               @click="confirmDecline"
                :disabled="!isDeclineValid"
              >
                CONFIRM DECLINE
              </button>
            </div>
          </div>
        </div>
      </div>




  </div>
</template>

<script>
import WeeklyCalendar from '../WeeklyCalendar.vue';
import axios from 'axios';

export default {
  components: { WeeklyCalendar },
   
  data() {
    return {
      selectedEvent: null,
      candidateStatus:null,
      showEventModal:false,
      events:[],
      declineModal: false,
      declineReason: null,
      suggestionText: '',

    };
  },
  mounted(){
    this.fetchCandidateStatus();
    

  },
  computed: {
    isDeclineValid() {
      if (!this.declineReason) return false;
      if (this.declineReason === 'suggest' && !this.suggestionText.trim()) return false;
      return true;
    }
  },

  methods: {

    fetchCandidateStatus() {
      const token = localStorage.getItem('token');

      if (token) {

        axios.get(
          'http://localhost:8080/candidates/getstatus',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(response => {

          this.candidateStatus = response.data;

          if (this.candidateStatus === "PRACTICAL") {
            this.fetchPracticalClasses();
          } else if (this.candidateStatus === "THEORY") {
            console.log('Theory candidate');
          }

        })
        .catch(error => {
          console.error("Fetch error:", error);
        });

      }
    },

    fetchPracticalClasses(){
        const token = localStorage.getItem('token');

      if(token){

        axios.get('http://localhost:8080/practicalclass/candidate/fullschedule',
          {
                headers: { Authorization: `Bearer ${token}` }
            })
             .then(response => {
                this.events = response.data;
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });

      }


    },
    selectEvent(event) {
      this.selectedEvent = event;
      this.showEventModal = true;
    },
    acceptClass(){

      const id = this.selectedEvent.id;

      axios.patch(`http://localhost:8080/practicalclass/acceptClass/${id}`)
          .then(response => {

                this.selectedEvent.accepted = true;

                const event = this.events.find(e => e.id === id);
                if (event) {
                  event.accepted = true;
                }

                this.showEventModal = false;
                this.selectedEvent = null;

                console.log(response.data);
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });

    },
    declineClass(){
        this.declineModal = true;
    },
    
    formatEventTime(event) {
      const options = { hour: 'numeric', minute: '2-digit', hour12: true };
      const start = new Date(event.startTime).toLocaleTimeString([], options);
      const end = new Date(event.endTime).toLocaleTimeString([], options);
      return `${start} - ${end}`;
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
    closeEventModal(){
      this.selectedEvent = null;
      this.showEventModal= false;
    },
     formatDetailedDate(event) {
      const start = new Date(event.startTime);
     
      
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
     
      
      const dateStr = start.toLocaleDateString('en-US', dateOptions);
     
      
      return `${dateStr}`;
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
    openDeclineModal() {
    this.declineModal = true;
    this.declineReason = null;
    this.suggestionText = '';
  },

  closeDeclineModal() {
    this.declineModal = false;
    this.declineReason = null;
    this.suggestionText = '';
  },
  confirmDecline() {

    if(this.declineReason == null){
      return;
    }


    const declineData = {
      instructorEmail : this.selectedEvent.instructorEmail,
      text: this.suggestionText
    }

     const id = this.selectedEvent.id;

    const token = localStorage.getItem('token');

    if(this.declineReason === 'suggest' ){
        axios.post(`http://localhost:8080/request/save`, declineData, 
          {headers: { Authorization: `Bearer ${token}` } }
      )
        .then(response => {
          console.log( response.data);
          
          this.events = this.events.filter(e => e.id !== id);
          this.closeDeclineModal();
          this.closeEventModal();
        })
        .catch(error => {
          console.error("Decline error:", error);
        });
        
    }

   

      

        axios.delete(
          `http://localhost:8080/practicalclass/deleteById/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {

          this.events = this.events.filter(e => e.id !== id);

          this.closeDeclineModal();
          this.closeEventModal();
        })
        .catch(error => {
          console.error("Delete error:", error);
        });

      

  },

  }
};
</script>

<style scoped>

.calendar-layout {
  display: flex;
  height: calc(100vh - 120px);
  width: 100%;
}

.calendar-layout :deep(.weekly-calendar-container) {
  flex: 3;
}

.event-time { font-weight: bold; font-size: 12px; opacity: 0.8; }

.event-status {
  font-size: 10px;
  margin-top: 3px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.85;
}

.event-button{
  margin: 10px;
  padding: 5px;
  border-radius: 30px;
  border: 2px solid #e1dbe2;
  font-size: 10px;
}

.event-button:hover{
  border: 2px solid #9136a1;
  background: #dad5d5;
}

.selected-event-info {
  margin-top: 20px;
  padding: 10px;
  background: #f3e5f5;
  border-radius: 4px;
  color: #4a148c;
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
  margin-bottom: 24px;
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

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}


.close-btn:hover {
  background: #e0e0e0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.accept-btn {
  background-color: #e6f7e6;
  color: #2e7d32;
  border: 1px solid #a5d6a5;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accept-btn:hover {
  background-color: #c8e6c9;
  border-color: #81c784;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.2);
}

.accept-btn:active {
  transform: translateY(0);
}

.decline-btn {
  background-color: #feeaea;
  color: #b71c1c;
  border: 1px solid #ffb3b3;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.decline-btn:hover {
  background-color: #ffcdd2;
  border-color: #ef9a9a;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(183, 28, 28, 0.2);
}



.accept-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}


/* Decline Modal Styles */
.decline-modal {
  max-width: 550px;
}

.decline-instruction {
  color: #666;
  margin-bottom: 20px;
  font-size: 1rem;
}

.decline-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.decline-option {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.decline-option:hover {
  border-color: #9C27B0;
  background-color: #f9f2fb;
}

.option-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.option-radio {
  margin-top: 3px;
  width: 18px;
  height: 18px;
  accent-color: #9C27B0;
  cursor: pointer;
}

.option-text {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.4;
  color: #333;
}

.suggestion-area {
  margin-top: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #9C27B0;
}

.suggestion-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.suggestion-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.suggestion-input:focus {
  outline: none;
  border-color: #9C27B0;
  box-shadow: 0 0 0 3px rgba(156, 39, 176, 0.1);
}

.decline-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #eeeeee;
  border-color: #ccc;
}

.confirm-decline-btn {
  background-color: #feeaea;
  color: #b71c1c;
  border: 1px solid #ffb3b3;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-decline-btn:hover:not(:disabled) {
  background-color: #ffcdd2;
  border-color: #ef9a9a;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(183, 28, 28, 0.2);
}

.confirm-decline-btn:disabled {
  background-color: #cccccc;
  border-color: #cccccc;
  color: #888888;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>