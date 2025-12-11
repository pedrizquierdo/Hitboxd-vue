<template>
  <div class="profile-page">

    <Nav />

    <div v-if="isLoading" class="loading-container">
      <p>Cargando perfil...</p>
    </div>

    <div v-else class="profile-container">
      
      <div class="profile-header">
        <div class="profile-avatar">
          <img :src="avatar" class="avatar-img" />
        </div>

        <div class="profile-info">
          <h1 class="username">{{ username }}</h1>
        </div>

        <div class="profile-stats">
          <div class="stat-block">
            <span class="stat-number">{{ userStats.gamesCount || 0 }}</span>
            <span class="stat-label">Games</span>
          </div>
          <div class="divider"></div>
          <div class="stat-block">
            <span class="stat-number">{{ userStats.followers || 0 }}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="divider"></div>
          <div class="stat-block">
            <span class="stat-number">{{ userStats.following || 0 }}</span>
            <span class="stat-label">Following</span>
          </div>
        </div>
      </div>

      <nav class="profile-tabs">
        <a 
          v-for="tab in tabs"
          :key="tab"
          href="#"
          :class="{ active: activeTab === tab }"
          @click.prevent="setTab(tab)"
        >
          {{ tab }}
        </a>
        <div class="search-icons"></div>
      </nav>

      <section v-show="activeTab === 'PROFILE'" class="section">
        <h2 class="section-title">FAVORITE GAMES</h2>
        <p class="section-text">Don't forget to select your favorite Games!</p>
        <h2 class="section-title" style="margin-top: 40px;">RECENT ACTIVITY</h2>
      </section>

      <section v-show="activeTab === 'ACTIVITY'" class="section">
        <h2 class="section-title">RECENT ACTIVITY</h2>
        <p class="section-text">Nothing here yet.</p>
      </section>

      <section v-show="activeTab === 'GAMES'" class="section">
        <h2 class="section-title">GAMES</h2>
        <p class="section-text">No games logged yet.</p>
      </section>

      <section v-show="activeTab === 'DIARY'" class="section">
        <h2 class="section-title">DIARY</h2>
        <p class="section-text">Diary is empty.</p>
      </section>

      <section v-show="activeTab === 'REVIEWS'" class="section">
        <h2 class="section-title">REVIEWS</h2>
        <p class="section-text">No reviews yet.</p>
      </section>

      <section v-show="activeTab === 'PLAYLIST'" class="section">
        <h2 class="section-title">PLAYLIST</h2>
        <p class="section-text">No playlists created.</p>
      </section>

      <section v-show="activeTab === 'LISTS'" class="section">
        <div class="section-header-row">
          <h2 class="section-title">LISTS</h2>
          <button 
            v-if="userLists.length > 0" 
            @click="openModal" 
            class="btn-create-mini"
            title="Crear nueva lista"
          >
            + NEW
          </button>
        </div>

        <div v-if="userLists.length > 0" class="lists-grid">
          <div 
            v-for="list in userLists" 
            :key="list.id_list || list.id" 
            class="list-card"
            @click="editList(list)" >
            <div class="list-card-content">
              <h3>{{ list.title || list.name }}</h3> 
              <p class="list-desc">{{ list.description || 'Sin descripción' }}</p>
            </div>
            <div class="list-card-footer">
              <small>{{ list.games ? list.games.length : 0 }} GAMES</small>
              <span class="list-icon">📝</span>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <p class="section-text">YOU HAVENT CREATED ANY LISTS YET.</p>
          <button class="start-list-btn" @click="openModal">
            CREATE YOUR FIRST LIST
          </button>
        </div>
      </section>

      <section v-show="activeTab === 'LIKES'" class="section">
        <h2 class="section-title">LIKES</h2>
        <p class="section-text">You haven't liked anything yet.</p>
      </section>

      <section v-show="activeTab === 'TAGS'" class="section">
        <h2 class="section-title">TAGS</h2>
        <p class="section-text">No tags added.</p>
      </section>

      <section v-show="activeTab === 'NETWORK'" class="section">
        <h2 class="section-title">NETWORK</h2>
        <p class="section-text">No connections yet.</p>
      </section>
    </div> 
    
    <CreateListModal 
      :open="isModalOpen" 
      @close="closeModal"
      @created="handleListCreated"
    />
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import Nav from "@/components/common/Nav.vue"
import Footer from "@/components/common/Footer.vue"
import CreateListModal from "@/components/lists/CreateListModal.vue"
import api from "@/api/axios.js" 

const router = useRouter()
const username = ref("")
const avatar = ref("")
const isModalOpen = ref(false) 
const userLists = ref([]) 
const isLoading = ref(true) 

const userStats = ref({
    gamesCount: 0,
    followers: 0,
    following: 0
})

let currentUserId = null;

const openModal = () => { isModalOpen.value = true }
const closeModal = () => { isModalOpen.value = false }

const handleListCreated = (newListData) => {
  console.log('✅ Lista creada:', newListData);
  userLists.value.unshift(newListData); 
}

// 🚨 FUNCIÓN AÑADIDA: Maneja la navegación a la vista de edición de lista
const editList = (list) => {
    const listId = list.id_list || list.id;
    if (listId) {
        // Redirige a la ruta dinámica /lists/:listId
        router.push({ 
            name: 'ListDetail', // Asegúrate que este sea el nombre de tu ruta
            params: { listId: listId } 
        });
    }
};

// --- Lógica de Carga con "Parche de Hidratación" ---
onMounted(async () => {
  try {
    isLoading.value = true;
    
    // 1. Cargar Usuario
    const userResponse = await api.get("/users/me")
    const userData = userResponse.data;
    
    username.value = userData.username
    avatar.value = userData.avatar_url || "/default-avatar.png" 
    
    userStats.value = {
        gamesCount: userData.games_count || 0,
        followers: userData.followers_count || 0,
        following: userData.following_count || 0
    }

    currentUserId = userData.id_user || userData.id; 

    // 2. Cargar Listas
    if (currentUserId) {
      // a) Obtenemos las listas básicas (sin juegos)
      const listsResponse = await api.get(`/lists/user/${currentUserId}`)
      const basicLists = listsResponse.data
      
      // b) PARCHE: Pedimos el detalle de cada lista para obtener el conteo de juegos
      const detailedListsPromises = basicLists.map(async (list) => {
           const listId = list.id_list || list.id;
           try {
               // Pedimos el detalle completo individual
               const { data } = await api.get(`/lists/${listId}`);
               return data; // 'data' incluye el array 'games'
           } catch (error) {
               console.error(`Error cargando detalles de lista ${listId}`, error);
               return list; // Si falla, usamos la básica (mostrará 0 juegos)
           }
       });
      
      // c) Esperamos a que todas las peticiones terminen y guardamos
      userLists.value = await Promise.all(detailedListsPromises);
    }
    
  } catch (error) {
    console.error("Error cargando perfil:", error)
    if (error.response && error.response.status === 401) {
        alert("Tu sesión ha expirado.");
        router.push("/");
    }
  } finally {
    isLoading.value = false; 
  }
})

// Tabs (FILMS ELIMINADO)
const activeTab = ref("PROFILE")
const tabs = [
  "PROFILE", "ACTIVITY", "GAMES", "DIARY", "REVIEWS", 
  "PLAYLIST", "LISTS", "LIKES", "TAGS", "NETWORK"
]

const setTab = tab => {
  activeTab.value = tab
}
</script>

<style scoped>
/* Estilos Generales */
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.profile-container {
  width: 90%;
  max-width: 1100px;
  margin: 40px auto;
  flex: 1;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    font-size: 18px;
    color: #666;
}

/* HEADER */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #111;
  background: #000;
  flex-shrink: 0;
  z-index: 2;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: -400px; 
}

.username {
  font-size: 32px;
  margin: 0;
  color: #333;
}

.profile-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-block {
  text-align: center;
  min-width: 60px;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  display: block;
  color: #222;
}

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.5px;
}

.divider {
  width: 1px;
  height: 30px;
  background: #ccc;
}

/* TABS */
.profile-tabs {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #ccc;
  margin-top: 10px;
  padding-bottom: 10px;
  overflow-x: auto;
}

.profile-tabs a {
  text-decoration: none;
  font-size: 13px;
  color: #666;
  font-weight: 500;
  transition: color 0.2s;
  white-space: nowrap;
}

.profile-tabs a:hover {
    color: #000;
}

.profile-tabs a.active {
  color: #00aaff;
  font-weight: bold;
  border-bottom: 3px solid #00aaff;
  padding-bottom: 7px;
}

/* SECCIONES */
.section {
  margin-top: 40px;
}

.section-title {
  font-size: 14px;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
  color: #888;
  font-weight: normal;
  letter-spacing: 1px;
}

.section-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ddd;
    margin-bottom: 15px;
    padding-bottom: 5px;
}

.section-header-row .section-title {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.section-text {
  font-size: 14px;
  color: #555;
}

/* LISTAS */
.lists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.list-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 120px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer; /* Importante para indicar que es clickeable */
}

.list-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    border-color: #00aaff;
}

.list-card-content h3 {
    margin-top: 0;
    font-size: 16px;
    color: #222;
    margin-bottom: 8px;
    font-weight: bold;
}

.list-desc {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.list-card-footer {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f0f0f0;
    padding-top: 10px;
    font-size: 12px;
    color: #888;
}

/* Botones */
.empty-state {
    text-align: center;
    padding: 20px;
    background: #f0f0f0;
    border-radius: 8px;
}

.start-list-btn {
  background: #00aaff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  transition: background 0.2s;
}

.start-list-btn:hover {
    background: #008ecc;
}

.btn-create-mini {
  background: transparent;
  color: #00aaff;
  border: 1px solid #00aaff;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-create-mini:hover {
  background: #00aaff;
  color: white;
}
</style>