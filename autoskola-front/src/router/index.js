import { createRouter, createWebHistory } from 'vue-router';

// Import your components here
//import HelloWorld from '@/components/HelloWorld.vue'; // Update path if necessary
import HomeView from '@/view/HomeView/HomeView.vue'
import RegistrationView from '@/view/RegistrationView.vue';
import CandidateHomeView from '@/view/HomeView/CandidateHomeView.vue';


const routes = [
  { path: '/', component: HomeView },
  {path: '/register', component: RegistrationView},
  {path: '/candidate', component: CandidateHomeView},
];

const router = createRouter({
  history: createWebHistory(), // Use createWebHistory for Vue 3
  routes
});

export default router;