<template>
    <div>
        <div class="calendar-layout">
      <WeeklyCalendar
      :events="events"
      @event-click="selectEvent"
    >
      <template #event="{ event }">
            <div >CLASS</div>
            <div class="event-time">{{ formatEventTime(event) }}</div>
            <div>students: {{ event.enrolledStudents }}</div>
            <button class="event-button">SEE MORE</button>
      </template>
    </WeeklyCalendar>

      <MyClassDetails 
        v-if="showEventModal && selectedEvent"
        :event="selectedEvent"
        @close="showTheoryModal = false; selectedEvent = null"
        
      />

    


    </div>    
    </div>
</template>

<script>
import axios from 'axios';
import WeeklyCalendar from '../WeeklyCalendar.vue';
import MyClassDetails from './MyClassDetails.vue';

export default {
    components:{WeeklyCalendar,MyClassDetails},
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
      
        formatEventTime(event) {
            const options = { hour: 'numeric', minute: '2-digit', hour12: true };
            const start = new Date(event.startTime).toLocaleTimeString([], options);
            const end = new Date(event.endTime).toLocaleTimeString([], options);
            return `${start} - ${end}`;
        },
        fetchProfClasses(){

            

                axios.get('http://localhost:8080/theoryclass/fullschedule')
                    .then(response => {
                        
                        this.events = response.data.map(e => ({
                        ...e,
                        available: true
                    }));
                    })
                    .catch(error => {
                        console.error("Fetch error:", error);
                    });

            

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
