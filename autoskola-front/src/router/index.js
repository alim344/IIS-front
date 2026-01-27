import { createRouter, createWebHistory } from 'vue-router';

// Import your components here
import HelloWorld from '@/components/HelloWorld.vue'; // Update path if necessary

const routes = [
  { path: '/', component: HelloWorld },
 
];

const router = createRouter({
  history: createWebHistory(), // Use createWebHistory for Vue 3
  routes
});

export default router;