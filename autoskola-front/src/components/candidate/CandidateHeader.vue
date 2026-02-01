<script setup>
</script>

<template>
  <header class="top"> 
    <div class="logo"> 
      <span class="big_logo">TaSaMi</span>
      <span class="small_logo">Auto škola</span>
    </div>
    <div class="header-right">
      <div class="notifications">
        <span class="notification-icon">🔔</span>
        <!-- <span v-if="unreadCount > 0" class="notification-badge">
          {{ unreadCount }}
        </span> -->
      </div>
      <div class="user-info">
        <span class="welcome-text">Welcome, {{ candidateName }}</span>
        <button class="logout button">
          Logout
        </button>
      </div>
    </div>
  </header>
</template>



<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 80px;
  background: linear-gradient(135deg, #4f364b 0%, #6a0dad 100%);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(79, 54, 75, 0.2);
  padding: 0 40px;
}

.logo {
  display: flex;
  flex-direction: column;
}

.big_logo {
  font-size: 36px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.small_logo {
  font-size: 16px;
  color: #be8fe9;
  margin-left: 5px;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.notifications {
  position: relative;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.notifications:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.notification-icon {
  font-size: 24px;
  color: white;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  font-size: 12px;
  font-weight: bold;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.logout.button {
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 8px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.3s ease;
}

.logout.button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .top {
    padding: 0 20px;
    flex-direction: column;
    height: auto;
    padding: 15px;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
    margin-top: 15px;
  }
}
</style>