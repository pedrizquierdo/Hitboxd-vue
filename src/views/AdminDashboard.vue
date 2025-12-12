<template>
<Nav />
 <div class="admin-dashboard-wrapper">

  <h1 class="main-title">Panel de Moderación</h1>

  <section class="stats-grid">
   <div class="stat-card">
    <span class="stat-number">12345</span>
    <span class="stat-label">Usuarios (Estimado)</span>
   </div>
   <div class="stat-card stat-card-active">
    <span class="stat-number">{{ totalGamesCount }}</span>
    <span class="stat-label">Juegos en Caché (Mínimo)</span>
   </div>
   <div class="stat-card stat-card-alert">
        <span class="stat-number">{{ reportedReviews.length }}</span>
    <span class="stat-label">Denuncias Pendientes</span>
   </div>
   <div class="stat-card">
    <span class="stat-number">{{ adminInfo.id_user ? adminInfo.id_user : 'N/A' }}</span>
    <span class="stat-label">ID Admin Logueado</span>
   </div>
  </section>

  <section class="admin-panels-grid">

   <div class="panel catalog-management-panel full-width-panel">
    <h2>Catálogo de Juegos (Trending)</h2>
    <p class="panel-note">Datos obtenidos de `/games/trending`. Limitado a 1000.</p>
    <div class="data-table">
     <div class="table-header">
      <span>ID</span>
      <span>Título</span>
      <span>Desarrollador</span>
      <span>Acción</span>
     </div>
     <div v-if="games.length === 0" class="loading-state">Cargando juegos o sin resultados...</div>

     <div v-for="game in games.slice(0, 10)" :key="game.id_game" class="table-row">
      <span>{{ game.id_game }}</span>
      <span>{{ game.title }}</span>
      <span>{{ game.developer || 'N/A' }}</span>
      <button @click="viewGame(game.slug)" class="btn-action view">Ver</button>
     </div>
    </div>
   </div>

   <div class="panel moderation-reviews-panel">
    <h2>Moderación de Reseñas (Denunciadas)</h2>
        <p class="panel-note-alert">Datos obtenidos de `/reviews/reported`. Requiere token de Admin.</p>
    <div class="data-table">
      <div class="table-header reviews-header-columns">
        <span>ID</span>
        <span>Juego</span>
        <span>Usuario</span>
        <span># Rep.</span>
        <span>Acción</span>
      </div>
            <div v-if="reportedReviews.length === 0" class="loading-state">Cargando reseñas o No hay reseñas pendientes de moderación.</div>

                  <div v-for="review in reportedReviews" :key="review.id_review" class="table-row reviews-row-columns">
                <span>{{ review.id_review }}</span>
        <span class="review-game-title">{{ review.game_title }}</span>
        <span class="review-username">{{ review.review_username }}</span>
                <span :title="review.all_reasons">{{ review.report_count }}</span>
        <div class="action-buttons">
                    <button @click="viewReview(review)" class="btn-action view">Ver</button>
          <button @click="moderationAction('Eliminar', review.id_review)" class="btn-action delete">Eliminar</button>
          <button @click="moderationAction('Aprobar', review.id_review)" class="btn-action approve">Aprobar</button>
        </div>
      </div>
    </div>
   </div>

  </section>

 </div>
 <Footer />
</template>

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

// 3. Obtener Reseñas Denunciadas (CONEXIÓN API)
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

// Acción de Ver Contenido de la reseña (NUEVO)
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

// Acción de Moderación (Ahora real y con refresco)
const moderationAction = async (action, reviewId) => {
    if (!confirm(`¿CONFIRMAS ${action.toUpperCase()} la reseña ID ${reviewId}?`)) {
        return;
    }

    try {
        if (action === 'Eliminar') {
            // Ejecuta la llamada a la API para eliminar la reseña
            await api.delete(`/reviews/${reviewId}`);
            alert(`Reseña ${reviewId} eliminada.`);
        } else if (action === 'Aprobar') {
            // Aquí debería ir la lógica para limpiar los reportes de esta reseña
            // Ejemplo de un endpoint de backend que limpiarías:
            // await api.put(`/reviews/${reviewId}/clear-reports`);
            alert(`ACCIÓN SIMULADA: Reseña ${reviewId} Aprobada (Reportes Limpiados).`);
        }

        // Refrescamos la lista para que desaparezca la reseña moderada
        await fetchReportedReviews();

    } catch (error) {
        alert(`Error al ejecutar la acción de moderación para ${action}: ${error.response?.data?.message || 'Error de red/servidor'}`);
        console.error("Error en Moderation Action:", error);
    }
};


// --- CICLO DE VIDA ---
onMounted(() => {
 fetchAdminInfo();
 fetchGames();
  fetchReportedReviews(); // <-- Llamada clave para obtener las denuncias
});
</script>

<style scoped>
/* --- ESTILOS ADAPTADOS Y COMBINADOS (TUS ESTILOS ORIGINALES) --- */

/* --- VARIABLES --- */
:root {
--color-bg-light: #f5f5f5;
--color-panel-dark: #3a3a3a;
--color-text-light: #fff;
--color-divider: #505050;
--color-input-bg: #4b4b4b;
--color-text-main: #222;
--color-accent-blue: #00AEEF;
 --color-accent-alert: #FFC107; /* Nuevo color para alertas/denuncias */
--color-btn-delete: #dc3545;
--color-btn-view: #6c757d;
 --color-btn-approve: #28a745;
}

.admin-dashboard-wrapper {
background-color: var(--color-bg-light);
min-height: 100vh;
padding: 30px 20px;
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
grid-template-columns: repeat(4, 1fr);
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
  /* Color para resaltar el conteo de denuncias */
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

/* --- 2. GRILLA PRINCIPAL DE PANELES (Actualizada) --- */
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

/* Columnas para Catálogo (Modificado el grid para 4 columnas) */
.catalog-management-panel .table-header,
.catalog-management-panel .table-row {
grid-template-columns: 0.5fr 3fr 2fr 1fr;
}

/* AJUSTE CLAVE: Columna de Moderación. Necesitamos 5 columnas para ID, Juego, Usuario, #Reportes, Acción */
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
color : white;
}

.btn-action.delete {
background-color: var(--color-btn-delete);
color: white;
}
.btn-action.approve {
  background-color: var(--color-btn-approve);
    color: white;
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
