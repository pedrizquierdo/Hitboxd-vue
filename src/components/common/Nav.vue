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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>

        <button
          @click="showReviewModal = true"
          class="review-btn"
        >
          ✎ Review
        </button>

        <button class="menu-toggle-btn" @click="toggleMobileMenu">
          <svg v-if="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

    </div>

    <div v-if="showSearchInput" class="search-dropdown">
        <div class="search-inner-container">
            <input
                type="text"
                v-model="searchQuery"
                placeholder="Buscar juegos..."
                class="search-input"
            />

            <div class="search-results-list">
                <h4 class="results-title">
                    JUEGOS DISPONIBLES ({{ filteredGames.length }})
                </h4>

                <p v-if="!allGames.length && !searchQuery" class="no-results">Cargando juegos...</p>
                <p v-else-if="searchQuery && !filteredGames.length" class="no-results">No hay resultados para "{{ searchQuery }}"</p>

                <div
                    v-for="game in filteredGames"
                    :key="game.id_game"
                    class="game-result-item"
                    @click="goToDetail(game.slug)"
                >
                    <img :src="game.cover_url" :alt="game.title" class="game-cover-mini"/>
                    <span class="game-title-result">{{ game.title }}</span>
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
      @close="showReviewModal = false"
      @submit="handleReviewSubmit"
    />
  </nav>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import HitboxdLogo from "@/components/common/Logo.vue";
import api from '@/api/axios';
import ReviewModal from '@/components/reviews/reviewModal.vue';
// 3. IMPORTAMOS EL COMPONENTE
import LogoutButton from '@/components/auth/LogoutButton.vue';

const router = useRouter();

defineOptions({ name: "NavBar" });

const profileMenu = ref(false);
const mobileMenuOpen = ref(false);
const showSearchInput = ref(false);
const allGames = ref([]);
const searchQuery = ref('');

// ESTADO REACTIVO PARA EL MODAL INTERNO
const showReviewModal = ref(false);

// LÓGICA DE MANEJO DE ENVÍO DE LA RESEÑA
const handleReviewSubmit = (reviewData) => {
    console.log("Reseña enviada desde el Nav:", reviewData);
    showReviewModal.value = false;
};


// --- Filtro de Búsqueda Dinámico ---
const filteredGames = computed(() => {
    if (!searchQuery.value) {
        return allGames.value;
    }
    const query = searchQuery.value.toLowerCase();
    return allGames.value.filter(game =>
        game.title.toLowerCase().includes(query)
    );
});


// --- Funciones de Navegación y UI ---

const toggleProfileMenu = () => {
  profileMenu.value = !profileMenu.value;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const goToDetail = (id) => {
    showSearchInput.value = false;
    router.push(`/game/${id}`);
};

const fetchAllGames = async () => {
    try {
        const res = await api.get('/games/trending?limit=500');

        if (res.data && Array.isArray(res.data)) {
            allGames.value = res.data;
        } else {
            console.error("[NAV SEARCH] Error: La API no devolvió una lista de juegos válida.");
        }
    } catch (error) {
        console.error("[NAV SEARCH] Error al obtener juegos:", error);
    }
};

const toggleSearch = () => {
    showSearchInput.value = !showSearchInput.value;
    searchQuery.value = '';
    profileMenu.value = false;

    if (showSearchInput.value && allGames.value.length === 0) {
        fetchAllGames();
    }
};
</script>

<style scoped>
/* --- ESTILOS DE LA BARRA DE NAVEGACIÓN (Base) --- */

.navbar {
  width: 100%;
  background-color: #e5e7eb;
  border-bottom: none;
  padding: 0.6rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: none;
}

.navbar::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url('/assets/bg-texture.jpg');
  background-size: 400px;
  opacity: 0.1;
  z-index: -1;
  pointer-events: none;
}

.navbar-inner {
  width: 100%;
  max-width: 1300px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

/* Links, Dropdown y Auth Buttons */
.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
  list-style: none;
  font-weight: 500;
}
.nav-item {
  position: relative;
}
.nav-links a, .nav-links span {
  color: #2d2d2d;
  text-decoration: none;
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}
.dropdown-menu {
  position: absolute;
  top: 22px;
  left: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0;
  min-width: 150px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  z-index: 10;
  list-style: none;
}
.dropdown-menu li {
  padding: 0.4rem 1rem;
}
.dropdown-menu li:hover {
  background: #f3f4f6;
}

/* 4. ESTILOS EXTRA PARA EL LOGOUT EN DROPDOWN */
.separator {
  border-top: 1px solid #eee;
  margin: 4px 0;
  padding: 0 !important;
  height: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* ESTILO DEL BOTÓN DE RESEÑA FIJO */
.review-btn {
  font-weight: 600;
  border: none;
  padding: 6px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
  color: white;
  background: var(--brand-cyan, #00AEEF);
}

.review-btn:hover {
  background: #0095CC;
}

.search-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #555;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}
.search-btn:hover {
  color: var(--brand-cyan, #00AEEF);
}

/* --- ESTILOS DE LA BARRA DE BÚSQUEDA --- */

.search-dropdown {
  width: 100%;
  background-color: #f7f7f7;
  border-top: 1px solid #d1d5db;
  padding: 1rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.search-inner-container {
  max-width: 1000px;
  width: 90%;
  margin: 0 auto;
  position: relative;
}
.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  background-color: white;
}
.search-input:focus {
  border-color: var(--brand-cyan, #00AEEF);
}
.search-results-list {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 10px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.results-title {
  font-size: 0.8rem;
  color: #555;
  margin: 0 0 10px 0;
  text-transform: uppercase;
}
.game-result-item {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
}
.game-result-item:hover {
  background-color: #f3f4f6;
}
.game-cover-mini {
  width: 40px;
  height: 60px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 3px;
  flex-shrink: 0;
}
.game-title-result {
  font-weight: 600;
  color: #333;
}
.no-results {
  color: #777;
  padding: 10px;
  text-align: center;
}

/* --- RESPONSIVIDAD Y MENÚ MÓVIL --- */

.menu-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #2d2d2d;
  display: none;
}

.mobile-menu {
  position: absolute;
  top: 48px;
  left: 0;
  width: 100%;
  background-color: #f3f4f6;
  border-top: 1px solid #d1d5db;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 99;
}
.mobile-links {
  list-style: none;
  padding: 10px 0;
}
.mobile-links li a {
  display: block;
  padding: 10px 2rem;
  text-decoration: none;
  color: #2d2d2d;
  font-size: 1rem;
  font-weight: 500;
  border-bottom: 1px solid #e0e0e0;
}
.mobile-links li a:hover {
  background-color: #e5e7eb;
}

/* Ajuste para el botón de logout en móvil */
.mobile-logout-container {
  padding: 10px 2rem;
  border-bottom: 1px solid #e0e0e0;
}

@media (max-width: 850px) {
  .desktop-links {
    display: none;
  }
  .menu-toggle-btn {
    display: block;
  }
  .navbar-inner {
    padding: 0 1rem;
  }
  .review-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  .nav-right {
    gap: 10px;
  }
  .search-inner-container {
    width: 95%;
  }
}
</style>
