<template>
  <Nav />
  <div class="admin-dashboard-wrapper">
    <main class="admin-content">
      <h1 class="main-title">Administrator</h1>

      <section class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">12345</span>
          <span class="stat-label">Users</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ totalGamesCount }}</span>
          <span class="stat-label">Games</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">2750</span>
          <span class="stat-label">Reviews</span>
        </div>
        <div class="stat-card stat-card-total">
          <svg class="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          <span class="stat-label">Total Reviews</span>
        </div>
      </section>

      <section class="admin-panels-grid">

        <div class="panel user-management-panel">
          <h2>User Management</h2>
          <div class="data-table">
            <div class="table-header">
              <span class="header-username">Username</span>
              <span class="header-email">Email</span>
              <span class="header-role">Role</span>
            </div>
            <div v-for="user in dummyUsers" :key="user.id" class="table-row">
              <span class="row-username">{{ user.username }}</span>
              <span class="row-email">{{ user.email }}</span>
              <span class="row-role">{{ user.role }}</span>
            </div>
          </div>
        </div>

        <div class="panel add-game-panel">
          <h2>Add Game</h2>
          <form @submit.prevent="submitNewGame">
            <input type="text" v-model="newGame.releaseDate" placeholder="Release Date" class="form-input" />
            <input type="text" v-model="newGame.title" placeholder="Title" class="form-input" />
            <input type="text" v-model="newGame.description" placeholder="Description" class="form-input" />
            <input type="text" v-model="newGame.developer" placeholder="Developer" class="form-input" />
            <textarea v-model="newGame.details" placeholder="Details (Optional)" class="form-textarea"></textarea>
            <button type="submit" class="btn-publish">Publish</button>
          </form>
        </div>

        <div class="panel recent-actions-panel">
          <h2>Recent action on reviews</h2>
          <div class="data-table">
            <div class="table-header">
              <span class="header-game">Game title</span>
              <span class="header-user">User</span>
              <span class="header-action">Action</span>
            </div>
            <div v-for="(action, index) in dummyActions" :key="'a'+index" class="table-row">
              <span class="row-game">{{ action.game }}</span>
              <span class="row-user">{{ action.user }}</span>
              <span class="row-action">{{ action.action }}</span>
            </div>
          </div>
        </div>

        <div class="panel recent-reviews-panel">
          <h2>Recente reviews</h2>
          <div class="data-table">
            <div class="table-header">
              <span class="header-game">Game title</span>
              <span class="header-user">User</span>
              <span class="header-review">Review</span>
            </div>
            <div v-for="(review, index) in dummyReviews" :key="'r'+index" class="table-row">
              <span class="row-game">{{ review.game }}</span>
              <span class="row-user">{{ review.user }}</span>
              <span class="row-review">{{ review.content }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
// Asumiendo que 'api' está configurado
import Nav from '@/components/common/Nav.vue';
import Footer from '@/components/common/PageFooter.vue';

// --- DUMMY DATA (Mantenemos la simulación por la restricción de backend) ---
const dummyUsers = [
  { id: 1, username: 'Usrename', email: 'Example@gmail.com', role: 'Personal Role' },
  { id: 2, username: 'Usrename', email: 'Example@gmail.com', role: 'Personal Role' },
  { id: 3, username: 'Usrename', email: 'Example@gmail.com', role: 'Personal Role' },
  { id: 4, username: 'Usrename', email: 'Example@gmail.com', role: 'Personal Role' },
];

const newGame = ref({
  releaseDate: '', title: '', description: '', developer: '', details: '',
});

const dummyActions = [
  { game: 'Game title', user: 'Username', action: 'Action on review' },
  { game: 'Game title', user: 'Username', action: 'Action on review' },
  { game: 'Game title', user: 'Username', action: 'Action on review' },
  { game: 'Game title', user: 'Username', action: 'Action on review' },
];

const dummyReviews = [
  { game: 'Game title', user: 'Username', content: 'Personal Review' },
  { game: 'Game title', user: 'Username', content: 'Personal Review' },
  { game: 'Game title', user: 'Username', content: 'Personal Review' },
  { game: 'Game title', user: 'Username', content: 'Personal Review' },
];

// --- FUNCIONALIDAD DE DATOS ---

const totalGamesCount = ref('350');

const fetchTotalGamesEstimate = async () => {
  try {
    const res = await api.get('/games/trending?limit=500');
    if (res.data && Array.isArray(res.data)) {
      totalGamesCount.value = res.data.length.toString();
    }
  } catch (error) {
    console.error("Error al obtener juegos trending para conteo:", error);
  }
};

const submitNewGame = () => {
  console.log("Intentando publicar juego (Simulado):", newGame.value);
  alert("Juego simulado publicado. Requiere endpoint POST de backend.");
};

onMounted(() => {
  fetchTotalGamesEstimate();
});
</script>

<style scoped>
/* --- VARIABLES Y ESTILOS GLOBALES --- */
:root {
  --color-bg-light: #f5f5f5; /* Fondo general más claro */
  --color-panel-dark: #444; /* Fondo de los paneles y tarjetas */
  --color-text-light: #fff; /* Texto en paneles oscuros */
  --color-divider: #666; /* Separadores en paneles oscuros */
  --color-input-bg: #555; /* Fondo de los inputs */
  --color-accent: #5cb85c; /* Verde para el botón Publish/Total Reviews */
  --color-text-main: #333;
}

.admin-dashboard-wrapper {
  background-color: var(--color-bg-light);
  min-height: 100vh;
}

.admin-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 400; /* Letra delgada como en la imagen */
  margin-bottom: 30px;
  color: var(--color-text-main);
}

/* --- 1. STATS CARDS (Tarjetas de Resumen) --- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background-color: var(--color-panel-dark);
  color: var(--color-text-light);
  padding: 15px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90px;
  transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-card-total {
    /* Fondo ligeramente diferente o acento como en la imagen */
    background-color: #6c757d;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 3px;
}

.stat-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  opacity: 0.9;
}

.stat-icon {
    width: 28px;
    height: 28px;
    color: var(--color-text-light);
    margin-bottom: 5px;
}

/* --- 2. GRILLA PRINCIPAL DE PANELES --- */
.admin-panels-grid {
  display: grid;
  /* 2 columnas: la izquierda más ancha que la derecha */
  grid-template-columns: 2fr 1fr;
  /* 2 filas: una para la gestión/adición, otra para la actividad reciente */
  grid-template-rows: auto auto;
  gap: 20px;
}

.panel {
  background-color: var(--color-panel-dark);
  color: var(--color-text-light);
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.panel h2 {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-divider);
}

/* Asignación de Paneles a la Grilla */
.user-management-panel {
    grid-area: 1 / 1; /* Fila 1, Columna 1 */
}
.add-game-panel {
    grid-area: 1 / 2; /* Fila 1, Columna 2 */
}
.recent-actions-panel {
    grid-area: 2 / 1; /* Fila 2, Columna 1 */
}
.recent-reviews-panel {
    grid-area: 2 / 2; /* Fila 2, Columna 2 */
}


/* --- TABLAS (Data Table) --- */
.data-table {
  width: 100%;
}

.table-header, .table-row {
  display: grid;
  padding: 10px 0;
  font-size: 0.9rem;
  align-items: center;
}

/* Columnas de User Management */
.user-management-panel .table-header,
.user-management-panel .table-row {
    grid-template-columns: 1.5fr 2fr 1.5fr;
}

/* Columnas de Reviews/Actions (3 columnas) */
.recent-actions-panel .table-header,
.recent-actions-panel .table-row,
.recent-reviews-panel .table-header,
.recent-reviews-panel .table-row {
    grid-template-columns: 1fr 1fr 2fr;
}


.table-header {
  font-weight: bold;
  border-bottom: 1px solid var(--color-divider);
  text-transform: uppercase;
  opacity: 0.9;
}

.table-row {
  border-bottom: 1px solid #555; /* Separador más sutil */
}

.table-row:last-child {
  border-bottom: none;
}

/* --- FORMULARIO (Add Game) --- */
.form-input, .form-textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 4px;
  background-color: var(--color-input-bg);
  color: var(--color-text-light);
  font-size: 1rem;
  transition: background-color 0.2s;
}

.form-input::placeholder, .form-textarea::placeholder {
  color: #aaa;
}

.form-input:focus, .form-textarea:focus {
    background-color: #666;
    outline: none;
}

.form-textarea {
  height: 100px;
  resize: vertical;
}

.btn-publish {
  width: 100%;
  background-color: var(--color-accent);
  color: white;
  padding: 10px 0;
  margin-top: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.btn-publish:hover {
  background-color: #4CAF50;
}

/* --- RESPONSIVIDAD --- */
@media (max-width: 992px) {
  /* En tablets, las estadísticas siguen siendo 2x2 */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  /* La grilla principal colapsa a una sola columna */
  .admin-panels-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  /* Reasignación de áreas para el flujo vertical */
  .user-management-panel { grid-area: auto; }
  .add-game-panel { grid-area: auto; }
  .recent-actions-panel { grid-area: auto; }
  .recent-reviews-panel { grid-area: auto; }
}

@media (max-width: 600px) {
    /* En móviles, las estadísticas se ponen una debajo de otra */
    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
