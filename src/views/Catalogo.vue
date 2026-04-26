<template>
  <div class="page-wrapper">
    <div class="catalog-container">
      <div class="catalog-header-actions">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search all games..."
          class="catalog-search-input"
        />
      </div>
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading library...</p>
      </div>
      <div v-else class="library-content fade-in">       
        <div v-if="searchQuery" class="search-results-container">
           <h3 class="section-title">SEARCH RESULTS ({{ filteredGames.length }})</h3>          
           <div v-if="filteredGames.length > 0" class="results-grid">
             <div class="grid-item" v-for="game in filteredGames" :key="game.id_game">
                <GameCard :game="game" />
             </div>
           </div>           
           <div v-else class="no-results">
              <p>No games found for "{{ searchQuery }}"</p>
           </div>
        </div>
        <div v-else class="default-view">
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
        </div> </div>
    </div>
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger'
import { ref, onMounted, computed } from 'vue';
import api from '@/api/axios';
import GameCard from '@/components/common/GameCard.vue';

document.title = 'Games Catalog — Hitboxd';

const loading = ref(true);
const allGames = ref([]);
const trendingGames = ref([]);
const topGames = ref([]);
const newGames = ref([]);


const searchQuery = ref('');

const filteredGames = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return allGames.value.filter(game => 
    game.title.toLowerCase().includes(query)
  );
});

const scrollRow = (id, direction) => {
  const container = document.getElementById(id);
  
  if (container) {
    const scrollAmount = 500;
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth; 
    const tolerance = 5; 
    if (direction === 1) {
      if (currentScroll >= maxScroll - tolerance) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } 
    else {
      if (currentScroll <= tolerance) {
        container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }
};

// TODO: trendingGames and topGames should come from separate backend endpoints
// (e.g. /games/trending and /games/top-rated) when the API exposes them.
// For now both are sourced from /games/trending and split arbitrarily by index.
const fetchGames = async () => {
  try {
    const res = await api.get('/games/trending?limit=400');
    const newRes = await api.get('/games/new?limit=12');
    allGames.value = res.data;
    trendingGames.value = res.data.slice(0, 200);
    topGames.value = res.data.slice(200, 400);
    newGames.value = newRes.data.slice(0, 12);
  } catch (error) {
    logger.error("Error fetching games:", error);
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
.catalog-header-actions {
  margin-bottom: 2rem;
}
.catalog-search-input {
  width: 100%;
  max-width: 480px;
  padding: 10px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  outline: none;
  background: white;
  color: #2d2d2d;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.catalog-search-input:focus {
  border-color: var(--brand-cyan, #00AEEF);
  box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.12);
}
.search-results-container {
  margin-top: 20px;
}
.results-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}
.grid-item {
  width: 180px;
}
.no-results {
  text-align: center;
  margin-top: 40px;
  font-size: 1.2rem;
  color: #666;
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
  .carousel-item, .grid-item {
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
  .results-grid {
      justify-content: center;
      gap: 10px;
  }
}

.loading-state { text-align: center; margin-top: 5rem; }
.fade-in { animation: fadeIn 0.8s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>