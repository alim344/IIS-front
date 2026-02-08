import { createRouter, createWebHistory } from 'vue-router';

// Import your components here
//import HelloWorld from '@/components/HelloWorld.vue'; // Update path if necessary
import HomeView from '@/view/HomeView/HomeView.vue'
import RegistrationView from '@/view/RegistrationView.vue';
import CandidateHomeView from '@/view/HomeView/CandidateHomeView.vue';
import LoginView from '@/view/LoginView.vue';
import CandidateHomeView from '@/view/HomeView/CandidateHomeView.vue';
import InstructorHomeView from '@/view/HomeView/InstructorHomeView.vue';
import ProfessorHomeView from '@/view/HomeView/ProfessorHomeView.vue';
import AdminHomeView from '@/view/HomeView/AdminHomeView.vue';


const routes = [
  { path: '/', component: HomeView },
  {path: '/register', component: RegistrationView},
  {path: '/candidate', component: CandidateHomeView},
  {path:'/login', component: LoginView},
  {path:'/candidateHome', component: CandidateHomeView},
  {path:'/instructorHome', component:InstructorHomeView},
  {path:'/professorHome', component:ProfessorHomeView},
  {path:'/adminHome', component:AdminHomeView}
];

const router = createRouter({
  history: createWebHistory(), // Use createWebHistory for Vue 3
  routes
});

export default router;