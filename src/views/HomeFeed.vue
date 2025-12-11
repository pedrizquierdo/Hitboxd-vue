<template>
  <Nav />
  <div class="page-wrapper">
    <div class="home-container">
      <div class="bg-texture"></div>

      <h1 class="home-title fade-in">
        Welcome Account. Here’s what we’ve been gaming...
      </h1>
      <p class="subtitle fade-in-delay">
        This homepage will become customized as you
        <a href="/members" class="link">follow active members</a> on Hitboxd.
      </p>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your feed...</p>
      </div>

      <div v-else class="library-content fade-in">

        <div class="game-row-split">

          <section class="game-section half-width">
            <h3 class="section-title">NEW ON HITBOXD</h3>
            <div class="carousel-track mini-track">
              <div class="carousel-item mini-item"
                   v-for="game in newGames.slice(0, 5)"
                   :key="game.id_game"
                   @click="goToDetail(game.id_game)">
                <GameCard :game="game" />
              </div>
            </div>
          </section>

          <section class="game-section half-width">
            <h3 class="section-title">YOUR ACTIVITY</h3>
            <div class="carousel-track mini-track">
              <div class="carousel-item mini-item"
                   v-for="game in trendingGames.slice(0, 5)"
                   :key="'act-' + game.id_game"
                   @click="goToDetail(game.id_game)">
                <GameCard :game="game" />
              </div>
            </div>
          </section>
        </div>

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

let reviewUpdateInterval;
let targetGameId = null; // ID del juego para el cual buscaremos las reseñas

const scrollRow = (id, direction) => {
  const container = document.getElementById(id);
  if (container) {
    const scrollAmount = 500;
    container.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  }
};

const goToDetail = (id) => router.push(`/game/${id}`);

/**
 * Función para obtener las reseñas del JUEGO MÁS POPULAR.
 * Usamos la ruta existente: /reviews/game/:gameId
 */
const fetchReviews = async () => {
    // Si aún no tenemos el ID del juego (la primera vez), salimos.
    if (!targetGameId) return;

    try {
        // ✨ USO DE RUTA EXISTENTE: /reviews/game/:gameId ✨
        // Esto devolverá las últimas reseñas para el juego MÁS POPULAR, que se actualizan al crear una nueva.
        const resReviews = await api.get(`/reviews/game/${targetGameId}`);

        if (resReviews.data && Array.isArray(resReviews.data)) {
            // Como solo queremos mostrar 4, hacemos el slicing en el Frontend:
            const latestReviews = resReviews.data.slice(0, 4);

            // Formateamos los datos para que ReviewCard los entienda (títulos y URLs)
            // NOTA: La ruta /game/:gameId NO devuelve el título ni cover_url (ver reviews.model.js)
            // Esto es un problema de Backen. Usaremos placeholders.

            // --- PENDIENTE DE CORRECCIÓN DE BACKEND (Formato de Datos) ---
            // Temporalmente, asumimos que cada reseña tendrá al menos game_title y game_cover_url
            // En tu modelo actual, getReviewsByGame() SOLO devuelve r.* (reseña) y u.* (usuario).
            // Esto NO incluye el título y la portada.
            // Necesitarías modificar el modelo de Backend para incluir g.title y g.cover_url
            // O hacer una llamada adicional aquí.

            // Por ahora, usamos una estructura básica (los datos de usuario SÍ están, pero no la info del juego)
            const formattedReviews = latestReviews.map(r => ({
                id: r.id_review,
                user_name: r.username,
                // Estos dos son placeholders porque tu modelo /game/:gameId no los devuelve
                game_title: popularGames.value[0]?.title || `Game ID: ${r.id_game}`,
                game_cover_url: popularGames.value[0]?.cover_url || '/assets/placeholder.jpg',
                review_text: r.content,
                // (Asumo que r.rating existe en la tabla reviews, pero no lo veo en el SQL)
                rating: r.rating || 4, // Usar rating real si existe
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

/**
 * Función para obtener los datos de los juegos (tu lógica de slicing).
 * Después de cargar los juegos, define el targetGameId.
 */
const fetchGames = async () => {
  try {
    const res = await api.get('/games/trending?limit=90');
    const allGames = res.data;

    newGames.value = allGames.slice(0, 10);
    trendingGames.value = allGames.slice(10, 20);
    popularGames.value = allGames.slice(20, 50);

    // DEFINIMOS EL ID DEL JUEGO MÁS POPULAR PARA USARLO EN FETCHREVIEWS
    if (popularGames.value.length > 0) {
        targetGameId = popularGames.value[0].id_game;
    }

  } catch (error) {
    console.error("Error fetching homefeed data:", error);
  } finally {
    loading.value = false;

    // UNA VEZ QUE TENEMOS EL ID DEL JUEGO, INICIAMOS LA CARGA DE RESEÑAS
    if (targetGameId) {
        fetchReviews();
        // Configura el Polling para actualizar las reseñas de ese juego
        reviewUpdateInterval = setInterval(fetchReviews, 60000);
    }
  }
};


onMounted(() => {
  // Solo llamamos a fetchGames. fetchGames se encarga de llamar a fetchReviews y configurar el Polling.
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
/* ESTILOS DEL HOMEFEED (Basados en tu código) */
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

/* SECCIONES DE CONTENIDO */
.game-section {
  margin-bottom: 3rem;
  padding: 0 30px;
}

/* LAYOUT DE DOBLE COLUMNA (NEW / ACTIVITY) */
.game-row-split {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 3rem;
  padding: 0 30px;
}

.half-width {
  flex: 1;
  min-width: 0;
  padding: 0;
}

/* Carrusel pequeño para NEW y ACTIVITY */
.mini-track {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 15px;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.mini-track::-webkit-scrollbar { display: none; }

.mini-item {
  min-width: 110px;
  width: 110px;
  height: auto;
  flex-shrink: 0;
}


/* CARRUSEL DE JUEGOS POPULARES (Similar a tu código de catálogo) */
.carousel-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  transition: margin 0.3s ease, padding 0.3s ease;
}

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


/* GRID DE RESEÑAS (2x2) */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* RESPONSIVIDAD */

@media (max-width: 768px) {
  .game-row-split {
    flex-direction: column;
    padding: 0 1.5rem;
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
