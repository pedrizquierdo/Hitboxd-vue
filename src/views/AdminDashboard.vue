<template>
   <div class="page-wrapper">
    <div class="bg-texture"></div>

    <transition name="fade">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <p>{{ toast.message }}</p>
      </div>
    </transition>

    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal-box">
        <h3>Confirm Action</h3>
        <p>{{ confirmMessage }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showConfirmModal = false">Cancel</button>
          <button class="btn-confirm" @click="executeModeration">Confirm</button>
        </div>
      </div>
    </div>

    <div v-if="showReviewDetailModal" class="modal-overlay">
      <div class="modal-box modal-box-wide">
        <h3>Review Detail</h3>
        <div class="review-detail-grid">
          <span class="detail-label">Review ID</span>
          <span>{{ selectedReviewDetail.id_review }}</span>
          <span class="detail-label">Reports</span>
          <span>{{ selectedReviewDetail.report_count }}</span>
          <span class="detail-label">Game</span>
          <span>{{ selectedReviewDetail.game_title }}</span>
          <span class="detail-label">User</span>
          <span>{{ selectedReviewDetail.review_username }}</span>
          <span class="detail-label">Content</span>
          <span class="detail-content">{{ selectedReviewDetail.content }}</span>
          <span class="detail-label">Report Reasons</span>
          <span class="detail-content">{{ selectedReviewDetail.all_reasons }}</span>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showReviewDetailModal = false">Close</button>
        </div>
      </div>
    </div>

    <div class="admin-dashboard-wrapper">
        <h1 class="main-title">Moderation Panel</h1>

        <section class="stats-grid">
            <div class="stat-card stat-card-active">
                <span class="stat-number">{{ totalGamesCount }}</span>
                <span class="stat-label">Cached games</span>
            </div>
            <div class="stat-card stat-card-alert">
                <span class="stat-number">{{ reportedReviews.length }}</span>
                <span class="stat-label">Pending Complaints</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">{{ adminInfo.id_user ? adminInfo.id_user : 'N/A' }}</span>
                <span class="stat-label">ID Admin Logged in</span>
            </div>
            <div class="stat-card" style="background-color: #6f42c1;">
                <span class="stat-number">{{ totalUsersCount }}</span>
                <span class="stat-label">Registered Users</span>
            </div>
        </section>

        <section class="stats-chart-section">
          <div class="chart-panel">
            <h2>Reviews Activity (Last 30 days)</h2>
            <div class="chart-container">
              <canvas ref="chartRef"></canvas>
            </div>
          </div>
          <div class="stat-cards-extra">
            <div class="stat-card">
              <span class="stat-number">{{ totalUsersCount }}</span>
              <span class="stat-label">Total Users</span>
            </div>
            <div class="stat-card" style="background-color: #28a745;">
              <span class="stat-number">{{ globalStats.newUsersPerWeek?.[0]?.count ?? '...' }}</span>
              <span class="stat-label">New Users This Week</span>
            </div>
          </div>
        </section>

        <section class="admin-panels-grid">

            <div class="panel users-panel full-width-panel">
              <h2>User Management</h2>
              <div class="panel-search-bar">
                <input
                  v-model="userSearch"
                  @input="onUserSearchInput"
                  type="text"
                  placeholder="Search by username or email..."
                  class="search-input"
                />
              </div>
              <div class="data-table">
                <div class="table-header users-columns">
                  <span>ID</span>
                  <span>Username</span>
                  <span>Email</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                <div v-if="isLoadingUsers" class="loading-state">Loading users...</div>
                <div v-else-if="users.length === 0" class="loading-state">No users found.</div>
                <div v-for="user in users" :key="user.id_user" class="table-row users-columns">
                  <span>{{ user.id_user }}</span>
                  <span>{{ user.username }}</span>
                  <span class="text-muted">{{ user.email }}</span>
                  <span :class="user.is_banned ? 'badge-banned' : 'badge-active'">
                    {{ user.is_banned ? 'Banned' : 'Active' }}
                  </span>
                  <div class="action-buttons">
                    <button @click="$router.push(`/u/${user.username}`)" class="btn-action view">Profile</button>
                    <button @click="toggleBan(user)" :class="user.is_banned ? 'btn-action approve' : 'btn-action delete'">
                      {{ user.is_banned ? 'Unban' : 'Ban' }}
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="userTotalPages > 1" class="pagination-bar">
                <button :disabled="userPage <= 1" @click="userPage--; fetchUsers()" class="page-btn">Prev</button>
                <span class="page-info">Page {{ userPage }} / {{ userTotalPages }}</span>
                <button :disabled="userPage >= userTotalPages" @click="userPage++; fetchUsers()" class="page-btn">Next</button>
              </div>
            </div>

            <div class="panel catalog-management-panel full-width-panel">
                <h2>Games Catalog (Trending)</h2>
                <div class="panel-search-bar">
                  <input v-model="gameSearch" @input="onGameSearchInput" type="text" placeholder="Search game..." class="search-input" />
                </div>
                <div class="data-table">
                    <div class="table-header">
                        <span>ID</span>
                        <span>Title</span>
                        <span>Developer</span>
                        <span>Action</span>
                    </div>
                    <div v-if="isLoadingGames" class="loading-state">Loading...</div>
                    <div v-else-if="games.length === 0" class="loading-state">No results found.</div>

                    <div v-for="game in games" :key="game.id_game" class="table-row">
                        <span>{{ game.id_game }}</span>
                        <span>{{ game.title }}</span>
                        <span>{{ game.developer || 'N/A' }}</span>
                        <button @click="viewGame(game.slug)" class="btn-action view">View</button>
                    </div>
                </div>
                <div v-if="gameTotalPages > 1" class="pagination-bar">
                  <button :disabled="gamePage <= 1" @click="gamePage--; fetchGames()" class="page-btn">Prev</button>
                  <span class="page-info">Page {{ gamePage }} / {{ gameTotalPages }}</span>
                  <button :disabled="gamePage >= gameTotalPages" @click="gamePage++; fetchGames()" class="page-btn">Next</button>
                </div>
            </div>

            <div class="panel moderation-reviews-panel">
                <h2>Review Moderation (Reported)</h2>
                <div class="data-table">
                    <div class="table-header reviews-header-columns">
                        <span>ID</span>
                        <span>Game</span>
                        <span>User</span>
                        <span># Rep.</span>
                        <span>Action</span>
                    </div>
                    <div v-if="reportedReviews.length === 0" class="loading-state">Loading reviews or No reviews pending moderation.</div>

                    <div v-for="review in reportedReviews" :key="review.id_review" class="table-row reviews-row-columns">
                        <span>{{ review.id_review }}</span>
                        <span class="review-game-title">{{ review.game_title }}</span>
                        <span class="review-username">{{ review.review_username }}</span>
                        <span :title="review.all_reasons">{{ review.report_count }}</span>
                        <div class="action-buttons">
                            <button @click="viewReview(review)" class="btn-action view">View</button>
                            <button @click="moderationAction('Eliminar', review.id_review)" class="btn-action delete">Delete</button>
                            <button @click="moderationAction('Aprobar', review.id_review)" class="btn-action approve">Approve</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="panel moderation-log-panel full-width-panel">
              <h2>Moderation Log</h2>
              <div class="data-table">
                <div class="table-header log-columns">
                  <span>Date</span>
                  <span>Admin</span>
                  <span>Action</span>
                  <span>Target</span>
                  <span>Details</span>
                </div>
                <div v-if="isLoadingLog" class="loading-state">Loading log...</div>
                <div v-else-if="moderationLog.length === 0" class="loading-state">No moderation actions recorded yet.</div>
                <div v-for="entry in moderationLog" :key="entry.id" class="table-row log-columns">
                  <span class="text-muted">{{ formatLogDate(entry.created_at) }}</span>
                  <span>{{ entry.admin_username }}</span>
                  <span :class="entry.action === 'delete' ? 'log-action-delete' : 'log-action-approve'">
                    {{ entry.action?.toUpperCase() }}
                  </span>
                  <span class="text-muted">{{ entry.target_type }} #{{ entry.target_id }}</span>
                  <span class="text-muted">{{ entry.details }}</span>
                </div>
              </div>
              <div v-if="modLogTotalPages > 1" class="pagination-bar">
                <button :disabled="modLogPage <= 1" @click="modLogPage--; fetchModerationLog()" class="page-btn">Prev</button>
                <span class="page-info">Page {{ modLogPage }} / {{ modLogTotalPages }}</span>
                <button :disabled="modLogPage >= modLogTotalPages" @click="modLogPage++; fetchModerationLog()" class="page-btn">Next</button>
              </div>
            </div>

        </section>

    </div>
  </div>
</template>

<script setup>
// npm install chart.js
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend } from 'chart.js'
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend)

import { logger } from '@/utils/logger'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import api from '@/api/axios';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { socket } from '@/realtime/socket.js';

const router = useRouter();
const userStore = useUserStore();

// --- ESTADOS DE DATOS ---
const adminInfo = ref({});
const totalGamesCount = ref('0');
const games = ref([]);
const reportedReviews = ref([]);

// --- STATS GLOBALES ---
const globalStats = ref({ reviewsPerDay: [], newUsersPerWeek: [] })
const totalUsersCount = ref('...')
const chartRef = ref(null)
let chartInstance = null

// --- JUEGOS: paginacion y busqueda ---
const gameSearch = ref('')
const gamePage = ref(1)
const gameTotalPages = ref(1)
const isLoadingGames = ref(false)
let gameSearchTimer = null

// --- USUARIOS ---
const users = ref([])
const userSearch = ref('')
const userPage = ref(1)
const userTotalPages = ref(1)
const isLoadingUsers = ref(false)
let userSearchTimer = null

// --- LOG DE MODERACION ---
const moderationLog = ref([])
const modLogPage = ref(1)
const modLogTotalPages = ref(1)
const isLoadingLog = ref(false)

// --- REALTIME ---
// Tracks last toast timestamp to avoid spamming when reports arrive in bursts.
const lastReportToastAt = ref(0)

const onReportNew = (review) => {
  const existing = reportedReviews.value.find(r => r.id_review === review.id_review)
  if (existing) {
    existing.report_count = review.report_count
    existing.all_reasons = review.all_reasons
  } else {
    reportedReviews.value.unshift(review)
  }
  const now = Date.now()
  if (now - lastReportToastAt.value > 5000) {
    showToast('New reported review received', 'info')
    lastReportToastAt.value = now
  }
}

// Fires when another admin resolves a report while this session is open.
const onReportResolved = ({ id_review }) => {
  reportedReviews.value = reportedReviews.value.filter(r => r.id_review !== id_review)
}

// --- TOAST ---
const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3500);
};

// --- MODAL DE CONFIRMACION ---
const showConfirmModal = ref(false);
const confirmAction = ref('');
const confirmReviewId = ref(null);
const confirmMessage = ref('');

// --- MODAL DE DETALLE DE RESENA ---
const showReviewDetailModal = ref(false);
const selectedReviewDetail = ref({});

// --- FUNCIONES DE FETCHING ---

const fetchAdminInfo = async () => {
  try {
    await userStore.fetchUser();
    adminInfo.value = userStore.user;
  } catch (error) {
    logger.error("Error al obtener info del administrador:", error);
  }
};

const fetchGames = async () => {
  isLoadingGames.value = true
  try {
    const res = await api.get('/games/trending', {
      params: { limit: 20, page: gamePage.value, search: gameSearch.value || undefined }
    })
    const raw = res.data
    if (Array.isArray(raw)) {
      games.value = raw
      gameTotalPages.value = 1
    } else {
      games.value = raw.games ?? raw.data ?? []
      gameTotalPages.value = raw.totalPages ?? 1
    }
    totalGamesCount.value = (raw.total ?? games.value.length).toString()
  } catch (error) {
    logger.error('Error al obtener juegos:', error)
  } finally {
    isLoadingGames.value = false
  }
};

const fetchReportedReviews = async () => {
  try {
    const res = await api.get('/reviews/reported');
    reportedReviews.value = res.data || [];
  } catch (error) {
    logger.error("Error al obtener reseñas denunciadas:", error);
  }
};

const fetchGlobalStats = async () => {
  try {
    const res = await api.get('/admin/stats/global')
    globalStats.value = res.data
    totalUsersCount.value = res.data.totalUsers?.toString() ?? '...'
    await nextTick()
    renderChart()
  } catch (err) {
    logger.error('Error fetching global stats:', err)
  }
}

const renderChart = () => {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.destroy()
  const labels = globalStats.value.reviewsPerDay.map(d => d.date)
  const data = globalStats.value.reviewsPerDay.map(d => d.count)
  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Reviews per day',
        data,
        borderColor: '#00AEEF',
        backgroundColor: 'rgba(0,174,239,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#00AEEF',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#ccc', font: { size: 12 } } } },
      scales: {
        x: { ticks: { color: '#aaa' }, grid: { color: '#444' } },
        y: { ticks: { color: '#aaa' }, grid: { color: '#444' }, beginAtZero: true }
      }
    }
  })
}

const fetchUsers = async () => {
  isLoadingUsers.value = true
  try {
    const res = await api.get('/users/admin/all', {
      params: { search: userSearch.value, page: userPage.value, limit: 20 }
    })
    users.value = res.data.users ?? res.data ?? []
    userTotalPages.value = res.data.totalPages ?? 1
  } catch (err) {
    logger.error('Error fetching users:', err)
  } finally {
    isLoadingUsers.value = false
  }
}

const fetchModerationLog = async () => {
  isLoadingLog.value = true
  try {
    const res = await api.get('/admin/moderation/log', {
      params: { page: modLogPage.value, limit: 20 }
    })
    moderationLog.value = res.data.logs ?? res.data ?? []
    modLogTotalPages.value = res.data.totalPages ?? 1
  } catch (err) {
    logger.error('Error fetching moderation log:', err)
    moderationLog.value = []
  } finally {
    isLoadingLog.value = false
  }
}

const formatLogDate = (d) => d ? new Date(d).toLocaleString() : ''

// --- FUNCIONES DE ACCION ---

const viewGame = (slug) => {
  router.push(`/game/${slug}`);
};

const viewReview = (review) => {
  selectedReviewDetail.value = review;
  showReviewDetailModal.value = true;
};

const moderationAction = (action, reviewId) => {
  const label = action === 'Eliminar' ? 'delete' : 'approve';
  confirmAction.value = action;
  confirmReviewId.value = reviewId;
  confirmMessage.value = `Are you sure you want to ${label} review ID ${reviewId}?`;
  showConfirmModal.value = true;
};

const toggleBan = (user) => {
  const action = user.is_banned ? 'unban' : 'ban'
  confirmAction.value = action === 'ban' ? 'BanUser' : 'UnbanUser'
  confirmReviewId.value = user.id_user
  confirmMessage.value = `Are you sure you want to ${action} user "${user.username}"?`
  showConfirmModal.value = true
}

const executeModeration = async () => {
  showConfirmModal.value = false;
  const action = confirmAction.value;
  const reviewId = confirmReviewId.value;

  try {
    if (action === 'BanUser') {
      await api.put(`/users/admin/${reviewId}/ban`)
      showToast('User banned.', 'success')
      await fetchUsers()
      return
    }
    if (action === 'UnbanUser') {
      await api.put(`/users/admin/${reviewId}/unban`)
      showToast('User unbanned.', 'success')
      await fetchUsers()
      return
    }
    if (action === 'Eliminar') {
      await api.delete(`/reviews/${reviewId}`);
      showToast(`Review ${reviewId} deleted.`, 'success');
    } else if (action === 'Aprobar') {
      await api.put(`/reviews/${reviewId}/approve`);
      showToast(`Review ${reviewId} approved.`, 'success');
    }
    await fetchReportedReviews();
    await fetchModerationLog();
  } catch (error) {
    showToast(error.response?.data?.message || 'Network or server error', 'error');
    logger.error("Error in moderation action:", error);
  }
};

const onGameSearchInput = () => {
  clearTimeout(gameSearchTimer)
  gameSearchTimer = setTimeout(() => { gamePage.value = 1; fetchGames() }, 400)
}

const onUserSearchInput = () => {
  clearTimeout(userSearchTimer)
  userSearchTimer = setTimeout(() => { userPage.value = 1; fetchUsers() }, 400)
}

onMounted(() => {
  fetchAdminInfo();
  fetchGames();
  fetchReportedReviews();
  fetchGlobalStats();
  fetchUsers();
  fetchModerationLog();
  socket.on('moderation:report_new', onReportNew);
  socket.on('moderation:resolved', onReportResolved);
});

onBeforeUnmount(() => {
  socket.off('moderation:report_new', onReportNew);
  socket.off('moderation:resolved', onReportResolved);
});
</script>

<style scoped>
:root {
  --color-bg-light: #f5f5f5;
  --color-panel-dark: #3a3a3a;
  --color-text-light: #fff;
  --color-divider: #505050;
  --color-input-bg: #4b4b4b;
  --color-text-main: #222;
  --color-accent-blue: #00AEEF;
  --color-accent-alert: #FFC107;
  --color-btn-delete: #dc3545;
  --color-btn-view: #6c757d;
  --color-btn-approve: #28a745;
}

.page-wrapper {
   min-height: 100vh;
   display: flex; flex-direction: column;
   background-color: #E3E4E8;
   position: relative;
}

.bg-texture {
   position: fixed; top: 0; left: 0; width: 100%; height: 100%;
   background-image: url('/assets/bg-texture.webp'), url('/assets/bg-texture.jpg');
   background-size: 400px; opacity: 0.1; z-index: 0; pointer-events: none;
}

/* TOAST */
.toast-notification {
  position: fixed; top: 20px; right: 20px; z-index: 10000;
  padding: 15px 20px; border-radius: 6px;
  display: flex; align-items: center; gap: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 14px; font-weight: 600; color: white;
  min-width: 280px;
}
.toast-notification.success { background-color: #00cc66; }
.toast-notification.error { background-color: #ff4444; }
.toast-notification.info { background-color: #00AEEF; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-20px); }

/* MODALES */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.65); z-index: 9000;
  display: flex; justify-content: center; align-items: center;
}
.modal-box {
  background: #2d2d2d; color: #fff; padding: 30px; border-radius: 8px;
  width: 90%; max-width: 420px; text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
}
.modal-box-wide { max-width: 600px; text-align: left; }
.modal-box h3 { margin-top: 0; color: #fff; margin-bottom: 12px; font-size: 1.1rem; }
.modal-box p { color: #ccc; font-size: 14px; margin-bottom: 25px; }
.modal-actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
.btn-cancel { background: #555; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
.btn-cancel:hover { background: #444; }
.btn-confirm { background: #00AEEF; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
.btn-confirm:hover { background: #0095cc; }

.review-detail-grid {
  display: grid; grid-template-columns: 130px 1fr; gap: 10px 16px;
  font-size: 0.9rem; margin-bottom: 10px;
}
.detail-label { color: #aaa; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; padding-top: 2px; }
.detail-content { white-space: pre-wrap; word-break: break-word; color: #eee; }

.admin-dashboard-wrapper {
   background-color: transparent;
   min-height: 100vh;
   padding: 30px 20px;
   position: relative;
   z-index: 1;
}

.main-title {
  max-width: 1200px;
  margin: 0 auto;
  font-size: 2.5rem;
  font-weight: 400;
  margin-bottom: 30px;
  color: var(--color-text-main);
}

/* --- STATS CARDS --- */
.stats-grid {
  max-width: 1200px;
  margin: 0 auto 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background-color: var(--color-panel-dark);
  color: var(--color-text-light);
  padding: 15px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-card-active { background-color: var(--color-accent-blue); }
.stat-card-alert { background-color: var(--color-accent-alert); color: var(--color-text-main); }

.stat-number { font-size: 2rem; font-weight: 700; margin-bottom: 5px; }
.stat-label { font-size: 0.8rem; text-transform: uppercase; opacity: 0.9; text-align: center; }

/* --- PANELES --- */
.admin-panels-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.panel {
  background-color: var(--color-panel-dark);
  color: var(--color-text-light);
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.panel h2 {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-divider);
}

/* --- TABLAS --- */
.data-table { width: 100%; }

.loading-state { padding: 20px 0; text-align: center; color: #ccc; }

.table-header, .table-row {
  display: grid;
  padding: 12px 0;
  font-size: 0.9rem;
  align-items: center;
  justify-items: start;
}

.catalog-management-panel .table-header,
.catalog-management-panel .table-row {
  grid-template-columns: 0.5fr 3fr 2fr 1fr;
}

.moderation-reviews-panel .reviews-header-columns,
.moderation-reviews-panel .reviews-row-columns {
  grid-template-columns: 0.5fr 1.5fr 1fr 0.8fr 1.5fr;
}

.table-header {
  font-weight: bold;
  border-bottom: 1px solid var(--color-divider);
  text-transform: uppercase;
  opacity: 0.9;
}

.table-row { border-bottom: 1px solid #4a4a4a; }
.table-row:last-child { border-bottom: none; }

.action-buttons { display: flex; gap: 8px; }

.btn-action {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  transition: background-color 0.5s;
}

.btn-action.view { background-color: var(--color-btn-view); color: rgb(27,172,254); }
.btn-action.delete { background-color: var(--color-btn-delete); color: rgb(254,70,77); }
.btn-action.approve { background-color: var(--color-btn-approve); color: rgb(19,221,123); }

/* --- RESPONSIVIDAD --- */
@media (max-width: 992px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .stats-grid { grid-template-columns: 1fr; }
  .action-buttons { flex-direction: column; gap: 5px; }
}

/* --- NUEVOS ESTILOS --- */

/* Stats grid 4 columnas en desktop */
.stats-grid { grid-template-columns: repeat(4, 1fr); }

/* Chart section */
.stats-chart-section { max-width: 1200px; margin: 0 auto 30px; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: start; }
.chart-panel { background-color: var(--color-panel-dark); padding: 20px; border-radius: 8px; }
.chart-panel h2 { font-size: 1rem; font-weight: 600; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--color-divider); color: #fff; text-transform: uppercase; letter-spacing: 0.5px; }
.chart-container { height: 200px; position: relative; }
.stat-cards-extra { display: flex; flex-direction: column; gap: 20px; }
@media (max-width: 768px) { .stats-chart-section { grid-template-columns: 1fr; } }

/* Search bar */
.panel-search-bar { margin-bottom: 16px; }
.search-input {
  width: 100%; max-width: 400px; padding: 8px 12px;
  background-color: var(--color-input-bg); border: 1px solid #606060;
  border-radius: 4px; color: #fff; font-size: 0.9rem;
}
.search-input::placeholder { color: #999; }
.search-input:focus { outline: none; border-color: #00AEEF; }

/* Paginacion */
.pagination-bar { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--color-divider); }
.page-btn { background-color: #555; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: background 0.2s; }
.page-btn:hover:not(:disabled) { background-color: #00AEEF; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { color: #ccc; font-size: 0.85rem; }

/* Columnas usuarios */
.users-columns { grid-template-columns: 0.4fr 1.5fr 2fr 0.8fr 1.5fr; }

/* Columnas log */
.log-columns { grid-template-columns: 1.5fr 1fr 0.8fr 1fr 2fr; }

/* Badges */
.badge-active { color: #28a745; font-weight: 600; font-size: 0.8rem; }
.badge-banned { color: #dc3545; font-weight: 600; font-size: 0.8rem; }

/* Log actions */
.log-action-delete { color: #ff6b6b; font-weight: 700; font-size: 0.8rem; }
.log-action-approve { color: #51cf66; font-weight: 700; font-size: 0.8rem; }

/* Text muted */
.text-muted { color: #aaa; font-size: 0.85rem; }
</style>
