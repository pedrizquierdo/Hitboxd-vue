<template>
  <div class="page-wrapper">
    <Nav />
    
    <div class="home-container">
      <div class="bg-texture"></div>

      <div class="header-content fade-in">
        <h1>Welcome back, <span class="username">{{ userName }}</span>.</h1>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else class="feed-content fade-up">

        <section class="game-section">
          <div class="section-header">
            <h3>Friends Activity</h3>
            <span class="line"></span>
          </div>

          <div class="carousel-wrapper" v-if="friendsActivity.length > 0">
            <button class="nav-btn prev prev-friends"><i class="fas fa-chevron-left">&lt;</i></button>
            <button class="nav-btn next next-friends"><i class="fas fa-chevron-right">&gt;</i></button>
            
            <div class="fade-left"></div>
            
            <swiper
              :modules="modules"
              :loop="true"
              :slides-per-view="'auto'"
              :space-between="20"
              :breakpoints="swiperBreakpoints"
              :navigation="{ prevEl: '.prev-friends', nextEl: '.next-friends' }"
              :mousewheel="{ forceToAxis: true }"
              :free-mode="{ enabled: true, sticky: false, momentumRatio: 0.5 }"
              class="my-swiper"
            >
              <swiper-slide v-for="(act, index) in friendsActivity" :key="index" class="swiper-item">
                <ActivityCard :activity="act" />
              </swiper-slide>
            </swiper>

            <div class="fade-right"></div>
          </div>
          
           <div v-else class="empty-state">
              <p>It's quiet here...</p>
           </div>
        </section>

        <section class="game-section">
          <div class="section-header">
            <h3>New Releases</h3>
            <span class="line"></span>
          </div>
          
          <div class="carousel-wrapper">
            <button class="nav-btn prev prev-new">&lt;</button>
            <button class="nav-btn next next-new">&gt;</button>
            <div class="fade-left"></div>
            
            <swiper
              :modules="modules"
              :loop="true"
              :slides-per-view="'auto'"
              :space-between="20"
              :breakpoints="swiperBreakpoints"
              :navigation="{ prevEl: '.prev-new', nextEl: '.next-new' }"
              :mousewheel="{ forceToAxis: true }"
              :free-mode="{ enabled: true, sticky: false, momentumRatio: 0.5 }"
              class="my-swiper"
            >
              <swiper-slide v-for="game in newGames" :key="game.igdb_id" class="swiper-item">
                <GameCard :game="game" />
              </swiper-slide>
            </swiper>
            
            <div class="fade-right"></div>
          </div>
        </section>

        <section class="game-section">
          <div class="section-header">
            <h3>Popular on Hitboxd</h3>
            <span class="line"></span>
          </div>
          
          <div class="carousel-wrapper">
             <button class="nav-btn prev prev-pop">&lt;</button>
            <button class="nav-btn next next-pop">&gt;</button>
            <div class="fade-left"></div>
            
            <swiper
              :modules="modules"
              :loop="true"
              :slides-per-view="'auto'"
              :space-between="20"
              :breakpoints="swiperBreakpoints"
              :navigation="{ prevEl: '.prev-pop', nextEl: '.next-pop' }"
              :mousewheel="{ forceToAxis: true }"
              :free-mode="{ enabled: true, sticky: false, momentumRatio: 0.5 }"
              class="my-swiper"
            >
              <swiper-slide v-for="game in popularGames" :key="game.igdb_id" class="swiper-item">
                <GameCard :game="game" />
              </swiper-slide>
            </swiper>
            
            <div class="fade-right"></div>
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
import Nav from '@/components/common/Nav.vue';
import Footer from '@/components/common/PageFooter.vue';
import GameCard from '@/components/common/GameCard.vue';
import ActivityCard from '@/components/activity/ActivityCard.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, FreeMode, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

const loading = ref(true);
const userName = ref('Player');
const newGames = ref([]);
const popularGames = ref([]);
const friendsActivity = ref([]);
const modules = [Navigation, FreeMode, Mousewheel];

const swiperBreakpoints = {
  320: { slidesPerView: 2.2, spaceBetween: 15 }, 
  640: { slidesPerView: 3.5, spaceBetween: 15 },
  768: { slidesPerView: 4.5, spaceBetween: 20 },
  1024: { slidesPerView: 5.5, spaceBetween: 20 }, 
};

const fetchData = async () => {
  loading.value = true;
  try {
    try {
        const userRes = await api.get('/users/me');
        if (userRes.data?.username) userName.value = userRes.data.username;
    } catch (error) { console.error("Error user", error); }

    const results = await Promise.allSettled([
        api.get('/games/new?limit=20'),
        api.get('/games/trending?limit=20'),
        api.get('/activity/feed') 
    ]);

    if (results[0].status === 'fulfilled') newGames.value = results[0].value.data;
    if (results[1].status === 'fulfilled') popularGames.value = results[1].value.data;
    if (results[2].status === 'fulfilled') friendsActivity.value = results[2].value.data;

  } catch (error) {
    console.error("Error cargando feed:", error);
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
  padding: 10px 0 20px 0; 
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory; 
  scrollbar-width: none;
  scrollbar-color: none;
}

.horizontal-scroll::-webkit-scrollbar { display: none; }
.horizontal-scroll::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 4px; }
.horizontal-scroll::-webkit-scrollbar-track { background-color: transparent; }

.scroll-item {
  min-width: 160px; 
  width: 160px;
  flex-shrink: 0;
  scroll-snap-align: start; 
  transition: transform 0.2s;
}
.carousel-wrapper {
  position: relative;
  width: 100%;
}

.my-swiper {
  padding: 10px 0 20px 0; 
  z-index: 0;
  cursor: default 
}

.swiper-item {
  height: auto;
  display: flex;
  justify-content: center;
}

.swiper-item > * {
  width: 100%;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
  color: hsl(0, 0%, 20%);
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
  width: 20px;
  height: 95%; 
  z-index: 5;
  pointer-events: none; 
  z-index: 10;
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