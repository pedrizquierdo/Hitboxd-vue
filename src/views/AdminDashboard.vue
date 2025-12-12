<template>
<Nav />
   <div class="page-wrapper">
    <div class="bg-texture"></div> <div class="admin-dashboard-wrapper">
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
                            <button @click="moderationAction('Aprobar', review.id_review)" class="btn-action approve">Aprove</button>
                        </div>
                    </div>
                </div>
            </div>

        </section>

    </div>
   <Footer />
  </div> </template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
import { useRouter } from 'vue-router';
import Nav from '@/components/common/Nav.vue';
import Footer from '@/components/common/PageFooter.vue';

const router = useRouter();

// --- ESTADOS DE DATOS ---
const adminInfo = ref({});
const totalGamesCount = ref('0');
const games = ref([]);
const reportedReviews = ref([]);

// --- FUNCIONES DE FETCHING ---

const fetchAdminInfo = async () => {
  try {
   const res = await api.get('/users/me');
   adminInfo.value = res.data;
  } catch (error) {
   console.error("Error al obtener info del administrador (¿Está logueado?):", error);
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
            // Llama al endpoint /reviews/reported
            const res = await api.get('/reviews/reported');
            reportedReviews.value = res.data || [];
      } catch (error) {
            console.error("Error al obtener reseñas denunciadas. Revise el endpoint /reviews/reported y el token.", error);
      }
}


// --- FUNCIONES DE ACCIÓN ---

const viewGame = (slug) => {
  router.push(`/game/${slug}`);
};

const viewReview = (review) => {
      alert(`
            Reseña ID: ${review.id_review} (Reportes: ${review.report_count})
            Juego: ${review.game_title} | Usuario: ${review.review_username}
            ---------------------------
            Contenido: ${review.content}
            ---------------------------
            Motivos de Reporte: ${review.all_reasons}
      `);
}

const moderationAction = async (action, reviewId) => {
      if (!confirm(`¿CONFIRMAS ${action.toUpperCase()} la reseña ID ${reviewId}?`)) {
            return;
      }

      try {
            if (action === 'Eliminar') {
                  await api.delete(`/reviews/${reviewId}`);
                  alert(`Reseña ${reviewId} eliminada.`);
            } else if (action === 'Aprobar') {
                        await api.put(`/reviews/${reviewId}/approve`);
                        alert(`Reseña ${reviewId} Aprobada.`);
            }

            await fetchReportedReviews();

      } catch (error) {
            alert(`Error al ejecutar la acción de moderación para ${action}: ${error.response?.data?.message || 'Error de red/servidor'}`);
            console.error("Error en Moderation Action:", error);
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

/* 1. ESTILO CONTENEDOR PRINCIPAL (COPIADO DE HOME) */
.page-wrapper {
   min-height: 100vh;
   display: flex; flex-direction: column;
   background-color: #E3E4E8; /* Fondo principal claro */
   position: relative; /* Necesario para que bg-texture funcione correctamente */
}

/* 2. TEXTURA DE FONDO (COPIADO DE HOME) */
.bg-texture {
   position: fixed; top: 0; left: 0; width: 100%; height: 100%;
   /* Asegúrate que esta ruta sea correcta en tu proyecto */
   background-image: url('/assets/bg-texture.jpg');
   background-size: 400px; opacity: 0.1; z-index: 0; pointer-events: none;
}

/* 3. CONTENEDOR DEL DASHBOARD (MODIFICADO para estar sobre la textura) */
.admin-dashboard-wrapper {
   /* MODIFICADO: Quitamos el background-color original para ver la textura */
   /* background-color: var(--color-bg-light); <-- ESTO FUE ELIMINADO */
     background-color: transparent; /* Asegura que el contenedor principal sea transparente */
     min-height: 100vh;
     padding: 30px 20px;
     position: relative; /* Asegura que el contenido del dashboard esté sobre la textura */
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

/* --- 1. STATS CARDS --- */
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

.stat-card-active {
  background-color: var(--color-accent-blue);
}

.stat-card-alert {
      background-color: var(--color-accent-alert);
      color: var(--color-text-main);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  opacity: 0.9;
  text-align: center;
}

/* --- 2. GRILLA PRINCIPAL DE PANELES --- */
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

.panel-note {
  font-size: 0.8rem;
  color: #a0a0a0;
  margin-bottom: 15px;
}

.panel-note-alert {
  font-size: 0.8rem;
  color: var(--color-accent-alert);
  margin-bottom: 15px;
}


/* --- TABLAS (Data Table) --- */
.data-table {
  width: 100%;
}

.loading-state {
  padding: 20px 0;
  text-align: center;
  color: #ccc;
}

.table-header, .table-row {
  display: grid;
  padding: 12px 0;
  font-size: 0.9rem;
  align-items: center;
  justify-items: start;
}

/* Columnas para Catálogo */
.catalog-management-panel .table-header,
.catalog-management-panel .table-row {
  grid-template-columns: 0.5fr 3fr 2fr 1fr;
}

/* Columnas para Moderación */
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

.table-row {
  border-bottom: 1px solid #4a4a4a;
}

.table-row:last-child {
  border-bottom: none;
}

/* Botones de Acción */
.action-buttons {
   display: flex;
   gap: 8px;
}

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

.btn-action.view {
  background-color: var(--color-btn-view);
  color : rgb(27,172,254)
}

.btn-action.delete {
  background-color: var(--color-btn-delete);
  color: rgb(254,70,77)
}
.btn-action.approve {
   background-color: var(--color-btn-approve);
      color:  rgb(19,221,123)
}


/* --- RESPONSIVIDAD --- */
@media (max-width: 992px) {
  .stats-grid {
   grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
  grid-template-columns: 1fr;
  }
  .action-buttons {
  flex-direction: column;
  gap: 5px;
  }
}
</style>
