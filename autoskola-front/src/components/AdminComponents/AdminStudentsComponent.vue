<template>
  <div class="students-section">
    <h1 class="page-title">Students</h1>

    <!-- STATS -->
    <div class="stats-row">
      <div
        class="stat-card"
        v-for="s in stats"
        :key="s.label"
        @click="activeFilter = s.filter"
        :class="{ active: activeFilter === s.filter }"
      >
        <span class="stat-num" :style="{ color: s.color }">{{ s.value }}</span>
        <span class="stat-lbl">{{ s.label }}</span>
      </div>
    </div>

    <!-- SEARCH + FILTER -->
    <div class="toolbar">
      <div class="filter-row">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-btn"
          :class="{ active: activeFilter === f.value }"
          @click="activeFilter = f.value"
        >{{ f.label }}</button>
      </div>
      <input v-model="search" class="search-input" placeholder="🔍 Search by name, email or username..." />
    </div>

    <!-- LOADING / EMPTY -->
    <div v-if="loading" class="loading-text">Loading students...</div>
    <div v-else-if="filtered.length === 0" class="empty-state">
      <div class="empty-icon">👤</div>
      <p>No students found.</p>
    </div>

    <!-- GRID -->
    <div v-else class="students-grid">
      <div class="student-card" v-for="s in filtered" :key="s.candidateId">
        <div class="card-header">
          <div class="avatar">{{ initials(s.name, s.lastname) }}</div>
          <div class="header-info">
            <h2>{{ s.name }} {{ s.lastname }}</h2>
            <span class="status-badge" :class="statusClass(s.status)">{{ s.status }}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">📧 Email</span>
            <span class="value">{{ s.email }}</span>
          </div>
          <div class="info-row">
            <span class="label">👤 Username</span>
            <span class="value">{{ s.username }}</span>
          </div>
          <div class="info-row">
            <span class="label">🚗 Category</span>
            <span class="value"><span class="cat-badge">{{ s.category }}</span></span>
          </div>
          <div class="info-row">
            <span class="label">👨‍🏫 Instructor</span>
            <span class="value" :class="{ 'no-value': !s.instructor }">
              {{ s.instructor || 'Not assigned' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      students: [],
      loading: true,
      search: '',
      activeFilter: 'ALL',
      filters: [
        { label: 'All',       value: 'ALL' },
        { label: 'Theory',    value: 'THEORY' },
        { label: 'Pending',   value: 'PENDING' },
        { label: 'Practical', value: 'PRACTICAL' },
        { label: 'Passed',    value: 'PASSED' },
      ],
    };
  },

  computed: {
    filtered() {
      let list = this.students;
      if (this.activeFilter !== 'ALL') {
        list = list.filter(s => s.status === this.activeFilter);
      }
      if (this.search.trim()) {
        const q = this.search.toLowerCase();
        list = list.filter(s =>
          (s.name + ' ' + s.lastname).toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.username?.toLowerCase().includes(q)
        );
      }
      return list;
    },

    stats() {
      return [
        { label: 'Total',     value: this.students.length,                                        color: '#4f364b', filter: 'ALL'       },
        { label: 'Theory',    value: this.students.filter(s => s.status === 'THEORY').length,    color: '#7b61d6', filter: 'THEORY'    },
        { label: 'Pending',   value: this.students.filter(s => s.status === 'PENDING').length,   color: '#e65100', filter: 'PENDING'   },
        { label: 'Practical', value: this.students.filter(s => s.status === 'PRACTICAL').length, color: '#1565c0', filter: 'PRACTICAL' },
        { label: 'Passed',    value: this.students.filter(s => s.status === 'PASSED').length,    color: '#2e7d32', filter: 'PASSED'    },
      ];
    },
  },

  mounted() {
    this.fetchStudents();
  },

  methods: {
    async fetchStudents() {
      this.loading = true;
      try {
        const res = await axios.get("http://localhost:8080/candidates/all", {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        });
        this.students = res.data;
      } catch (e) {
        console.error("Error fetching students:", e);
      } finally {
        this.loading = false;
      }
    },

    statusClass(status) {
      return {
        'THEORY':    'status-theory',
        'PENDING':   'status-pending',
        'PRACTICAL': 'status-practical',
        'PASSED':    'status-passed',
      }[status] || '';
    },

    initials(name, lastname) {
      return ((name?.[0] || '') + (lastname?.[0] || '')).toUpperCase();
    },
  }
};
</script>

<style scoped>
.students-section {
  padding: 0 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #4f364b;
}

/* STATS */
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 18px 16px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.07);
  border: 2px solid #e9e1f5;
  cursor: pointer;
  transition: all 0.2s;
}
.stat-card:hover,
.stat-card.active {
  border-color: #be8fe9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(190,143,233,0.2);
}
.stat-num {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}
.stat-lbl {
  display: block;
  font-size: 0.78rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* TOOLBAR */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.filter-btn {
  padding: 7px 18px;
  border-radius: 20px;
  border: 2px solid #e9e1f5;
  background: white;
  color: #4f364b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn:hover  { border-color: #be8fe9; }
.filter-btn.active { background: #be8fe9; border-color: #be8fe9; color: white; }

.search-input {
  padding: 9px 16px;
  border: 2px solid #e9e1f5;
  border-radius: 10px;
  font-size: 0.9rem;
  outline: none;
  min-width: 280px;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #be8fe9; }

/* GRID */
.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.student-card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 15px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  border: 2px solid transparent;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.student-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 15px 40px rgba(106,13,173,0.2), 0 0 25px rgba(190,143,233,0.3);
  border-color: #be8fe9;
  background: linear-gradient(145deg, #fef9fb, #f5f0f9);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 2px solid #e9e1f5;
  padding-bottom: 14px;
  margin-bottom: 14px;
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white;
  font-size: 1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-info h2 {
  margin: 0 0 5px;
  color: #4f364b;
  font-size: 1rem;
  font-weight: 700;
}

.status-badge {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-theory    { background: #ede7f6; color: #512da8; }
.status-pending   { background: #fff3e0; color: #e65100; }
.status-practical { background: #e3f2fd; color: #1565c0; }
.status-passed    { background: #e8f5e9; color: #2e7d32; }

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}
.label {
  font-weight: 600;
  color: #4f364b;
  flex-shrink: 0;
}
.value {
  color: #444;
  text-align: right;
  word-break: break-all;
}
.no-value {
  color: #bbb;
  font-style: italic;
}
.cat-badge {
  background: linear-gradient(135deg, #be8fe9, #9C27B0);
  color: white;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.loading-text { text-align: center; color: #888; padding: 60px; font-size: 1.1rem; }
.empty-state  { text-align: center; padding: 60px; color: #aaa; }
.empty-icon   { font-size: 3rem; margin-bottom: 12px; }

@media (max-width: 900px) {
  .students-section { padding: 0 16px 40px; }
  .stats-row { grid-template-columns: repeat(3, 1fr); }
  .toolbar { flex-direction: column; align-items: flex-start; }
  .search-input { min-width: 100%; width: 100%; box-sizing: border-box; }
}
</style>