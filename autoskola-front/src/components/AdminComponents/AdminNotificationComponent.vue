<template>
  <div class="notifications-container">
    <div class="header-with-button">
      <h1 class="page-title">Notifications</h1>
      <button class="refresh-btn" @click="refreshNotifications" :disabled="refreshing">
        <span class="refresh-icon" :class="{ spinning: refreshing }">↻</span>
        {{ refreshing ? 'Checking...' : 'Check Now' }}
      </button>
    </div>

    <div v-if="loading" class="loading">Loading notifications...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="notifications-content">

      <!-- NOTIFICATIONS LIST -->
      <div class="notifications-list">
        <div v-if="notifications.length === 0" class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.5; margin-bottom: 20px;">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/>
          </svg>
          <p>No notifications</p>
          <p class="hint">New notifications will appear here</p>
        </div>

        <div
            v-for="notification in sortedNotifications"
            :key="notification.id"
            class="notification-card"
            :class="{ 'expired': notification.text.includes('EXPIRED') }"
        >
          <button class="delete-btn" @click.stop="deleteNotification(notification.id)" title="Delete notification">
            ×
          </button>

          <div class="notification-icon">
            <span v-if="notification.text.includes('EXPIRED')">⚠️</span>
            <span v-else-if="notification.text.includes('expires')">⏰</span>
            <span v-else>📋</span>
          </div>

          <div class="notification-content">
            <div class="notification-text">{{ notification.text }}</div>
            <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
          </div>

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
      refreshing: false,
      error: null
    }
  },

  mounted() {
    this.fetchNotifications();
  },

  computed: {
    sortedNotifications() {
      return [...this.notifications].sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
  },

  methods: {
    async fetchNotifications() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8080/schedulednotif', {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        this.notifications = response.data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        this.error = 'Failed to load notifications.';

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },

    async refreshNotifications() {
      this.refreshing = true;
      try {
        await axios.post('http://localhost:8080/schedulednotif/check-now', {}, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        await this.fetchNotifications();
      } catch (error) {
        console.error('Error refreshing notifications:', error);
        this.error = 'Failed to refresh notifications.';
      } finally {
        this.refreshing = false;
      }
    },

    async deleteNotification(id) {

      try {
        await axios.delete(`http://localhost:8080/schedulednotif/${id}`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });

        this.notifications = this.notifications.filter(n => n.id !== id);

      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification.');
      }
    },

    formatTime(date) {
      if (!date) return '';

      const notificationDate = new Date(date);
      const now = new Date();
      const diffMs = now - notificationDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;

      return notificationDate.toLocaleDateString('en-GB');
    }
  }
}
</script>

<style scoped>
.notifications-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-with-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  color: #342a3c;
  position: relative;
  width: 100%;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 5px rgba(190, 143, 233, 0.15);
  margin: 0;
  flex: 1;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 130px;
  height: 2px;
  background: #be8fe9;
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(190, 143, 233, 0.5);
  opacity: 0.8;
}

.refresh-btn {
  background: linear-gradient(135deg, #be8fe9, #9f7ad6);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(190, 143, 233, 0.3);
  white-space: nowrap;
  margin-left: 20px;
  z-index: 10;
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #a06bc0, #8a5bb0);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(190, 143, 233, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  display: inline-block;
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.notifications-content {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 700px;
  overflow-y: auto;
  padding-right: 5px;
}

.notifications-list::-webkit-scrollbar {
  width: 8px;
}

.notifications-list::-webkit-scrollbar-track {
  background: #f8f4fc;
  border-radius: 10px;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: #be8fe9;
  border-radius: 10px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: #9f7ad6;
}

.notification-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f4fc;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}

.notification-card:hover {
  border-color: #be8fe9;
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(190, 143, 233, 0.2);
}

.notification-card:hover .delete-btn {
  opacity: 1;
}

.notification-card.expired {
  background: linear-gradient(135deg, #fee, #fdd);
  border-left: 4px solid #ff6b6b;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  color: #666;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 5;
}

.delete-btn:hover {
  background: #ff6b6b;
  color: white;
  transform: scale(1.1);
}

.notification-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.notification-content {
  flex: 1;
}

.notification-text {
  font-size: 1rem;
  color: #2c1f2d;
  margin-bottom: 5px;
  font-weight: 500;
}

.notification-time {
  font-size: 0.8rem;
  color: #8a7a99;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #8a7a99;
  background: #f8f4fc;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-state p {
  margin: 5px 0;
  font-size: 1.2rem;
  color: #6b5b7a;
}

.empty-state .hint {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-top: 10px;
}

.loading, .error {
  text-align: center;
  padding: 60px;
  font-size: 1.2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.error {
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .notifications-container {
    padding: 15px;
  }

  .header-with-button {
    flex-direction: column;
    gap: 15px;
  }

  .refresh-btn {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .notifications-content {
    padding: 15px;
  }

  .notification-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .notification-icon {
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
  }

  .delete-btn {
    opacity: 1;
    top: 5px;
    right: 5px;
  }
}
</style>