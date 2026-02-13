<template>
    <div>
        <header class="top"> 
            <div class ="logo"> 
                <span class = "big_logo">TaSaMi</span>
                <span class = "small_logo">Car school</span>
            </div>
            <div class = "authbuttons"> 
                <button class = "log button" @click="navigateToHomePage">Log out</button>
            </div>
        </header>
        
        <div class="main-container">
           
            <aside class="sidebar">
                
                <nav class="sidebar-nav">
                    <ul>
                        <li 
                            v-for="tab in tabs" 
                            :key="tab.id"
                            :class="{ 'active': activeComponent === tab.component }"
                            @click="setActiveComponent(tab.component)"
                        >
                            
                            <span class="nav-text">{{ tab.text }}</span>
                        </li>
                    </ul>
                </nav>
                
            </aside>

            <!-- Main Content Area -->
            <main class="content-area">
                <div class="content-wrapper">
                    <component :is="activeComponent" 
                    :events="events"
                    @update-events="events = $event"/>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import HomeScheduleComponent from '@/components/InstructorComponents/HomeScheduleComponent.vue';
import ClassTrackingComponent from '@/components/InstructorComponents/ClassTrackingComponent.vue';
import InstructorTrendsComponent from '@/components/InstructorComponents/InstructorTrendsComponent.vue';
import InstructorProfileComponent from '@/components/InstructorComponents/InstructorProfileComponent.vue';
import MakeScheduleComponent from '@/components/InstructorComponents/MakeScheduleComponent.vue';
import InstructorVehicleComponent from "@/components/InstructorComponents/InstructorVehicleComponent.vue";

export default {
    name: 'InstructorDashboard',
    
    components: {
        HomeScheduleComponent,
        ClassTrackingComponent,
        InstructorTrendsComponent,
        InstructorProfileComponent,
        MakeScheduleComponent,
        InstructorVehicleComponent
    },

    data() {
        return {
            activeComponent: 'HomeScheduleComponent',
            events: [],
            tabs: [
                { id: 1, text: 'Schedule', component: 'HomeScheduleComponent' },
                { id: 2, text: 'Handle Schedule', component: 'MakeScheduleComponent' },
                { id: 3, text: 'Class Tracking', component: 'ClassTrackingComponent' },
                { id: 4, text: 'Trends', component: 'InstructorTrendsComponent'},
                { id: 5, text: 'Profile', component: 'InstructorProfileComponent' },
                { id: 6, text: 'Vehicle', component: InstructorVehicleComponent}
            ]
        };
    },

    

    methods: {
        navigateToHomePage() {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            this.$router.push('/');
        },
        
        setActiveComponent(component) {
            this.activeComponent = component;
        }
    },
    mounted(){
        const token = localStorage.getItem("token");
        if(token) {
        axios.get('http://localhost:8080/practicalclass/fullschedule', { 
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => { this.events = response.data; })
        .catch(error => { console.error("Fetch error:", error); });
        }
    }

   
}
</script>

<style scoped>
.top {
    display: flex;
    justify-content: space-between;
    align-content: center;
    width: 100%;
    height: 80px;
    background-color: rgb(154, 154, 174);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 20;
}

.logo {
    margin: 20px;
}

.big_logo {
    font-size: 40px;
    font-weight: 700;
    color: white;
}

.small_logo {
    font-size: 19px;
    opacity: 0.8;
    margin-left: 5px;
}

.authbuttons {
    margin: 10px;
    align-content: center;
    padding: 10px;
    justify-content: space-between;
}

.button {
    border: 2px;
    padding: 8px 15px;
    margin: 0 10px;
    border-radius: 10px;
    cursor: pointer;
}

.log {
    border-color: rgb(58, 40, 60);
    box-shadow: 0 4px 6px rgba(39, 27, 27, 0.9);
    font-size: 20px;
    background-color: rgb(190, 143, 233);
    transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.log:hover {
    color: #484264;
    background-color: #342b56;
    color: #fef9fb;
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(199, 147, 221, 0.8);
}

/* Main container for sidebar and content */
.main-container {
    display: flex;
    min-height: calc(100vh - 80px);
    margin-top: 80px; /* Height of the fixed header */
}

/* Sidebar styles */
.sidebar {
    width: 250px;
    background: linear-gradient(180deg, #3a283c 0%, #2c1f2d 100%);
    color: white;
    position: fixed;
    height: calc(100vh - 80px);
    left: 0;
    top: 80px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
}

.sidebar-header {
    padding: 25px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
}

.sidebar-header h2 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    color: #e6e6e6;
}

.sidebar-nav {
    flex: 1;
    padding: 20px 0;
}

.sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar-nav li {
    padding: 15px 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    margin: 5px 10px;
    border-radius: 8px;
}

.sidebar-nav li:hover {
    background-color: rgba(190, 143, 233, 0.2);
    transform: translateX(5px);
}

.sidebar-nav li.active {
    background-color: rgb(190, 143, 233);
    color: #2c1f2d;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(190, 143, 233, 0.3);
}

.nav-icon {
    font-size: 1.2rem;
    margin-right: 15px;
    width: 24px;
    text-align: center;
}

.nav-text {
    font-size: 1rem;
}

.sidebar-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
}

/* Main content area */
.content-area {
    flex: 1;
    margin-left: 250px; /* Width of sidebar */
    padding: 20px;
    background-color: #f5f5f7;
    min-height: calc(100vh - 80px);
}

.content-header {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.content-header h1 {
    margin: 0;
    color: #3a283c;
    font-size: 1.8rem;
}

.content-wrapper {
    background-color: white;
    padding: 25px;
    border-radius: 10px;
    min-height: calc(100vh - 180px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

</style>