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
        </section>

        <section class="admin-panels-grid">

            <div class="panel catalog-management-panel full-width-panel">
                <h2>Games Catalog (Trending)</h2>
                <div class="data-table">
                    <div class="table-header">
                        <span>ID</span>
                        <span>Title</span>
                        <span>Developer</span>
                        <span>Action</span>
                    </div>
                    <div v-if="games.length === 0" class="loading-state">Loading games or no results...</div>

                    <div v-for="game in games.slice(0, 10)" :key="game.id_game" class="table-row">
                        <span>{{ game.id_game }}</span>
                        <span>{{ game.title }}</span>
                        <span>{{ game.developer || 'N/A' }}</span>
                        <button @click="viewGame(game.slug)" class="btn-action view">View</button>
                    </div>
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

        </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const userStore = useUserStore();

// --- ESTADOS DE DATOS ---
const adminInfo = ref({});
const totalGamesCount = ref('0');
const games = ref([]);
const reportedReviews = ref([]);

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
    console.error("Error al obtener info del administrador:", error);
  }
};

const fetchGames = async () => {
  try {
   const res = await api.get('/games/trending?limit=500');
   games.value = res.data || [];
   totalGamesCount.value = games.value.length.toString();
  } catch (error) {
   console.error("Error al obtener juegos:", error);
  }
};

const fetchReportedReviews = async () => {
  try {
    const res = await api.get('/reviews/reported');
    reportedReviews.value = res.data || [];
  } catch (error) {
    console.error("Error al obtener reseñas denunciadas:", error);
  }
};

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

const executeModeration = async () => {
  showConfirmModal.value = false;
  const action = confirmAction.value;
  const reviewId = confirmReviewId.value;

  try {
    if (action === 'Eliminar') {
      await api.delete(`/reviews/${reviewId}`);
      showToast(`Review ${reviewId} deleted.`, 'success');
    } else if (action === 'Aprobar') {
      await api.put(`/reviews/${reviewId}/approve`);
      showToast(`Review ${reviewId} approved.`, 'success');
    }
    await fetchReportedReviews();
  } catch (error) {
    showToast(error.response?.data?.message || 'Network or server error', 'error');
    console.error("Error in moderation action:", error);
  }
};

onMounted(() => {
  fetchAdminInfo();
  fetchGames();
  fetchReportedReviews();
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
</style>
