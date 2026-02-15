<template>
  <div >
    <div class="calendar-layout">
      <WeeklyCalendar
      :events="events"
      @event-click="selectEvent"
    >
      <template #event="{ event }">
        <div class="event-time">{{ formatEventTime(event) }}</div>
        <div class="event-title">{{ event.name }} {{ event.lastname || '' }}</div>
        <div>{{ event.category }}</div>
        <div class="event-status">{{ getEventStatusText(event) }}</div>
      </template>
    </WeeklyCalendar>

    <div class="right-panel">
      
        <div class="panel-section">
            <h4>Upcoming classes today</h4>
            <div class="upcoming-list">
              <div v-for="event in upcomingEvents" :key="event.id" class="upcoming-item">
                <div class="upcoming-time">{{ formatEventTime(event) }}</div>
                <div class="upcoming-category">{{ event.category }}</div>
                <div class="upcoming-student">{{ event.name }} {{ event.lastname }}</div>
              </div>
            </div>
          </div>
          <div class="panel-section">

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
              <span class="detail-value">{{ selectedEvent.name }} {{ selectedEvent.lastname }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value">{{ selectedEvent.category }}</span>
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
import WeeklyCalendar from '../WeeklyCalendar.vue';

export default {
  components: { WeeklyCalendar },
   props: {
      events: {
        type: Array,
        required: true
      }
    },
  data() {
    return {
      selectedEvent: null,
      showEventModal:false,
    };
  },

  methods: {
    selectEvent(event) {
      this.selectedEvent = event;
      this.showEventModal= true;
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

.event-time { font-weight: bold; font-size: 9px; opacity: 0.8; }
.event-title { font-weight: 700; margin: 1px 0; }

.event-status {
  font-size: 9px;
  margin-top: 3px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.85;
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

.right-panel {
  flex: 1;
  max-width: 300px;
  padding: 20px;
  background: #fafafa;
}

.panel-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
}

.panel-section h4 {
  color: #3a283c;
  margin: 0 0 15px 0;
  font-size: 1rem;
  font-weight: 600;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upcoming-item {
  padding: 10px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid rgb(190, 143, 233);
  cursor: pointer;
  transition: all 0.2s;
}

.upcoming-item:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upcoming-time {
  font-size: 0.8rem;
  color: rgb(190, 143, 233);
  font-weight: 600;
  margin-bottom: 2px;
}

.upcoming-category {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.upcoming-student {
  font-size: 0.8rem;
  color: #666;
}
</style>