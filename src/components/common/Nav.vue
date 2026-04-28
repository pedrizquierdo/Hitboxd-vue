<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <HitboxdLogo />

      <div class="search-bar-wrapper" ref="searchBarRef">
        <svg
          class="search-bar-icon"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          style="pointer-events: auto; cursor: pointer;"
          @click="showSearchInput && searchQuery ? navigateToSearch() : null"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          @input="onGlobalSearchInput"
          @focus="searchFocused = true"
          @keyup.enter="navigateToSearch"
          placeholder="Search all games..."
          class="inline-search-input"
        />
        <div v-if="searchFocused && searchQuery.trim()" class="inline-search-results">
          <div v-if="searchLoading" class="spinner-wrapper">
            <div class="spinner"></div>
          </div>
          <template v-else>
            <p v-if="searchResults.length === 0" class="no-results">No results found</p>
            <div
              v-for="game in searchResults"
              :key="game.id_game"
              class="game-result-item"
              @mousedown.prevent="goToDetail(game.slug)"
            >
              <img :src="game.cover_url" :alt="game.title" class="game-cover-mini" />
              <span class="game-title-result">{{ game.title }}</span>
            </div>
            <button
              v-if="searchResults.length > 0"
              class="see-all-btn"
              @mousedown.prevent="navigateToSearch"
            >
              Ver todos los resultados para "{{ searchQuery }}" →
            </button>
          </template>
        </div>
      </div>

      <ul class="nav-links desktop-links">
        <li><router-link to="/games">CATALOG</router-link></li>
        <li class="nav-item dropdown">
          <button
            class="avatar-btn"
            :class="{ 'avatar-active': isProfileActive }"
            @click="toggleProfileMenu"
            aria-label="Profile menu"
          >
            <img
              :src="userStore.user?.avatar_url || '/assets/default-avatar.png'"
              alt=""
              class="avatar-img"
            />
          </button>
          <ul v-if="profileMenu" class="dropdown-menu">
            <li><router-link to="/profile" @click="toggleProfileMenu">My Profile</router-link></li>
            <li><router-link to="/settings" @click="toggleProfileMenu">Settings</router-link></li>
            <li class="separator"></li>
            <li>
              <LogoutButton :minimal="true" @click="toggleProfileMenu" />
            </li>
          </ul>
        </li>
      </ul>

      <div class="nav-right">
        <button @click="openGamePicker" class="review-btn">
          Review
        </button>

        <button class="menu-toggle-btn" @click="toggleMobileMenu">
          <svg v-if="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>

    <div v-if="showGamePicker" class="picker-overlay" @click.self="showGamePicker = false">
      <div class="picker-box">
        <div class="picker-header">
          <h3>Elige un juego para reseñar</h3>
          <button class="close-picker" @click="showGamePicker = false">&times;</button>
        </div>

        <div class="picker-input-wrapper">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            v-model="reviewSearchQuery"
            @input="onReviewSearchInput"
            placeholder="Escribe el nombre del juego..."
            class="picker-input"
            ref="pickerInputRef"
          />
        </div>

        <div class="picker-results">
           <div v-if="reviewLoading" class="spinner-wrapper">
               <div class="spinner"></div>
           </div>
           <template v-else>
               <p v-if="!reviewSearchQuery" class="picker-hint">Empieza a escribir para buscar...</p>
               <p v-else-if="reviewSearchResults.length === 0" class="picker-hint">No encontramos ese juego</p>

               <div
                 v-for="game in reviewSearchResults"
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
           </template>
        </div>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="mobile-menu">
      <ul class="mobile-links">
        <li><router-link to="/profile" @click="toggleMobileMenu">PROFILE</router-link></li>
        <li><router-link to="/games" @click="toggleMobileMenu">CATALOG</router-link></li>
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
import { logger } from '@/utils/logger'
import { ref, nextTick, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import HitboxdLogo from "@/components/common/Logo.vue";
import api from '@/api/axios';
import ReviewModal from '@/components/reviews/ReviewModal.vue';
import LogoutButton from '@/components/auth/LogoutButton.vue';
import { useToastStore } from '@/stores/toastStore';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const route = useRoute();
defineOptions({ name: "NavBar" });

const userStore = useUserStore();

const isProfileActive = computed(() =>
  route.path.startsWith('/profile') || route.path.startsWith('/settings')
);

// Estados Generales
const profileMenu = ref(false);
const mobileMenuOpen = ref(false);

// Estados Busqueda Global
const searchQuery = ref('');
const searchResults = ref([]);
const searchLoading = ref(false);
const searchFocused = ref(false);
const showSearchInput = ref(true);
const searchBarRef = ref(null);
let searchDebounceTimer = null;

const handleClickOutside = (e) => {
  if (searchBarRef.value && !searchBarRef.value.contains(e.target)) {
    searchFocused.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));

// Estados Busqueda de Review
const showGamePicker = ref(false);
const reviewSearchQuery = ref('');
const reviewSearchResults = ref([]);
const reviewLoading = ref(false);
let reviewDebounceTimer = null;
const pickerInputRef = ref(null);
const gameToReview = ref(null);
const showReviewModal = ref(false);

const { showToast } = useToastStore();

// --- BUSQUEDA GLOBAL ---
const runGlobalSearch = async () => {
    const q = searchQuery.value.trim();
    if (!q) { searchResults.value = []; return; }
    searchLoading.value = true;
    try {
        const { data } = await api.get(`/games/search?q=${encodeURIComponent(q)}`);
        searchResults.value = Array.isArray(data) ? data : [];
    } catch (error) {
        logger.error("Error en busqueda global:", error);
        searchResults.value = [];
    } finally {
        searchLoading.value = false;
    }
};

const onGlobalSearchInput = () => {
    clearTimeout(searchDebounceTimer);
    if (!searchQuery.value.trim()) { searchResults.value = []; return; }
    searchDebounceTimer = setTimeout(runGlobalSearch, 300);
};

// --- BUSQUEDA DE REVIEW ---
const runReviewSearch = async () => {
    const q = reviewSearchQuery.value.trim();
    if (!q) { reviewSearchResults.value = []; return; }
    reviewLoading.value = true;
    try {
        const { data } = await api.get(`/games/search?q=${encodeURIComponent(q)}`);
        reviewSearchResults.value = Array.isArray(data) ? data : [];
    } catch (error) {
        logger.error("Error en busqueda de review:", error);
        reviewSearchResults.value = [];
    } finally {
        reviewLoading.value = false;
    }
};

const onReviewSearchInput = () => {
    clearTimeout(reviewDebounceTimer);
    if (!reviewSearchQuery.value.trim()) { reviewSearchResults.value = []; return; }
    reviewDebounceTimer = setTimeout(runReviewSearch, 300);
};

// --- ACCIONES ---

const openGamePicker = () => {
    reviewSearchQuery.value = '';
    reviewSearchResults.value = [];
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

    logger.log("Enviando Reseña:", payload);

    try {
        await api.post('/reviews', payload);
        showToast("¡Reseña publicada con éxito!", "success");
        showReviewModal.value = false;
        gameToReview.value = null;
    } catch (error) {
        logger.error("Error publicando reseña:", error);
        if (error.response && error.response.status === 400) {
            showToast("Error: Revisa los datos (Quizás ya reseñaste este juego)", "error");
        } else {
            showToast("Error al conectar con el servidor", "error");
        }
    }
};

const navigateToSearch = () => {
  if (!searchQuery.value || searchQuery.value.trim().length < 2) return;
  router.push({ name: 'SearchResults', query: { q: searchQuery.value.trim() } });
  showSearchInput.value = false;
  searchFocused.value = false;
  searchQuery.value = '';
};

// Navegación
const toggleProfileMenu = () => profileMenu.value = !profileMenu.value;
const toggleMobileMenu = () => mobileMenuOpen.value = !mobileMenuOpen.value;
const goToDetail = (slug) => {
    searchQuery.value = '';
    searchResults.value = [];
    searchFocused.value = false;
    router.push(`/game/${slug}`);
};
</script>

<style scoped>
/* NAVBAR BASE */
.navbar { width: 100%; background-color: #e5e7eb; padding: 0.6rem 0; display: flex; flex-direction: column; align-items: center; position: sticky; top: 0; z-index: 100; }
.navbar::before { content: ""; position: absolute; inset: 0; background-image: url('/assets/bg-texture.webp'), url('/assets/bg-texture.jpg'); background-size: 400px; opacity: 0.1; z-index: -1; pointer-events: none; }
.navbar-inner { width: 100%; max-width: 1300px; display: flex; align-items: center; padding: 0 2rem; position: relative; }
.nav-links { display: flex; align-items: center; gap: 20px; list-style: none; font-weight: 500; margin-left: auto; }
.nav-item { position: relative; }
.nav-links a { color: #2d2d2d; text-decoration: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.5px; display: inline-block; transition: color 0.2s ease, transform 0.2s ease; }
.nav-links a:not(.router-link-active):hover { color: var(--brand-green); transform: translateY(-2px); }
.nav-links a.router-link-active { color: var(--brand-cyan); border-bottom: 2px solid var(--brand-cyan); padding-bottom: 2px; }
.dropdown-menu { position: absolute; top: 38px; right: 0; background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 0.5rem 0; min-width: 150px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); z-index: 10; list-style: none; }
.dropdown-menu li { padding: 0.4rem 1rem; }
.dropdown-menu li:hover { background: #f3f4f6; }
.separator { border-top: 1px solid #eee; margin: 4px 0; padding: 0 !important; height: 0; }
.nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.review-btn { font-weight: 600; border: none; padding: 6px 16px; border-radius: 9999px; cursor: pointer; font-size: 0.85rem; transition: background 0.2s; color: white; background: var(--brand-cyan, #00AEEF); white-space: nowrap; }
.review-btn:hover { background: #0095CC; }

/* AVATAR */
.avatar-btn { background: none; border: 2px solid transparent; padding: 0; cursor: pointer; border-radius: 50%; transition: border-color 0.2s; display: flex; align-items: center; justify-content: center; }
.avatar-btn:hover, .avatar-btn.avatar-active { border-color: var(--brand-cyan); }
.avatar-img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; display: block; }

/* PERSISTENT SEARCH BAR */
.search-bar-wrapper { position: absolute; left: 50%; transform: translateX(-50%); width: 100%; max-width: 360px; display: flex; align-items: center; }
.search-bar-icon { position: absolute; right: 10px; color: #888; pointer-events: none; flex-shrink: 0; }
.inline-search-input { width: 100%; padding: 7px 32px 7px 12px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 0.85rem; background: white; color: #2d2d2d; outline: none; transition: border-color 0.2s; }
.inline-search-input:focus { border-color: var(--brand-cyan, #00AEEF); }
.inline-search-input::placeholder { color: #aaa; }
.inline-search-results { position: absolute; top: calc(100% + 6px); left: 0; width: 100%; background: white; border: 1px solid #d1d5db; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 200; max-height: 360px; overflow-y: auto; }
.game-result-item { display: flex; align-items: center; padding: 8px 12px; cursor: pointer; transition: background-color 0.15s; gap: 10px; }
.game-result-item:hover { background-color: #f3f4f6; }
.game-cover-mini { width: 32px; height: 48px; object-fit: cover; border-radius: 3px; flex-shrink: 0; }
.game-title-result { font-weight: 600; color: #333; font-size: 0.85rem; }
.no-results { color: #999; padding: 16px 12px; text-align: center; font-size: 0.85rem; }
.see-all-btn { width: 100%; padding: 10px; border: none; background: transparent; color: var(--brand-cyan, #00aeef); cursor: pointer; font-size: 0.85rem; border-top: 1px solid #e5e7eb; margin-top: 8px; text-align: center; display: block; transition: background-color 0.15s; }
.see-all-btn:hover { background: #f3f4f6; }

/* SPINNER */
.spinner-wrapper { display: flex; justify-content: center; padding: 24px; }
.spinner { width: 24px; height: 24px; border: 3px solid #e5e7eb; border-top-color: var(--brand-cyan, #00AEEF); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

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
  .review-btn { padding: 6px 12px; font-size: 0.8rem; }
  .nav-right { margin-left: auto; }
  .search-bar-wrapper { display: none; }
  .picker-box { width: 95%; height: 80vh; max-height: none; }
}
</style>
