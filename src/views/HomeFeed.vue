<template>
  <Nav />
  <div class="page-wrapper">
    <div class="home-container">
      <div class="bg-texture"></div>

      <h1 class="home-title fade-in">
        Welcome {{ userName }}. Here’s what we’ve been gaming...
      </h1>
      <p class="subtitle fade-in-delay">
        This homepage will become customized as you review on Hitboxd.
      </p>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your feed...</p>
      </div>

      <div v-else class="library-content fade-in">

        <section class="game-section">
            <div class="top-row-titles">
                <h3 class="section-title">NEW ON HITBOXD</h3>

                <h3 class="section-title activity-title">
                    <router-link to="/profile" class="activity-link">
                        YOUR ACTIVITY
                    </router-link>
                </h3>
            </div>

            <div class="carousel-wrapper top-carousel-wrapper">
                <button class="nav-btn left" @click="scrollRow('top-games-track', -1)">&#8249;</button>

                <div class="carousel-track" id="top-games-track">

                    <div class="carousel-item top-item"
                        v-for="game in newGames.slice(0, 5)"
                        :key="'new-' + game.id_game"
                        @click="goToDetail(game.id_game)">
                        <GameCard :game="game" />
                    </div>

                    <div class="carousel-item top-item activity-game-item"
                        v-for="game in trendingGames.slice(0, 5)"
                        :key="'act-' + game.id_game"
                        @click="goToDetail(game.id_game)">
                        <GameCard :game="game" />
                    </div>
                </div>

                <button class="nav-btn right" @click="scrollRow('top-games-track', 1)">&#8250;</button>
            </div>
        </section>

        <section class="game-section">
          <h3 class="section-title">POPULAR ON HITBOXD</h3>
          <div class="carousel-wrapper">
            <button class="nav-btn left" @click="scrollRow('popular', -1)">&#8249;</button>
            <div class="carousel-track" id="popular">
              <div class="carousel-item"
                   v-for="game in popularGames"
                   :key="'pop-' + game.id_game"
                   @click="goToDetail(game.id_game)">
                <GameCard :game="game" />
              </div>
            </div>
            <button class="nav-btn right" @click="scrollRow('popular', 1)">&#8250;</button>
          </div>
        </section>

        <section class="game-section">
          <h3 class="section-title">POPULAR REVIEWS THIS WEEK</h3>
          <div class="reviews-grid">
            <ReviewCard
              v-for="review in popularReviews"
              :key="review.id"
              :review="review"
              :gameImage="review.game_cover_url"
            />
          </div>
        </section>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import api from '@/api/axios';
import Footer from '@/components/common/Footer.vue';
import Nav from "@/components/common/Nav.vue";
import GameCard from '@/components/common/GameCard.vue';
import ReviewCard from '@/components/reviews/reviewCard.vue';

const router = useRouter();

const loading = ref(true);
const trendingGames = ref([]);
const popularGames = ref([]);
const newGames = ref([]);
const popularReviews = ref([]);
const userName = ref("Account"); // Estado reactivo para el nombre del usuario

let reviewUpdateInterval;
let targetGameId = null;

// --- FUNCIÓN DE CARGA DE DATOS PRINCIPAL MODIFICADA ---
const fetchUserData = async () => {
    try {
        // 1. Cargar información del usuario (usando la misma lógica de tu ejemplo)
        const userResponse = await api.get("/users/me");
        // ASUMO que el endpoint /users/me devuelve { username: "nombre" }
        if (userResponse.data && userResponse.data.username) {
            userName.value = userResponse.data.username;
        }
    } catch (error) {
        console.error("Error al obtener información del usuario logueado:", error);
        // Si hay un error (ej: 401 Unauthorized), lo mantenemos como "Account"
    }
};

const scrollRow = (id, direction) => {
  const container = document.getElementById(id);
  if (container) {
    const itemWidth = (180 + 16);
    const scrollAmount = itemWidth * 3;
    container.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  }
};

const goToDetail = (id) => router.push(`/game/${id}`);

const fetchReviews = async () => {
    // ... (Lógica de fetchReviews)
    if (!targetGameId) return;

    try {
        const resReviews = await api.get(`/reviews/game/${targetGameId}`);

        if (resReviews.data && Array.isArray(resReviews.data)) {
            const latestReviews = resReviews.data.slice(0, 4);

            const formattedReviews = latestReviews.map(r => ({
                id: r.id_review,
                user_name: r.username,
                game_title: popularGames.value[0]?.title || `Game ID: ${r.id_game}`,
                game_cover_url: popularGames.value[0]?.cover_url || '/assets/placeholder.jpg',
                review_text: r.content,
                rating: r.rating || 4,
            }));

            popularReviews.value = formattedReviews;

        } else {
            console.warn("[REVIEWS] API devolvió lista vacía o inválida.");
            popularReviews.value = [];
        }
    } catch (error) {
        console.error("Error al obtener reseñas del juego más popular:", error);
        popularReviews.value = [];
    }
};

const fetchGames = async () => {
  try {
    const res = await api.get('/games/trending?limit=90');
    const allGames = res.data;

    newGames.value = allGames.slice(0, 10);
    trendingGames.value = allGames.slice(10, 20);
    popularGames.value = allGames.slice(20, 50);

    if (popularGames.value.length > 0) {
        targetGameId = popularGames.value[0].id_game;
    }

  } catch (error) {
    console.error("Error fetching homefeed data:", error);
  } finally {
    loading.value = false;

    if (targetGameId) {
        fetchReviews();
        reviewUpdateInterval = setInterval(fetchReviews, 60000);
    }
  }
};


onMounted(async () => {
  // 1. Obtener el nombre del usuario logueado llamando a /users/me
  await fetchUserData();

  // 2. Iniciar la carga del feed
  fetchGames();
});

onUnmounted(() => {
  if (reviewUpdateInterval) {
    clearInterval(reviewUpdateInterval);
    console.log("Polling de reseñas detenido.");
  }
});
</script>

<style scoped>
/* ----------------------------------- */
/* ESTILOS DEL HOMEFEED */
/* ----------------------------------- */

.page-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.home-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  position: relative;
  overflow-x: hidden;
  color: #000;
  text-align: center;
}

.bg-texture {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-image: url('/assets/bg-texture.jpg');
  background-size: 400px; opacity: 0.1; z-index: -1;
}

/* TITLES */
.home-title {
  font-family: 'Courier Prime', monospace;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #000000;
}

.subtitle {
  margin-bottom: 3rem;
  font-size: 0.95rem;
  color: #505050;
}

.link {
  color: var(--brand-cyan, #00AEEF);
  text-decoration: none;
}

.section-title {
  font-family: 'Courier Prime', monospace;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  text-align: left;
  padding: 0 0.5rem;
  color: #504f4f;
  text-transform: uppercase;
}

.game-section {
  margin-bottom: 3rem;
  padding: 0 30px;
}

/* TÍTULOS DE LA FILA SUPERIOR */
.top-row-titles {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0 0.5rem;
    margin-bottom: 1rem;
}

.top-row-titles .section-title {
    margin-bottom: 0;
}

/* Título 'YOUR ACTIVITY' contenedor */
.activity-title {
    text-align: right;
    margin-left: auto;
    padding: 0;
}

/* Estilo para el router-link dentro del H3 */
.activity-link {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
}

.activity-link:hover {
    color: var(--brand-cyan, #00AEEF);
}


/* --- CARRUSEL GENERAL --- */

.carousel-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  transition: margin 0.3s ease, padding 0.3s ease;
}

/* El track permite el desplazamiento horizontal */
.carousel-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 15px;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  flex: 1;
  min-width: 0;
  width: 100%;
}
.carousel-track::-webkit-scrollbar { display: none; }

/* Item (Tamaño de las portadas) */
.carousel-item {
  min-width: 180px;
  width: 180px;
  scroll-snap-align: start;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.nav-btn {
  background: white;
  border: 1px solid #ccc;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  line-height: 1;
  color: #555;
  transition: all 0.2s;
  flex-shrink: 0;
  z-index: 2;
  padding-bottom: 4px;
}

.nav-btn:hover {
  background: var(--brand-cyan, #00AEEF);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.nav-btn.left { margin-right: 10px; }
.nav-btn.right { margin-left: 10px; }


/* GRID DE RESEÑAS */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* RESPONSIVIDAD */
@media (max-width: 768px) {
  .top-row-titles {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-title {
    text-align: left;
    margin-left: 0;
  }

  .game-section {
    padding: 0 1.5rem;
  }

  .carousel-wrapper {
    margin: 0 -1.5rem;
    padding: 0 1.5rem;
    width: auto;
  }

  .reviews-grid {
    grid-template-columns: 1fr;
  }

  .nav-btn {
    display: none;
  }
}


/* ANIMATIONS */
.loading-state { text-align: center; margin-top: 5rem; }
.fade-in { animation: fadeIn 0.8s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
