<!-- src/components/candidate/SidebarNav.vue -->
<template>
  <nav class="sidebar">
    <ul class="nav-menu">
      <li 
        v-for="navItem in navItems" 
        :key="navItem.id"
        :class="{ active: activeSection === navItem.id }"
        @click="$emit('navigate', navItem.id)"
      >
        <span class="nav-icon">{{ navItem.icon }}</span>
        <span class="nav-text">{{ navItem.text }}</span>
      </li>
    </ul>
    
  </nav>
</template>

<script setup>
import { ref } from 'vue';

const navItems = ref([
  { id: 'home', text: 'Home', icon: '🏠' },
  { id: 'schedule', text: 'Schedule', icon: '📅' },
  { id: 'notifications', text: 'Notifications', icon: '🔔' },
  { id: 'profile', text: 'MyProfile', icon: '👤' }
]);
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: white;
  padding: 30px 0;
  border-right: 1px solid #e9e1f5;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  padding: 18px 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.nav-menu li:hover {
  background-color: #f9f5ff;
  border-left-color: #be8fe9;
}

.nav-menu li.active {
  background-color: #f0e9ff;
  border-left-color: #6a0dad;
  font-weight: 600;
  color: #4f364b;
}

.nav-icon {
  font-size: 20px;
}

.nav-text {
  font-size: 16px;
}

.progress-summary {
  margin-top: auto;
  padding: 25px;
  background: linear-gradient(135deg, #f9f5ff 0%, #f0e9ff 100%);
  border-radius: 15px;
  margin: 25px;
}

.progress-summary h3 {
  color: #4f364b;
  margin-bottom: 20px;
  font-size: 18px;
}

.progress-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.progress-item span:first-child {
  color: #666;
  font-size: 14px;
  flex: 1;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background-color: #e9e1f5;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 10px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
}

.progress-fill.theory {
  background: linear-gradient(90deg, #6a0dad 0%, #be8fe9 100%);
}

.progress-fill.practical {
  background: linear-gradient(90deg, #4f364b 0%, #a992c4 100%);
}

.remaining-hours {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #d9c9e9;
  text-align: center;
}

.remaining-hours p {
  margin: 0;
  color: #4f364b;
}

.remaining-hours strong {
  font-size: 24px;
  color: #6a0dad;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    flex-direction: row;
    padding: 15px 0;
    overflow-x: auto;
  }
  
  .nav-menu {
    display: flex;
  }
  
  .nav-menu li {
    flex-direction: column;
    padding: 15px;
    min-width: 100px;
    text-align: center;
    border-left: none;
    border-bottom: 4px solid transparent;
  }
  
  .nav-menu li.active,
  .nav-menu li:hover {
    border-left: none;
    border-bottom-color: #6a0dad;
  }
  
  .progress-summary {
    display: none;
  }
}
</style>