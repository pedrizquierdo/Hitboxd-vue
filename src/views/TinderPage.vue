<template>
  <div class="page-wrapper">  
    <div class="body">
      <div class="bg-texture"></div>
      <div v-if="loading" class="loading-state fade-in">
        <div class="spinner"></div>
        <p>Searching for hidden gems...</p>
      </div>
      <div v-else-if="currentGame" class="matcher-content slide-up">
        <button class="action-btn skip" @click="handleAction('skip')">
          <span>SKIP</span>
        </button>
          <button class="top-corner-btn" @click="handleBack">
          <span class="icon-btn">&#8592;</span></button>
        <div class="game-poster-card" @click="goToDetail">
          <div class="poster-wrapper">
            <img
              :src="currentGame.cover_url || '/assets/placeholder.jpg'"
              :alt="currentGame.title"
              class="poster-img"
            />
            <div class="poster-overlay">
            </div>
          </div>
          <div class="poster-info">
            <h1 class="game-title">{{ currentGame.title }}</h1>
            <p class="game-info">
              <strong>Developer:</strong> {{ currentGame.developer || 'Unknown' }} •
              <strong>Release year:</strong> {{ releaseYear }}
            </p>
          </div>
        </div>
        <div class="right-actions">
          <button class="action-btn played" @click="handleAction('played')">
            <span>PLAYED</span>
          </button>
          <button class="action-btn wishlist" @click="handleWishlist">
            <span>WISHLIST</span>
          </button>
        </div>
      </div>
      <div v-else class="sinDatos fade-in">
        <h2>No more games found!</h2>
        <button class="retry-btn" @click="fetchRandomGame">Refresh</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger'
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axios';

const router = useRouter();
const loading = ref(true);
const currentGame = ref(null);

const releaseYear = computed(() => {
  const date = currentGame.value?.release_date;
  if (!date) return "N/A";
  
  const year = new Date(date).getFullYear();
  return isNaN(year) ? "N/A" : year;
});

const fetchRandomGame = async () => {
  loading.value = true;
  currentGame.value = null;
  try {
    const res = await api.get('/games/random');
    currentGame.value = res.data;
  } catch (err) {
    logger.error("Error fetching random game", err);
  } finally {
    loading.value = false;
  }
};


const handleAction = (type) => {
  api.post(`/activity/game/${currentGame.value.id_game}`, {
    action: type
  });
  fetchRandomGame();
};

const handleWishlist = () => {
  api.post(`/activity/game/${currentGame.value.id_game}`, {
    status: 'plan_to_play'
  });
  fetchRandomGame();
};
const handleBack = () => {
  router.push('/');
};
const goToDetail = () => {
  if (currentGame.value) {
    router.push(`/game/${currentGame.value.slug}`);
  }
};

onMounted(() => {
  fetchRandomGame();
});
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.body {
  width: 100%;
  max-width: 1440px;
  margin: auto;
  padding-bottom: 32px;
  position: relative;
  color: var(--text-main);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.bg-texture {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url('/assets/bg-texture.webp'), url('/assets/bg-texture.jpg');
  background-size: 400px;
  opacity: 0.1;
  z-index: -1;
}
.matcher-content {
  display: flex;
  align-items: center;
  gap: 10px;
}
.game-poster-card {
  position: relative;
  width: 500px; 
  height: 600px;
  border-radius: 8px;
  background-color: var(--card-bg, #fff);
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.game-poster-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.45);
}
.poster-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.poster-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 40%, transparent 100%);
}
.poster-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 30px 0px;
  text-align: center;
  z-index: 2;
}
.game-title {
  font-family: 'Courier Prime', monospace; 
  font-size: 2.2rem;
  color: white;
  margin-bottom: 0.8rem;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}
.game-info {
  color: #ddd;
  font-size: 0.95rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  font-family: 'Inter', sans-serif;
}
.game-info strong {
  color: white;
}
.action-btn {
  width: 90px;
  height: 90px;
  border-radius: 5%;
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: grid;
  justify-content: center;
  align-items: center;
  background-color: var(--card-bg, #fff);
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
}
.action-btn:hover {
  transform: scale(1.15);
}
.action-btn:active {
  transform: scale(0.95);
}
.skip { 
  border: 3px solid var(--brand-red, #FF4444);
  color: var(--brand-red, #FF4444);
}
.skip:hover {
  background-color: var(--brand-red, #FF4444);
  color: white;
}
.right-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.played {
  border: 3px solid var(--brand-green, #00CC66);
  color: var(--brand-green, #00CC66);
}
.played:hover {
  background-color: var(--brand-green, #00CC66);
  color: white;
}
.wishlist {
  border: 3px solid var(--brand-blue, #2196f3);
  color: var(--brand-blue, #2196f3);
}
.wishlist:hover {
  background-color: var(--brand-blue, #2196f3);
  color: white;
}
.icon {
  font-size: 2.2rem;
  line-height: 1;
  font-weight: bold;
}

.loading-state, .sinDatos {
  text-align: center;
  margin-top: 5rem;
  font-family: 'Inter', sans-serif;
  color: #555;
}

.fade-in {
  animation: fadeIn 0.5s ease;
}
.slide-up {
  animation: slideUp 0.5s ease;
}
.slide-down {
  animation: slideDown 0.5s ease;
}

.top-corner-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 20;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.top-corner-btn:hover {
  background-color: white;
  color: black;
  transform: scale(1.1);
  border-color: white;
}

.icon-btn {
  font-size: 19px;
  line-height: 1;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  .matcher-content {
    flex-direction: column;
    gap: 10px;
  }
  .game-poster-card {
    width: 90vw;
    height: 60vh;
  }
  .game-poster-card{
    background: none;
  }
  .right-actions {
    flex-direction: row;
    position: absolute;
    bottom: 16px;
    right: 5%;
    z-index: 10;
    gap: 6px;
  }
  .action-btn {
    position: static;
    width: 70px;
    height: 70px;
    font-size: 14px;
  }
  .skip {
    position: absolute;
    bottom: 16px;
    left: 15%;
    z-index: 10;
    background: white;
  }
  .played {
    background: white;
  }
  .wishlist {
    background: white;
  }
  .poster-info {
    padding: 55px 0px;
  }
    .poster-img {
    object-fit: contain;
  }
}

</style>