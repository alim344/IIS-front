<!-- components/InstructorRequest.vue -->
<template>
  <div class="request-card" :class="{ 'status-changed': request.status !== 'PENDING' }">
    <div class="request-header">
      <strong>{{ request.candidate_name }} {{ request.candidate_lastname }}</strong>
    </div>
    <p class="request-text">Week :{{ request.declineWeek }}</p>
    <p class="request-text">{{ request.text }}</p>
    
    <div v-if="request.status === 'PENDING'" class="request-actions">
      <button 
        class="accept-btn" 
        @click="$emit('accept', request.id)"
      >
        Accept
      </button>
      <button 
        class="decline-btn" 
        @click="$emit('decline', request.id)"
      >
        Decline
      </button>
    </div>
    
    <div v-else class="request-status" 
         :class="{'status-accepted': request.status === 'ACCEPTED', 
                  'status-declined': request.status === 'DECLINED'}">
      {{ request.status }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'InstructorRequest',
  props: {
    request: {
      type: Object,
      required: true,
      validator: (prop) => {
        return prop.id && prop.candidate_name && prop.candidate_lastname && prop.text && prop.status;
      }
    }
  }
};
</script>

<style scoped>
.request-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.request-card:hover:not(.status-changed) {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-color: rgb(190, 143, 233);
}

.status-changed {
  opacity: 0.8;
}

.request-header {
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.request-text {
  color: #666;
  font-size: 13px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 6px;
  font-style: italic;
}

.request-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.accept-btn, .decline-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.accept-btn {
  background: #4CAF50;
  color: white;
}

.accept-btn:hover {
  background: #45a049;
}

.decline-btn {
  background: #f44336;
  color: white;
}

.decline-btn:hover {
  background: #e53935;
}

.request-status {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  padding: 4px;
  border-radius: 4px;
  margin-top: 5px;
}

.status-accepted {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-declined {
  background: #ffebee;
  color: #c62828;
}
</style>