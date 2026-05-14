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
            <svg class="streak-fire" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C9.5 7 11 9.5 9 12c-1 1.5-2.5 2-2.5 2s.5-2-1-3.5C4 12.5 3 15 3 17a9 9 0 0 0 18 0c0-5-4-9-9-15Zm0 18a5 5 0 0 1-5-5c0-2 1-3.5 2.5-4.5.5 1.5 1.5 2.5 1.5 2.5s-.5-2 1-3.5C13.5 11 15 13 15 15a3 3 0 0 1-3 3Z"/>
            </svg>
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
              @swiper="onSwiperInit"
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

        <!-- Popular Lists -->
        <section v-if="popularLists.length > 0" class="game-section">
          <div class="section-header">
            <h3>Popular Lists</h3>
            <span class="line"></span>
          </div>
          <div class="lists-grid">
            <RouterLink
              v-for="(list, index) in popularLists"
              :key="list.id_list"
              :to="`/lists/${list.id_list}`"
              class="list-card"
            >
              <div class="list-covers">
                <div
                  v-for="(cover, i) in list.covers.slice(0, 4)"
                  :key="i"
                  class="list-cover-cell"
                >
                  <img :src="cover" alt="" class="list-cover-thumb" />
                </div>
                <div
                  v-for="i in Math.max(0, 4 - list.covers.length)"
                  :key="'empty-' + i"
                  class="list-cover-cell list-cover-empty"
                ></div>
                <span class="list-rank-badge" :class="index < 3 ? `rank-top-${index + 1}` : 'rank-default'">#{{ index + 1 }}</span>
              </div>
              <div class="list-info">
                <div class="list-title-row">
                  <span class="list-title">{{ list.title }}</span>
                  <span class="list-type-pill" :class="`type-${list.list_type}`">{{ list.list_type }}</span>
                </div>
                <span v-if="list.description" class="list-desc">{{ list.description }}</span>
                <div class="list-meta">
                  <span class="list-author">
                    <img
                      :src="list.avatar_url || '/assets/default-avatar.svg'"
                      :alt="list.username"
                      class="list-author-avatar"
                    />
                    {{ list.username }}
                  </span>
                  <span class="list-meta-dot">·</span>
                  <span class="list-likes">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="list-heart-icon" aria-hidden="true">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {{ list.like_count }}
                  </span>
                  <span class="list-meta-dot">·</span>
                  <span class="list-game-count">{{ list.game_count }} game{{ list.game_count !== 1 ? 's' : '' }}</span>
                </div>
              </div>
            </RouterLink>
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
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import api from '@/api/axios';
import { useUserStore } from '@/stores/userStore';
import { socket } from '@/realtime/socket.js';
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
const popularLists = ref([]);
const followingSet = ref(new Set());
const streak = ref(0);
const activeGenre = ref(null);
const popularLoading = ref(false);
const modules = [Navigation, FreeMode, Mousewheel];

const friendsSwiperInstance = ref(null);
const onSwiperInit = (swiper) => { friendsSwiperInstance.value = swiper; };

// feed:review payload shape: { id_review, id_user, username, avatar_url, id_game, title, cover_url, content, rating, created_at }
// slug may be absent from review events — goToGame in ActivityCard guards for null slug.
const reviewToActivity = (review) => ({
  username: review.username,
  avatar_url: review.avatar_url,
  title: review.title,
  cover_url: review.cover_url,
  rating: review.rating,
  status: 'review',
  slug: review.slug ?? null,
  created_at: review.created_at,
});

// fanoutToFollowers sends events only to the actor's followers, never to the actor
// themselves, so no self-filter guard is needed on the client side.
const onFeedActivity = (item) => {
  friendsActivity.value.unshift(item);
  if (friendsActivity.value.length > 30) {
    friendsActivity.value = friendsActivity.value.slice(0, 30);
  }
  nextTick(() => { friendsSwiperInstance.value?.update(); });
};

const onFeedReview = (review) => {
  friendsActivity.value.unshift(reviewToActivity(review));
  if (friendsActivity.value.length > 30) {
    friendsActivity.value = friendsActivity.value.slice(0, 30);
  }
  nextTick(() => { friendsSwiperInstance.value?.update(); });
};

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
      api.get('/lists/popular?limit=9'),
    ]);

    if (results[0].status === 'fulfilled') newGames.value = results[0].value.data;
    if (results[1].status === 'fulfilled') popularGames.value = results[1].value.data;
    if (results[2].status === 'fulfilled') friendsActivity.value = results[2].value.data;
    if (results[3].status === 'fulfilled') recommendedGames.value = results[3].value.data;
    if (results[4].status === 'fulfilled') suggestions.value = results[4].value.data;
    if (results[5].status === 'fulfilled') streak.value = results[5].value.data.streak ?? 0;
    if (results[6].status === 'fulfilled') popularLists.value = results[6].value.data;

  } catch (error) {
    logger.error('Error loading feed:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
  socket.on('feed:activity', onFeedActivity);
  socket.on('feed:review', onFeedReview);
});

onBeforeUnmount(() => {
  socket.off('feed:activity', onFeedActivity);
  socket.off('feed:review', onFeedReview);
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
  width: 1.5rem;
  height: 1.5rem;
  color: #f97316;
  flex-shrink: 0;
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

/* Popular Lists */
.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  position: relative;
  z-index: 1;
}

.list-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s, transform 0.2s;
  border: 1.5px solid transparent;
}

.list-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.14);
  transform: translateY(-3px);
  border-color: #00AEEF33;
}

/* Cover collage */
.list-covers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  height: 148px;
  gap: 2px;
  background: #e5e7eb;
  position: relative;
  overflow: hidden;
}

.list-cover-cell {
  overflow: hidden;
}

.list-cover-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.list-card:hover .list-cover-thumb {
  transform: scale(1.06);
}

.list-cover-empty {
  background: linear-gradient(135deg, #d1d5db 0%, #c4c8d0 100%);
}

/* Rank badge */
.list-rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  font-family: 'Courier Prime', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  letter-spacing: 0.03em;
  line-height: 1.6;
  pointer-events: none;
}

.rank-top-1 { background: #f59e0b; color: #fff; box-shadow: 0 1px 4px rgba(245,158,11,0.4); }
.rank-top-2 { background: #94a3b8; color: #fff; box-shadow: 0 1px 4px rgba(148,163,184,0.4); }
.rank-top-3 { background: #b07850; color: #fff; box-shadow: 0 1px 4px rgba(176,120,80,0.4); }
.rank-default { background: rgba(0,0,0,0.45); color: #fff; backdrop-filter: blur(4px); }

/* Info area */
.list-info {
  padding: 13px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.list-title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.list-title {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 0.95rem;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

/* List type pill */
.list-type-pill {
  flex-shrink: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 20px;
}

.type-collection { background: #e0f2fe; color: #0284c7; }
.type-ranking    { background: #fef3c7; color: #b45309; }
.type-wishlist   { background: #f0fdf4; color: #16a34a; }

.list-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #888;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.list-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.list-author {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Inter', sans-serif;
  font-size: 0.74rem;
  color: #555;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-author-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #e5e7eb;
  flex-shrink: 0;
}

.list-meta-dot {
  color: #ccc;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.list-likes {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: 'Inter', sans-serif;
  font-size: 0.74rem;
  font-weight: 700;
  color: #e74c3c;
  flex-shrink: 0;
}

.list-heart-icon {
  width: 12px;
  height: 12px;
}

.list-game-count {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  color: #aaa;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  h1 { font-size: 1.8rem; }
  .nav-btn { display: none; }
  .fade-left, .fade-right { width: 30px; }
  .header-top { flex-direction: column; align-items: flex-start; }
  .suggestions-grid { grid-template-columns: 1fr; }
  .lists-grid { grid-template-columns: 1fr; }
}
</style>
