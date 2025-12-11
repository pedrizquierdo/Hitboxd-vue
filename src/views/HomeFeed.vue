<template>
  <div class="page-wrapper">
    <Nav />
    
    <div class="home-container">
      <div class="bg-texture"></div>

      <div class="header-content fade-in">
        <h1>Welcome back, <span class="username">{{ userName }}</span>.</h1>
        <p class="subtitle">Here’s what’s happening in the world of gaming.</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your feed...</p>
      </div>

      <div v-else class="feed-content fade-up">

        <section class="game-section">
          <div class="section-header">
            <h3>New Releases</h3>
            <span class="line"></span>
          </div>
          
          <div class="carousel-wrapper">
            <button class="nav-btn prev" @click="scroll(newGamesScroll, 'left')" aria-label="Scroll Left">
              &#10094; </button>

            <div class="fade-left"></div>
            <div class="fade-right"></div>

            <div class="horizontal-scroll" ref="newGamesScroll">
              <GameCard 
                v-for="game in newGames" 
                :key="game.igdb_id" 
                :game="game"
                class="scroll-item"
              />
            </div>

            <button class="nav-btn next" @click="scroll(newGamesScroll, 'right')" aria-label="Scroll Right">
              &#10095; </button>
          </div>
        </section>

        <section class="game-section">
          <div class="section-header">
            <h3>Popular on Hitboxd</h3>
            <span class="line"></span>
          </div>
          
          <div class="carousel-wrapper">
            <button class="nav-btn prev" @click="scroll(popularScroll, 'left')">&#10094;</button>
            <div class="fade-left"></div>
            <div class="fade-right"></div>
            
            <div class="horizontal-scroll" ref="popularScroll">
              <GameCard 
                v-for="game in popularGames" 
                :key="game.igdb_id" 
                :game="game"
                class="scroll-item"
              />
            </div>

            <button class="nav-btn next" @click="scroll(popularScroll, 'right')">&#10095;</button>
          </div>
        </section>

      </div>
    </div>
    
    <Footer/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
import Nav from '@/components/common/Nav.vue';
import Footer from '@/components/common/Footer.vue';
import GameCard from '@/components/common/GameCard.vue'; 

const loading = ref(true);
const userName = ref('Player');
const newGames = ref([]);
const popularGames = ref([]);

const newGamesScroll = ref(null);
const popularScroll = ref(null);

const scroll = (element, direction) => {
  if (!element) return;
  
  const scrollAmount = 300; 
  
  element.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  });
};


const fetchData = async () => {
  loading.value = true;
  try {
    try {
        const userRes = await api.get('/users/me');
        if (userRes.data?.username) userName.value = userRes.data.username;
    } catch (error) { 
        console.error("No se pudo obtener usuario:", error);
    }

    const results = await Promise.allSettled([
        api.get('/games/new?limit=12'),           
        api.get('/games/trending?limit=12')
    ]);

    if (results[0].status === 'fulfilled') {
        newGames.value = results[0].value.data;
    } else {
        console.error("No se pudo obtener nuevos juegos:", results[0].reason);
    }

    if (results[1].status === 'fulfilled') {
        popularGames.value = results[1].value.data;
    } else {
        console.error("No se pudo obtener juegos populares:", results[1].reason);
    }

  } catch (error) {
    console.error("Error general cargando feed:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  display: flex; flex-direction: column;
  background-color: #E3E4E8;
}

.home-container {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

.bg-texture {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-image: url('/assets/bg-texture.jpg');
  background-size: 400px; opacity: 0.1; z-index: 0; pointer-events: none;
}

.header-content {
  position: relative; z-index: 1; margin-bottom: 3rem; text-align: center;
}

h1 { font-family: 'Courier Prime', monospace; font-size: 2.5rem; color: #2D2D2D; margin-bottom: 0.5rem; }
.username { color: #00AEEF; } 
.subtitle { color: #666; font-size: 1.1rem; }

.game-section {
  margin-bottom: 4rem; position: relative; z-index: 1;
}

.section-header {
  display: flex; align-items: center; gap: 15px; margin-bottom: 1.5rem;
}

h3 {
  font-family: 'Inter', sans-serif; font-weight: 800; font-size: 1.2rem;
  color: #444; text-transform: uppercase; white-space: nowrap;
}

.line {
  flex: 1; height: 2px; background-color: #d1d5db; 
}

.view-all {
  font-size: 0.9rem; color: #00AEEF; text-decoration: none; font-weight: bold;
}

.horizontal-scroll {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px; 
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory; 
  
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.horizontal-scroll::-webkit-scrollbar { height: 6px; }
.horizontal-scroll::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 4px; }
.horizontal-scroll::-webkit-scrollbar-track { background-color: transparent; }

.scroll-item {
  min-width: 160px; 
  width: 160px;
  flex-shrink: 0;
  scroll-snap-align: start; 
}
.carousel-wrapper {
  position: relative;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
  color: #333;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.nav-btn.prev { left: -50px; } 
.nav-btn.next { right: -50px; }


.fade-left, .fade-right {
  position: absolute;
  top: 0; bottom: 0;
  width: 30px;
  height: 95%; 
  z-index: 5;
  pointer-events: none; 
}

.fade-left {
  left: 0;
  background: linear-gradient(to right, #d2d4d9 0%, transparent 100%);
}

.fade-right {
  right: 0;
  background: linear-gradient(to left, #d2d4d9 0%, transparent 100%);
}


.loading-state { text-align: center; margin-top: 5rem; color: #666; font-family: monospace; position: relative; z-index: 1;}
.spinner { margin-bottom: 10px; font-size: 2rem; }

.fade-in { animation: fadeIn 0.8s ease; }
.fade-up { animation: fadeUp 0.8s ease; }



@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }


@media (max-width: 768px) {
  h1 { font-size: 1.8rem; }
  .nav-btn { display: none; }
  .fade-left, .fade-right { width: 30px; }
  
  .nav-btn.prev { left: 0; }
  .nav-btn.next { right: 0; }
  .horizontal-scroll { gap: 15px; }
  .scroll-item { min-width: 140px; width: 140px; }
}
</style>