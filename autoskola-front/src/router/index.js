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


const routes = [
  { path: '/', component: HomeView },
  {path: '/register', component: RegistrationView},
  {path:'/login', component: LoginView},
  {path:'/candidateHome', component: CandidateHomeView},
  {path:'/instructorHome', component:InstructorHomeView},
  {path:'/professorHome', component:ProfessorHomeView},
  {path:'/adminHome', component:AdminHomeView},
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