<template>
    <div>
        <div class="calendar-layout">
      <WeeklyCalendar
      :events="events"
      @event-click="selectEvent"
    >
      <template #event="{ event }">
            <div class="event-title" style="font-weight: bold; text-transform: uppercase;">
                {{ event.title }}
            </div>

            <div class="event-time">
                {{ formatDate(event.startTime) }} | {{ formatEventTime(event) }}
            </div>
      </template>
    </WeeklyCalendar>

     
    


    </div>    
    </div>
</template>

<script>
import axios from 'axios';
import WeeklyCalendar from '../WeeklyCalendar.vue';


export default {
    components:{WeeklyCalendar},
    data() {
    return {
      selectedEvent: null,
      showEventModal:false,
      events:[],
    };
  },
  mounted(){
    this.fetchProfClasses();
    

  },
    methods:{
        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        },
      
        formatEventTime(event) {
            const options = { hour: 'numeric', minute: '2-digit', hour12: true };
            const start = new Date(event.startTime).toLocaleTimeString([], options);
            const end = new Date(event.endTime).toLocaleTimeString([], options);
            return `${start} - ${end}`;
        },
        fetchProfClasses(){
            const token = localStorage.getItem('token');

            if(token){

               axios.get('http://localhost:8080/professors/getExams', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(response => {
                    this.events = response.data.map(e => {
                        
                        const startDate = new Date(e.date);
                        const endDate = new Date(startDate);
                        endDate.setHours(startDate.getHours() + 1); 

                        return {
                            ...e,
                            startTime: startDate,
                            endTime: endDate,
                            title: e.practical ? "Practical Exam" : "Theory Exam",
                            enrolled: e.practical === true,
                            available: e.practical === false
                        };
                    });
                })
                .catch(error => {
                    console.error("Error fetching exams:", error);
                });

            }

        },
        selectEvent(event){
            this.showEventModal = true;
            this.selectedEvent = event;
        }
    }
}
</script>

<style  scoped>




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

</style>
