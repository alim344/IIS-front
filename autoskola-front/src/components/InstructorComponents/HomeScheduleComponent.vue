<template>
  <div class="weekly-calendar-container">
    <div class="calendar-header">
      <div class="calendar-navigation">
        <button class="nav-btn" @click="previousWeek">&lt;</button>
        <button class="today-btn" @click="goToToday">Today</button>
        <button class="nav-btn" @click="nextWeek">&gt;</button>
        <h2 class="current-week">{{ weekRange }}</h2>
      </div>
    </div>

    <div class="calendar-grid">
      <div class="calendar-content">
        <div class="day-headers">
          <div class="time-header-spacer"></div>
          <div v-for="day in days" :key="day.date" class="day-header" :class="{ 'today': day.isToday }">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ day.date }}</div>
          </div>
        </div>

        <div class="time-grid">
          <div class="time-labels">
            <div v-for="time in times" :key="time" class="time-label">
              {{ time }}
            </div>
          </div>

          <div v-for="day in days" :key="'col-' + day.date" class="day-column">
            <div v-for="time in times" :key="time" class="time-cell"></div>

            <div 
              v-for="event in getEventsForDay(day)" 
              :key="event.startTime + event.email" 
              class="compact-event"
              :class="getEventStatus(event)"
              :style="getEventStyle(event)"
              @click.stop="selectEvent(event)"
            >
              <div class="event-time">{{ formatEventTime(event) }}</div>
              <div class="event-title">{{ event.name }} {{ event.lastname }}</div>
              <div>{{ event.category }}</div>
              <div class="event-status">
                {{ getEventStatusText(event) }}
              </div>
              
            </div>
          </div>
        </div>
      </div>

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

    <!-- Modal for class details -->
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
export default {
  props: {
  events: {
    type: Array,
    required: true
  }
},
  data() {
    return {
      currentDate: new Date(),
      selectedEvent: null,
      rowHeight: 60, // Matches CSS height
      startHour: 8,  
      times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
              '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
      showEventModal : false
     
    };
  },
  computed: {
    days() {
      const daysArray = [];
      const today = new Date(this.currentDate);
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        daysArray.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
          date: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
          fullDate: date,
          isToday: date.toDateString() === new Date().toDateString(),
          monthName: date.toLocaleDateString('en-US', { month: 'short' })
        });
      }
      return daysArray;
    },

    weekRange() {
      const start = this.days[0];
      const end = this.days[6];
      return `${start.monthName} ${start.date} - ${end.date}, ${start.year}`;
    },
    upcomingEvents() {
      const now = new Date();
      const today = new Date();

      return this.events
        .filter(event => {
          const start = new Date(event.startTime);

          
          const isToday =
            start.getDate() === today.getDate() &&
            start.getMonth() === today.getMonth() &&
            start.getFullYear() === today.getFullYear();

          return isToday && start > now;
        })
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }

  },

  methods: {
    previousWeek() {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() - 7);
      this.currentDate = d;
    },
    nextWeek() {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() + 7);
      this.currentDate = d;
    },
    goToToday() {
      this.currentDate = new Date();
    },

    getEventsForDay(day) {
      return this.events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.getDate() === day.date &&
               eventDate.getMonth() === day.month &&
               eventDate.getFullYear() === day.year;
      });
    },
    getEventStatus(event){
        const now = new Date();
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);

        if (now > end) return 'passed';
        if (now >= start && now <= end) return 'ongoing';
        if (event.accepted) return 'future-accepted';

        return 'future-pending';
    },

    getEventStyle(event) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      const startMinutes = (start.getHours() * 60 + start.getMinutes()) - (this.startHour * 60);
      const durationMinutes = (end - start) / (1000 * 60);

      const top = (startMinutes / 60) * this.rowHeight;
      const height = (durationMinutes / 60) * this.rowHeight;

     const status = this.getEventStatus(event);

      return {
        top: `${top}px`,
        height: `${height - 4}px` ,
        opacity: status === 'passed' ? 0.4 : 1
      };
    },
    getEventStatusText(event) {
      const status = this.getEventStatus(event);

      if (status === 'passed') return 'Passed';
      if (status === 'ongoing') return 'In session';
      if (status === 'future-accepted') return 'Accepted';
      return 'Pending';
    },


    formatEventTime(event) {
      const options = { hour: 'numeric', minute: '2-digit', hour12: true };
      const start = new Date(event.startTime).toLocaleTimeString([], options);
      const end = new Date(event.endTime).toLocaleTimeString([], options);
      return `${start} - ${end}`;
    },

    selectEvent(event) {
      this.selectedEvent = event;
      this.showEventModal = true;
    },
    closeEventModal(){
      this.selectedEvent = null;
      this.showEventModal = false;
    },

    addEventAtTime(day, time) {
      alert(`Add event on ${day.name} at ${time}`);
    },

   
    formatDetailedDate(event) {
      const start = new Date(event.startTime);
     
      
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
     
      
      const dateStr = start.toLocaleDateString('en-US', dateOptions);
     
      
      return `${dateStr}`;
    },
    
   
  }
};
</script>

<style scoped>
/* Root Variables for perfect alignment */
.weekly-calendar-container {
  --time-col-width: 85px;
  --row-height: 60px;
  --border-color: #e0e0e0;
  
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.calendar-header {
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.calendar-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn, .today-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: #fff;
  cursor: pointer;
  color: #9C27B0;
  font-weight: 600;
}

.current-week {
  margin-left: 10px;
  color: #555;
  font-size: 1.1rem;
}

.calendar-grid {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.calendar-content {
  flex: 3;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
}

/* Day Headers - Synced with Grid */
.day-headers {
  display: grid;
  grid-template-columns: var(--time-col-width) repeat(7, 1fr);
  background: #fcfcfc;
  border-bottom: 1px solid var(--border-color);
  /* Accounts for the scrollbar in the grid below */
  padding-right: 17px; 
}

.time-header-spacer {
  border-right: 1px solid var(--border-color);
}

.day-header {
  padding: 12px 0;
  text-align: center;
  border-right: 1px solid #eee;
}

.day-header.today {
  background: #f9f2fb;
  box-shadow: inset 0 -2px 0 #9C27B0;
}

.day-name { font-size: 11px; color: #888; }
.day-date { font-size: 18px; font-weight: bold; color: #333; }

/* Scrollable Grid Area */
.time-grid {
  display: grid;
  grid-template-columns: var(--time-col-width) repeat(7, 1fr);
  flex: 1;
  overflow-y: scroll; /* Force scrollbar to prevent header jumping */
  position: relative;
}

.time-labels {
  border-right: 1px solid var(--border-color);
  background: #fff;
}

.time-label {
  height: var(--row-height);
  box-sizing: border-box;
  border-bottom: 1px solid #f0f0f0;
  padding: 4px 10px 0 0;
  text-align: right;
  font-size: 12px;
  color: #999;
}

.day-column {
  position: relative; /* Base for event positioning */
  border-right: 1px solid #f0f0f0;
}

.time-cell {
  height: var(--row-height);
  box-sizing: border-box;
  border-bottom: 1px solid #f0f0f0;
}

/* Event Styling */
.compact-event {
  position: absolute;
  left: 4px;
  right: 4px;
  border-radius: 4px;
  padding: 6px;
  z-index: 5;
  font-size: 11px;
  border-left: 4px solid;
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.1s;
}

.compact-event:hover { transform: scale(1.02); z-index: 10; }

.event-time { font-weight: bold; font-size: 9px; opacity: 0.8; }
.event-title { font-weight: 700; margin: 1px 0; }

.compact-event.future-accepted {
  background: #e8f5e9;
  border-left-color: #4CAF50;
  color: #1b5e20;
}

.compact-event.future-pending {
  background: #fff3e0;
  border-left-color: #ff9800;
  color: #e65100;
}

.compact-event.ongoing {
  background: #f3e5f5;
  border-left-color: #9C27B0;
  color: #4a148c;
}

.compact-event.passed {
  background: #f5f5f5;
  border-left-color: #9e9e9e;
  color: #393939;
}

/* Status label */
.event-status {
  font-size: 9px;
  margin-top: 3px;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.85;
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
</style>