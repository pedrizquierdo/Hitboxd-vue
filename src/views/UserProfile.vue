<template>
  <div class="profile-page">
    <Nav />

    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>

    <div v-else class="profile-container">

      <div class="profile-header">
        <div class="profile-avatar">
          <img :src="avatar || 'https://placehold.co/150'" class="avatar-img" />
        </div>

        <div class="profile-info">
          <h1 class="username">{{ username }}</h1>
          <span v-if="pronouns" class="pronouns-badge">{{ pronouns }}</span>
          <p v-if="bio" class="bio-text">{{ bio }}</p>

          <button
            v-if="isAdmin"
            @click="goToAdminPanel"
            class="admin-profile-btn"
          >
            ⚙️ Panel Admin
          </button>
        </div>

        <div class="profile-stats">
          <div class="stat-block">
            <span class="stat-number">{{ games_count || watchlist.length || 0 }}</span>
            <span class="stat-label">Games</span>
          </div>
          <div class="divider"></div>
          <div class="stat-block">
            <span class="stat-number">{{ followers_count || 0 }}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="divider"></div>
          <div class="stat-block">
            <span class="stat-number">{{ following_count || 0 }}</span>
            <span class="stat-label">Following</span>
          </div>
        </div>
      </div>

      <nav class="profile-tabs">
        <a
          v-for="tab in tabs"
          :key="tab"
          href="#"
          :class="{ active: activeTab === tab }"
          @click.prevent="activeTab = tab"
        >
          {{ tab }}
        </a>
      </nav>

      <section v-show="activeTab === 'PROFILE'" class="section">
        <h2 class="section-title">FAVORITE GAMES</h2>

        <div v-if="likedGames.length > 0" class="fav-games-grid">
          <div
            v-for="game in likedGames.slice(0, 4)"
            :key="game.id_game"
            class="game-poster-card"
          >
            <img :src="getCoverUrl(game.cover_url)" alt="Game Cover" />
            <span class="game-title-hover">{{ game.title }}</span>
          </div>
        </div>
        <p v-else class="section-text">No favorite games yet.</p>

        <h2 class="section-title" style="margin-top: 40px;">RECENT REVIEWS</h2>
         <div v-if="reviews.length > 0" class="mini-reviews-list">
            <div v-for="review in reviews.slice(0, 3)" :key="review.id_review" class="mini-review-item">
              <span class="review-game">
                {{ getGameTitle(review.id_game) }}
              </span>
              <div class="review-meta">
                <span class="stars">★ {{ review.rating }}</span>
                <span class="date">{{ formatDate(review.created_at) }}</span>
              </div>
              <p class="review-content">"{{ review.content }}"</p>
            </div>
         </div>
         <p v-else class="section-text">No recent reviews.</p>
      </section>

      <section v-show="activeTab === 'ACTIVITY'" class="section">
        <h2 class="section-title">FRIENDS ACTIVITY FEED</h2>
        <div v-if="activityFeed.length > 0" class="activity-list">
          <div v-for="(act, index) in activityFeed" :key="index" class="activity-card">
            
            <div class="activity-icon" :class="act.status">
                {{ getStatusIcon(act.status) }}
            </div>
            
            <div class="activity-content">
              <p class="activity-text">
                <strong class="user-link">
                    {{ act.username || `User #${act.id_user}` }}
                </strong>
                
                <span class="status-text"> {{ getStatusLabel(act.status) }} </span>
                
                <strong class="game-link">{{ getGameTitle(act.id_game) }}</strong>
              </p>
              <small class="activity-date">{{ formatDate(act.created_at) }}</small>
            </div>
          </div>
        </div>
        <p v-else class="section-text">No recent activity found.</p>
      </section>

      <section v-show="activeTab === 'GAMES'" class="section">
         <h2 class="section-title">GAMELIST</h2> 
         <div v-if="watchlistError" class="error-box">
            <p>⚠️ <strong>Server Error:</strong> Unable to load gamelist.</p>
         </div>

         <div v-else-if="watchlist.length > 0" class="games-grid-layout">
            <div v-for="game in watchlist" :key="game.id_game" class="game-poster-card">
               <img :src="getCoverUrl(game.cover_url)" alt="Game Cover" />
               <span class="game-title-hover">{{ game.title }}</span>
            </div>
         </div>
         <p v-else class="section-text">Your gamelist is empty.</p>
      </section>

      <section v-show="activeTab === 'REVIEWS'" class="section">
        <h2 class="section-title">MY REVIEWS</h2>
        <div v-if="reviews.length > 0" class="reviews-list">
          <div v-for="review in reviews" :key="review.id_review" class="review-card-full">
            <div class="review-header">
               <span class="game-name">{{ getGameTitle(review.id_game) }}</span>
               <span v-if="review.rating" class="rating-badge">★ {{ review.rating }}</span>
            </div>
            <p class="review-body">{{ review.content }}</p>
            <div class="review-footer">
               <small>{{ formatDate(review.created_at) }}</small>
               <span v-if="review.has_spoilers" class="spoiler-tag">SPOILER</span>
            </div>
          </div>
        </div>
        <p v-else class="section-text">You haven't written any reviews yet.</p>
      </section>

      <section v-show="activeTab === 'LISTS'" class="section">
        <div class="section-header-row">
          <h2 class="section-title">LISTS</h2>
          <button v-if="userLists.length > 0" @click="openModal" class="btn-create-mini">
            + NEW
          </button>
        </div>

        <div v-if="userLists.length > 0" class="lists-grid">
          <div
            v-for="list in userLists"
            :key="list.id_list || list.id"
            class="list-card"
            @click="editList(list)"
          >
            <div class="list-card-content">
              <h3>{{ list.title || list.name }}</h3>
              <p class="list-desc">{{ list.description || 'Sin descripción' }}</p>
            </div>
            <div class="list-card-footer">
              <small>{{ list.games ? list.games.length : 0 }} GAMES</small>
              <span class="list-icon">📝</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p class="section-text">YOU HAVEN'T CREATED ANY LISTS YET.</p>
          <button class="start-list-btn" @click="openModal">
            CREATE YOUR FIRST LIST
          </button>
        </div>
      </section>

      <section v-show="activeTab === 'NETWORK'" class="section">
        <h2 class="section-title">FOLLOWING & FRIENDS</h2>
        <div class="network-grid">
           <p class="section-text">No friends connected yet.</p>
        </div>
      </section>

      <section v-show="activeTab === 'DIARY'" class="section">
        <h2 class="section-title">DIARY LOG</h2>
        <div v-if="reviews.length > 0" class="diary-list">
           <div v-for="entry in reviews" :key="entry.id_review" class="diary-entry">
             <div class="diary-date">
                 <span class="day">{{ new Date(entry.created_at).getDate() }}</span>
                 <span class="month">{{ new Date(entry.created_at).toLocaleString('default', { month: 'short' }) }}</span>
                 <span class="year">{{ new Date(entry.created_at).getFullYear() }}</span>
             </div>
             <div class="diary-poster">
                 <div class="mini-poster-placeholder">🎮</div>
             </div>
             <div class="diary-info">
                 <span class="diary-game-title">{{ getGameTitle(entry.id_game) }}</span>
                 <div class="diary-rating">
                    <span v-for="n in 5" :key="n" :class="{ 'star-filled': n <= entry.rating, 'star-empty': n > entry.rating }">★</span>
                 </div>
             </div>
           </div>
        </div>
        <p v-else class="section-text">Diary is empty. Write a review to add an entry!</p>
      </section>

      <section v-show="activeTab === 'LIKES'" class="section">
        <h2 class="section-title">LIKED GAMES</h2>
        <div v-if="likedGames.length > 0" class="games-grid-layout">
            <div v-for="game in likedGames" :key="game.id_game" class="game-poster-card">
               <img :src="getCoverUrl(game.cover_url)" alt="Game Cover" />
               <span class="game-title-hover">{{ game.title }}</span>
               <span class="heart-icon">❤️</span>
            </div>
         </div>
         <p v-else class="section-text">You haven't liked any games yet.</p>
      </section>

    </div>

    <CreateListModal
      :open="isModalOpen"
      @close="closeModal"
      @created="handleListCreated"
    />

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import Nav from "@/components/common/Nav.vue"
import Footer from "@/components/common/PageFooter.vue"
import CreateListModal from "@/components/lists/CreateListModal.vue"
import api from "@/api/axios.js"

const router = useRouter()
const isLoading = ref(true)

const username = ref("")
const avatar = ref("")
const bio = ref("")
const pronouns = ref("")
const currentUserId = ref(null)
const isAdmin = ref(false)

// Datos de Contenido
const watchlist = ref([])
const watchlistError = ref(false)
const reviews = ref([])
const activityFeed = ref([])
const userLists = ref([])
const gamesCache = ref({})
const followers_count = ref(0);
const following_count = ref(0);
const games_count = ref(0);

const likedGames = computed(() => {
  return watchlist.value.filter(game => game.is_favorite || game.is_liked);
})

const activeTab = ref("PROFILE")
const tabs = ["PROFILE", "ACTIVITY", "GAMES", "REVIEWS", "LISTS", "NETWORK", "DIARY", "LIKES"]
const isModalOpen = ref(false)

const openModal = () => { isModalOpen.value = true }
const closeModal = () => { isModalOpen.value = false }

// --- TRADUCTOR DE ACTIVIDAD (NUEVO) ---
const getStatusLabel = (status) => {
    const map = {
        'plan_to_play': 'plans to play',
        'played': 'played',
        'completed': 'completed',
        'abandoned': 'abandoned',
        'dropped': 'dropped',
        'playing': 'is currently playing',
        'wishlist': 'added to wishlist'
    };
    return map[status] || status; // Si no encuentra, pone el original
}

const getStatusIcon = (status) => {
    const map = {
        'plan_to_play': '📅',
        'played': '✅',
        'completed': '🏆',
        'abandoned': '🗑️',
        'dropped': '🗑️',
        'playing': '🕹️',
        'wishlist': '🎁'
    };
    return map[status] || '📝';
}

// --- Helpers Generales ---
const getCoverUrl = (url) => {
  if (!url) return 'https://placehold.co/150x220?text=No+Cover';
  return url.replace('t_thumb', 't_cover_big');
}

const formatDate = (dateString) => {
  if(!dateString) return '';
  return new Date(dateString).toLocaleDateString();
}

const getGameTitle = (gameId) => {
  if (!gameId) return 'Unknown Game';
  if (gamesCache.value[gameId]) {
    return gamesCache.value[gameId].title || gamesCache.value[gameId].name;
  }
  return `Game...`;
}

const editList = (list) => {
    const listId = list.id_list || list.id;
    if (listId) router.push({ name: 'ListDetail', params: { listId: listId } });
};

const goToAdminPanel = () => {
    if (isAdmin.value) router.push({ name: 'AdminDashboard' });
};

const handleListCreated = (newListData) => {
  userLists.value.unshift(newListData);
}

// --- LOGICA DE CARGA DE JUEGOS ---
const enrichDataWithGameInfo = async () => {
  // Solo buscamos JUEGOS, ya no usuarios porque no tienes la API
  const gameIdsToFetch = new Set();

  reviews.value.forEach(r => { if(r.id_game) gameIdsToFetch.add(r.id_game) });
  activityFeed.value.forEach(a => { if(a.id_game) gameIdsToFetch.add(a.id_game) });
  watchlist.value.forEach(g => { if(g.id_game) gameIdsToFetch.add(g.id_game) });

  const promises = Array.from(gameIdsToFetch).map(async (id) => {
      if (gamesCache.value[id]) return;
      try {
          const { data } = await api.get(`/games/${id}`);
          gamesCache.value[id] = data;
      } catch (error) {
          console.error(`Error fetching game ${id}:`, error);
      }
  });
  await Promise.all(promises);
}

// --- Carga Inicial ---
onMounted(async () => {
  try {
    isLoading.value = true;

    const { data: userData } = await api.get("/users/me");

    currentUserId.value = userData.id_user || userData.id;
    username.value = userData.username;
    avatar.value = userData.avatar_url;
    bio.value = userData.bio;
    pronouns.value = userData.pronouns;
    followers_count.value = userData.followers_count || 0;
    following_count.value = userData.following_count || 0;
    games_count.value = userData.games_count || 0;

    if (userData.role && userData.role === 'admin') isAdmin.value = true;

    if (currentUserId.value) {
      try {
        const res = await api.get(`/reviews/user/${currentUserId.value}`);
        reviews.value = res.data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      } catch (e) { console.error("Error reviews", e); }

      try {
        const res = await api.get('/activity/all');
        watchlist.value = res.data;
      } catch (e) { watchlistError.value = true;
        console.error("Error watchlist", e);
       }

      try {
        const res = await api.get('/activity/feed');
        activityFeed.value = res.data;
      } catch (e) { console.error("Error feed", e); }

      try {
        const res = await api.get(`/lists/user/${currentUserId.value}`);
        userLists.value = res.data;
      } catch (e) { console.error("Error listas", e); }

      await enrichDataWithGameInfo();
    }

  } catch (error) {
    if (error.response && error.response.status === 401) router.push("/login");
  } finally {
    isLoading.value = false;
  }
})
</script>

<style scoped>
/* GENERAL */
.profile-page { display: flex; flex-direction: column; min-height: 100vh; background-color: #f8f9fa; font-family: 'Inter', sans-serif; }
.profile-container { width: 90%; max-width: 1100px; margin: 40px auto; flex: 1; }
.loading-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 50vh; color: #666; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #00cc66; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 15px;}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* HEADER */
.profile-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.profile-avatar { width: 110px; height: 110px; border-radius: 50%; overflow: hidden; border: 5px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); background: #000; flex-shrink: 0; z-index: 2; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.profile-info { display: flex; flex-direction: column; justify-content: center; margin-left: -350px; padding-bottom: 10px; }
.username { font-size: 32px; margin: 0; color: #333; font-weight: 700; }
.pronouns-badge { display: inline-block; background-color: #e0e0e0; color: #666; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-top: 4px; margin-bottom: 8px; width: fit-content; }
.bio-text { color: #666; font-size: 14px; margin-top: 5px; max-width: 400px;}
.profile-stats { display: flex; align-items: center; gap: 20px; }
.stat-block { text-align: center; min-width: 60px; }
.stat-number { font-size: 20px; font-weight: bold; display: block; color: #222; }
.stat-label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
.divider { width: 1px; height: 30px; background: #eee; }

/* Botón Admin */
.admin-profile-btn { align-self: flex-start; margin-top: 15px; background: transparent; color: #cc0066; border: 1px solid #cc0066; padding: 8px 16px; border-radius: 25px; cursor: pointer; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; transition: background 0.2s, color 0.2s; }
.admin-profile-btn:hover { background: #cc0066; color: white; }

/* TABS */
.profile-tabs { display: flex; align-items: center; gap: 25px; border-bottom: 1px solid #e0e0e0; margin-top: 20px; padding-bottom: 0; overflow-x: auto; }
.profile-tabs a { text-decoration: none; font-size: 13px; color: #666; font-weight: 600; padding-bottom: 15px; border-bottom: 3px solid transparent; transition: all 0.2s; white-space: nowrap; }
.profile-tabs a:hover { color: #333; }
.profile-tabs a.active { color: #00cc66; border-bottom-color: #00cc66; }

/* SECTIONS */
.section { margin-top: 40px; }
.section-title { font-size: 13px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #999; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;}
.section-text { font-size: 14px; color: #666; }
.error-box { padding: 20px; background: #fff0f0; border: 1px solid #ffcccc; border-radius: 6px; color: #d8000c; text-align: center; margin-bottom: 20px;}

/* ACTIVITY FEED STYLES (MEJORADO) */
.activity-list { display: flex; flex-direction: column; gap: 15px; }
.activity-card { background: #fff; padding: 15px; border: 1px solid #eee; border-radius: 8px; display: flex; gap: 15px; align-items: center; transition: box-shadow 0.2s; }
.activity-card:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

.activity-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; background: #f0f0f0; flex-shrink: 0; }
/* Colores por estado */
.activity-icon.plan_to_play { background: #e3f2fd; color: #2196f3; }
.activity-icon.played { background: #e8f5e9; color: #4caf50; }
.activity-icon.completed { background: #fff3e0; color: #ff9800; }
.activity-icon.abandoned { background: #ffebee; color: #f44336; }

.activity-content { flex: 1; }
.activity-text { margin: 0; font-size: 14px; color: #444; line-height: 1.4; }
.user-link { color: #333; font-weight: 700; cursor: pointer; }
.status-text { color: #666; font-style: normal; margin: 0 4px; }
.game-link { color: #333; font-weight: 700; cursor: pointer; }
.game-link:hover, .user-link:hover { text-decoration: underline; color: #00cc66; }
.activity-date { color: #999; font-size: 11px; margin-top: 4px; display: block; }

/* GAMES & LIKES GRID */
.fav-games-grid, .games-grid-layout { display: flex; gap: 15px; flex-wrap: wrap; }
.game-poster-card { width: 120px; height: 180px; background: #ddd; border-radius: 6px; overflow: hidden; position: relative; transition: transform 0.2s; cursor: pointer; }
.game-poster-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
.game-poster-card img { width: 100%; height: 100%; object-fit: cover; }
.game-title-hover { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.7); color: white; font-size: 11px; padding: 4px; text-align: center; opacity: 0; transition: opacity 0.2s; }
.game-poster-card:hover .game-title-hover { opacity: 1; }
.heart-icon { position: absolute; top: 5px; right: 5px; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }

/* REVIEWS & MINI */
.reviews-list { display: flex; flex-direction: column; gap: 20px; }
.review-card-full { background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
.review-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.game-name { font-weight: bold; color: #333; }
.rating-badge { background: #00cc66; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.review-body { color: #555; font-size: 14px; line-height: 1.5; font-style: italic; }
.review-footer { margin-top: 10px; display: flex; gap: 10px; font-size: 12px; color: #999; }
.spoiler-tag { color: #ff4444; font-weight: bold; }

.mini-reviews-list { display: flex; flex-direction: column; gap: 10px; }
.mini-review-item { background: #fff; padding: 12px; border: 1px solid #eee; border-radius: 6px; }
.review-game { display: block; font-weight: bold; font-size: 13px; color: #333; margin-bottom: 4px; }
.review-meta { font-size: 11px; color: #999; margin-bottom: 6px; display: flex; gap: 10px; }
.stars { color: #00cc66; font-weight: bold; }
.review-content { font-size: 13px; color: #555; margin: 0; font-style: italic;}

/* DIARY */
.diary-list { border-top: 1px solid #eee; }
.diary-entry { display: flex; padding: 15px 0; border-bottom: 1px solid #eee; align-items: center; gap: 20px; }
.diary-date { display: flex; flex-direction: column; align-items: center; min-width: 50px; color: #666; }
.diary-date .day { font-size: 18px; font-weight: bold; color: #333; line-height: 1; }
.diary-date .month { font-size: 11px; text-transform: uppercase; line-height: 1; margin-top: 2px;}
.diary-date .year { font-size: 10px; color: #999; }
.diary-poster { width: 40px; height: 60px; background: #eee; border-radius: 4px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; }
.mini-poster-placeholder { font-size: 20px; }
.diary-info { display: flex; flex-direction: column; }
.diary-game-title { font-weight: bold; font-size: 14px; color: #333; }
.diary-rating { display: flex; gap: 2px; margin-top: 4px; font-size: 12px; }
.star-filled { color: #00cc66; }
.star-empty { color: #ddd; }

/* LISTS & NETWORK */
.section-header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; margin-bottom: 20px; padding-bottom: 10px; }
.lists-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
.list-card { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; min-height: 140px; cursor: pointer; transition: all 0.2s; }
.list-card:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0,0,0,0.05); border-color: #00cc66; }
.list-card-content h3 { margin: 0 0 10px 0; font-size: 18px; color: #333; }
.list-desc { font-size: 13px; color: #777; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.list-card-footer { margin-top: 20px; display: flex; justify-content: space-between; color: #aaa; font-size: 12px; border-top: 1px solid #f9f9f9; padding-top: 10px; }
.btn-create-mini { background: transparent; color: #00cc66; border: 1px solid #00cc66; padding: 5px 12px; border-radius: 20px; cursor: pointer; font-size: 11px; font-weight: bold; }
.btn-create-mini:hover { background: #00cc66; color: white; }
.empty-state { text-align: center; padding: 40px; background: #fff; border: 1px dashed #ccc; border-radius: 8px; }
.start-list-btn { background: #00cc66; color: white; border: none; padding: 12px 24px; border-radius: 30px; cursor: pointer; font-weight: bold; margin-top: 15px; }
</style>