<template>
  <div class="profile-page">
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Buscando usuario...</p>
    </div>

    <div v-else class="profile-container">
      <!-- STICKY HEADER -->
      <div class="sticky-header" :class="{ visible: showStickyHeader }">
        <div class="sticky-header-inner">
          <div class="sticky-left">
            <img :src="avatar || 'https://placehold.co/150'" class="sticky-avatar" alt="Avatar" />
            <span class="sticky-username">{{ username }}</span>
          </div>
          <button
            v-if="myUserId"
            class="follow-btn"
            :class="{ following: isFollowing }"
            @click="handleFollowToggle"
          >
            {{ isFollowing ? 'FOLLOWING' : '+ FOLLOW' }}
          </button>
          <router-link v-else to="/" class="login-prompt-btn">Log in to follow</router-link>
        </div>
      </div>

      <!-- HEADER (PÚBLICO) -->
      <div class="profile-header">
        <div class="profile-avatar">
          <img :src="avatar || 'https://placehold.co/150'" class="avatar-img" alt="Avatar" />
        </div>

        <div class="profile-info">
          <h1 class="username">{{ username }}</h1>
          <span v-if="pronouns" class="pronouns-badge">{{ pronouns }}</span>
          <p v-if="bio" class="bio-text">{{ bio }}</p>
          <span
            v-if="myUserId && compatibility && compatibility.count > 0"
            class="compatibility-badge"
          >
            You both played {{ compatibility.count }} games · {{ compatibility.percent }}% match
          </span>

          <div class="header-actions">
            <!-- BOTÓN FOLLOW / UNFOLLOW -->
            <!-- Solo se muestra si estoy logueado (myUserId existe) -->
            <button
              v-if="myUserId"
              class="follow-btn"
              :class="{ following: isFollowing }"
              @click="handleFollowToggle"
            >
              {{ isFollowing ? 'FOLLOWING' : '+ FOLLOW' }}
            </button>

            <!-- Mensaje si no estoy logueado -->
            <router-link v-else to="/" class="login-prompt-btn"> Log in to follow </router-link>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-block">
            <span class="stat-number">{{ games_count }}</span>
            <span class="stat-label">Games</span>
          </div>
          <div class="divider"></div>
          <div class="stat-block">
            <span class="stat-number">{{ followers_count }}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="divider"></div>
          <div class="stat-block">
            <span class="stat-number">{{ following_count }}</span>
            <span class="stat-label">Following</span>
          </div>
        </div>
      </div>

      <nav class="profile-tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab"
          role="tab"
          :aria-selected="activeTab === tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </nav>

      <!-- SECCIONES DE CONTENIDO PÚBLICO -->

      <!-- 1. FAVORITE GAMES (Top 4) -->
      <section v-show="activeTab === 'PROFILE'" class="section">
        <h2 class="section-title">FAVORITE GAMES</h2>

        <div v-if="likedGames.length > 0" class="fav-games-grid">
          <div
            v-for="game in likedGames.slice(0, 4)"
            :key="game.id_game"
            class="game-poster-card"
            @click="goToGame(game)"
          >
            <img :src="getCoverUrl(game.cover_url)" alt="Game Cover" />
            <span class="game-title-hover">{{ game.title }}</span>
          </div>
        </div>
        <p v-else class="section-text">No favorite games yet.</p>

        <h2 class="section-title" style="margin-top: 40px">RECENT REVIEWS</h2>
        <div v-if="reviews.length > 0" class="mini-reviews-list">
          <div
            v-for="review in reviews.slice(0, 3)"
            :key="review.id_review"
            class="mini-review-item"
          >
            <span class="review-game">
              {{ getGameTitle(review.id_game) }}
            </span>
            <div class="review-meta">
              <span class="stars">{{ review.rating }}/5</span>
              <span class="date">{{ formatDate(review.created_at) }}</span>
            </div>
            <p class="review-content">"{{ review.content }}"</p>
          </div>
        </div>
        <p v-else class="section-text">No recent reviews.</p>
      </section>

      <!-- 2. GAMES TAB (Librería Pública) -->
      <section v-show="activeTab === 'GAMES'" class="section">
        <h2 class="section-title">GAMELIST</h2>
        <div v-if="watchlist.length > 0">
          <div class="status-filters">
            <button
              v-for="f in statusButtons"
              :key="f.value"
              class="status-filter-btn"
              :class="{ active: statusFilter === f.value }"
              :style="statusFilter === f.value ? { background: f.color, color: 'white', borderColor: f.color } : {}"
              @click="statusFilter = f.value"
            >
              {{ f.label }} ({{ f.count }})
            </button>
          </div>
          <div class="games-grid-layout">
            <div
              v-for="game in filteredWatchlist"
              :key="game.id_game"
              class="game-poster-card"
              @click="goToGame(game)"
            >
              <img :src="getCoverUrl(game.cover_url)" alt="Game Cover" />
              <span class="game-title-hover">{{ game.title }}</span>
            </div>
          </div>
        </div>
        <p v-else class="section-text">User has no games listed.</p>
      </section>

      <!-- 3. REVIEWS TAB -->
      <section v-show="activeTab === 'REVIEWS'" class="section">
        <h2 class="section-title">REVIEWS</h2>
        <div v-if="reviews.length > 0" class="reviews-list">
          <div
            v-for="review in reviews"
            :key="review.id_review"
            class="review-card-full"
            @click="navigateToGameFromReview(review)"
          >
            <img
              class="review-cover"
              :src="gamesCache[review.id_game]?.cover_url ? getCoverUrl(gamesCache[review.id_game]?.cover_url) : 'https://placehold.co/40x60?text=?'"
              alt="Game Cover"
            />
            <div class="review-card-body">
              <div class="review-header">
                <span
                  class="game-name"
                  @click.stop="router.push(`/game/${gamesCache[review.id_game]?.slug || review.id_game}`)"
                >{{ getGameTitle(review.id_game) }}</span>
                <span v-if="review.rating" class="rating-badge">{{ review.rating }}/5</span>
              </div>
              <p class="review-body">{{ review.content }}</p>
              <div class="review-footer">
                <small>{{ formatDate(review.created_at) }}</small>
                <span v-if="review.has_spoilers" class="spoiler-tag">SPOILER</span>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="section-text">No reviews yet.</p>
      </section>

      <!-- 4. LISTS TAB -->
      <section v-show="activeTab === 'LISTS'" class="section">
        <h2 class="section-title">LISTS</h2>

        <div v-if="userLists.length > 0" class="lists-grid">
          <div
            v-for="list in userLists"
            :key="list.id_list || list.id"
            class="list-card"
            @click="viewList(list)"
          >
            <div class="list-cover-collage">
              <template v-for="n in 4" :key="n">
                <div v-if="list.games && list.games[n - 1]" class="collage-slot">
                  <img :src="getCoverUrl(list.games[n - 1].cover_url)" alt="Game Cover" />
                </div>
                <div v-else class="collage-slot collage-empty"></div>
              </template>
            </div>
            <div class="list-card-content">
              <h3>{{ list.title || list.name }}</h3>
              <p class="list-desc">{{ list.description || 'Sin descripción' }}</p>
            </div>
            <div class="list-card-footer">
              <small>{{ list.games ? list.games.length : 0 }} GAMES</small>
              <span class="list-icon">LIST</span>
            </div>
          </div>
        </div>
        <p v-else class="section-text">No lists created.</p>
      </section>

      <!-- 5. LIKES TAB -->
      <section v-show="activeTab === 'LIKES'" class="section">
        <h2 class="section-title">LIKED GAMES</h2>
        <div v-if="likedGames.length > 0" class="games-grid-layout">
          <div
            v-for="game in likedGames"
            :key="game.id_game"
            class="game-poster-card"
            @click="goToGame(game)"
          >
            <img :src="getCoverUrl(game.cover_url)" alt="Game Cover" />
            <span class="heart-icon"></span>
            <span class="game-title-hover">{{ game.title }}</span>
          </div>
        </div>
        <p v-else class="section-text">No liked games yet.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger'
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios.js'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isLoading = ref(true)

// Datos del Perfil Visitado (Target)
const targetUserId = ref(null)
const username = ref('')
const avatar = ref('')
const bio = ref('')
const pronouns = ref('')
const followers_count = ref(0)
const following_count = ref(0)
const games_count = ref(0)

// Mi Estado (Visitante)
const myUserId = ref(null)
const isFollowing = ref(false)

// Contenido
const watchlist = ref([])
const reviews = ref([])
const userLists = ref([])
const gamesCache = ref({})

// Computed para Favoritos (Top 4) y Likes
const likedGames = computed(() => {
  return watchlist.value.filter((game) => game.is_favorite || game.is_liked)
})

const activeTab = ref('PROFILE')
// Quitamos pestañas privadas como DIARY, NETWORK o ACTIVITY FEED privado
const tabs = ['PROFILE', 'GAMES', 'REVIEWS', 'LISTS', 'LIKES']

// --- HELPERS ---
const getCoverUrl = (url) =>
  url ? url.replace('t_thumb', 't_cover_big') : 'https://placehold.co/150x220?text=No+Cover'
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '')
const getGameTitle = (id) => (gamesCache.value[id] ? gamesCache.value[id].title : `Game ${id}`)
const goToGame = (game) => router.push(`/game/${game.slug || game.id_game}`)

const viewList = (list) => {
  // Solo ver, no editar
  const listId = list.id_list || list.id
  if (listId) router.push({ name: 'ListDetail', params: { listId: listId } })
}

// --- GAMES FILTER ---
const statusFilter = ref('all')

const filteredWatchlist = computed(() => {
  if (statusFilter.value === 'all') return watchlist.value
  return watchlist.value.filter((g) => g.status === statusFilter.value)
})

const statusButtons = computed(() => [
  { value: 'all', label: 'All', color: '#555', count: watchlist.value.length },
  {
    value: 'playing',
    label: 'Playing',
    color: '#2196f3',
    count: watchlist.value.filter((g) => g.status === 'playing').length,
  },
  {
    value: 'played',
    label: 'Played',
    color: '#10B981',
    count: watchlist.value.filter((g) => g.status === 'played').length,
  },
  {
    value: 'plan_to_play',
    label: 'Backlog',
    color: '#FBBF24',
    count: watchlist.value.filter((g) => g.status === 'plan_to_play').length,
  },
  {
    value: 'dropped',
    label: 'Dropped',
    color: '#EF4444',
    count: watchlist.value.filter((g) => g.status === 'dropped').length,
  },
])

// --- COMPATIBILITY ---
const compatibility = computed(() => {
  if (!myUserId.value) return null
  const myGames = new Set(userStore.user?.games?.map((g) => g.id_game))
  if (watchlist.value.length === 0 || myGames.size === 0) return null
  const shared = watchlist.value.filter((g) => myGames.has(g.id_game))
  const percent = Math.round((shared.length / Math.max(watchlist.value.length, 1)) * 100)
  return { count: shared.length, percent }
})

// --- REVIEW NAVIGATION ---
const navigateToGameFromReview = (review) => {
  const game = gamesCache.value[review.id_game]
  if (game?.slug) router.push(`/game/${game.slug}`)
  else if (review.id_game) router.push(`/game/${review.id_game}`)
}

// --- STICKY HEADER ---
const showStickyHeader = ref(false)

const handleScroll = () => {
  showStickyHeader.value = window.scrollY > 200
}

// Cargar nombres de juegos para el cache (Optimizado)
const enrichDataWithGameInfo = async () => {
  const gameIdsToFetch = new Set()
  reviews.value.forEach((r) => {
    if (r.id_game) gameIdsToFetch.add(r.id_game)
  })
  watchlist.value.forEach((g) => {
    if (g.id_game) gameIdsToFetch.add(g.id_game)
  })

  const promises = Array.from(gameIdsToFetch).map(async (id) => {
    if (gamesCache.value[id]) return
    try {
      const { data } = await api.get(`/games/${id}`)
      gamesCache.value[id] = data
    } catch (error) {
      logger.error(`Error fetching game ${id}:`, error)
    }
  })
  await Promise.all(promises)
}

// --- LOGICA DE CARGA ---
const loadPublicData = async () => {
  isLoading.value = true
  const routeUsername = route.params.username

  try {
    // 1. Identificarme a mi mismo (Visitante)
    try {
      await userStore.fetchUser()
      myUserId.value = userStore.user?.id_user || userStore.user?.id || null

      // Si resulta que soy yo mismo, redirigir a la vista privada /profile
      if (userStore.user?.username === routeUsername) {
        router.replace('/profile')
        return
      }
    } catch (e) {
      myUserId.value = null
      logger.error('Error fetching my user info', e)
    }

    // 2. Buscar al usuario objetivo por username
    const { data: userData } = await api.get(`/users/${routeUsername}`)
    targetUserId.value = userData.id_user

    // Asignar datos a la vista
    username.value = userData.username
    avatar.value = userData.avatar_url
    bio.value = userData.bio
    pronouns.value = userData.pronouns

    followers_count.value = userData.followers_count || 0
    following_count.value = userData.following_count || 0
    games_count.value = userData.games_count || 0

    // 3. Verificar si lo sigo (solo si estoy logueado)
    if (myUserId.value) {
      try {
        const resFollow = await api.get(`/users/follow/${targetUserId.value}/check`)
        isFollowing.value = resFollow.data.isFollowing
      } catch (e) {
        logger.error('Error check follow', e)
      }
    }

    // 4. Cargar su contenido público en paralelo
    await Promise.allSettled([
      // Reviews
      api
        .get(`/reviews/user/${targetUserId.value}`)
        .then(
          (r) =>
            (reviews.value = r.data.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at),
            )),
        ),
      // Listas
      api.get(`/lists/user/${targetUserId.value}`).then((r) => (userLists.value = r.data)),
      // Juegos (Librería Pública)
      // Nota: Asegúrate de tener la ruta GET /api/activity/user/:id en el backend
      api.get(`/activity/user/${targetUserId.value}`).then((r) => (watchlist.value = r.data)),
    ])

    // Cargar nombres de juegos
    await enrichDataWithGameInfo()
  } catch (error) {
    logger.error('Error loading public profile:', error)
    if (error.response?.status === 404) {
      alert('Usuario no encontrado')
      router.push('/home')
    }
  } finally {
    isLoading.value = false
  }
}

// --- LOGICA DE FOLLOW ---
const handleFollowToggle = async () => {
  if (!myUserId.value) {
    alert('Inicia sesión para seguir a usuarios.')
    // Opcional: Redirigir a login
    return
  }

  const original = isFollowing.value
  // Optimistic Update
  isFollowing.value = !isFollowing.value
  if (isFollowing.value) followers_count.value++
  else followers_count.value--

  try {
    if (original) {
      // Unfollow
      await api.delete(`/users/follow/${targetUserId.value}`)
    } else {
      // Follow
      await api.post(`/users/follow/${targetUserId.value}`)
    }
  } catch (e) {
    // Revertir si falla
    isFollowing.value = original
    if (isFollowing.value) followers_count.value++
    else followers_count.value--
    logger.error('Error follow toggle', e)
    alert('Error al cambiar seguimiento')
  }
}

// Recargar si cambio de un perfil público a otro (/u/juan -> /u/maria)
watch(() => route.params.username, loadPublicData)

onMounted(() => {
  loadPublicData()
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* GENERAL */
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Inter', sans-serif;
  color: #333;
}
.profile-container {
  width: 90%;
  max-width: 1100px;
  margin: 40px auto;
  flex: 1;
}
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: #666;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00cc66;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* STICKY HEADER */
.sticky-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-100%);
  opacity: 0;
  transition: transform 0.2s, opacity 0.2s;
}
.sticky-header.visible {
  transform: translateY(0);
  opacity: 1;
}
.sticky-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
  padding: 10px 5%;
}
.sticky-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sticky-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.sticky-username {
  font-weight: 700;
  font-size: 15px;
  color: #333;
}

/* HEADER */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background: #000;
  flex-shrink: 0;
  z-index: 2;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: -300px;
  padding-bottom: 10px;
  max-width: 500px;
}
.username {
  font-size: 32px;
  margin: 0;
  color: #333;
  font-weight: 700;
}
.pronouns-badge {
  display: inline-block;
  background-color: #e0e0e0;
  color: #666;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  margin-bottom: 8px;
  width: fit-content;
}
.bio-text {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}
.compatibility-badge {
  display: inline-block;
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  border-radius: 20px;
  font-size: 12px;
  padding: 4px 10px;
  margin-top: 8px;
  width: fit-content;
}

/* ACTIONS */
.header-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.follow-btn {
  background: #00cc66;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.follow-btn:hover {
  background: #00b359;
  transform: translateY(-1px);
}
.follow-btn.following {
  background: #444;
  color: #ccc;
}
.follow-btn.following:hover {
  background: #d32f2f;
  color: white;
} /* Efecto Unfollow opcional */

.login-prompt-btn {
  background: #444;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.login-prompt-btn:hover {
  background: #333;
}

/* STATS */
.profile-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}
.stat-block {
  text-align: center;
  min-width: 60px;
}
.stat-number {
  font-size: 20px;
  font-weight: bold;
  display: block;
  color: #222;
}
.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 0.5px;
}
.divider {
  width: 1px;
  height: 30px;
  background: #eee;
}

/* TABS */
.profile-tabs {
  display: flex;
  align-items: center;
  gap: 25px;
  border-bottom: 1px solid #e0e0e0;
  margin-top: 20px;
  padding-bottom: 0;
  overflow-x: auto;
}
.profile-tabs button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  font-weight: 600;
  padding-bottom: 15px;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}
.profile-tabs button:hover {
  color: #333;
}
.profile-tabs button.active {
  color: #00cc66;
  border-bottom-color: #00cc66;
}

/* SECTIONS & GRIDS */
.section {
  margin-top: 40px;
}
.section-title {
  font-size: 13px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  color: #999;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.section-text {
  font-size: 14px;
  color: #666;
}

.fav-games-grid,
.games-grid-layout {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
.game-poster-card {
  width: 120px;
  height: 180px;
  background: #ddd;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s;
  cursor: pointer;
}
.game-poster-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
.game-poster-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.game-title-hover {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 11px;
  padding: 4px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.game-poster-card:hover .game-title-hover {
  opacity: 1;
}
.heart-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* STATUS FILTERS */
.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.status-filter-btn {
  background: white;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}
.status-filter-btn:hover {
  border-color: #aaa;
  color: #333;
}

/* LISTS */
.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}
.list-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}
.list-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  border-color: #00cc66;
}

/* LIST COVER COLLAGE */
.list-cover-collage {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  height: 80px;
  width: 100%;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
}
.collage-slot {
  overflow: hidden;
}
.collage-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.collage-empty {
  background: #e0e0e0;
}

.list-card-content {
  padding: 15px 20px 0;
}
.list-card-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}
.list-desc {
  font-size: 13px;
  color: #777;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.list-card-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  color: #aaa;
  font-size: 12px;
  border-top: 1px solid #f9f9f9;
  padding: 10px 20px 15px;
}

/* REVIEWS */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.review-card-full {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  border-left: 3px solid var(--hover-color, var(--brand-cyan));
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  gap: 15px;
  align-items: flex-start;
}
.review-card-full:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.reviews-list .review-card-full:nth-child(4n + 1) { --hover-color: var(--brand-red); }
.reviews-list .review-card-full:nth-child(4n + 2) { --hover-color: var(--brand-cyan); }
.reviews-list .review-card-full:nth-child(4n + 3) { --hover-color: var(--brand-green); }
.reviews-list .review-card-full:nth-child(4n)     { --hover-color: var(--brand-yellow); }

.review-cover {
  width: 40px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}
.review-card-body {
  flex: 1;
}
.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.game-name {
  font-weight: bold;
  color: #333;
  cursor: pointer;
}
.game-name:hover {
  text-decoration: underline;
}
.rating-badge {
  background: #00cc66;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
.review-body {
  color: #555;
  font-size: 14px;
  line-height: 1.5;
  font-style: italic;
}
.review-footer {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #999;
}
.spoiler-tag {
  color: #ff4444;
  font-weight: bold;
}

.mini-reviews-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mini-review-item {
  background: #fff;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
}
.review-game {
  display: block;
  font-weight: bold;
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
}
.review-meta {
  font-size: 11px;
  color: #999;
  margin-bottom: 6px;
  display: flex;
  gap: 10px;
}
.stars {
  color: #00cc66;
  font-weight: bold;
}
.review-content {
  font-size: 13px;
  color: #555;
  margin: 0;
  font-style: italic;
}
</style>
