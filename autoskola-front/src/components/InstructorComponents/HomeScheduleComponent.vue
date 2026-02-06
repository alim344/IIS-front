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
            <div v-for="time in times" :key="time" class="time-cell" @click="addEventAtTime(day, time)"></div>

            <div 
              v-for="event in getEventsForDay(day)" 
              :key="event.startTime + event.email" 
              class="compact-event"
              :class="event.category.toLowerCase()"
              :style="getEventStyle(event)"
              @click.stop="selectEvent(event)"
            >
              <div class="event-time">{{ formatEventTime(event) }}</div>
              <div class="event-title">{{ event.name }} {{ event.lastname }}</div>
              <div class="event-category">{{ event.category }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-header">
          <h3>Summary</h3>
          <p class="panel-subtitle">Week Overview</p>
        </div>
        <div class="panel-sections">
          <div class="panel-section">
            <h4>Stats</h4>
            <div class="stat-item">
              <div class="stat-value">{{ events.length }}</div>
              <div class="stat-label">Classes Scheduled</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      currentDate: new Date(),
      selectedEvent: null,
      rowHeight: 60, // Matches CSS height
      startHour: 8,  // Calendar starts at 8 AM
      times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
              '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
      events: []
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

    getEventStyle(event) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      const startMinutes = (start.getHours() * 60 + start.getMinutes()) - (this.startHour * 60);
      const durationMinutes = (end - start) / (1000 * 60);

      const top = (startMinutes / 60) * this.rowHeight;
      const height = (durationMinutes / 60) * this.rowHeight;

      return {
        top: `${top}px`,
        height: `${height - 4}px` 
      };
    },

    formatEventTime(event) {
      const options = { hour: 'numeric', minute: '2-digit', hour12: true };
      const start = new Date(event.startTime).toLocaleTimeString([], options);
      const end = new Date(event.endTime).toLocaleTimeString([], options);
      return `${start} - ${end}`;
    },

    selectEvent(event) {
      this.selectedEvent = event;
    },

    addEventAtTime(day, time) {
      alert(`Add event on ${day.name} at ${time}`);
    }
  },

  mounted() {
    const token = localStorage.getItem("token");
    if(token) {
      axios.get('http://localhost:8080/practicalclass/fullschedule', { 
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => { this.events = response.data; })
      .catch(error => { console.error("Fetch error:", error); });
    }
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

.compact-event.a { background: #e3f2fd; border-left-color: #2196F3; color: #0d47a1; }
.compact-event.b { background: #e8f5e9; border-left-color: #4CAF50; color: #1b5e20; }
.compact-event.c { background: #f3e5f5; border-left-color: #9C27B0; color: #4a148c; }
.compact-event.am { background: #fff3e0; border-left-color: #FF9800; color: #e65100; }

.event-time { font-weight: bold; font-size: 9px; opacity: 0.8; }
.event-title { font-weight: 700; margin: 1px 0; }

.right-panel {
  flex: 1;
  max-width: 300px;
  padding: 20px;
  background: #fafafa;
}
</style>