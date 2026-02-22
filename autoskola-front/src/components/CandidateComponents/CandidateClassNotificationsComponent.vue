<template>
  <div class="notifications-wrapper">
    <div class="notifications-header">
      <h2>Notifications</h2>
    </div>

    <div class="notifications-grid">
      <div v-if="loading" class="info-msg">Loading your updates...</div>
      
      <div v-else-if="notifications.length === 0" class="info-msg">
        No notifications found.
      </div>

      <div 
        v-for="(notif, index) in notifications" 
        :key="index" 
        class="notif-card"
        :class="getCardTheme(notif.type)"
      >
        <div class="notif-icon-section">
          <span class="type-label">{{ notif.type }}</span>
        </div>
        <div class="notif-content-section">
          <p class="notif-text">{{ notif.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      notifications: [],
      loading: true,
      
    };
  },
  mounted() {
    this.fetchNotifications();
  },
  methods: {
    fetchNotifications() {
     
        this.loading = true;
        const token = localStorage.getItem("token");

            if (token) {
            axios.get('http://localhost:8080/schedulednotif/getcandidate', {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                this.notifications = response.data;
                this.loading = false;
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
            }
    },
    getCardTheme(type) {
      switch (type) {
        case 'UPDATE': return 'theme-update';
        case 'CLASS': return 'theme-class';
        case 'REQUEST': return 'theme-request';
        case 'TIME_PREFERENCE': return 'theme-preference'
        case 'THEORY_EXAM': return 'theme-exam'
        default: return 'theme-default';
      }
    }
  }
};
</script>

<style scoped>
.notifications-wrapper {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.notifications-header {
  margin-bottom: 30px;
}

.notifications-header h2 {
  color: #3a283c;
  font-size: 1.8rem;
  margin: 0;
}

.notifications-header p {
  color: #777;
  margin-top: 5px;
}

.notifications-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.notif-card {
  display: flex;
  align-items: center;
  padding: 20px 25px;
  border-radius: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(0,0,0,0.05);
}

.notif-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.notif-icon-section {
  min-width: 100px;
}

.type-label {
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
}

.notif-content-section {
  flex-grow: 1;
  padding-left: 20px;
}

.notif-text {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
}


.theme-class {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  border-left: 8px solid #4caf50;
}

.theme-update {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
  border-left: 8px solid #2196f3;
}

.theme-request {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #ef6c00;
  border-left: 8px solid #ff9800;
}

.theme-preference{
  background: linear-gradient(135deg, #fff3e0 0%, #fcb2ff 100%);
  color:#e700ef ;
  border-left: 8px solid #c015b2;

}

.theme-preference{
  background: linear-gradient(135deg, #fff3e0 0%, #ffb2b2 100%);
  color:#ef0000 ;
  border-left: 8px solid #c01515;

}

.theme-default {
  background: #f5f5f5;
  color: #616161;
  border-left: 8px solid #9e9e9e;
}

.info-msg {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 15px;
  color: #999;
}
</style>