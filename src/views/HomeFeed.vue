<template>
  <div class="page-wrapper">
    <div class="home-container">
      <div class="bg-texture"></div>

      <div class="header-content fade-in">
        <div class="header-top">
          <div>
            <h1>Welcome back, <span class="username">{{ userName }}</span>.</h1>
          </div>
          <div v-if="streak > 0" class="streak-widget" title="Days in a row you've logged games">
            <span class="streak-fire">🔥</span>
            <div class="streak-text">
              <span class="streak-count">{{ streak }}</span>
              <span class="streak-label">day streak</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else class="feed-content fade-up">

        <!-- Friends Activity -->
        <section class="game-section">
          <div class="section-header">
            <h3>Friends Activity</h3>
            <span class="line"></span>
          </div>

          <div class="carousel-wrapper" v-if="friendsActivity.length > 0">
            <button class="nav-btn prev prev-friends">&lt;</button>
            <button class="nav-btn next next-friends">&gt;</button>
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
            <p>It's quiet here... follow some people to see their activity.</p>
          </div>
        </section>

        <!-- Games You Might Like -->
        <section v-if="recommendedGames.length > 0" class="game-section">
          <div class="section-header">
            <h3>Games You Might Like</h3>
            <span class="line"></span>
          </div>
          <div class="carousel-wrapper">
            <button class="nav-btn prev prev-rec">&lt;</button>
            <button class="nav-btn next next-rec">&gt;</button>
            <div class="fade-left"></div>
            <swiper
              :modules="modules"
              :loop="true"
              :slides-per-view="'auto'"
              :space-between="20"
              :breakpoints="swiperBreakpoints"
              :navigation="{ prevEl: '.prev-rec', nextEl: '.next-rec' }"
              :mousewheel="{ forceToAxis: true }"
              :free-mode="{ enabled: true, sticky: false, momentumRatio: 0.5 }"
              class="my-swiper"
            >
              <swiper-slide v-for="game in recommendedGames" :key="game.id_game" class="swiper-item">
                <GameCard :game="game" />
              </swiper-slide>
            </swiper>
            <div class="fade-right"></div>
          </div>
        </section>

        <!-- New Releases -->
        <section class="game-section">
          <div class="section-header">
            <h3>New Releases</h3>
            <span class="line"></span>
          </div>

          <div v-if="newGames.length > 0" class="carousel-wrapper">
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
          <div v-else class="empty-state">
            <p>Nothing here yet</p>
            <button class="retry-btn" @click="fetchData">Retry</button>
          </div>
        </section>

        <!-- Popular on Hitboxd (with genre filter tabs) -->
        <section class="game-section">
          <div class="section-header">
            <h3>Popular on Hitboxd</h3>
            <span class="line"></span>
          </div>

          <nav class="genre-tabs" role="tablist" aria-label="Genre filter">
            <button
              v-for="tab in genreTabs"
              :key="tab.value"
              role="tab"
              :aria-selected="activeGenre === tab.value"
              :class="['genre-tab', { active: activeGenre === tab.value }]"
              @click="setGenre(tab.value)"
            >{{ tab.label }}</button>
          </nav>

          <div v-if="popularGames.length > 0" class="carousel-wrapper">
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
              <swiper-slide v-for="game in popularGames" :key="game.id_game || game.igdb_id" class="swiper-item">
                <GameCard :game="game" />
              </swiper-slide>
            </swiper>
            <div class="fade-right"></div>
          </div>
          <div v-else-if="popularLoading" class="empty-state">
            <p>Loading...</p>
          </div>
          <div v-else class="empty-state">
            <p>Nothing here yet</p>
            <button class="retry-btn" @click="fetchPopular">Retry</button>
          </div>
        </section>

        <!-- People You May Know -->
        <section v-if="suggestions.length > 0" class="game-section">
          <div class="section-header">
            <h3>People You May Know</h3>
            <span class="line"></span>
          </div>
          <div class="suggestions-grid">
            <div
              v-for="user in suggestions"
              :key="user.id_user"
              class="suggestion-card"
              @click="goToUser(user.username)"
            >
              <img
                :src="user.avatar_url || '/assets/default-avatar.svg'"
                :alt="user.username"
                class="suggestion-avatar"
              />
              <div class="suggestion-info">
                <span class="suggestion-name">{{ user.username }}</span>
                <span class="suggestion-bio">{{ user.bio || 'No bio yet' }}</span>
              </div>
              <button
                class="follow-btn"
                :class="{ following: followingSet.has(user.id_user) }"
                @click.stop="toggleFollow(user)"
              >
                {{ followingSet.has(user.id_user) ? 'Following' : 'Follow' }}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axios';
import { useUserStore } from '@/stores/userStore';
import GameCard from '@/components/common/GameCard.vue';
import ActivityCard from '@/components/activity/ActivityCard.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, FreeMode, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

const userStore = useUserStore();
const router = useRouter();
const loading = ref(true);
const userName = ref('Player');
const newGames = ref([]);
const popularGames = ref([]);
const friendsActivity = ref([]);
const recommendedGames = ref([]);
const suggestions = ref([]);
const followingSet = ref(new Set());
const streak = ref(0);
const activeGenre = ref(null);
const popularLoading = ref(false);
const modules = [Navigation, FreeMode, Mousewheel];

const genreTabs = [
  { label: 'All',       value: null },
  { label: 'Action',    value: 'Action' },
  { label: 'RPG',       value: 'Role-playing (RPG)' },
  { label: 'Strategy',  value: 'Strategy' },
  { label: 'Adventure', value: 'Adventure' },
  { label: 'Sports',    value: 'Sport' },
];

const swiperBreakpoints = {
  320: { slidesPerView: 2.2, spaceBetween: 15 },
  640: { slidesPerView: 3.5, spaceBetween: 15 },
  768: { slidesPerView: 4.5, spaceBetween: 20 },
  1024: { slidesPerView: 5.5, spaceBetween: 20 },
};

const fetchPopular = async () => {
  popularLoading.value = true;
  try {
    const params = activeGenre.value
      ? `/games/popular?limit=20&genre=${encodeURIComponent(activeGenre.value)}`
      : '/games/popular?limit=20';
    const { data } = await api.get(params);
    popularGames.value = data;
  } catch (e) {
    logger.error('Error fetching popular:', e);
  } finally {
    popularLoading.value = false;
  }
};

const setGenre = async (genre) => {
  activeGenre.value = genre;
  await fetchPopular();
};

const goToUser = (username) => {
  router.push(`/u/${username}`);
};

const toggleFollow = async (user) => {
  const id = user.id_user;
  try {
    if (followingSet.value.has(id)) {
      await api.delete(`/users/follow/${id}`);
      followingSet.value = new Set([...followingSet.value].filter(x => x !== id));
    } else {
      await api.post(`/users/follow/${id}`);
      followingSet.value = new Set([...followingSet.value, id]);
    }
  } catch (e) {
    logger.error('Error toggling follow:', e);
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    try {
      await userStore.fetchUser();
      if (userStore.user?.username) userName.value = userStore.user.username;
    } catch (e) { logger.error('Error fetching user', e); }

    const results = await Promise.allSettled([
      api.get('/games/new?limit=20'),
      api.get('/games/popular?limit=20'),
      api.get('/activity/feed'),
      api.get('/games/recommended?limit=20'),
      api.get('/users/suggestions?limit=6'),
      api.get('/activity/streak'),
    ]);

    if (results[0].status === 'fulfilled') newGames.value = results[0].value.data;
    if (results[1].status === 'fulfilled') popularGames.value = results[1].value.data;
    if (results[2].status === 'fulfilled') friendsActivity.value = results[2].value.data;
    if (results[3].status === 'fulfilled') recommendedGames.value = results[3].value.data;
    if (results[4].status === 'fulfilled') suggestions.value = results[4].value.data;
    if (results[5].status === 'fulfilled') streak.value = results[5].value.data.streak ?? 0;

  } catch (error) {
    logger.error('Error loading feed:', error);
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
  background-image: url('/assets/bg-texture.webp'), url('/assets/bg-texture.jpg');
  background-size: 400px; opacity: 0.1; z-index: 0; pointer-events: none;
}

.header-content {
  position: relative; z-index: 1; margin-bottom: 3rem;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

h1 { font-family: 'Courier Prime', monospace; font-size: 2.5rem; color: #2D2D2D; margin-bottom: 0.5rem; }
.username { color: #00AEEF; }

/* Streak widget */
.streak-widget {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 2px solid #f97316;
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.15);
  cursor: default;
}

.streak-fire {
  font-size: 1.5rem;
  line-height: 1;
}

.streak-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.streak-count {
  font-family: 'Courier Prime', monospace;
  font-size: 1.4rem;
  font-weight: 700;
  color: #f97316;
}

.streak-label {
  font-size: 0.7rem;
  color: #888;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Genre tabs */
.genre-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.genre-tab {
  background: none;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 0.8rem;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.15s ease;
}

.genre-tab:hover {
  border-color: #00AEEF;
  color: #00AEEF;
}

.genre-tab.active {
  background: #00AEEF;
  border-color: #00AEEF;
  color: #fff;
}

/* People you may know */
.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  position: relative;
  z-index: 1;
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.suggestion-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transform: translateY(-1px);
}

.suggestion-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.suggestion-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.suggestion-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2D2D2D;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-bio {
  font-size: 0.75rem;
  color: #999;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.follow-btn {
  flex-shrink: 0;
  background: #00AEEF;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.follow-btn.following {
  background: none;
  color: #888;
  border: 1px solid #ccc;
}

.follow-btn:hover {
  opacity: 0.85;
}

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

.carousel-wrapper {
  position: relative;
  width: 100%;
}

.my-swiper {
  padding: 10px 0 20px 0;
  z-index: 0;
  cursor: grab;
}

.my-swiper:active {
  cursor: grabbing;
}

.swiper-item {
  width: 160px;
  height: auto;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.swiper-item > * {
  width: 100%;
}

.swiper-item:nth-child(4n + 1) { --hover-color: var(--brand-red); }
.swiper-item:nth-child(4n + 2) { --hover-color: var(--brand-cyan); }
.swiper-item:nth-child(4n + 3) { --hover-color: var(--brand-green); }
.swiper-item:nth-child(4n)     { --hover-color: var(--brand-yellow); }

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

.loading-state { text-align: center; margin-top: 5rem; color: #666; font-family: monospace; position: relative; z-index: 1; }
.spinner { margin-bottom: 10px; font-size: 2rem; }

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #888;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  position: relative;
  z-index: 1;
}

.empty-state p { margin: 0 0 0.75rem 0; }

.retry-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 14px;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.retry-btn:hover {
  border-color: #00AEEF;
  color: #00AEEF;
}

.fade-in { animation: fadeIn 0.8s ease; }
.fade-up { animation: fadeUp 0.8s ease; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  h1 { font-size: 1.8rem; }
  .nav-btn { display: none; }
  .fade-left, .fade-right { width: 30px; }
  .header-top { flex-direction: column; align-items: flex-start; }
  .suggestions-grid { grid-template-columns: 1fr; }
}
</style>
