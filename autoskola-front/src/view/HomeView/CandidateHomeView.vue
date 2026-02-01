<!-- src/view/HomeView/CandidateHomeView.vue -->
<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <span class="big-logo">TaSaMi</span>
        <span class="small-logo">Auto škola</span>
      </div>
      <div class="user-info">
        <span class="welcome">Welcome, {{ candidateName }}</span>
        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="content">
      <!-- Sidebar -->
      <nav class="sidebar">
        <ul class="nav-list">
          <li 
            v-for="item in navItems" 
            :key="item.id"
            :class="{ active: activeNav === item.id }"
            @click="setActiveNav(item.id)"
          >
            <span class="icon">{{ item.icon }}</span>
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </nav>

      <!-- Main Area -->
      <main class="main">
        <div class="welcome-card">
          <h1>Welcome, {{ candidateName }}!</h1>
          <p>This is your home page. Here you can navigate to your profile, progress and schedule.</p>
        </div>

        <div class="stats">
          <div class="stat-card">
            <h3>Theoretical classes</h3>
            <div class="progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: candidate.theory + '%' }"></div>
              </div>
              <span>{{ candidate.theory }}%</span>
            </div>
          </div>

          <div class="stat-card">
            <h3>Practical classes</h3>
            <div class="progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: candidate.practical + '%' }"></div>
              </div>
              <span>{{ candidate.practical }}%</span>
            </div>
          </div>
        </div>

        <div class="upcoming">
          <h2>Upcoming classes</h2>
          <div v-if="lessons.length > 0" class="lessons">
            <div v-for="lesson in lessons" :key="lesson.id" class="lesson">
              <span class="date">{{ lesson.date }}</span>
              <span class="time">{{ lesson.time }}</span>
              <span class="type">{{ lesson.type }}</span>
            </div>
          </div>
          <div v-else class="no-lessons">
            <p>No upcoming classes.</p>
            <button @click="goToSchedule">Schedule a new class</button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CandidateHomeView',
  data() {
    return {
      candidateName: 'Ana Marković',
      activeNav: 'home',
      navItems: [
        { id: 'home', text: 'Home', icon: '🏠' },
        { id: 'schedule', text: 'Schedule', icon: '📅' },
        { id: 'notifications', text: 'Notifications', icon: '🔔' },
        { id: 'profile', text: 'MyProfile', icon: '👤' }
      ],
      candidate: {
        theory: 65,
        practical: 40
      },
      lessons: [
        { id: 1, date: 'Sutra', time: '14:00', type: 'Praktični' },
        { id: 2, date: 'Prekosutra', time: '10:00', type: 'Teorijski' }
      ]
    }
  },
  methods: {
    handleLogout() {
      console.log('Logout clicked')
      // Ovde bi se dodala logika za logout
    },
    setActiveNav(navId) {
      this.activeNav = navId
      console.log('Navigating to:', navId)
    },
    goToSchedule() {
      this.setActiveNav('schedule')
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Header */
.header {
  background: #6a0dad;
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  flex-direction: column;
}

.big-logo {
  font-size: 32px;
  font-weight: bold;
}

.small-logo {
  font-size: 14px;
  color: #d0b3ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome {
  font-size: 16px;
}

.logout-btn {
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Content */
.content {
  display: flex;
  min-height: calc(100vh - 80px);
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #ddd;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border-left: 4px solid transparent;
}

.nav-list li:hover {
  background: #f0f0f0;
}

.nav-list li.active {
  background: #f0e9ff;
  border-left-color: #6a0dad;
  color: #6a0dad;
  font-weight: bold;
}

.icon {
  font-size: 20px;
}

/* Main Area */
.main {
  flex: 1;
  padding: 30px;
}

.welcome-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.welcome-card h1 {
  margin: 0 0 10px 0;
  color: #333;
}

.welcome-card p {
  margin: 0;
  color: #666;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #6a0dad;
  border-radius: 5px;
}

.upcoming {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.upcoming h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.lessons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lesson {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 5px;
}

.date {
  font-weight: bold;
  color: #6a0dad;
}

.time {
  color: #666;
}

.type {
  background: #e0e0e0;
  padding: 5px 10px;
  border-radius: 3px;
  font-size: 14px;
}

.no-lessons {
  text-align: center;
  padding: 30px;
  color: #666;
}

.no-lessons button {
  background: #6a0dad;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.no-lessons button:hover {
  background: #5a0cad;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
    padding: 15px;
  }
  
  .content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }
  
  .nav-list {
    display: flex;
    overflow-x: auto;
  }
  
  .nav-list li {
    flex-direction: column;
    min-width: 100px;
    text-align: center;
    border-left: none;
    border-bottom: 4px solid transparent;
  }
  
  .nav-list li.active {
    border-left: none;
    border-bottom-color: #6a0dad;
  }
  
  .stats {
    grid-template-columns: 1fr;
  }
  
  .main {
    padding: 20px;
  }
}
</style>