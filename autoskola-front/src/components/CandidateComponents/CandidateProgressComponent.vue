<template>
  <div class="progress-container">
    <h1 class="page-title">My Learning Progress</h1>

    <div class="progress-cards">
      <div class="progress-card">
        <h3>Theory Classes</h3>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: theoryProgress + '%' }"></div>
        </div>
        <p>{{ theoryAttended }} / 30 classes completed</p>
      </div>

      <div class="progress-card">
        <h3>Practical Classes</h3>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: practicalProgress + '%' }"></div>
        </div>
        <p>{{ practicalAttended }} / 40 classes completed</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      theoryAttended: 0,
      practicalAttended: 0
    }
  },

  computed: {
    theoryProgress() {
      return (this.theoryAttended / 30) * 100;
    },
    practicalProgress() {
      return (this.practicalAttended / 40) * 100;
    }
  }
}
</script>

<style scoped>
.progress-bar {
  width: 100%;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #be8fe9, #9C27B0);
  transition: width 0.3s ease;
}
</style>