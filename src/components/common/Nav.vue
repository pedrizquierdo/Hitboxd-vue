<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <HitboxdLogo />
      
      <ul class="nav-links desktop-links">
        <li class="nav-item dropdown">
          <span @click="toggleProfileMenu">
            PROFILE ▾
          </span>
          <ul v-if="profileMenu" class="dropdown-menu">
            <li><router-link to="/profile" @click="toggleProfileMenu">My Profile</router-link></li>
            <li><router-link to="/settings" @click="toggleProfileMenu">Settings</router-link></li>
            <li class="separator"></li>
            <li>
              <LogoutButton :minimal="true" @click="toggleProfileMenu" />
            </li>
          </ul>
        </li>
        <li><router-link to="/games">CATALOG</router-link></li>
        <li><router-link to="/lists">LISTS</router-link></li>
      </ul>

      <div class="nav-right">
        <button class="search-btn" @click="toggleSearch">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>

        <button @click="openGamePicker" class="review-btn">
          ✎ Review
        </button>

        <button class="menu-toggle-btn" @click="toggleMobileMenu">
          <svg v-if="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '⚠️' }}</span>
        <p>{{ toast.message }}</p>
      </div>
    </transition>

    <div v-if="showSearchInput" class="search-dropdown">
        <div class="search-inner-container">
            <input type="text" v-model="searchQuery" placeholder="Buscar en catálogo..." class="search-input" />
            <div class="search-results-list">
                <h4 class="results-title">RESULTADOS GLOBAL ({{ filteredGames.length }})</h4>
                <p v-if="!allGames.length && !searchQuery" class="no-results">Cargando...</p>
                <div v-for="game in filteredGames" :key="game.id_game" class="game-result-item" @click="goToDetail(game.slug)">
                    <img :src="game.cover_url" :alt="game.title" class="game-cover-mini"/>
                    <span class="game-title-result">{{ game.title }}</span>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showGamePicker" class="picker-overlay" @click.self="showGamePicker = false">
      <div class="picker-box">
        <div class="picker-header">
          <h3>Elige un juego para reseñar</h3>
          <button class="close-picker" @click="showGamePicker = false">&times;</button>
        </div>
        
        <div class="picker-input-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            v-model="reviewSearchQuery" 
            placeholder="Escribe el nombre del juego..." 
            class="picker-input"
            ref="pickerInputRef"
          />
        </div>

        <div class="picker-results">
           <p v-if="!reviewSearchQuery" class="picker-hint">Empieza a escribir para buscar...</p>
           <p v-else-if="reviewFilteredGames.length === 0" class="picker-hint">No encontramos ese juego :(</p>
           
           <div 
             v-for="game in reviewFilteredGames" 
             :key="game.id_game" 
             class="picker-item"
             @click="selectGameForReview(game)"
           >
             <img :src="game.cover_url" class="picker-cover" />
             <div class="picker-info">
               <span class="picker-title">{{ game.title }}</span>
               <span class="picker-year">JUEGO</span> 
             </div>
             <span class="picker-arrow">→</span>
           </div>
        </div>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="mobile-menu">
      <ul class="mobile-links">
        <li><router-link to="/profile" @click="toggleMobileMenu">PROFILE</router-link></li>
        <li><router-link to="/games" @click="toggleMobileMenu">CATALOGO</router-link></li>
        <li><router-link to="/lists" @click="toggleMobileMenu">LISTS</router-link></li>
        <li><router-link to="/members" @click="toggleMobileMenu">MEMBERS</router-link></li>
        <li class="mobile-logout-container">
           <LogoutButton :minimal="true" />
        </li>
      </ul>
    </div>

    <ReviewModal
      v-if="showReviewModal"
      :selectedGame="gameToReview" 
      @close="showReviewModal = false"
      @submit="handleReviewSubmit"
    />
  </nav>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import HitboxdLogo from "@/components/common/Logo.vue";
import api from '@/api/axios';
import ReviewModal from '@/components/reviews/reviewModal.vue';
import LogoutButton from '@/components/auth/LogoutButton.vue';

const router = useRouter();
defineOptions({ name: "NavBar" });

// Estados Generales
const profileMenu = ref(false);
const mobileMenuOpen = ref(false);
const allGames = ref([]);

// Estados Búsqueda Global
const showSearchInput = ref(false);
const searchQuery = ref('');

// Estados Búsqueda de Review
const showGamePicker = ref(false);
const reviewSearchQuery = ref('');
const pickerInputRef = ref(null);
const gameToReview = ref(null); 
const showReviewModal = ref(false);

// Toast System
const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (msg, type = 'success') => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => toast.value.show = false, 3000);
}

// --- CARGA DE JUEGOS ---
const fetchAllGames = async () => {
    if (allGames.value.length > 0) return;
    try {
        const res = await api.get('/games/trending?limit=500');
        if (res.data && Array.isArray(res.data)) allGames.value = res.data;
    } catch (error) {
        console.error("Error obteniendo juegos:", error);
    }
};

// --- FILTROS ---
const filteredGames = computed(() => {
    if (!searchQuery.value) return allGames.value;
    const query = searchQuery.value.toLowerCase();
    return allGames.value.filter(game => game.title.toLowerCase().includes(query));
});

const reviewFilteredGames = computed(() => {
    if (!reviewSearchQuery.value) return [];
    const query = reviewSearchQuery.value.toLowerCase();
    return allGames.value.filter(game => game.title.toLowerCase().includes(query)).slice(0, 10);
});

// --- ACCIONES ---

const openGamePicker = async () => {
    await fetchAllGames();
    reviewSearchQuery.value = '';
    showGamePicker.value = true;
    nextTick(() => { if(pickerInputRef.value) pickerInputRef.value.focus(); });
};

const selectGameForReview = (game) => {
    gameToReview.value = game; 
    showGamePicker.value = false; 
    showReviewModal.value = true; 
};

// --- ENVÍO DE RESEÑA (Lógica Correcta) ---
const handleReviewSubmit = async (reviewData) => {
    // 1. Validación
    if (!gameToReview.value || !gameToReview.value.id_game) {
        showToast("Error: No hay juego seleccionado", "error");
        return;
    }

    // 2. Payload
    const payload = {
        id_game: gameToReview.value.id_game,
        content: reviewData.content,
        rating: reviewData.rating,
        has_spoilers: reviewData.has_spoilers || false
    };

    console.log("Enviando Reseña:", payload);

    try {
        await api.post('/reviews', payload);
        showToast("¡Reseña publicada con éxito! 🎉", "success");
        showReviewModal.value = false; 
        gameToReview.value = null;     
    } catch (error) {
        console.error("Error publicando reseña:", error);
        if (error.response && error.response.status === 400) {
            showToast("Error: Revisa los datos (Quizás ya reseñaste este juego)", "error");
        } else {
            showToast("Error al conectar con el servidor", "error");
        }
    }
};

// Navegación
const toggleProfileMenu = () => profileMenu.value = !profileMenu.value;
const toggleMobileMenu = () => mobileMenuOpen.value = !mobileMenuOpen.value;
const goToDetail = (id) => {
    showSearchInput.value = false;
    router.push(`/game/${id}`);
};
const toggleSearch = () => {
    showSearchInput.value = !showSearchInput.value;
    searchQuery.value = '';
    if (showSearchInput.value) fetchAllGames();
};
</script>

<style scoped>
/* NAVBAR BASE */
.navbar { width: 100%; background-color: #e5e7eb; padding: 0.6rem 0; display: flex; flex-direction: column; align-items: center; position: sticky; top: 0; z-index: 100; }
.navbar::before { content: ""; position: absolute; inset: 0; background-image: url('/assets/bg-texture.jpg'); background-size: 400px; opacity: 0.1; z-index: -1; pointer-events: none; }
.navbar-inner { width: 100%; max-width: 1300px; display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; }
.nav-links { display: flex; align-items: center; gap: 30px; list-style: none; font-weight: 500; }
.nav-item { position: relative; }
.nav-links a, .nav-links span { color: #2d2d2d; text-decoration: none; cursor: pointer; font-size: 0.85rem; letter-spacing: 0.5px; }
.dropdown-menu { position: absolute; top: 22px; left: 0; background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 0.5rem 0; min-width: 150px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); z-index: 10; list-style: none; }
.dropdown-menu li { padding: 0.4rem 1rem; }
.dropdown-menu li:hover { background: #f3f4f6; }
.separator { border-top: 1px solid #eee; margin: 4px 0; padding: 0 !important; height: 0; }
.nav-right { display: flex; align-items: center; gap: 15px; }
.review-btn { font-weight: 600; border: none; padding: 6px 14px; border-radius: 10px; cursor: pointer; font-size: 0.85rem; transition: background 0.2s; color: white; background: var(--brand-cyan, #00AEEF); }
.review-btn:hover { background: #0095CC; }
.search-btn { background: none; border: none; cursor: pointer; padding: 6px; color: #555; transition: color 0.2s; display: flex; align-items: center; }
.search-btn:hover { color: var(--brand-cyan, #00AEEF); }

/* BÚSQUEDA GLOBAL */
.search-dropdown { width: 100%; background-color: #f7f7f7; border-top: 1px solid #d1d5db; padding: 1rem 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
.search-inner-container { max-width: 1000px; width: 90%; margin: 0 auto; position: relative; }
.search-input { width: 100%; padding: 10px 15px; border: 2px solid #ccc; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; background-color: white; }
.search-input:focus { border-color: var(--brand-cyan, #00AEEF); }
.search-results-list { max-height: 400px; overflow-y: auto; margin-top: 10px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #e0e0e0; }
.results-title { font-size: 0.8rem; color: #555; margin: 0 0 10px 0; text-transform: uppercase; }
.game-result-item { display: flex; align-items: center; padding: 8px; cursor: pointer; transition: background-color 0.2s; border-radius: 4px; }
.game-result-item:hover { background-color: #f3f4f6; }
.game-cover-mini { width: 40px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 3px; flex-shrink: 0; }
.game-title-result { font-weight: 600; color: #333; }
.no-results { color: #777; padding: 10px; text-align: center; }

/* --- ESTILOS PICKER MEJORADOS (BUSCADOR PARA REVIEW) --- */
.picker-overlay {
  position: fixed; inset: 0; background: rgba(18, 24, 32, 0.7); backdrop-filter: blur(4px);
  z-index: 2000; display: flex; justify-content: center; align-items: flex-start; padding-top: 80px;
  animation: fadeIn 0.2s ease-out;
}
.picker-box {
  background: white; width: 90%; max-width: 600px; border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden; display: flex; flex-direction: column;
}
.picker-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 24px; border-bottom: 1px solid #f3f4f6; background: #fff;
}
.picker-header h3 { margin: 0; font-size: 1.1rem; color: #111; font-weight: 700; letter-spacing: -0.5px; }
.close-picker { background: none; border: none; font-size: 28px; cursor: pointer; color: #9ca3af; line-height: 1; transition: color 0.2s; }
.close-picker:hover { color: #111; }

/* Wrapper para el input con ícono */
.picker-input-wrapper {
  position: relative; border-bottom: 1px solid #eee; display: flex; align-items: center;
}
.search-icon { position: absolute; left: 24px; font-size: 1.2rem; opacity: 0.5; color: #555; }
.picker-input {
  width: 100%; border: none; padding: 24px 24px 24px 60px; font-size: 1.2rem; outline: none;
  background: #fafafa; color: #333; transition: background 0.2s;
}
.picker-input:focus { background: #fff; }
.picker-input::placeholder { color: #d1d5db; font-weight: 300; }

.picker-results {
  max-height: 450px; overflow-y: auto; background: white;
}
.picker-hint { padding: 40px; text-align: center; color: #9ca3af; font-size: 0.95rem; }

.picker-item {
  display: flex; align-items: center; padding: 12px 24px; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid #f9fafb;
}
.picker-item:hover { background: #f0f9ff; padding-left: 30px; }
.picker-cover { width: 40px; height: 56px; object-fit: cover; border-radius: 4px; margin-right: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.picker-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.picker-title { font-weight: 700; color: #1f2937; font-size: 1rem; margin-bottom: 2px; }
.picker-year { font-size: 0.75rem; color: #6b7280; font-weight: 600; letter-spacing: 0.5px; }
.picker-arrow { color: #d1d5db; font-weight: bold; font-size: 1.2rem; transition: all 0.2s; }
.picker-item:hover .picker-arrow { color: #00AEEF; transform: translateX(5px); }

/* --- TOAST --- */
.toast-notification { position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 15px 20px; border-radius: 6px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 14px; font-weight: 600; color: white; min-width: 280px; }
.toast-notification.success { background-color: #00cc66; }
.toast-notification.error { background-color: #ff4444; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-20px); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

/* MÓVIL */
.menu-toggle-btn { background: none; border: none; cursor: pointer; padding: 6px; color: #2d2d2d; display: none; }
.mobile-menu { position: absolute; top: 48px; left: 0; width: 100%; background-color: #f3f4f6; border-top: 1px solid #d1d5db; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 99; }
.mobile-links { list-style: none; padding: 10px 0; }
.mobile-links li a { display: block; padding: 10px 2rem; text-decoration: none; color: #2d2d2d; font-size: 1rem; font-weight: 500; border-bottom: 1px solid #e0e0e0; }
.mobile-logout-container { padding: 10px 2rem; border-bottom: 1px solid #e0e0e0; }

@media (max-width: 850px) {
  .desktop-links { display: none; }
  .menu-toggle-btn { display: block; }
  .navbar-inner { padding: 0 1rem; }
  .review-btn { padding: 6px 10px; font-size: 0.8rem; }
  .nav-right { gap: 10px; }
  .search-inner-container { width: 95%; }
  .picker-box { width: 95%; height: 80vh; max-height: none; }
}
</style>