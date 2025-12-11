<template>
  <div class="page-wrapper">
    <div class="catalog-container">
      <div class="bg-texture"></div>
      <div class="catalog-header">
        <h1>GAME LIBRARY</h1>
      </div>
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading library...</p>
      </div>
      <div v-else class="library-content fade-in">
        <section class="game-section">
          <h3 class="section-title">POPULAR GAMES THIS WEEK</h3>
          <div class="carousel-wrapper">
            <button class="nav-btn left" @click="scrollRow('trending', -1)">&#8249;</button>
            <div class="carousel-track" id="trending">
              <div class="carousel-item" v-for="game in trendingGames" :key="game.id_game">
                <GameCard :game="game" />
              </div>
            </div>
            <button class="nav-btn right" @click="scrollRow('trending', 1)">&#8250;</button>
          </div>
        </section>
        <section class="game-section">
          <h3 class="section-title">TOP RATED</h3>
          <div class="carousel-wrapper">
            <button class="nav-btn left" @click="scrollRow('top', -1)">&#8249;</button>
            <div class="carousel-track" id="top">
               <div class="carousel-item" v-for="game in topGames" :key="game.id_game">
                <GameCard :game="game" />
              </div>
            </div>
            <button class="nav-btn right" @click="scrollRow('top', 1)">&#8250;</button>
          </div>
        </section>
        <section class="game-section">
          <h3 class="section-title">NEW RELEASES</h3>
          <div class="carousel-wrapper">
             <button class="nav-btn left" @click="scrollRow('new', -1)">&#8249;</button>
            <div class="carousel-track" id="new">
               <div class="carousel-item" v-for="game in newGames" :key="game.id_game">
                <GameCard :game="game" />
              </div>
            </div>
             <button class="nav-btn right" @click="scrollRow('new', 1)">&#8250;</button>
          </div>
        </section>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
import Footer from '@/components/common/Footer.vue';
import GameCard from '@/components/common/GameCard.vue';
import Logo from '@/components/common/Logo.vue';

const loading = ref(true);
const trendingGames = ref([]);
const topGames = ref([]);
const newGames = ref([]);

const scrollRow = (id, direction) => {
  const container = document.getElementById(id);
  if(container) {
    const scrollAmount = 500; 
    container.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  }
};

const fetchGames = async () => {
  try {
    const res = await api.get('/games/trending?limit=90');
    trendingGames.value = res.data.slice(0, 30);
    topGames.value = res.data.slice(30, 60);
    newGames.value = res.data.slice(60, 90);
  } catch (error) {
    console.error("Error fetching games:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchGames();
});
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.catalog-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  position: relative;
  overflow-x: hidden; 
}

.bg-texture {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-image: url('/assets/bg-texture.jpg');
  background-size: 400px; opacity: 0.1; z-index: -1;
}

.catalog-header h1 {
  font-family: 'Courier Prime', monospace;
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  margin-top: 1rem;
}

.game-section {
  margin-bottom: 3rem;
  padding: 0px 30px;
}

.section-title {
  font-family: 'Courier Prime', monospace;
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 10px;
}

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
  scrollbar-width: none;
  scroll-behavior: smooth;
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

@media (max-width: 1024px) {
  .catalog-container {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .carousel-item {
    min-width: 100px; 
    width: 100px; 
  }
  .carousel-wrapper {
    margin: 0 -1.5rem;
    padding: 0 1.5rem;
    width: auto;
  }
  .section-title {
    font-size: 1.2rem;
  }
}

.loading-state { text-align: center; margin-top: 5rem; }
.fade-in { animation: fadeIn 0.8s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>