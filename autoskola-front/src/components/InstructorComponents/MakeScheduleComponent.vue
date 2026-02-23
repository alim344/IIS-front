<template>
  <div>
    <div class="calendar-layout">
      <WeeklyCalendar
        :events="[...this.events,...this.draftEvents]"
        @event-click="selectEvent"
        @cell-click="addEventAtTime" 
      >
        <template #event="{ event }">
          <div class="event-time">{{ formatEventTime(event) }}</div>
          <div class="event-title">{{ event.name }} {{ event.lastname || '' }}</div>
          <div>{{ event.category }}</div>
          <div class="event-status">{{ getEventStatusText(event) }}</div>
        </template>
      </WeeklyCalendar>

      <div class="right-panel">
        <div class="header-action">
            <button v-if="scheduleMode!=null" class="cancel_button" @click="cancelSchedule">CANCEL</button>
            <button v-if="scheduleMode!=null" class="save_button" @click="saveSchedule">SAVE SCHEDULE </button>
            <button class="create-button" v-if="!scheduleMode" @click="showModal">CREATE NEXT WEEK SCHEDULE</button>
            
        </div>
          <div class="panel-section" v-show="!isEditModalOpen && !isCreateModalOpen">
            <!-- Nothing selected -->
            <div v-if="!scheduleMode" class="requests-section">
               <h4>Requests</h4>
                
                <div v-if="requests.length === 0" class="no-requests">
                  <p>No requests from candidates</p>
                </div>

                 <div v-else class="requests-list">
                  <RequestsComponent 
                    v-for="request in requests" 
                    :key="request.id"
                    :request="request"
                    @accept="acceptRequest(request)"
                    @decline ="declineRequest(request)"
                  />
                </div>


            
            </div>

            <!-- COPY MODE -->
            <div v-else-if="scheduleMode === 'copy'">
            <h4>Copy schedule</h4>
            <p>This will duplicate this week’s schedule.</p>
            <p>Check out next week and confirm the schedule.</p>

            
            </div>

            <!-- MANUAL MODE -->
            <div v-else-if="scheduleMode === 'manual'" >
                <div class="manual_header"> 
                  <h4 class="manual_title">Manual scheduling</h4>
                </div>

                <form class="class-form" @submit.prevent="createClass"> 
                  <h5>Create a class</h5>
                  
                      <label class="form-label">Filter prefrences by day</label>
                      <select v-model="selectedDay" class="day_select">
                        <option value="">All days</option>
                        <option v-for="day in days" :key="day" :value="day">{{ day.date }} {{ day.name }}</option>
                      </select>

                      <div class="timepref_list">
                        <div v-for="item in filteredItems" :key="item.email" class="pref_card" @click="selectTimePref(item)" :class="{selected: selectedTimePref=== item}">
                          <div>{{ item.candidate_name }} {{ item.canddiate_lastname }}</div>
                          <div class="timepref_date">{{ item.date }}   {{ item.startTime }} -{{ item.endTime }}</div>
                        </div>
                      </div>

                      <div class="form_group"> 
                        <label for="startTime">Start Time:</label>
                        <input 
                        type="time"
                        key="startTime" v-model="classFormData.startTime" required
                        step="900"
                        />
                      </div>

                      <div class="form_group"> 
                        <label for="endTime">End Time:</label>
                        <input 
                        type="time"
                        key="endTime" v-model="classFormData.endTime" required
                        step="900"
                        />
                      </div>
                    

                  
                <button class="sidebar-action primary">Add class</button>
                </form>
            
            </div>


            <!--ALG MODE-->
            <div v-else-if="scheduleMode === 'alg'">
              <h4>Computer schedule</h4>
              
              <div class="alg-container">
                <div class="alg-step">
                  <p class="alg-step-title">Pick next weeks dates to be less available</p>
                  
             
                  <div class="days-checkbox-list">
                    <div 
                      v-for="day in nextWeekDays" 
                      :key="day.fullDate"
                      class="day-checkbox-item"
                      @click="toggleLightDay(day)"
                    >
                      <input 
                        type="checkbox" 
                        :checked="isLightDaySelected(day)"
                        class="day-checkbox"
                      />
                      <span class="day-name">{{ day.name }}, {{ day.date }}. {{ day.monthName }}</span>
                    </div>
                  </div>
                  
                 
                  
                </div>

                
                  <div class="alg-step">
                    <p class="alg-step-title">Choose candidate</p>
                    <div class="candidate-list">
                      <div 
                        v-for="candidate in timepref"  
                        :key="candidate.email"
                        class="candidate-item"
                        @click="toggleCandidate(candidate)"
                      >
                        <input 
                          type="checkbox" 
                          :checked="isCandidateSelected(candidate)"
                          class="candidate-checkbox"
                        />
                        <span>{{ candidate.candidate_name }} {{ candidate.canddiate_lastname }} - {{ candidate.category }}</span>
                      </div>
                      <div v-if="timepref.length === 0" class="no-data">
                        No available candidates
                      </div>
                    </div>
                  </div>

                
                <button 
                  class="alg-generate-btn"
                  :disabled="selectedCandidates.size === 0"
                  @click="generateSchedule"
                >
                  GENERATE
                </button>
              </div>
            </div>





          </div>

           <!--EDIT MODAL-->
        <div class="edit_modal" v-if="isEditModalOpen"> 
            <h3>Edit class</h3>

            <div class="candidate_info">
              <div>Name: {{ editForm.name }}</div>
              <div>Lastname: {{ editForm.lastname }}</div>
              <div>Category: {{ editForm.category }}</div>
            </div>

              <div class="form_group">
                <label>Date</label>
                <input type="date" v-model="editForm.date" />
              </div>

              <div class="form_group">
                <label>Start Time</label>
                <input type="time" v-model="editForm.startTime" />
              </div>

              <div class="form_group">
                <label>End Time</label>
                <input type="time" v-model="editForm.endTime" />
              </div>

              <div class="actions">
                <button class="sidebar-action primary" @click="saveEdit(editingEvent)">
                  Edit
                </button>
                <button class="sidebar-action" @click="closeEditModal">
                  Cancel
                </button>
                <button class="sidebar-action deletion" @click="deleteClass(editingEvent)">
                  Delete Class
                </button>
              </div>

        </div>

        <!--CREATE MODAL-->
        <div class="edit_modal" v-if="isCreateModalOpen"> 
            <h3>Create class</h3>

            <div v-for="pref in timepref" :key="pref.email" class="pref_card" @click="selectCandidate(pref)" :class="{selected: selectedCandidate=== pref}">
              <div>{{ pref.candidate_name }} {{ pref.canddiate_lastname }}</div>
            </div>

              <div class="form_group">
                <label>Date</label>
                <input type="date" v-model="classFormData.date" />
              </div>

              <div class="form_group">
                <label>Start Time</label>
                <input type="time" v-model="classFormData.startTime" />
              </div>

              <div class="form_group">
                <label>End Time</label>
                <input type="time" v-model="classFormData.endTime" />
              </div>

              <div class="actions">
                <button class="sidebar-action primary" @click="saveAClass(selectedCandidate)">
                  Save
                </button>
                <button class="sidebar-action" @click="closeCreateModal">
                  Cancel
                </button>
              </div>

        </div>

      </div>
    </div>
    <!-- Modal Overlay -->
        <div v-if="showScheduleModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
            <h3>Create next weeks schedule</h3>

            <button class="modal-option" @click="selectMode('copy')">
            Copy from this week
            </button>

            <button class="modal-option" @click="selectMode('alg')">
            Use algorithm
            </button>

            <button class="modal-option" @click="selectMode('manual')">
            Create manually
            </button>

            <button class="modal-cancel" @click="closeModal">
            Cancel
            </button>
        </div>
        </div>

       

  </div>
</template>

<script>
import axios from 'axios';
import WeeklyCalendar from '../WeeklyCalendar.vue';
import RequestsComponent from './RequestsComponent.vue';
export default {
  components: {  WeeklyCalendar,RequestsComponent},
    props:{
        events: {
        type: Array,
        required: true
    }
    },
  data() {
    return {
      currentDate: new Date(),
      selectedEvent: null,
      rowHeight: 60, 
      startHour: 8,  
      times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
              '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],

       showScheduleModal: false,
       scheduleMode: null,  // manual i alg i copy old
       draftEvents: [],
       timepref: [],
      selectedDay:null,
      selectedTimePref:null,
      classFormData:{
        startTime:null,
        endTime:null,
        date:null,
      },
      isEditModalOpen: false,
      isCreateModalOpen:false,
      selectedCandidate: null,
      editingEvent:null,
      requests: [],
      editForm: {
        date: null,
        startTime: null,
        endTime: null,
        name: "",
        lastname: "",
        category: "",
        
      },
      requestId:null,
      selectedLightDays: [],
     selectedCandidates: new Set(),
       
     
    };
  },
  mounted() {
    this.getInstructorRequests();
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
    nextWeekDays() {
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
    
      const nextMonday = new Date(thisMonday);
      nextMonday.setDate(thisMonday.getDate() + 7);
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(nextMonday);
        date.setDate(nextMonday.getDate() + i);
        
        days.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
          date: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
          fullDate: date,
          monthName: date.toLocaleDateString('en-US', { month: 'short' })
        });
      }
      return days;
    },
   
    filteredItems(){
      if (!this.selectedDay) {
        return this.timepref; 
      }

       const selected = new Date(
        this.selectedDay.year,
        this.selectedDay.month,   
        this.selectedDay.date     
      );


    return this.timepref.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.toDateString() === selected.toDateString();
    });
    },
    

  },

  methods: {
    
   
    showModal(){
        this.showScheduleModal = true;
    },
    closeModal(){
        this.showScheduleModal = false;
    },
    toLocalDateTimeString(date) {
      const pad = n => n.toString().padStart(2, '0');

      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    },
    toLocalDateString(date) {
      const pad = n => n.toString().padStart(2, '0');
      
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    },
    getTimePrefs(){
       const token = localStorage.getItem("token");

            if(token){
              axios.get('http://localhost:8080/time_pref/get_by_inst_id', 
              {headers:{Authorization: `Bearer ${token}`}})
                .then(response => {this.timepref = response.data})
                .catch(error => { console.error("Fetch error:", error); })
            }
    },
    selectMode(mode) {
        this.scheduleMode = mode;
        this.showScheduleModal = false;

        this.currentDate = this.getNextMonday()
        this.draftEvents = [];

        if(mode === 'copy'){
          this.getCopiedNextWeek();
        }
        
         if ((mode === 'manual' || mode === 'alg') && this.timepref.length === 0) {
            this.getTimePrefs();
         }

    },

    getCopiedNextWeek(){

      const token = localStorage.getItem('token');

      if(token){

        axios.get('http://localhost:8080/practicalclass/getCopiedSchedule', { headers: { Authorization: `Bearer ${token}` }})
        .then(response=> { 
          this.draftEvents = response.data.map(e => ({
            ...e,
            isDraft: true,     
            accepted: false   
          }));
        }).catch(err => {
        if (err.response?.status === 409) {
          alert("Cannot copy — next week already has classes that overlap");
          this.scheduleMode= null;
        }
      });

      }




    },

    getNextMonday(date = new Date()){
      const d = new Date(date);
      const day = d.getDay();  // 0- Sunday, 1-Monday

        const diffToMonday = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diffToMonday);

        
        d.setDate(d.getDate() + 7);

        d.setHours(0, 0, 0, 0);
        return d;
    },
    getEventsForDay(day) {
      return [...this.events,...this.draftEvents].filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.getDate() === day.date &&
               eventDate.getMonth() === day.month &&
               eventDate.getFullYear() === day.year;
      });
    },
    getEventStatus(event){

      if (event.isDraft) return 'future-pending';
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
    canEditEvent(event) {
        const now = new Date();
        const eventEnd = new Date(event.endTime);
        return event.isDraft || (!event.accepted && eventEnd > now);
      },

    selectEvent(event) {
      
      if (!this.canEditEvent(event)) return;

      this.editingEvent = event;
      this.isEditModalOpen = true;

      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      this.editForm.date = start.toISOString().slice(0, 10);
      this.editForm.startTime = start.toTimeString().slice(0, 5);
      this.editForm.endTime = end.toTimeString().slice(0, 5);

      this.editForm.name = event.name;
      this.editForm.lastname = event.lastname;
      this.editForm.category = event.category;

    },

    addEventAtTime({day, time}) {
      
      
       const date = new Date(day.fullDate);
      

      
      const parsed = new Date(`1970-01-01 ${time}`);
      const hours = parsed.getHours().toString().padStart(2, "0");
      const minutes = parsed.getMinutes().toString().padStart(2, "0");


      const startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);

      if (startDateTime <= new Date()) {
        alert("Start time must be in the future");
        return;
      }
      this.isCreateModalOpen = true;
      this.getTimePrefs();

      this.classFormData.date = date.toISOString().slice(0, 10);

      this.classFormData.startTime = `${hours}:${minutes}`;
      this.classFormData.endTime = null;

      
      },

    selectTimePref(item){

      if (!item) return;
      this.selectedTimePref = item;

      this.classFormData.startTime = item.startTime;
      this.classFormData.endTime = item.endTime;
    },

     isTimeSlotTaken(newStart, newEnd) {

          const allEvents = [...this.events, ...this.draftEvents];

          const sameDateEvents = allEvents.filter(event => {
            const start = new Date(event.startTime);
             return (
              start.toDateString() === newStart.toDateString() &&
              (!this.editingEvent || event.id !== this.editingEvent.id)
            );
          });

          for (const event of sameDateEvents) {
            const start = new Date(event.startTime);
            const end = new Date(event.endTime);

            if (newStart < end && newEnd > start) {
              return true; 
            }
          }

          return false; 
   },

   saveAClass(){
      
        if(this.selectedCandidate == null){
          alert('Select a candidate')
          return;
        }

        if (!this.classFormData.date || 
          !this.classFormData.startTime || 
          !this.classFormData.endTime) {
        alert("Please fill all fields");
        return;
      }

      
        const newStartDate = new Date(`${this.classFormData.date}T${this.classFormData.startTime}`);
        const newEndDate = new Date(`${this.classFormData.date}T${this.classFormData.endTime}`);

        const newClass= {
        email: this.selectedCandidate.email,
        startTime: this.toLocalDateTimeString(newStartDate),
        endTime: this.toLocalDateTimeString(newEndDate),
        name: this.selectedCandidate.candidate_name,
        lastname: this.selectedCandidate.canddiate_lastname,
        category: this.selectedCandidate.category,
        accepted: false,
        isDraft: true
      };

        if (this.isTimeSlotTaken(newStartDate, newEndDate)) {
            alert("Time slot already taken");
            return;
          }


        if (this.scheduleMode !== null) {

          if (this.isTimeSlotTaken(newStartDate, newEndDate)) {
            alert("Time slot already taken");
            return;
          }

          this.draftEvents.push(newClass);
          this.closeCreateModal();
          return;
        }

        const oneClass=
          {  email : this.selectedCandidate.email,
             startTime :this.toLocalDateTimeString(newStartDate),
             endTime : this.toLocalDateTimeString(newEndDate),}
        

        const token = localStorage.getItem('token');
        const params = this.requestId ? { requestId: this.requestId } : {};

        if(token){
          axios.post(`http://localhost:8080/practicalclass/saveClass`,oneClass,
          {params: params, headers: { Authorization: `Bearer ${token}` }})
          .then(() => {
                this.$emit('refreshEvents');
                
                if(this.requestId != null){
                  this.requests = this.requests.filter(r => r.id !== this.requestId);
                  this.requestId = null;
                }
                this.closeCreateModal();
                

        })
            .catch(error => {
                console.error("Fetch error:", error);
            });
        }



   },

    createClass(){

        if(!this.selectedTimePref){
          alert('Select a candidate')
          return;
        }

          const day = new Date(this.selectedTimePref.date);

          const [startHour, startMinute] = this.classFormData.startTime.split(":");
          const [endHour, endMinute] = this.classFormData.endTime.split(":");

          const startDateTime = new Date(day);
          startDateTime.setHours(startHour, startMinute, 0, 0);

          const endDateTime = new Date(day);
          endDateTime.setHours(endHour, endMinute, 0, 0);

          

          const draftEvent = {
            startTime: this.toLocalDateTimeString( startDateTime),
            endTime: this.toLocalDateTimeString(endDateTime),

            name: this.selectedTimePref.candidate_name,
            lastname: this.selectedTimePref.canddiate_lastname,
            email: this.selectedTimePref.email,
            category: this.selectedTimePref.category,

            accepted: false,
            isDraft: true
          };

          if(this.isTimeSlotTaken(startDateTime,endDateTime)){
            alert('Time slot already taken');
            return;
          }

           this.draftEvents.push(draftEvent);

           
            this.selectedTimePref = null;
            this.classFormData.startTime = null;
            this.classFormData.endTime = null;

    },
    closeEditModal() {
      this.isEditModalOpen = false;
      this.editingEvent = null;
    },

    saveEdit(){

      if (!this.editForm.date || !this.editForm.startTime || !this.editForm.endTime) {
        alert("Please fill all fields");
        return;
      }

      const start = new Date(this.editForm.date);
      const [sh, sm] = this.editForm.startTime.split(":");
      start.setHours(sh, sm, 0, 0);

      const end = new Date(this.editForm.date);
      const [eh, em] = this.editForm.endTime.split(":");
      end.setHours(eh, em, 0, 0);

      const now = new Date();

      if (start <= now) {
        alert("Start time must be in the future");
        return;
      }

      if (end <= start) {
        alert("End time must be after start time");
        return;
      }

       if (this.isTimeSlotTaken(start, end, this.editingEvent)) {
        alert("Time slot already taken!");
        return;
      }

    this.editingEvent.startTime = this.toLocalDateTimeString(start);
    this.editingEvent.endTime = this.toLocalDateTimeString(end);


      if(!this.editingEvent.isDraft){

       axios.patch(`http://localhost:8080/practicalclass/updateDateTime`, this.editingEvent)
        .then(() => {
          console.log("Class updated successfully!");
          this.closeEditModal();
        })
        .catch(error => {
          if (error.response && error.response.status === 409) {
             alert("Update conflict occurred! Please adjust the time.");
            console.warn("Update conflict occurred!");
          } else {
            console.error("Error updating class:", error);
          }
        });

      }else{
        this.closeEditModal();
      }

      
    },
    async deleteClass(event){

        if (event.isDraft) {
          this.draftEvents = this.draftEvents.filter(e => e !== event);
          
          this.closeEditModal();
          return;
        }

        const id = event.id;


        try {
          await axios.delete(`http://localhost:8080/practicalclass/deleteById/${id}`);
           this.$emit('refreshEvents');
          this.closeEditModal();
          console.log("Deleted and removed from events list");
          return;
        } catch (error) {
          console.error("Error deleting:", error);
        }
       

    },
    cancelSchedule(){
      this.draftEvents = [];
      this.showScheduleModal= false;
      this.scheduleMode= null; 
      this.selectedDay=null;
      this.selectedTimePref=null;
      this.selectedCandidates= new Set();
      this.selectedLightDays = [];

    },
    saveSchedule(){
      if(this.draftEvents.length == 0){
        alert('The schedule has not been created');
        return;
      }

      const drafts = this.draftEvents.map(e => ({
        email: e.email,
        startTime: e.startTime,
        endTime: e.endTime,
      }));

      const token = localStorage.getItem('token');
      

     axios.post('http://localhost:8080/practicalclass/manual_schedule/save', drafts, { headers: { Authorization: `Bearer ${token}` }})
    .then(res => {
      console.log('Drafts saved successfully', res.data);

      this.draftEvents = [];

      this.$emit('refreshEvents');

      this.showScheduleModal= false;
      this.scheduleMode= null; 
    })
    .catch(err => console.error(err));



    },
    selectCandidate(pref){
      this.selectedCandidate = pref;
    },
    closeCreateModal(){
                this.isCreateModalOpen = false;
                this.selectedCandidate= null;
                this.classFormData.date = null;
                this.classFormData.startTime = null;
                this.classFormData.endTime = null;
                this.requestId = null;
    },
  getInstructorRequests() {

    const token = localStorage.getItem("token");
    
    if (token) {
      axios.get('http://localhost:8080/request/getInstructorRequests', 
        { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          this.requests = response.data;
        })
        .catch(error => {
          console.error("Error fetching requests:", error);
        });
    }
  },
   acceptRequest(request){
    
    
    this.getTimePrefs();
    this.isCreateModalOpen = true;

    this.requestId = request.id;
    
    
  },
  declineRequest(request){

    const requestId = request.id;

     axios.patch(`http://localhost:8080/request/declineRequest/${requestId}`,)
      .then(response => {
        console.log(response.data);
        this.requests = this.requests.filter(r => r.id !== requestId);
      })
      .catch(error => {
      console.error("Error accepting request:", error);
      alert("Failed to accept request.");
    });


  },
   toggleLightDay(day) {
    const index = this.selectedLightDays.findIndex(d => d.fullDate === day.fullDate);
    if (index === -1) {
      this.selectedLightDays.push(day);
    } else {
      this.selectedLightDays.splice(index, 1);
    }
  },
  
  isLightDaySelected(day) {
    return this.selectedLightDays.some(d => d.fullDate === day.fullDate);
    
  },
  toggleCandidate(candidate) {
    if (this.selectedCandidates.has(candidate.email)) {
      this.selectedCandidates.delete(candidate.email);
    } else {
      this.selectedCandidates.add(candidate.email);
    }
    this.selectedCandidates = new Set(this.selectedCandidates); // za reactivity
  },
  
  isCandidateSelected(candidate) {
    return this.selectedCandidates.has(candidate.email);
  },


  generateSchedule(){
    if (this.selectedCandidates.size === 0) {
      alert('You have to pick at least one candidate');
      return;
    }

    if(this.selectedCandidates.size > 12){
      alert('You have picked more candidates then you can take a week. 12 max');
    }

    if (this.selectedLightDays.length > 2) {
        alert("You can only pick two days");
        return; 
    }

    const lightDays = this.selectedLightDays.map(day => 
      this.toLocalDateString(new Date(day.fullDate))
    );

    

    const emails = Array.from(this.selectedCandidates);


    const scheduleData=
          {  lightDays : lightDays,
             emails :emails,}

             const token = localStorage.getItem('token');
             if(token== null)return;

      axios.post('http://localhost:8080/practicalclass/schedule/alg', scheduleData,
        {
                headers: { Authorization: `Bearer ${token}` }
            }
      )
        .then(response=> { 
          this.draftEvents = response.data.map(e => ({
            ...e,
            isDraft: true,     
            accepted: false   
          }));
        }).catch(err => {
       
          alert("Error has happened!! You have classes next week maybe"+err);
          
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

.header-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 20px auto 30px auto;
  
}



.create-button {
  background: rgb(190, 143, 233);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

.create-button:hover {
  background: #3a283c;
}

.save_button{
  background: rgb(101, 164, 111);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

.save_button:hover{
  background: #1b5e20;
}

.cancel_button{
   background: rgb(194, 102, 102);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

.cancel_button:hover{
  background: rgb(98, 31, 31);
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

   display: flex;
  flex-direction: column;
  overflow-y: auto;
   position: relative; 
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

.requests-section {
  padding: 10px 0;
}

.requests-section h4 {
  color: #3a283c;
  margin: 0 0 15px 0;
  font-size: 1rem;
  font-weight: 600;
}

.no-requests {
  text-align: center;
  color: #777;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 5px;
}


.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 25px;
  border-radius: 30px;
  width: 300px;
  text-align: center;
  box-shadow: #333;
}

.modal-option {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border: none;
  background: rgb(154, 154, 174);
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.modal-option:hover {
  background: rgb(117, 117, 172);
}

.modal-cancel {
  margin-top: 15px;
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
}

/* Sidebar buttons */
.sidebar-action {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.sidebar-action.primary {
  background: rgb(154, 154, 174);
  color: white;
  border: none;
}

.deletion{
  background: red;
  color: white;
}

.deletion:hover{
  background: white;
  color: red;
  box-shadow:2px solid #9C27B0;
}


.class-form{
  display: flex;
  flex-direction: column;
  align-content: center;
  border: 3px solid rgb(190, 143, 233);  /* Use your purple color */
  padding: 5px 25px;
  background: white;
  box-shadow: 0 6px 20px rgba(190, 143, 233, 0.2);
  border-radius: 16px;
  min-height: 250px;
  gap: 15px;  /* Space between child elements */
}


.day_select{
   width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s;
}

.manual_header{
  margin-bottom: 32px;
}

.manual_title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
}

.timepref_list{
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px #827e88;

  max-height: 300px;      
  overflow-y: auto;       
  padding-right: 6px; 
}

.pref_card{
  border: 1px solid #000205;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 5px;
  transition: all 0.2s;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pref_card:hover{
  border-radius: 12px;
  background: #827e88;
  
}

.pref_card.selected{
   border: 2px solid #1b5e20;   /* green border */
  background-color: #e8f5e9; 
}

.timepref_date{
  font-size: small;
  color: #333;

}




.form_group{
  padding: 5px;
  gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: center ;
  margin: 10px;
  border-bottom: 2px solid rgb(168, 147, 159);
}

.form_group label{
   display: block;
  margin-bottom: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

.form_group input{
   width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.edit_modal{
  position: absolute;
 
  width: 240px;          
  height: 100%; 
  background: white;
  border-left: 1px solid #e0e0e0;
  box-shadow: -6px 0 20px rgba(0,0,0,0.08);
  z-index: 900;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
 
   
}

.candidate_info{
  margin: 10px;
  margin-top: 0px;
  padding: 10px;
  border-bottom:2px solid #4CAF50;
  display: flex;
  flex-direction: column;
}


.alg-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding: 10px 0;
}

.alg-step {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid rgb(190, 143, 233);
}

.alg-step-title {
  margin: 0 0 15px 0;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

/* Checkbox lista za dane */
.days-checkbox-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  margin-bottom: 10px;
}

.day-checkbox-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.day-checkbox-item:hover {
  background: #f0e6ff;
}

.day-checkbox-item:last-child {
  border-bottom: none;
}

.day-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: rgb(190, 143, 233);
}

.day-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.selected-summary {
  background: #e8f5e9;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #2e7d32;
}

/* Lista kandidata */
.candidate-list {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.candidate-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.candidate-item:hover {
  background: #f0e6ff;
}

.candidate-item:last-child {
  border-bottom: none;
}

.candidate-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: rgb(190, 143, 233);
}

.no-data {
  padding: 30px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.alg-generate-btn {
  width: 100%;
  padding: 14px;
  background: rgb(190, 143, 233);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.alg-generate-btn:hover:not(:disabled) {
  background: #9b7bb5;
}

.alg-generate-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>