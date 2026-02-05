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


const routes = [
  { path: '/b', component: HomeView },
  {path: '/register', component: RegistrationView},
  {path:'/login', component: LoginView},
  {path:'/candidateHome', component: CandidateHomeView},
  {path:'/', component:InstructorHomeView},
  {path:'/professorHome', component:ProfessorHomeView},
  {path:'/adminHome', component:AdminHomeView},
  {path:'/homeschedule', component:HomeScheduleComponent},
  {path:'/classtracking', component:ClassTrackingComponent},
  {path:'/instructorProfile', component:InstructorProfileComponent},
  {path:'/instructorTrends', component:InstructorTrendsComponent},
 
];

const router = createRouter({
  history: createWebHistory(), // Use createWebHistory for Vue 3
  routes
});

export default router;