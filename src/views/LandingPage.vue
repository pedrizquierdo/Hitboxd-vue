<template>
  <div class="landing-container">

    <!-- NAVBAR -->
    <nav class="navbar">
      <Logo />

      <!-- Search bar (unauthenticated) -->
      <div class="nav-search-wrapper" ref="navSearchRef">
        <svg class="nav-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          @click="runNavSearch">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="navSearchQuery"
          type="text"
          placeholder="Search games..."
          class="nav-search-input"
          @keyup.enter="runNavSearch"
          @input="onNavSearchInput"
          @focus="navSearchFocused = true"
        />
        <div v-if="navSearchFocused && navSearchQuery.trim() && navSearchResults.length > 0" class="nav-search-dropdown">
          <router-link
            v-for="game in navSearchResults"
            :key="game.id_game || game.igdb_id"
            :to="`/game/${game.slug}`"
            class="nav-search-item"
            @click="closeNavSearch"
          >
            <img :src="game.cover_url" :alt="game.title" class="nav-search-cover" />
            <span>{{ game.title }}</span>
          </router-link>
          <button class="nav-search-see-all" @mousedown.prevent="runNavSearch">
            See all results for "{{ navSearchQuery }}" →
          </button>
        </div>
      </div>

      <div class="nav-links">
        <button @click="openModal('login')" class="nav-btn">SIGN IN</button>
        <button @click="openModal('register')" class="nav-btn">CREATE ACCOUNT</button>
        <router-link to="/games" class="nav-link">GAMES</router-link>
      </div>
    </nav>

    <!-- HERO -->
    <header class="hero">
      <div class="hero-image-placeholder">
        <img src="/assets/hero_image.webp" alt="Games Collage" class="collage-img" />
      </div>

      <h1 class="main-title">Play. Log. Share.</h1>

      <!-- USER COUNT BADGE -->
      <div class="user-count-badge" v-if="userCount > 0">
        <span class="badge-dot"></span>
        Join <strong>{{ formattedUserCount }}+</strong> gamers already tracking their backlog
      </div>

      <button class="cta-btn" @click="openModal('register')">
        Get started - it's free!
      </button>

      <p class="subtitle">
        The ultimate social platform to manage your backlog and rate your favorites.
      </p>
    </header>

    <!-- TRENDING GAMES GRID -->
    <section class="trending-section">
      <div v-if="isLoading" class="loading-msg">Loading games...</div>
      <div v-else class="games-grid">
        <GameCard
          v-for="game in games"
          :key="game.igdb_id"
          :game="game"
          class="game-item"
        />
      </div>
    </section>

    <!-- RECENT REVIEWS -->
    <section class="reviews-showcase" v-if="recentReviews.length > 0">
      <h3 class="showcase-title">WHAT GAMERS ARE SAYING</h3>
      <div class="reviews-showcase-grid">
        <div
          v-for="review in recentReviews"
          :key="review.id_review"
          class="showcase-card"
        >
          <div class="showcase-card-top">
            <img
              v-if="review.cover_url"
              :src="review.cover_url"
              :alt="review.game_title"
              class="showcase-game-cover"
            />
            <div class="showcase-meta">
              <span class="showcase-game-title">{{ review.game_title || 'Unknown game' }}</span>
              <span class="showcase-username">by {{ review.username || 'Anonymous' }}</span>
              <StarRating :model-value="review.rating || 0" disabled class="showcase-stars" />
            </div>
          </div>
          <p class="showcase-review-text">"{{ review.content }}"</p>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features-section">
      <h3>HITBOXD LETS YOU...</h3>
      <div class="features-grid">
        <div class="feature-card" ref="featureCardsRef">
          <span class="icon"><img src="/assets/Eye.png" alt="eye icon"></span>
          <p>Keep track of every game you've ever played (or just start from the day you join)</p>
        </div>
        <div class="feature-card">
          <span class="icon"><img src="/assets/Love.png" alt="heart icon"></span>
          <p>Show some love for your favorite games, lists and reviews with a "like"</p>
        </div>
        <div class="feature-card">
          <span class="icon"><img src="/assets/Align Left.png" alt="review icon"></span>
          <p>Write and share reviews, and follow friends and other players to read theirs</p>
        </div>
        <div class="feature-card">
          <span class="icon"><img src="/assets/Star Filled.png" alt="star icon"></span>
          <p>Rate each game on a five-star scale (with halves) to record and share your reaction</p>
        </div>
        <div class="feature-card">
          <span class="icon"><img src="/assets/Timeline Week.png" alt="stats icon"></span>
          <p>Keep a log of your gaming history and unlock personalized stats</p>
        </div>
        <div class="feature-card">
          <span class="icon"><img src="/assets/Four Squares.png" alt="lists icon"></span>
          <p>Compile and share lists on any topic and keep a backlog of games to play</p>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>© Hitboxd Limited. Made by <a href="#">fans</a> in Sonora Mexico. Game data from IGDB.</p>
      <div class="socials">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
          <img src="/assets/Twitter Bird.png" alt="Twitter" />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <img src="/assets/Facebook Circled.png" alt="Facebook" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <img src="/assets/Instagram.png" alt="Instagram" />
        </a>
      </div>
    </footer>

    <Transition name="modal">
      <AuthModal
        v-if="showAuth"
        :initialView="authView"
        @close="showAuth = false"
      />
    </Transition>
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Logo from '../components/common/Logo.vue';
import api from '@/api/axios';
import AuthModal from '../components/auth/AuthModal.vue';
import GameCard from '../components/common/GameCard.vue';
import StarRating from '../components/reviews/StarRating.vue';

const router = useRouter();

const showAuth = ref(false);
const authView = ref('login');
const games = ref([]);
const isLoading = ref(true);
const userCount = ref(0);
const recentReviews = ref([]);

// ── Nav search ──────────────────────────────────────────────────────────────
const navSearchQuery = ref('');
const navSearchResults = ref([]);
const navSearchFocused = ref(false);
const navSearchRef = ref(null);
let navSearchTimer = null;

const onNavSearchInput = () => {
  clearTimeout(navSearchTimer);
  const q = navSearchQuery.value.trim();
  if (!q) { navSearchResults.value = []; return; }
  navSearchTimer = setTimeout(async () => {
    try {
      const { data } = await api.get(`/games/search?q=${encodeURIComponent(q)}`);
      navSearchResults.value = Array.isArray(data) ? data.slice(0, 5) : [];
    } catch (e) {
      logger.error('Nav search error:', e);
    }
  }, 300);
};

const runNavSearch = () => {
  const q = navSearchQuery.value.trim();
  if (q.length < 2) return;
  router.push({ name: 'SearchResults', query: { q } });
  closeNavSearch();
};

const closeNavSearch = () => {
  navSearchFocused.value = false;
  navSearchQuery.value = '';
  navSearchResults.value = [];
};

const handleNavClickOutside = (e) => {
  if (navSearchRef.value && !navSearchRef.value.contains(e.target)) {
    navSearchFocused.value = false;
  }
};

// ── Formatted user count (1200 → "1,200") ───────────────────────────────────
const formattedUserCount = computed(() =>
  userCount.value.toLocaleString('en-US')
);

// ── Scroll-reveal via Intersection Observer ──────────────────────────────────
let revealObserver = null;

const initScrollReveal = () => {
  const cards = document.querySelectorAll('.feature-card');
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  cards.forEach((card) => revealObserver.observe(card));
};

// ── Auth ─────────────────────────────────────────────────────────────────────
const openModal = (view) => {
  authView.value = view;
  showAuth.value = true;
};

// ── Data fetching ─────────────────────────────────────────────────────────────
const fetchTrendingGames = async () => {
  try {
    const response = await api.get('games/trending?limit=12');
    games.value = response.data;
  } catch (error) {
    logger.error('Error loading games:', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchUserCount = async () => {
  try {
    const { data } = await api.get('/users/count');
    // Accept { count: N } or plain number
    userCount.value = typeof data === 'number' ? data : (data?.count ?? 0);
  } catch {
    userCount.value = 0;
  }
};

const fetchRecentReviews = async () => {
  try {
    const { data } = await api.get('/reviews/recent?limit=3');
    recentReviews.value = Array.isArray(data) ? data : [];
  } catch {
    recentReviews.value = [];
  }
};

onMounted(() => {
  const storageKey = import.meta.env.VITE_KEY_STORAGE || 'isAuthenticated';
  const isLoggedIn = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);

  if (isLoggedIn) {
    router.push('/home');
    return;
  }

  fetchTrendingGames();
  fetchUserCount();
  fetchRecentReviews();
  initScrollReveal();

  document.addEventListener('click', handleNavClickOutside);
});

onBeforeUnmount(() => {
  revealObserver?.disconnect();
  document.removeEventListener('click', handleNavClickOutside);
});
</script>

<style scoped>

.landing-container {
  min-height: 100vh;
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image: url('/assets/bg-texture.webp'), url('/assets/bg-texture.jpg');
    background-repeat: repeat;
    background-size: 400px;
    opacity: 0.1;
    pointer-events: none;
    z-index: 0;
  }

  .navbar, .hero, .trending-section, .reviews-showcase, .features-section, .footer {
    position: relative;
    z-index: 1;
  }

  /* ── NAVBAR ────────────────────────────────────────────────────────────── */
  .navbar {
    width: 100%;
    max-width: 1200px;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;

    .nav-links {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-shrink: 0;

      .nav-btn, .nav-link {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 600;
        color: #444;
        letter-spacing: 0.5px;
        text-decoration: none;
        transition: color 0.2s ease, transform 0.2s ease;

        &:nth-child(1):hover { color: var(--brand-red); transform: translateY(-1px); }
        &:nth-child(2):hover { color: var(--brand-cyan); transform: translateY(-1px); }
        &:nth-child(3):hover { color: var(--brand-green); transform: translateY(-1px); }
      }
    }
  }

  /* ── NAVBAR SEARCH ─────────────────────────────────────────────────────── */
  .nav-search-wrapper {
    position: relative;
    flex: 1;
    max-width: 340px;
  }

  .nav-search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #888;
    cursor: pointer;
  }

  .nav-search-input {
    width: 100%;
    padding: 7px 12px 7px 32px;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.85rem;
    background: white;
    color: #2d2d2d;
    outline: none;
    transition: border-color 0.2s;

    &:focus { border-color: var(--brand-cyan, #00AEEF); }
    &::placeholder { color: #aaa; }
  }

  .nav-search-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    width: 100%;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    z-index: 200;
    overflow: hidden;
  }

  .nav-search-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    text-decoration: none;
    color: #333;
    font-size: 0.85rem;
    font-weight: 600;
    transition: background 0.15s;

    &:hover { background: #f3f4f6; }
  }

  .nav-search-cover {
    width: 28px;
    height: 42px;
    object-fit: cover;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .nav-search-see-all {
    width: 100%;
    padding: 9px 12px;
    border: none;
    border-top: 1px solid #e5e7eb;
    background: transparent;
    color: var(--brand-cyan, #00aeef);
    font-size: 0.82rem;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;

    &:hover { background: #f3f4f6; }
  }

  /* ── HERO ──────────────────────────────────────────────────────────────── */
  .hero {
    text-align: center;
    margin-top: 2rem;
    width: 100%;
    max-width: 900px;

    .hero-image-placeholder {
      margin-bottom: 2rem;
      .collage-img {
        max-width: 100%; height: auto;
        mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
      }
    }

    .main-title {
      font-family: 'Courier Prime', monospace;
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1.2rem;
      letter-spacing: -2px;
    }

    .cta-btn {
      background-color: var(--brand-cyan);
      color: var(--white);
      border: none;
      padding: 12px 30px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      transition: transform 0.1s;

      &:hover { transform: scale(1.05); background-color: #0095CC; }
    }

    .subtitle { color: #666; margin-top: 2rem; font-size: 1.1rem; }
  }

  /* ── USER COUNT BADGE ──────────────────────────────────────────────────── */
  .user-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 174, 239, 0.1);
    border: 1px solid rgba(0, 174, 239, 0.3);
    color: #0095CC;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 9999px;
    margin-bottom: 1.2rem;

    strong { font-weight: 700; }

    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--brand-cyan, #00AEEF);
      animation: pulse 2s ease-in-out infinite;
      flex-shrink: 0;
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.85); }
  }

  /* ── TRENDING GRID ─────────────────────────────────────────────────────── */
  .trending-section {
    margin-top: 3rem;
    width: 100%;
    max-width: 1000px;
    padding: 0 20px;

    .loading-msg { text-align: center; color: #666; font-family: monospace; }

    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 20px;
      justify-content: center;

      .game-item:nth-child(4n + 1) { --hover-color: var(--brand-red); }
      .game-item:nth-child(4n + 2) { --hover-color: var(--brand-cyan); }
      .game-item:nth-child(4n + 3) { --hover-color: var(--brand-green); }
      .game-item:nth-child(4n)     { --hover-color: var(--brand-yellow); }
    }
  }

  /* ── REVIEWS SHOWCASE ──────────────────────────────────────────────────── */
  .reviews-showcase {
    margin-top: 4rem;
    width: 100%;
    max-width: 1000px;
    padding: 0 20px;

    .showcase-title {
      font-size: 0.9rem;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 1.2rem;
      letter-spacing: 0.5px;
    }

    .reviews-showcase-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .showcase-card {
      background: var(--card-bg, #F2F3F5);
      border-radius: 6px;
      padding: 1.2rem;
      box-shadow: 0 4px 8px rgba(0,0,0,0.25);
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
    }

    .showcase-card-top {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .showcase-game-cover {
      width: 48px;
      height: 64px;
      object-fit: cover;
      border-radius: 3px;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .showcase-meta {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .showcase-game-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #2d2d2d;
      line-height: 1.2;
    }

    .showcase-username {
      font-size: 0.75rem;
      color: #888;
    }

    .showcase-stars {
      font-size: 0.9rem !important;
    }

    .showcase-review-text {
      font-size: 0.82rem;
      color: #555;
      line-height: 1.5;
      font-style: italic;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  /* ── FEATURES ──────────────────────────────────────────────────────────── */
  .features-section {
    margin-top: 4rem; margin-bottom: 4rem;
    width: 100%; max-width: 1000px; padding: 0 20px;

    h3 {
      font-size: 0.9rem; text-transform: uppercase; margin-bottom: 1rem; color: #555;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .feature-card {
      background-color: var(--card-bg);
      color: var(--white);
      padding: 1.5rem;
      border-radius: 4px;
      display: flex;
      align-items: flex-start;
      gap: 15px;
      font-size: 0.85rem;
      line-height: 1.4;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s, opacity 0.5s ease, translate 0.5s ease;

      /* scroll-reveal initial state */
      opacity: 0;
      translate: 0 24px;

      &.is-visible {
        opacity: 1;
        translate: 0 0;
      }

      /* stagger each card by its position */
      &:nth-child(1) { transition-delay: 0ms; }
      &:nth-child(2) { transition-delay: 80ms; }
      &:nth-child(3) { transition-delay: 160ms; }
      &:nth-child(4) { transition-delay: 240ms; }
      &:nth-child(5) { transition-delay: 320ms; }
      &:nth-child(6) { transition-delay: 400ms; }

      &:nth-child(4n + 1):hover { transform: translateY(-5px); background-color: var(--brand-red);    box-shadow: 0 8px 12px rgba(0,0,0,0.4); }
      &:nth-child(4n + 2):hover { transform: translateY(-5px); background-color: var(--brand-cyan);   box-shadow: 0 8px 12px rgba(0,0,0,0.4); }
      &:nth-child(4n + 3):hover { transform: translateY(-5px); background-color: var(--brand-green);  box-shadow: 0 8px 12px rgba(0,0,0,0.4); }
      &:nth-child(4n):hover     { transform: translateY(-5px); background-color: var(--brand-yellow); box-shadow: 0 8px 12px rgba(0,0,0,0.4); }

      .icon {
        width: 44px; flex-shrink: 0;
        img { width: 100%; filter: brightness(0) invert(1); }
      }
    }
  }

  /* ── FOOTER ────────────────────────────────────────────────────────────── */
  .footer {
    width: 100%; padding: 2rem;
    background-color: #F2F3F5;
    display: flex; justify-content: space-between;
    font-size: 1rem; color: #666;
    border-top: 1px solid #d1d5db;

    a { color: #2D2D2D; text-decoration: underline; }

    .socials {
      display: flex; gap: 15px; align-items: center;
      a { display: flex; }
      img { width: 50px; opacity: 0.7; transition: opacity 0.2s; }
      a:hover img { opacity: 1; }
    }
  }
}

/* ── MODAL TRANSITION ──────────────────────────────────────────────────────── */
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* ── RESPONSIVE ────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .landing-container {
    .navbar { gap: 10px; padding: 1rem; }
    .nav-search-wrapper { max-width: 180px; }

    .features-section .features-grid { grid-template-columns: 1fr; }
    .reviews-showcase .reviews-showcase-grid { grid-template-columns: 1fr; }
    .footer { flex-direction: column; align-items: center; gap: 1rem; }
  }
}

@media (max-width: 480px) {
  .landing-container .nav-search-wrapper { display: none; }
}
</style>
