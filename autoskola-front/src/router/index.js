import { createRouter, createWebHistory } from 'vue-router';

// Import your components here
//import HelloWorld from '@/components/HelloWorld.vue'; // Update path if necessary
import HomeView from '@/view/HomeView/HomeView.vue'
import RegistrationView from '@/view/RegistrationView.vue';
import LoginView from '@/view/LoginView.vue';
import CandidateHomeView from '@/view/HomeView/CandidateHomeView.vue';
import InstructorHomeView from '@/view/HomeView/InstructorHomeView.vue';
import ProfessorHomeView from '@/view/HomeView/ProfessorHomeView.vue';
import AdminHomeView from '@/view/HomeView/AdminHomeView.vue';
import HomeScheduleComponent from '@/components/InstructorComponents/HomeScheduleComponent.vue';
import ClassTrackingComponent from '@/components/InstructorComponents/ClassTrackingComponent.vue';
import InstructorProfileComponent from '@/components/InstructorComponents/InstructorProfileComponent.vue';
import InstructorTrendsComponent from '@/components/InstructorComponents/InstructorTrendsComponent.vue';
import MakeScheduleComponent from '@/components/InstructorComponents/MakeScheduleComponent.vue';
import AdminInstructorsComponent from "@/components/AdminComponents/AdminInstructorsComponent.vue";
import AdminProfessorsComponent from "@/components/AdminComponents/AdminProfessorsComponent.vue";
import AdminProfileComponent from "@/components/AdminComponents/AdminProfileComponent.vue";
import AdminStudentsComponent from "@/components/AdminComponents/AdminStudentsComponent.vue";
import AdminVehiclesComponent from "@/components/AdminComponents/AdminVehiclesComponent.vue";
import InstructorDetailsComponent from "@/components/AdminComponents/InstructorDetailsComponent.vue";
import ProfessorDetailsComponent from "@/components/AdminComponents/ProfessorDetailsComponent.vue";
import VehicleDetailsComponent from "@/components/AdminComponents/VehicleDetailsComponent.vue";


const routes = [
  { path: '/', component: HomeView },
  {path: '/register', component: RegistrationView},
  {path:'/login', component: LoginView},
  {path:'/candidateHome', component: CandidateHomeView},
  {path:'/instructorHome', component:InstructorHomeView},
  {path:'/professorHome', component:ProfessorHomeView},

  {path: '/adminHome',
    component: AdminHomeView,
    children: [

      { path: 'instructors', component: AdminInstructorsComponent },
      { path: 'instructors/:id', component: InstructorDetailsComponent },

      { path: 'students', component: AdminStudentsComponent },

      { path: 'vehicles', component: AdminVehiclesComponent },
      { path: 'vehicles/:id', component: VehicleDetailsComponent },

      { path: 'professors', component: AdminProfessorsComponent },
      { path: 'professors/:id', component: ProfessorDetailsComponent },

      { path: 'profile', component: AdminProfileComponent },

    ]},

  {path:'/homeschedule', component:HomeScheduleComponent, props: true},
  {path:'/classtracking', component:ClassTrackingComponent, props: true},
  {path:'/instructorProfile', component:InstructorProfileComponent, props: true},
  {path:'/instructorTrends', component:InstructorTrendsComponent, props:true},
  {path:'/makeschedule', component: MakeScheduleComponent, props:true},
 
];

const router = createRouter({
  history: createWebHistory(), // Use createWebHistory for Vue 3
  routes
});

export default router;