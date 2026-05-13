<template>
  <div class="page-wrapper">

    <!-- 2. GENRE FILTER OVERLAY -->
    <div v-if="showGenreFilter" class="genre-overlay">
      <div class="genre-modal">
        <h2>What do you want to discover?</h2>
        <p class="genre-subtitle">Select genres or skip to see everything</p>
        <div class="genre-chips">
          <button
            v-for="genre in availableGenres"
            :key="genre"
            class="genre-chip"
            :class="{ active: selectedGenres.includes(genre) }"
            @click="toggleGenre(genre)"
          >{{ genre }}</button>
        </div>
        <div class="genre-actions">
          <button class="genre-skip-btn" @click="startWithoutFilter">Show me everything</button>
          <button
            class="genre-start-btn"
            :disabled="selectedGenres.length === 0"
            @click="startWithFilter"
          >
            Start{{ selectedGenres.length > 0 ? ` with ${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''}` : '' }}
          </button>
        </div>
      </div>
    </div>

    <div class="body">
      <div class="bg-texture"></div>
      <div v-if="loading" class="loading-state fade-in">
        <div class="spinner"></div>
        <p>Searching for hidden gems...</p>
      </div>
      <div v-else-if="currentGame" class="matcher-content slide-up">
        <button class="action-btn skip" @click="animateThenAct('left', () => handleAction('skip'))">
          <span>SKIP</span>
        </button>
          <button class="top-corner-btn" @click="handleBack">
          <span class="icon-btn">&#8592;</span></button>
        <div
          class="game-poster-card"
          :class="swipeClass"
          @click="goToDetail"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
        >
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
            <p v-if="shortDescription" class="game-description">{{ shortDescription }}</p>
          </div>
        </div>
        <div class="right-actions">
          <button class="action-btn played" @click="animateThenAct('right', () => handleAction('played'))">
            <span>PLAYED</span>
          </button>
          <button class="action-btn wishlist" @click="animateThenAct('up', () => handleWishlist())">
            <span>WISHLIST</span>
          </button>
        </div>
      </div>
      <p class="keyboard-hint" v-if="currentGame && !loading">← Skip &nbsp;·&nbsp; → Played &nbsp;·&nbsp; ↑ Wishlist &nbsp;·&nbsp; Enter to view</p>
      <p class="session-counter" v-if="sessionCount > 0">
        {{ sessionCount }} game{{ sessionCount !== 1 ? 's' : '' }} rated this session
      </p>

      <div v-if="!loading && !currentGame && !showGenreFilter" class="sinDatos fade-in">
        <h2>No more games found!</h2>
        <button class="retry-btn" @click="fetchRandomGame">Refresh</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axios';

const router = useRouter();
const loading = ref(true);
const currentGame = ref(null);

// --- COMPUTED ---

const shortDescription = computed(() => {
  const desc = currentGame.value?.description;
  if (!desc) return '';
  return desc.length > 120 ? desc.slice(0, 120) + '...' : desc;
});

const releaseYear = computed(() => {
  const date = currentGame.value?.release_date;
  if (!date) return "N/A";
  const year = new Date(date).getFullYear();
  return isNaN(year) ? "N/A" : year;
});

// --- GENRE FILTER ---

const showGenreFilter = ref(true);
const selectedGenres = ref([]);
const availableGenres = ['Action', 'RPG', 'Strategy', 'Adventure', 'Simulation', 'Sports', 'Puzzle', 'Horror', 'Platformer', 'Fighting', 'Racing', 'Indie'];

const toggleGenre = (genre) => {
  const idx = selectedGenres.value.indexOf(genre);
  if (idx === -1) selectedGenres.value.push(genre);
  else selectedGenres.value.splice(idx, 1);
};

const startWithoutFilter = () => {
  showGenreFilter.value = false;
  fetchRandomGame();
};

const startWithFilter = () => {
  showGenreFilter.value = false;
  fetchRandomGame(selectedGenres.value);
};

// --- DATA FETCHING ---

const fetchRandomGame = async (genres) => {
  loading.value = true;
  currentGame.value = null;
  try {
    let url = '/games/random';
    if (genres && genres.length > 0) {
      url += `?genres=${genres.join(',')}`;
    }
    const res = await api.get(url);
    currentGame.value = res.data;
  } catch (err) {
    logger.error("Error fetching random game", err);
  } finally {
    loading.value = false;
  }
};

// --- SESSION COUNTER ---

const sessionCount = ref(0);

// --- ACTIONS ---

const handleAction = (type) => {
  sessionCount.value++;
  api.post(`/activity/game/${currentGame.value.id_game}`, {
    action: type
  });
  fetchRandomGame();
};

const handleWishlist = () => {
  sessionCount.value++;
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

// --- SWIPE ANIMATION ---

const swipeDirection = ref('');
const isAnimating = ref(false);

const swipeClass = computed(() => ({
  'swipe-left':  swipeDirection.value === 'left',
  'swipe-right': swipeDirection.value === 'right',
  'swipe-up':    swipeDirection.value === 'up',
}));

const animateThenAct = (direction, action) => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  swipeDirection.value = direction;
  setTimeout(() => {
    action();
    swipeDirection.value = '';
    isAnimating.value = false;
  }, 350);
};

// --- KEYBOARD ---

const handleKeydown = (e) => {
  if (!currentGame.value || loading.value) return;
  if (e.key === 'ArrowLeft')  animateThenAct('left',  () => handleAction('skip'));
  if (e.key === 'ArrowRight') animateThenAct('right', () => handleAction('played'));
  if (e.key === 'ArrowUp')    animateThenAct('up',    () => handleWishlist());
  if (e.key === 'Enter')      goToDetail();
};

// --- POINTER / TOUCH ---

const touchStartX = ref(0);
const touchStartY = ref(0);
const touchCurrentX = ref(0);
const touchCurrentY = ref(0);
const isDragging = ref(false);

const onPointerDown = (e) => {
  if (isAnimating.value) return;
  touchStartX.value = e.clientX;
  touchStartY.value = e.clientY;
  touchCurrentX.value = e.clientX;
  touchCurrentY.value = e.clientY;
  isDragging.value = true;
  e.currentTarget.setPointerCapture(e.pointerId);
};

const onPointerMove = (e) => {
  if (!isDragging.value) return;
  touchCurrentX.value = e.clientX;
  touchCurrentY.value = e.clientY;
  const dx = touchCurrentX.value - touchStartX.value;
  const dy = touchCurrentY.value - touchStartY.value;
  const card = e.currentTarget;
  const rotate = dx * 0.08;
  card.style.transform = `translateX(${dx}px) translateY(${dy * 0.3}px) rotate(${rotate}deg)`;
  card.style.transition = 'none';
};

const onPointerUp = (e) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  const dx = touchCurrentX.value - touchStartX.value;
  const dy = touchCurrentY.value - touchStartY.value;
  const card = e.currentTarget;
  card.style.transition = '';
  card.style.transform = '';
  const THRESHOLD = 80;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx < -THRESHOLD) animateThenAct('left',  () => handleAction('skip'));
    else if (dx > THRESHOLD) animateThenAct('right', () => handleAction('played'));
  } else {
    if (dy < -THRESHOLD) animateThenAct('up', () => handleWishlist());
  }
};

const onPointerCancel = (e) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  const card = e.currentTarget;
  card.style.transform = '';
  card.style.transition = '';
};

// --- LIFECYCLE ---

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
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
  touch-action: none;
}

.game-poster-card:hover:not(.swipe-left):not(.swipe-right):not(.swipe-up) {
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
.game-description {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.8rem;
  font-family: 'Inter', sans-serif;
  line-height: 1.4;
  margin-top: 6px;
  padding: 0 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
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

.keyboard-hint {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #aaa;
  letter-spacing: 0.5px;
  text-align: center;
}

.session-counter {
  font-size: 0.75rem;
  color: #aaa;
  text-align: center;
  margin-top: 4px;
  font-family: 'Inter', sans-serif;
}

/* SWIPE ANIMATIONS */
.swipe-left  { animation: swipeLeft  0.35s ease forwards; }
.swipe-right { animation: swipeRight 0.35s ease forwards; }
.swipe-up    { animation: swipeUp    0.35s ease forwards; }

@keyframes swipeLeft  { to { transform: translateX(-120%) rotate(-15deg); opacity: 0; } }
@keyframes swipeRight { to { transform: translateX(120%)  rotate(15deg);  opacity: 0; } }
@keyframes swipeUp    { to { transform: translateY(-80%)  scale(0.8);     opacity: 0; } }

/* GENRE FILTER */
.genre-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}
.genre-modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 480px;
  width: 90%;
}
.genre-modal h2 {
  margin: 0 0 6px;
  font-size: 1.4rem;
  color: #222;
}
.genre-subtitle {
  color: #777;
  font-size: 0.9rem;
  margin: 0;
}
.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}
.genre-chip {
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1.5px solid #ddd;
  background: white;
  color: #444;
  transition: all 0.15s;
}
.genre-chip.active {
  background: var(--brand-cyan);
  color: white;
  border-color: var(--brand-cyan);
}
.genre-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
.genre-skip-btn {
  background: transparent;
  color: #666;
  border: none;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.9rem;
}
.genre-skip-btn:hover {
  color: #333;
}
.genre-start-btn {
  background: var(--brand-cyan);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: opacity 0.15s;
}
.genre-start-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .keyboard-hint { display: none; }
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
  .game-description {
    font-size: 0.75rem;
  }
}
</style>
