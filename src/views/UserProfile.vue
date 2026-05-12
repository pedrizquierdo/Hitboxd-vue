<template>
  <div class="profile-page">
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>

    <div v-else class="profile-container">

      <!-- HEADER -->
      <div class="profile-header">
        <div class="profile-avatar">
          <img :src="avatar || '/assets/default-avatar.svg'" class="avatar-img" />
        </div>

        <div class="profile-info">
          <h1 class="username">{{ username }}</h1>
          <span v-if="pronouns" class="pronouns-badge">{{ pronouns }}</span>
          <p v-if="bio" class="bio-text">{{ bio }}</p>
          <button v-if="isAdmin" @click="goToAdminPanel" class="admin-profile-btn">Admin Panel</button>
        </div>

        <div class="profile-stats">
          <div class="stat-block" @click="activeTab = 'GAMES'">
            <span class="stat-number">{{ games_count || watchlist.length || 0 }}</span>
            <span class="stat-label">Games</span>
          </div>
          <div class="divider"></div>
          <div class="stat-block" @click="activeTab = 'NETWORK'">
            <span class="stat-number">{{ followers_count || 0 }}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="divider"></div>
          <div class="stat-block" @click="activeTab = 'NETWORK'">
            <span class="stat-number">{{ following_count || 0 }}</span>
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
        >{{ tab }}</button>
      </nav>

      <!-- ── PROFILE TAB ── -->
      <section v-show="activeTab === 'PROFILE'" class="section">
        <h2 class="section-title">FAVORITE GAMES</h2>

        <div v-if="pinnedGames.length" class="fav-games-grid">
          <div
            v-for="(game, idx) in pinnedGames"
            :key="game.id_game"
            class="game-poster-card draggable"
            draggable="true"
            :class="{ 'drag-over': dragOverIndex === idx }"
            @dragstart="onDragStart($event, idx)"
            @dragover.prevent="dragOverIndex = idx"
            @dragleave="dragOverIndex = null"
            @drop="onDrop($event, idx)"
            @dragend="dragOverIndex = null"
            @click="goToGameById(game)"
          >
            <img :src="getCoverUrl(game.cover_url)" alt="Game Cover" />
            <div class="drag-hint">⠿</div>
            <span class="game-title-hover">{{ game.title }}</span>
          </div>
          <!-- Empty slots -->
          <div
            v-for="n in Math.max(0, 4 - pinnedGames.length)"
            :key="'empty-' + n"
            class="game-poster-card empty-slot"
            @dragover.prevent
            @drop="onDropIntoEmpty($event)"
          >
            <span class="empty-slot-label">+</span>
          </div>
        </div>
        <p v-else class="section-text">No favorite games yet. Mark games as favorite to pin them here.</p>

        <h2 class="section-title" style="margin-top:40px">RECENT REVIEWS</h2>
        <div v-if="reviews.length" class="mini-reviews-list">
          <div v-for="review in reviews.slice(0, 3)" :key="review.id_review" class="mini-review-item">
            <span
              class="review-game clickable"
              @click="goToGameBySlug(review.game_slug)"
            >{{ review.game_title || getGameTitle(review.id_game) }}</span>
            <div class="review-meta">
              <StarRating :model-value="review.rating" disabled />
              <span class="date">{{ formatDate(review.created_at) }}</span>
            </div>
            <p class="review-content">"{{ review.content }}"</p>
          </div>
        </div>
        <p v-else class="section-text">No recent reviews.</p>
      </section>

      <!-- ── STATS TAB ── -->
      <section v-show="activeTab === 'STATS'" class="section">
        <div v-if="statsLoading" class="stats-loading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="stats" class="stats-container">

          <!-- Top row: avg rating + total -->
          <div class="stats-summary-row">
            <div class="stat-hero">
              <span class="stat-hero-num">{{ stats.avg_rating ?? '—' }}</span>
              <span class="stat-hero-star">★</span>
              <span class="stat-hero-label">Avg Rating</span>
            </div>
            <div class="stat-hero">
              <span class="stat-hero-num">{{ stats.rated_count }}</span>
              <span class="stat-hero-label">Rated</span>
            </div>
            <div class="stat-hero">
              <span class="stat-hero-num">{{ watchlist.length }}</span>
              <span class="stat-hero-label">Logged</span>
            </div>
            <div class="stat-hero">
              <span class="stat-hero-num">{{ reviews.length }}</span>
              <span class="stat-hero-label">Reviews</span>
            </div>
          </div>

          <!-- Status breakdown -->
          <div class="stats-section" v-if="stats.status_distribution?.length">
            <h3 class="stats-heading">STATUS BREAKDOWN</h3>
            <div class="bar-chart">
              <div v-for="item in statsStatusSorted" :key="item.status" class="bar-row">
                <span class="bar-label">{{ STATUS_DISPLAY[item.status] || item.status }}</span>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    :class="'fill-' + item.status"
                    :style="{ width: barPct(item.count, maxStatusCount) + '%' }"
                  ></div>
                </div>
                <span class="bar-val">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <!-- Top genres -->
          <div class="stats-section" v-if="stats.genre_distribution?.length">
            <h3 class="stats-heading">TOP GENRES</h3>
            <div class="bar-chart">
              <div v-for="item in stats.genre_distribution" :key="item.genre" class="bar-row">
                <span class="bar-label">{{ item.genre }}</span>
                <div class="bar-track">
                  <div
                    class="bar-fill fill-genre"
                    :style="{ width: barPct(item.count, stats.genre_distribution[0].count) + '%' }"
                  ></div>
                </div>
                <span class="bar-val">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <!-- Years -->
          <div class="stats-section" v-if="stats.year_distribution?.length">
            <h3 class="stats-heading">RELEASE YEARS PLAYED</h3>
            <div class="bar-chart">
              <div v-for="item in stats.year_distribution" :key="item.year" class="bar-row">
                <span class="bar-label">{{ item.year }}</span>
                <div class="bar-track">
                  <div
                    class="bar-fill fill-year"
                    :style="{ width: barPct(item.count, stats.year_distribution[0].count) + '%' }"
                  ></div>
                </div>
                <span class="bar-val">{{ item.count }}</span>
              </div>
            </div>
          </div>

          <p v-if="!stats.genre_distribution?.length && !stats.year_distribution?.length" class="section-text">
            Log more games to see detailed stats.
          </p>
        </div>
        <p v-else class="section-text">No stats available yet.</p>
      </section>

      <!-- ── ACTIVITY TAB ── -->
      <section v-show="activeTab === 'ACTIVITY'" class="section">
        <h2 class="section-title">FRIENDS ACTIVITY FEED</h2>
        <div v-if="activityFeed.length" class="activity-list">
          <div v-for="(act, index) in activityFeed" :key="index" class="activity-card">
            <div class="activity-icon" :class="act.status">{{ getStatusIcon(act.status) }}</div>
            <div class="activity-content">
              <p class="activity-text">
                <strong class="user-link">{{ act.username || `User #${act.id_user}` }}</strong>
                <span class="status-text"> {{ getStatusLabel(act.status) }} </span>
                <strong class="game-link">{{ getGameTitle(act.id_game) }}</strong>
              </p>
              <small class="activity-date">{{ formatDate(act.created_at) }}</small>
            </div>
          </div>
        </div>
        <p v-else class="section-text">No recent activity found.</p>
      </section>

      <!-- ── GAMES TAB ── -->
      <section v-show="activeTab === 'GAMES'" class="section">
        <div class="games-tab-header">
          <h2 class="section-title" style="margin:0">GAMELIST</h2>
          <div class="status-filter-row">
            <button
              v-for="f in STATUS_FILTERS"
              :key="f.value"
              class="status-filter-btn"
              :class="{ active: gamesFilter === f.value, ['color-' + f.value]: gamesFilter === f.value }"
              @click="gamesFilter = f.value"
            >{{ f.label }} <span class="filter-count">{{ statusCount(f.value) }}</span></button>
          </div>
        </div>

        <div v-if="watchlistError" class="error-box">
          <p><strong>Server Error:</strong> Unable to load gamelist.</p>
        </div>
        <div v-else-if="filteredWatchlist.length" class="games-grid-layout">
          <div
            v-for="game in filteredWatchlist"
            :key="game.id_game"
            class="game-poster-card"
            @click="goToGameById(game)"
          >
            <img :src="getCoverUrl(game.cover_url)" alt="Game Cover" />
            <span class="game-title-hover">{{ game.title }}</span>
          </div>
        </div>
        <p v-else class="section-text">No games with this status.</p>
      </section>

      <!-- ── REVIEWS TAB ── -->
      <section v-show="activeTab === 'REVIEWS'" class="section">
        <h2 class="section-title">MY REVIEWS</h2>
        <div v-if="reviews.length" class="reviews-list">
          <div v-for="review in reviews" :key="review.id_review" class="review-card-full">
            <div class="review-header">
              <span
                class="game-name clickable"
                @click="goToGameBySlug(review.game_slug)"
              >{{ review.game_title || getGameTitle(review.id_game) }}</span>
              <span v-if="review.rating" class="rating-badge">{{ review.rating }}/5</span>
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

      <!-- ── LISTS TAB ── -->
      <section v-show="activeTab === 'LISTS'" class="section">
        <div class="section-header-row">
          <h2 class="section-title">LISTS</h2>
          <button v-if="userLists.length" @click="openModal" class="btn-create-mini">+ NEW</button>
        </div>
        <div v-if="userLists.length" class="lists-grid">
          <div
            v-for="list in userLists"
            :key="list.id_list || list.id"
            class="list-card"
            @click="editList(list)"
          >
            <div class="list-card-content">
              <h3>{{ list.title || list.name }}</h3>
              <p class="list-desc">{{ list.description || 'No description' }}</p>
            </div>
            <div class="list-card-footer">
              <small>{{ list.games ? list.games.length : 0 }} GAMES</small>
              <span class="list-icon">LIST</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="section-text">YOU HAVEN'T CREATED ANY LISTS YET.</p>
          <button class="start-list-btn" @click="openModal">CREATE YOUR FIRST LIST</button>
        </div>
      </section>

      <!-- ── NETWORK TAB ── -->
      <section v-show="activeTab === 'NETWORK'" class="section">
        <div class="network-header">
          <div class="network-tabs">
            <button class="net-tab-btn" :class="{ active: networkSubTab === 'following' }" @click="networkSubTab = 'following'">
              FOLLOWING <span class="count-badge">{{ following_count }}</span>
            </button>
            <button class="net-tab-btn" :class="{ active: networkSubTab === 'followers' }" @click="networkSubTab = 'followers'">
              FOLLOWERS <span class="count-badge">{{ followers_count }}</span>
            </button>
          </div>
          <div class="network-search">
            <input type="text" v-model="networkSearch" placeholder="Find a user..." />
          </div>
        </div>
        <div class="network-content">
          <div v-if="loadingNetwork" class="mini-loader">Loading...</div>
          <div v-else-if="filteredNetworkList.length" class="user-grid">
            <div
              v-for="user in filteredNetworkList"
              :key="user.id_user"
              class="user-card"
              @click="goToUserProfile(user.username)"
            >
              <div class="user-card-header">
                <img :src="user.avatar_url || '/assets/default-avatar.svg'" class="user-avatar" />
              </div>
              <div class="user-card-body">
                <h4 class="user-name">{{ user.username }}</h4>
                <span class="user-meta">{{ user.games_count || 0 }} games logged</span>
              </div>
              <button class="btn-follow-mini" @click.stop="toggleFollow(user)">
                {{ user.is_following ? 'Following' : 'Follow' }}
              </button>
            </div>
          </div>
          <div v-else class="empty-network">
            <p v-if="networkSubTab === 'following'">Not following anyone yet.</p>
            <p v-else>No followers yet.</p>
          </div>
        </div>
      </section>

      <!-- ── DIARY TAB ── -->
      <section v-show="activeTab === 'DIARY'" class="section">
        <h2 class="section-title">DIARY LOG</h2>
        <div v-if="reviews.length" class="diary-list">
          <div v-for="entry in reviews" :key="entry.id_review" class="diary-entry">
            <div class="diary-date">
              <span class="day">{{ new Date(entry.created_at).getDate() }}</span>
              <span class="month">{{ new Date(entry.created_at).toLocaleString('default', { month: 'short' }) }}</span>
              <span class="year">{{ new Date(entry.created_at).getFullYear() }}</span>
            </div>
            <div class="diary-poster" @click="goToGameBySlug(entry.game_slug)" :class="{ clickable: entry.game_slug }">
              <img
                v-if="entry.cover_url || gamesCache[entry.id_game]?.cover_url"
                :src="getCoverUrl(entry.cover_url || gamesCache[entry.id_game]?.cover_url)"
                :alt="entry.game_title"
                class="diary-cover"
              />
              <div v-else class="mini-poster-placeholder">🎮</div>
            </div>
            <div class="diary-info">
              <span
                class="diary-game-title clickable"
                @click="goToGameBySlug(entry.game_slug)"
              >{{ entry.game_title || getGameTitle(entry.id_game) }}</span>
              <div class="diary-rating">
                <span
                  v-for="n in 5"
                  :key="n"
                  :class="{ 'star-filled': n <= entry.rating, 'star-empty': n > entry.rating }"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="section-text">Diary is empty. Write a review to add an entry!</p>
      </section>

      <!-- ── LIKES TAB ── -->
      <section v-show="activeTab === 'LIKES'" class="section">
        <h2 class="section-title">LIKED GAMES</h2>
        <div v-if="likedGames.length" class="games-grid-layout">
          <div v-for="game in likedGames" :key="game.id_game" class="game-poster-card" @click="goToGameById(game)">
            <img :src="getCoverUrl(game.cover_url)" alt="Game Cover" />
            <span class="game-title-hover">{{ game.title }}</span>
            <span class="heart-icon">♥</span>
          </div>
        </div>
        <p v-else class="section-text">You haven't liked any games yet.</p>
      </section>

    </div>

    <CreateListModal :open="isModalOpen" @close="closeModal" @created="handleListCreated" />
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger'
import { ref, onMounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import CreateListModal from "@/components/lists/CreateListModal.vue"
import StarRating from "@/components/reviews/StarRating.vue"
import api from "@/api/axios.js"
import { useUserStore } from "@/stores/userStore"

const router = useRouter()
const userStore = useUserStore()
const isLoading = ref(true)

const username = ref("")
const avatar = ref("")
const bio = ref("")
const pronouns = ref("")
const currentUserId = ref(null)
const isAdmin = ref(false)

const watchlist = ref([])
const watchlistError = ref(false)
const reviews = ref([])
const activityFeed = ref([])
const userLists = ref([])
const gamesCache = ref({})
const followers_count = ref(0)
const following_count = ref(0)
const games_count = ref(0)
const networkSubTab = ref('following')
const networkSearch = ref('')
const followingList = ref([])
const followersList = ref([])
const loadingNetwork = ref(false)

// Stats
const stats = ref(null)
const statsLoading = ref(false)

// Games filter
const gamesFilter = ref('all')

// Drag & drop
const dragSrcIndex = ref(null)
const dragOverIndex = ref(null)
const pinnedOrder = ref([])

const STATUS_DISPLAY = { playing: 'Playing', played: 'Played', plan_to_play: 'Backlog', dropped: 'Dropped' }

const STATUS_FILTERS = [
  { label: 'All',     value: 'all' },
  { label: 'Playing', value: 'playing' },
  { label: 'Played',  value: 'played' },
  { label: 'Backlog', value: 'plan_to_play' },
  { label: 'Dropped', value: 'dropped' },
]

const tabs = ["PROFILE", "STATS", "ACTIVITY", "GAMES", "REVIEWS", "LISTS", "NETWORK", "DIARY", "LIKES"]
const activeTab = ref("PROFILE")
const isModalOpen = ref(false)

// ── COMPUTED ──

const favoriteGames = computed(() => watchlist.value.filter(g => Boolean(g.is_favorite)))
const likedGames = computed(() => watchlist.value.filter(g => Boolean(g.is_liked)))

const pinnedGames = computed(() => {
  const favs = favoriteGames.value
  if (pinnedOrder.value.length) {
    const ordered = pinnedOrder.value.map(id => favs.find(g => g.id_game === id)).filter(Boolean)
    const extras = favs.filter(g => !pinnedOrder.value.includes(g.id_game))
    return [...ordered, ...extras].slice(0, 4)
  }
  return favs.slice(0, 4)
})

const filteredWatchlist = computed(() => {
  if (gamesFilter.value === 'all') return watchlist.value
  return watchlist.value.filter(g => g.status === gamesFilter.value)
})

const filteredNetworkList = computed(() => {
  const list = networkSubTab.value === 'following' ? followingList.value : followersList.value
  if (!networkSearch.value) return list
  return list.filter(u => u.username.toLowerCase().includes(networkSearch.value.toLowerCase()))
})

const statsStatusSorted = computed(() => {
  if (!stats.value?.status_distribution) return []
  const order = ['played', 'playing', 'plan_to_play', 'dropped']
  return [...stats.value.status_distribution].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
})

const maxStatusCount = computed(() =>
  Math.max(...(stats.value?.status_distribution || []).map(s => s.count), 1)
)

const statusCount = (filterVal) => {
  if (filterVal === 'all') return watchlist.value.length
  return watchlist.value.filter(g => g.status === filterVal).length
}

const barPct = (val, max) => Math.max(4, Math.round((val / max) * 100))

// ── HELPERS ──

const getCoverUrl = (url) => {
  if (!url) return 'https://placehold.co/150x220?text=No+Cover'
  return url.replace('t_thumb', 't_cover_big')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const getGameTitle = (gameId) => {
  if (!gameId) return 'Unknown Game'
  return gamesCache.value[gameId]?.title || gamesCache.value[gameId]?.name || 'Game...'
}

const goToGameById = (game) => {
  if (game?.slug) router.push(`/game/${game.slug}`)
}

const goToGameBySlug = (slug) => {
  if (slug) router.push(`/game/${slug}`)
}

const goToUserProfile = (uname) => {
  router.push({ name: 'PublicProfile', params: { username: uname } })
}

const goToAdminPanel = () => { if (isAdmin.value) router.push({ name: 'AdminDashboard' }) }

const getStatusLabel = (status) => {
  const map = { plan_to_play: 'plans to play', played: 'played', dropped: 'dropped', playing: 'is currently playing' }
  return map[status] || status
}

const getStatusIcon = (status) => {
  const map = { plan_to_play: '📋', played: '✅', dropped: '❌', playing: '🎮' }
  return map[status] || '•'
}

const editList = (list) => {
  const listId = list.id_list || list.id
  if (listId) router.push({ name: 'ListDetail', params: { listId } })
}

const openModal = () => { isModalOpen.value = true }
const closeModal = () => { isModalOpen.value = false }
const handleListCreated = (data) => { userLists.value.unshift(data) }

// ── DRAG & DROP (favorite games) ──

const loadPinnedOrder = () => {
  try {
    pinnedOrder.value = JSON.parse(localStorage.getItem(`hitboxd_pinned_${currentUserId.value}`) || '[]')
  } catch { pinnedOrder.value = [] }
}

const savePinnedOrder = () => {
  try {
    localStorage.setItem(`hitboxd_pinned_${currentUserId.value}`, JSON.stringify(pinnedOrder.value))
  } catch {}
}

const onDragStart = (e, index) => {
  dragSrcIndex.value = index
  e.dataTransfer.effectAllowed = 'move'
}

const onDrop = (e, targetIndex) => {
  e.preventDefault()
  if (dragSrcIndex.value === null || dragSrcIndex.value === targetIndex) { dragOverIndex.value = null; return }
  const newOrder = pinnedGames.value.map(g => g.id_game)
  const [removed] = newOrder.splice(dragSrcIndex.value, 1)
  newOrder.splice(targetIndex, 0, removed)
  pinnedOrder.value = newOrder
  savePinnedOrder()
  dragSrcIndex.value = null
  dragOverIndex.value = null
}

const onDropIntoEmpty = (e) => {
  e.preventDefault()
  dragSrcIndex.value = null
  dragOverIndex.value = null
}

// ── FOLLOW (network tab) ──

const toggleFollow = async (user) => {
  try {
    if (user.is_following) {
      await api.delete(`/users/follow/${user.id_user}`)
      user.is_following = false
    } else {
      await api.post(`/users/follow/${user.id_user}`)
      user.is_following = true
    }
  } catch (err) { logger.error('Error toggling follow:', err) }
}

// ── DATA FETCHING ──

const enrichDataWithGameInfo = () => {
  watchlist.value.forEach(g => { if (g.id_game) gamesCache.value[g.id_game] = g })
  activityFeed.value.forEach(a => { if (a.id_game) gamesCache.value[a.id_game] = a })
  const missing = [...new Set(reviews.value.map(r => r.id_game).filter(id => id && !gamesCache.value[id]))]
  return Promise.all(missing.map(async (id) => {
    try {
      const { data } = await api.get(`/games/${id}`)
      gamesCache.value[id] = data
    } catch {}
  }))
}

const fetchNetworkData = async () => {
  if (!currentUserId.value) return
  loadingNetwork.value = true
  try {
    const [resFollowing, resFollowers] = await Promise.all([
      api.get(`/users/${currentUserId.value}/following`),
      api.get(`/users/${currentUserId.value}/followers`),
    ])
    followingList.value = resFollowing.data
    followersList.value = resFollowers.data
  } catch (err) { logger.error("Error cargando network:", err) }
  finally { loadingNetwork.value = false }
}

const fetchStats = async () => {
  if (stats.value || statsLoading.value) return
  statsLoading.value = true
  try {
    const { data } = await api.get('/activity/stats')
    stats.value = data
  } catch (err) { logger.error('Error stats:', err) }
  finally { statsLoading.value = false }
}

watch(activeTab, (tab) => {
  if (tab === 'NETWORK') fetchNetworkData()
  if (tab === 'STATS') fetchStats()
})

onMounted(async () => {
  try {
    isLoading.value = true
    await userStore.fetchUser()
    const userData = userStore.user

    currentUserId.value = userData.id_user || userData.id
    username.value = userData.username
    document.title = username.value + ' — Hitboxd'
    avatar.value = userData.avatar_url
    bio.value = userData.bio
    pronouns.value = userData.pronouns
    followers_count.value = userData.followers_count || 0
    following_count.value = userData.following_count || 0
    games_count.value = userData.games_count || 0
    if (userData.role === 'admin') isAdmin.value = true

    if (currentUserId.value) {
      const [revRes, watchRes, feedRes, listsRes] = await Promise.allSettled([
        api.get(`/reviews/user/${currentUserId.value}`),
        api.get('/activity/all'),
        api.get('/activity/feed'),
        api.get(`/lists/user/${currentUserId.value}`),
      ])

      if (revRes.status === 'fulfilled') {
        reviews.value = revRes.value.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }
      if (watchRes.status === 'fulfilled') {
        watchlist.value = watchRes.value.data
      } else {
        watchlistError.value = true
      }
      if (feedRes.status === 'fulfilled') activityFeed.value = feedRes.value.data
      if (listsRes.status === 'fulfilled') userLists.value = listsRes.value.data

      await enrichDataWithGameInfo()
      loadPinnedOrder()
    }
  } catch (error) {
    if (error.response?.status === 401) router.push({ name: 'Auth' })
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* ─── BASE ─────────────────────────────────────── */
.profile-page { display: flex; flex-direction: column; min-height: 100vh; background-color: #f8f9fa; font-family: 'Inter', sans-serif; }
.profile-container { width: 90%; max-width: 1100px; margin: 40px auto; flex: 1; }
.loading-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 50vh; color: #666; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #00cc66; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* ─── HEADER ────────────────────────────────────── */
.profile-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.profile-avatar { width: 110px; height: 110px; border-radius: 50%; overflow: hidden; border: 5px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); background: #000; flex-shrink: 0; z-index: 2; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.profile-info { display: flex; flex-direction: column; justify-content: center; margin-left: -350px; padding-bottom: 10px; }
.username { font-size: 32px; margin: 0; color: #333; font-weight: 700; }
.pronouns-badge { display: inline-block; background-color: #e0e0e0; color: #666; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-top: 4px; margin-bottom: 8px; width: fit-content; }
.bio-text { color: #666; font-size: 14px; margin-top: 5px; max-width: 400px; }
.profile-stats { display: flex; align-items: center; gap: 20px; }
.stat-block { text-align: center; min-width: 60px; cursor: pointer; transition: opacity 0.15s; }
.stat-block:hover { opacity: 0.7; }
.stat-number { font-size: 2.2rem; font-weight: 700; display: block; color: #222; }
.stat-label { font-size: 0.7rem; text-transform: uppercase; color: #888; letter-spacing: 1px; }
.divider { width: 1px; height: 30px; background: #eee; }
.admin-profile-btn { align-self: flex-start; margin-top: 15px; background: transparent; color: #cc0066; border: 1px solid #cc0066; padding: 8px 16px; border-radius: 25px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.2s, color 0.2s; }
.admin-profile-btn:hover { background: #cc0066; color: white; }

/* ─── TABS ──────────────────────────────────────── */
.profile-tabs { display: flex; align-items: center; gap: 25px; border-bottom: 1px solid #e0e0e0; margin-top: 20px; overflow-x: auto; scrollbar-width: none; }
.profile-tabs::-webkit-scrollbar { display: none; }
.profile-tabs button { background: none; border: none; cursor: pointer; font-size: 13px; color: #666; font-weight: 600; padding-bottom: 15px; border-bottom: 3px solid transparent; transition: all 0.2s; white-space: nowrap; }
.profile-tabs button:hover { color: #333; }
.profile-tabs button.active { color: #00cc66; border-bottom-color: #00cc66; }

/* ─── SECTIONS ──────────────────────────────────── */
.section { margin-top: 40px; }
.section-title { font-size: 13px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #999; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
.section-text { font-size: 14px; color: #666; }
.error-box { padding: 20px; background: #fff0f0; border: 1px solid #ffcccc; border-radius: 6px; color: #d8000c; text-align: center; margin-bottom: 20px; }

/* ─── FAVORITE GAMES (drag & drop) ─────────────── */
.fav-games-grid { display: flex; gap: 15px; flex-wrap: wrap; }

.game-poster-card { width: 120px; height: 180px; background: #ddd; border-radius: 6px; overflow: hidden; position: relative; transition: transform 0.2s; cursor: pointer; }
.game-poster-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
.game-poster-card img { width: 100%; height: 100%; object-fit: cover; }
.game-title-hover { position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.7); color: white; font-size: 11px; padding: 4px; text-align: center; opacity: 0; transition: opacity 0.2s; }
.game-poster-card:hover .game-title-hover { opacity: 1; }

.draggable { cursor: grab; }
.draggable:active { cursor: grabbing; }
.drag-over { outline: 2px solid #00cc66; transform: scale(1.04); }
.drag-hint { position: absolute; top: 4px; right: 4px; color: white; font-size: 14px; opacity: 0; text-shadow: 0 1px 3px rgba(0,0,0,0.8); pointer-events: none; }
.game-poster-card:hover .drag-hint { opacity: 0.7; }

.empty-slot { background: #f0f0f0; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; cursor: default; }
.empty-slot:hover { transform: none; box-shadow: none; }
.empty-slot-label { font-size: 2rem; color: #ccc; }

.heart-icon { position: absolute; top: 5px; right: 5px; font-size: 14px; color: #ff4757; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }

/* ─── STATS ─────────────────────────────────────── */
.stats-loading { display: flex; justify-content: center; padding: 60px; }
.stats-container { display: flex; flex-direction: column; gap: 2rem; }

.stats-summary-row { display: flex; gap: 20px; flex-wrap: wrap; }
.stat-hero { background: white; border: 1px solid #eee; border-radius: 8px; padding: 20px 28px; text-align: center; display: flex; flex-direction: column; align-items: center; min-width: 100px; }
.stat-hero-num { font-size: 2.4rem; font-weight: 700; color: #222; line-height: 1; }
.stat-hero-star { color: #fbbf24; font-size: 1.2rem; }
.stat-hero-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-top: 4px; }

.stats-section { background: white; border: 1px solid #eee; border-radius: 8px; padding: 20px 24px; }
.stats-heading { font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px; color: #999; text-transform: uppercase; margin: 0 0 16px 0; }

.bar-chart { display: flex; flex-direction: column; gap: 10px; }
.bar-row { display: flex; align-items: center; gap: 12px; }
.bar-label { font-size: 0.78rem; font-weight: 600; color: #555; width: 130px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-track { flex: 1; height: 10px; background: #f0f0f0; border-radius: 5px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 5px; transition: width 0.5s ease; }
.bar-val { font-size: 0.75rem; color: #888; width: 28px; text-align: right; flex-shrink: 0; }

.fill-played     { background: #10B981; }
.fill-playing    { background: #2196f3; }
.fill-plan_to_play { background: #FBBF24; }
.fill-dropped    { background: #EF4444; }
.fill-genre      { background: #00AEEF; }
.fill-year       { background: #8B5CF6; }

/* ─── ACTIVITY ──────────────────────────────────── */
.activity-list { display: flex; flex-direction: column; gap: 15px; }
.activity-card { background: #fff; padding: 15px; border: 1px solid #eee; border-radius: 8px; display: flex; gap: 15px; align-items: center; transition: box-shadow 0.2s; }
.activity-card:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.activity-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 18px; background: #f0f0f0; flex-shrink: 0; }
.activity-icon.plan_to_play { background: #e3f2fd; }
.activity-icon.played { background: #e8f5e9; }
.activity-icon.dropped { background: #ffebee; }
.activity-icon.playing { background: #e3f2fd; }
.activity-content { flex: 1; }
.activity-text { margin: 0; font-size: 14px; color: #444; line-height: 1.4; }
.user-link, .game-link { color: #333; font-weight: 700; }
.status-text { color: #666; margin: 0 4px; }
.activity-date { color: #999; font-size: 11px; margin-top: 4px; display: block; }

/* ─── GAMES FILTER ──────────────────────────────── */
.games-tab-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.status-filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
.status-filter-btn { padding: 5px 12px; border: 1.5px solid #e0e0e0; border-radius: 9999px; background: white; font-size: 0.75rem; font-weight: 600; color: #777; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 5px; }
.status-filter-btn:hover { border-color: #999; color: #333; }
.status-filter-btn.active { color: white; border-color: transparent; }
.status-filter-btn.color-all.active { background: #333; }
.status-filter-btn.color-playing.active { background: #2196f3; }
.status-filter-btn.color-played.active { background: #10B981; }
.status-filter-btn.color-plan_to_play.active { background: #FBBF24; color: #333; }
.status-filter-btn.color-dropped.active { background: #EF4444; }
.filter-count { background: rgba(0,0,0,0.1); border-radius: 9999px; font-size: 0.65rem; padding: 1px 5px; }

/* ─── GAMES / LIKES GRID ────────────────────────── */
.games-grid-layout { display: flex; gap: 15px; flex-wrap: wrap; }

/* ─── REVIEWS ───────────────────────────────────── */
.reviews-list { display: flex; flex-direction: column; gap: 20px; }
.review-card-full { background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee; border-left: 3px solid var(--hover-color, var(--brand-cyan)); transition: transform 0.2s, box-shadow 0.2s; }
.review-card-full:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
.reviews-list .review-card-full:nth-child(4n + 1) { --hover-color: var(--brand-red); }
.reviews-list .review-card-full:nth-child(4n + 2) { --hover-color: var(--brand-cyan); }
.reviews-list .review-card-full:nth-child(4n + 3) { --hover-color: var(--brand-green); }
.reviews-list .review-card-full:nth-child(4n)     { --hover-color: var(--brand-yellow); }
.review-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.game-name { font-weight: bold; color: #333; }
.rating-badge { background: #00cc66; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; }
.review-body { color: #555; font-size: 14px; line-height: 1.5; font-style: italic; }
.review-footer { margin-top: 10px; display: flex; gap: 10px; font-size: 12px; color: #999; }
.spoiler-tag { color: #ff4444; font-weight: bold; }
.clickable { cursor: pointer; }
.clickable:hover { text-decoration: underline; color: #00cc66; }

.mini-reviews-list { display: flex; flex-direction: column; gap: 10px; }
.mini-review-item { background: #fff; padding: 12px; border: 1px solid #eee; border-radius: 6px; }
.review-game { display: block; font-weight: bold; font-size: 13px; color: #333; margin-bottom: 4px; }
.review-meta { font-size: 11px; color: #999; margin-bottom: 6px; display: flex; gap: 10px; align-items: center; }
.review-content { font-size: 13px; color: #555; margin: 0; font-style: italic; }

/* ─── LISTS ─────────────────────────────────────── */
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

/* ─── NETWORK ───────────────────────────────────── */
.network-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
.network-tabs { display: flex; gap: 15px; }
.net-tab-btn { background: none; border: none; font-size: 13px; font-weight: 700; color: #888; cursor: pointer; padding: 5px 0; position: relative; }
.net-tab-btn.active { color: #333; }
.net-tab-btn.active::after { content: ''; position: absolute; bottom: -11px; left: 0; width: 100%; height: 2px; background: #00cc66; }
.count-badge { background: #eee; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 5px; color: #666; }
.network-search input { padding: 6px 12px; border-radius: 20px; border: 1px solid #ddd; font-size: 13px; background: #f9f9f9; outline: none; }
.user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; }
.user-card { background: white; border: 1px solid #eee; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; align-items: center; text-align: center; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
.user-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-color: #00cc66; }
.user-avatar { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; border: 2px solid #f0f0f0; }
.user-name { font-size: 14px; font-weight: bold; color: #333; margin: 0 0 5px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.user-meta { font-size: 11px; color: #999; margin-bottom: 12px; display: block; }
.btn-follow-mini { width: 100%; padding: 6px 0; border-radius: 4px; border: 1px solid #ddd; background: #f9f9f9; color: #555; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.btn-follow-mini:hover { background: #333; color: white; border-color: #333; }
.empty-network { text-align: center; padding: 40px; color: #999; font-style: italic; }
.mini-loader { text-align: center; padding: 20px; color: #999; }

/* ─── DIARY ─────────────────────────────────────── */
.diary-list { border-top: 1px solid #eee; }
.diary-entry { display: flex; padding: 15px 0; border-bottom: 1px solid #eee; align-items: center; gap: 20px; }
.diary-date { display: flex; flex-direction: column; align-items: center; min-width: 50px; color: #666; }
.diary-date .day { font-size: 18px; font-weight: bold; color: #333; line-height: 1; }
.diary-date .month { font-size: 11px; text-transform: uppercase; line-height: 1; margin-top: 2px; }
.diary-date .year { font-size: 10px; color: #999; }
.diary-poster { width: 40px; height: 60px; border-radius: 4px; overflow: hidden; flex-shrink: 0; background: #eee; display: flex; align-items: center; justify-content: center; }
.diary-cover { width: 100%; height: 100%; object-fit: cover; }
.mini-poster-placeholder { font-size: 18px; }
.diary-info { display: flex; flex-direction: column; }
.diary-game-title { font-weight: bold; font-size: 14px; color: #333; }
.diary-rating { display: flex; gap: 2px; margin-top: 4px; font-size: 12px; }
.star-filled { color: #00cc66; }
.star-empty { color: #ddd; }
</style>
