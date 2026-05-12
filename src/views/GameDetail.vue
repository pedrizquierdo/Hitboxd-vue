<template>
  <div class="page-wrapper">
    <div v-if="loadingGame" class="loading-screen">
      <div class="spinner"></div>
    </div>

    <div v-else class="game-detail-container">
      <div class="bg-texture"></div>

      <!-- HEADER -->
      <div class="game-header-container">
        <div class="background-box fade-in">
          <img :src="game.background_url" class="background-img" alt="Game Background" />
        </div>

        <div class="header-content-overlay slide-up">
          <div class="game-avatar-box">
            <div class="cover-mask-wrapper">
              <img :src="game.cover_url" class="game-avatar-img" alt="Game Cover" />
            </div>
          </div>
          <div class="game-info-box">
            <h1 class="game-title-header">{{ game.title }}</h1>
            <p class="info-text-header">
              <strong>Developer:</strong> {{ game.developer || 'Unknown' }} •
              <strong>Release year:</strong> {{ releaseYear }}
            </p>
            <div v-if="gameStats?.avg_rating" class="rating-badge">
              <span class="star-icon">★</span>
              <span class="avg-value">{{ gameStats.avg_rating }}</span>
              <span class="rating-sep">·</span>
              <span class="rating-total">{{ gameStats.total_ratings }} rating{{ gameStats.total_ratings !== 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- GENRE CHIPS -->
      <div v-if="genres.length" class="genres-row slide-up">
        <span
          v-for="genre in genres"
          :key="genre.id"
          class="genre-chip"
          @click="goToGenre(genre.name)"
        >{{ genre.name }}</span>
      </div>

      <!-- MAIN CONTENT -->
      <div class="content-box-main slide-up">
        <div class="left-section">
          <div class="description-box card">
            <h3>GAME DESCRIPTION</h3>
            <p>{{ game.description || "No description available." }}</p>
          </div>
        </div>

        <div class="right-section card">
          <div class="activity-header-row">
            <h3 class="section-title">MY ACTIVITY</h3>
            <button
              class="fav-btn"
              :class="{ 'is-active': isGameLiked }"
              @click="toggleGameLike"
              title="Me gusta (like)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="fav-icon">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </button>
          </div>

          <div class="activity-buttons">
            <button class="btn status playing" :class="{ 'active-status': userStatus === 'playing' }" @click="updateStatus('playing')">Playing</button>
            <button class="btn status played" :class="{ 'active-status': userStatus === 'played' }" @click="updateStatus('played')">Played</button>
            <button class="btn status backlog" :class="{ 'active-status': userStatus === 'plan_to_play' }" @click="updateStatus('plan_to_play')">Backlog</button>
            <button class="btn status dropped" :class="{ 'active-status': userStatus === 'dropped' }" @click="updateStatus('dropped')">Dropped</button>
          </div>

          <div class="rating-section">
            <p>Rate</p>
            <StarRating v-model="userRating" />
          </div>

          <!-- ADD TO LIST -->
          <div v-if="currentUserId" class="add-to-list-wrapper" ref="addToListRef">
            <button class="add-list-btn" @click="toggleAddToList">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11H13V5a1 1 0 00-2 0v6H5a1 1 0 000 2h6v6a1 1 0 002 0v-6h6a1 1 0 000-2z"/></svg>
              Add to List
            </button>
            <div v-if="showAddToList" class="list-dropdown">
              <p v-if="!userLists.length" class="no-lists">No lists yet</p>
              <button
                v-for="list in userLists"
                :key="list.id_list"
                class="list-option"
                @click="addGameToList(list.id_list)"
              >{{ list.title }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- STATS ROW -->
      <div v-if="gameStats" class="stats-row slide-up">
        <!-- Rating histogram -->
        <div class="stats-card card">
          <h3>RATINGS</h3>
          <div class="histogram">
            <div v-for="bar in ratingHistogram" :key="bar.rating" class="bar-item">
              <div class="bar-track">
                <div class="bar-fill" :style="{ height: bar.percentage + '%' }"></div>
              </div>
              <span class="bar-label">{{ bar.rating % 1 === 0 ? bar.rating : bar.rating }}</span>
            </div>
          </div>
        </div>

        <!-- Status distribution -->
        <div v-if="gameStats.status_distribution?.length" class="stats-card card">
          <h3>COMMUNITY</h3>
          <div class="status-dist">
            <div
              v-for="item in statusDistributionSorted"
              :key="item.status"
              class="status-dist-row"
            >
              <span class="status-dist-label">{{ STATUS_DISPLAY[item.status] || item.status }}</span>
              <div class="status-dist-bar">
                <div
                  class="status-dist-fill"
                  :class="'fill-' + item.status"
                  :style="{ width: item.percentage + '%' }"
                ></div>
              </div>
              <span class="status-dist-pct">{{ item.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- REVIEWS -->
      <div class="reviews-section slide-up-delay">
        <div class="reviews-header">
          <h2>REVIEWS</h2>
          <button class="write-review-btn" @click="showReviewModal = true">WRITE A REVIEW</button>
        </div>

        <!-- Sort + filter controls -->
        <div class="reviews-controls">
          <div class="sort-buttons">
            <button
              class="sort-btn"
              :class="{ active: reviewSortBy === 'newest' }"
              @click="reviewSortBy = 'newest'"
            >Newest</button>
            <button
              class="sort-btn"
              :class="{ active: reviewSortBy === 'oldest' }"
              @click="reviewSortBy = 'oldest'"
            >Oldest</button>
            <button
              class="sort-btn"
              :class="{ active: reviewSortBy === 'most_liked' }"
              @click="reviewSortBy = 'most_liked'"
            >Most Liked</button>
          </div>
          <button
            class="sort-btn spoiler-toggle"
            :class="{ active: showSpoilersOnly }"
            @click="showSpoilersOnly = !showSpoilersOnly"
          >Spoilers</button>
        </div>

        <div class="reviews-list">
          <div v-if="!displayedReviews.length" class="no-reviews">
            No reviews yet{{ showSpoilersOnly ? ' with spoilers' : '' }}.
          </div>
          <div v-for="review in displayedReviews" :key="review.id_review" class="review-card card fade-in">
            <div class="review-meta">
              <span class="review-author">
                Reviewed by
                <strong class="clickable-author" @click.stop="goToUserProfile(review.username)">
                  {{ review.username || 'Anonymous' }}
                </strong>
              </span>
              <span class="review-date">{{ formatDate(review.created_at) }}</span>
            </div>

            <div class="review-rating-stars">
              <StarRating :model-value="review.rating" disabled />
            </div>

            <div class="review-content-wrapper" :class="{ 'has-spoilers-hidden': review.has_spoilers && !review.showContent }">
              <p class="review-text">{{ review.content || 'No content provided.' }}</p>
              <div v-if="review.has_spoilers && !review.showContent" class="spoiler-overlay">
                <button class="spoiler-btn" @click.stop="toggleSpoiler(review)">SPOILERS</button>
              </div>
            </div>

            <div class="review-actions">
              <button
                class="like-btn"
                :class="{ 'liked': review.is_liked }"
                @click="toggleReviewLike(review)"
                title="Like this review"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span class="like-count">{{ review.likes || 0 }}</span>
              </button>

              <button v-if="review.id_user !== currentUserId" class="report-btn" @click="toggleReport(review)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" class="flag-icon"><path d="M3 3v18h2v-6h4l1 2h7V5h-7l-1-2H3z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <button
          v-if="filteredSortedReviews.length > 3"
          class="show-all-btn"
          @click="showAllReviews = !showAllReviews"
        >
          {{ showAllReviews ? 'Show less' : `Show all ${filteredSortedReviews.length} reviews` }}
        </button>
      </div>

      <!-- SIMILAR GAMES -->
      <div v-if="similarGames.length" class="similar-section slide-up-delay">
        <h2>SIMILAR GAMES</h2>
        <div class="similar-carousel">
          <div
            v-for="sg in similarGames"
            :key="sg.igdb_id || sg.slug"
            class="similar-item"
            @click="goToGame(sg.slug)"
          >
            <img :src="sg.cover_url" :alt="sg.title" class="similar-cover" />
            <span class="similar-title">{{ sg.title }}</span>
          </div>
        </div>
      </div>

      <ReviewModal v-if="showReviewModal" @close="showReviewModal = false" @submit="submitReview" />
      <ReportModal v-if="showReportModal" @close="closeReportModal" @submit="submitReport" />
    </div>
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger'
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/axios.js'
import { useUserStore } from '@/stores/userStore'

import ReviewModal from '@/components/reviews/ReviewModal.vue'
import StarRating from '@/components/reviews/StarRating.vue'
import ReportModal from '@/components/reviews/ReportModal.vue'
import { useToastStore } from '@/stores/toastStore'

const router = useRouter()
const route = useRoute()

const STATUS_DISPLAY = {
  playing: 'Playing',
  played: 'Played',
  plan_to_play: 'Backlog',
  dropped: 'Dropped',
}

// Core state
const game = ref({})
const reviews = ref([])
const userRating = ref(0)
const userStatus = ref(null)
const isGameLiked = ref(false)
const loadingGame = ref(true)
const isFetchingActivity = ref(false)
const showReviewModal = ref(false)
const showReportModal = ref(false)
const selectedReviewId = ref(null)
const showAllReviews = ref(false)

// New state
const genres = ref([])
const similarGames = ref([])
const gameStats = ref(null)
const userLists = ref([])
const showAddToList = ref(false)
const reviewSortBy = ref('newest')
const showSpoilersOnly = ref(false)
const addToListRef = ref(null)

const userStore = useUserStore()
const currentUserId = computed(() => userStore.user?.id_user ?? null)
const { showToast } = useToastStore()

const releaseYear = computed(() => {
  const date = game.value?.release_date
  if (!date) return 'N/A'
  const year = new Date(date).getFullYear()
  return isNaN(year) ? 'N/A' : year
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const goToUserProfile = (username) => {
  if (username) router.push(`/u/${username}`)
}

const goToGenre = (genreName) => {
  router.push({ name: 'SearchResults', query: { q: genreName } })
}

const goToGame = (slug) => {
  router.push(`/game/${slug}`)
}

// Rating histogram computed
const ratingHistogram = computed(() => {
  if (!gameStats.value?.rating_distribution) return []
  const dist = gameStats.value.rating_distribution
  const maxCount = Math.max(...dist.map(d => Number(d.count)), 1)
  const allSteps = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
  return allSteps.map(rating => {
    const found = dist.find(d => parseFloat(d.rating) === rating)
    const count = found ? Number(found.count) : 0
    return { rating, count, percentage: Math.round((count / maxCount) * 100) }
  })
})

const statusDistributionSorted = computed(() => {
  const order = ['played', 'playing', 'plan_to_play', 'dropped']
  const dist = gameStats.value?.status_distribution || []
  return [...dist].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
})

// Review sort + filter
const filteredSortedReviews = computed(() => {
  let list = [...reviews.value]
  if (showSpoilersOnly.value) list = list.filter(r => r.has_spoilers)
  if (reviewSortBy.value === 'most_liked') {
    list.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  } else if (reviewSortBy.value === 'oldest') {
    list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } else {
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  return list
})

const displayedReviews = computed(() =>
  showAllReviews.value ? filteredSortedReviews.value : filteredSortedReviews.value.slice(0, 3)
)

// --- ACTIVITY ---

const saveActivity = async (payload) => {
  if (!game.value.id_game) return
  await api.post('/activity', { gameId: game.value.id_game, ...payload })
}

watch(userRating, async (newRating) => {
  if (!isFetchingActivity.value && game.value.id_game) {
    try {
      await saveActivity({ rating: newRating })
      showToast('Rating saved')
    } catch (err) {
      logger.error('Error saving rating:', err)
      showToast('Error saving rating', 'error')
    }
  }
})

const STATUS_LABELS = {
  playing: 'Now playing',
  played: 'Marked as played',
  plan_to_play: 'Added to backlog',
  dropped: 'Marked as dropped',
}

const updateStatus = async (status) => {
  const newStatus = userStatus.value === status ? null : status
  userStatus.value = newStatus
  try {
    await saveActivity({ status: newStatus })
    showToast(newStatus ? STATUS_LABELS[newStatus] : 'Status cleared')
  } catch (err) {
    logger.error('Error updating status:', err)
    showToast('Error updating status', 'error')
  }
}

const toggleGameLike = async () => {
  const oldVal = isGameLiked.value
  isGameLiked.value = !isGameLiked.value
  try {
    await saveActivity({ isFavorite: isGameLiked.value })
    showToast(isGameLiked.value ? 'Added to favorites' : 'Removed from favorites')
  } catch (err) {
    isGameLiked.value = oldVal
    logger.error('Error toggling game like:', err)
    showToast('Error saving like', 'error')
  }
}

const toggleReviewLike = async (review) => {
  const oldLiked = review.is_liked
  const oldLikes = review.likes || 0
  review.is_liked = !review.is_liked
  review.likes = review.is_liked ? oldLikes + 1 : oldLikes - 1
  try {
    await api.post(`/reviews/${review.id_review}/like`)
    showToast(review.is_liked ? 'Review liked' : 'Like removed')
  } catch (err) {
    review.is_liked = oldLiked
    review.likes = oldLikes
    logger.error('Error liking review:', err)
    showToast('Error liking review', 'error')
  }
}

// --- ADD TO LIST ---

const toggleAddToList = () => {
  showAddToList.value = !showAddToList.value
}

const addGameToList = async (listId) => {
  try {
    await api.post(`/lists/${listId}/games`, { gameId: game.value.id_game })
    showAddToList.value = false
    showToast('Added to list')
  } catch (err) {
    logger.error('Error adding to list:', err)
    showToast('Error adding to list', 'error')
  }
}

const handleOutsideClick = (e) => {
  if (addToListRef.value && !addToListRef.value.contains(e.target)) {
    showAddToList.value = false
  }
}

// --- FETCHING ---

const fetchGameDetail = async () => {
  try {
    const res = await api.get(`games/slug/${route.params.slug}`)
    game.value = res.data
  } catch (err) {
    logger.error('Error loading game:', err)
    if (err.response?.status === 404) router.replace('/')
  }
}

const fetchUserActivity = async (gameId) => {
  isFetchingActivity.value = true
  try {
    const res = await api.get(`activity/check/${gameId}`)
    if (res.data) {
      userStatus.value = res.data.status
      userRating.value = res.data.rating || 0
      isGameLiked.value = Boolean(res.data.is_favorite)
    }
  } catch (err) {
    logger.error('Error activity:', err)
  } finally {
    await nextTick()
    isFetchingActivity.value = false
  }
}

const fetchReviews = async (gameId) => {
  try {
    const res = await api.get(`reviews/game/${gameId}`)
    reviews.value = res.data.map(review => ({
      ...review,
      likes: review.likes || 0,
      showContent: !review.has_spoilers,
      is_reported: review.is_reported || false,
    }))
  } catch (err) { logger.error(err) }
}

const fetchGameExtras = async (gameId) => {
  try {
    const res = await api.get(`games/${gameId}/extras`)
    genres.value = res.data.genres || []
    similarGames.value = res.data.similarGames || []
  } catch (err) { logger.error('Error loading extras:', err) }
}

const fetchGameStats = async (gameId) => {
  try {
    const res = await api.get(`games/${gameId}/stats`)
    gameStats.value = res.data
  } catch (err) { logger.error('Error loading stats:', err) }
}

const fetchUserLists = async () => {
  if (!currentUserId.value) return
  try {
    const res = await api.get(`lists/user/${currentUserId.value}`)
    userLists.value = res.data
  } catch (err) { logger.error('Error loading lists:', err) }
}

const submitReview = async (data) => {
  if (!game.value.id_game) return
  try {
    await api.post('/reviews', {
      id_game: game.value.id_game,
      content: data.content,
      rating: data.rating,
      has_spoilers: data.has_spoilers,
    })
    showReviewModal.value = false
    await fetchReviews(game.value.id_game)
  } catch (err) { logger.error(err) }
}

const toggleSpoiler = (review) => { review.showContent = !review.showContent }
const toggleReport = (review) => {
  if (review.id_user === currentUserId.value) return
  selectedReviewId.value = review.id_review
  showReportModal.value = true
}
const closeReportModal = () => { showReportModal.value = false; selectedReviewId.value = null }
const submitReport = async (reason) => {
  try {
    await api.post(`/reviews/${selectedReviewId.value}/report`, { reason })
    const review = reviews.value.find(r => r.id_review === selectedReviewId.value)
    if (review) review.is_reported = true
    closeReportModal()
  } catch (err) { logger.error(err) }
}

onMounted(async () => {
  loadingGame.value = true
  document.addEventListener('click', handleOutsideClick)
  await userStore.fetchUser()
  await fetchGameDetail()

  document.title = game.value.title ? game.value.title + ' — Hitboxd' : 'Hitboxd'

  if (game.value.id_game) {
    const id = game.value.id_game
    await Promise.all([
      fetchReviews(id),
      fetchUserActivity(id),
      fetchGameExtras(id),
      fetchGameStats(id),
      fetchUserLists(),
    ])
  }
  loadingGame.value = false
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.loading-screen {
  display: flex; justify-content: center; align-items: center;
  height: 80vh;
}

.page-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #E3E4E8;
  color: #2d2d2d;
}

.game-detail-container {
  width: 100%;
  max-width: 1100px;
  margin: auto;
  padding-bottom: 4rem;
  position: relative;
  background-color: transparent;
  flex: 1;
  padding-top: 20px;
}

.bg-texture {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/bg-texture.webp'), url('/assets/bg-texture.jpg');
  background-repeat: repeat;
  background-size: 400px;
  opacity: 0.1;
  z-index: -1;
}

.card {
  background-color: #F2F3F5;
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.35);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 12px rgba(0,0,0,0.45);
}

/* HEADER */
.game-header-container {
  position: relative;
  width: 100%;
  margin: 0 -2rem 1rem -2rem;
}

.background-box {
  width: 100%;
  height: 380px;
  overflow: hidden;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.35);
  -webkit-mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
}

.background-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.header-content-overlay {
  position: absolute;
  bottom: -60px;
  left: 40px;
  display: flex;
  align-items: flex-end;
  gap: 20px;
}

.game-avatar-box {
  width: 180px;
  height: 240px;
  border: 5px solid #E3E4E8;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.4);
  position: relative;
}

.cover-mask-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, black 95%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 95%, transparent 100%);
}

.game-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-info-box {
  padding-bottom: 20px;
}

.game-title-header {
  font-family: 'Courier Prime', monospace;
  font-size: 3rem;
  color: white;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
  line-height: 1;
  margin: 0;
}

.info-text-header {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.85);
  text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
  margin: 5px 0 0 0;
}

.rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  background: rgba(0,0,0,0.45);
  padding: 4px 12px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.star-icon {
  color: #FFD700;
  font-size: 1rem;
}

.avg-value {
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.rating-sep {
  color: rgba(255,255,255,0.5);
}

.rating-total {
  color: rgba(255,255,255,0.8);
  font-size: 0.85rem;
}

/* GENRE CHIPS */
.genres-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 2rem;
  margin-top: 80px;
  margin-bottom: -60px;
}

.genre-chip {
  background: var(--brand-cyan, #00AEEF);
  color: white;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  user-select: none;
}

.genre-chip:hover {
  background: #0095CC;
  transform: scale(1.05);
}

/* MAIN CONTENT */
.content-box-main {
  display: flex;
  gap: 30px;
  margin-top: 80px;
  padding: 0 2rem;
}

.left-section {
  width: 60%;
}

.right-section {
  width: 40%;
  padding: 1.5rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1rem;
  min-height: 220px;
}

.activity-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  width: 100%;
}

.btn.status {
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  font-size: .9rem;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s, color 0.2s;
  background: #E5E7EB;
  color: #4B5563;
}

.btn.status:hover { transform: scale(1.05); }
.btn.status.active-status { transform: scale(1.05); }

.playing.active-status  { background: var(--brand-blue, #2196f3); color: white; }
.playing:hover:not(.active-status)  { background: var(--brand-blue, #2196f3); color: white; }
.played.active-status   { background: var(--brand-green, #10B981); color: white; }
.played:hover:not(.active-status)   { background: var(--brand-green, #10B981); color: white; }
.backlog.active-status  { background: var(--brand-yellow, #FBBF24); color: black; }
.backlog:hover:not(.active-status)  { background: var(--brand-yellow, #FBBF24); color: black; }
.dropped.active-status  { background: var(--brand-red, #EF4444); color: white; }
.dropped:hover:not(.active-status)  { background: var(--brand-red, #EF4444); color: white; }

/* ADD TO LIST */
.add-to-list-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.add-list-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: transparent;
  border: 1.5px solid #aaa;
  border-radius: 9999px;
  color: #555;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.add-list-btn:hover {
  border-color: var(--brand-cyan);
  color: var(--brand-cyan);
  background: rgba(0,174,239,0.06);
}

.list-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 180px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 100;
  padding: 4px;
}

.list-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  color: #2d2d2d;
  border-radius: 4px;
  transition: background 0.15s;
}

.list-option:hover { background: #f0f0f0; }

.no-lists {
  padding: 10px 12px;
  font-size: 0.82rem;
  color: #999;
  margin: 0;
}

/* STATS ROW */
.stats-row {
  display: flex;
  gap: 20px;
  padding: 0 2rem;
  margin-top: 1.5rem;
}

.stats-card {
  flex: 1;
}

.stats-card h3 {
  font-size: 0.8rem;
  letter-spacing: 1px;
  color: #777;
  margin: 0 0 1rem 0;
}

/* Histogram */
.histogram {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 80px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 4px;
}

.bar-track {
  width: 100%;
  height: 70px;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  background: var(--brand-cyan, #00AEEF);
  border-radius: 3px 3px 0 0;
  min-height: 2px;
  transition: height 0.4s ease;
}

.bar-label {
  font-size: 0.6rem;
  color: #888;
  white-space: nowrap;
}

/* Status distribution */
.status-dist {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-dist-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dist-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #555;
  width: 60px;
  flex-shrink: 0;
}

.status-dist-bar {
  flex: 1;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.status-dist-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.fill-played     { background: var(--brand-green, #10B981); }
.fill-playing    { background: var(--brand-blue, #2196f3); }
.fill-plan_to_play { background: var(--brand-yellow, #FBBF24); }
.fill-dropped    { background: var(--brand-red, #EF4444); }

.status-dist-pct {
  font-size: 0.75rem;
  color: #888;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}

/* REVIEWS */
.reviews-section {
  margin-top: 3rem;
  max-width: 100%;
  padding: 0 2rem;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reviews-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

.sort-buttons {
  display: flex;
  gap: 6px;
}

.sort-btn {
  padding: 5px 12px;
  background: transparent;
  border: 1.5px solid #ccc;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  color: #777;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.sort-btn:hover {
  border-color: var(--brand-cyan);
  color: var(--brand-cyan);
}

.sort-btn.active {
  background: var(--brand-cyan);
  border-color: var(--brand-cyan);
  color: white;
}

.spoiler-toggle.active {
  background: #8B5CF6;
  border-color: #8B5CF6;
  color: white;
}

.no-reviews {
  text-align: center;
  color: #999;
  padding: 2rem 0;
  font-size: 0.9rem;
}

.reviews-list { margin-top: 1rem; }

.show-all-btn {
  display: block;
  margin: 1rem auto 0;
  padding: 8px 24px;
  background: transparent;
  border: 1.5px solid var(--brand-cyan);
  color: var(--brand-cyan);
  border-radius: 9999px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
}

.show-all-btn:hover { background: var(--brand-cyan); color: white; }

.write-review-btn {
  background: var(--brand-cyan);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.15s;
}

.write-review-btn:hover { transform: scale(1.05); background-color: #0095CC; }

.review-card {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border-left: 3px solid var(--hover-color, var(--brand-cyan));
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.review-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.3); }

.reviews-list .review-card:nth-child(4n + 1) { --hover-color: var(--brand-red); }
.reviews-list .review-card:nth-child(4n + 2) { --hover-color: var(--brand-cyan); }
.reviews-list .review-card:nth-child(4n + 3) { --hover-color: var(--brand-green); }
.reviews-list .review-card:nth-child(4n)     { --hover-color: var(--brand-yellow); }

.review-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.review-rating-stars { margin-bottom: 0.5rem; }
.review-author strong { color: #2d2d2d; }
.clickable-author { cursor: pointer; text-decoration: underline; }

.review-text {
  margin: 0;
  line-height: 1.4;
  min-height: 50px;
}

.review-content-wrapper {
  position: relative;
  margin-top: 1rem;
  border-radius: 4px;
  overflow: hidden;
}

.review-content-wrapper.has-spoilers-hidden .review-text {
  filter: blur(5px);
  transition: filter 0.3s ease;
  user-select: none;
}

.spoiler-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(45,45,45,0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
}

.spoiler-btn {
  background-color: #2d2d2d;
  color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 10px 24px;
  border: 2px solid #888;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.spoiler-btn:hover { background-color: #444; border-color: #fff; transform: scale(1.05); }

.review-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
  gap: 10px;
}

.like-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;
  color: #888;
  transition: transform 0.2s, color 0.2s, background-color 0.2s;
  padding: 5px 8px;
  border-radius: 4px;
}

.like-btn:hover { background-color: rgba(0,0,0,0.05); transform: scale(1.1); }
.heart-icon { fill: #888; transition: fill 0.2s; }
.like-btn.liked { color: #ff4757; }
.like-btn.liked .heart-icon { fill: #ff4757; animation: heartPop 0.3s ease-out; }
.like-count { font-weight: 600; font-family: sans-serif; }

.report-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  padding: 5px 8px;
  border-radius: 4px;
  color: #999;
  transition: 0.2s;
}

.report-btn:hover { background-color: rgba(0,0,0,0.05); transform: scale(1.1); color: #e63946; }
.flag-icon { transition: 0.2s; }

/* ACTIVITY SECTION */
.activity-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.section-title { margin: 0; }

.fav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-btn:hover { background-color: rgba(0,0,0,0.05); transform: scale(1.1); }
.fav-btn:hover .fav-icon { color: #ff4757; transform: scale(1.1); }

.fav-icon {
  width: 28px;
  height: 28px;
  color: #ccc;
  transition: color 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fav-btn.is-active .fav-icon { color: #ff4757; transform: scale(1.1); }

/* SIMILAR GAMES */
.similar-section {
  margin-top: 3rem;
  padding: 0 2rem;
}

.similar-section h2 {
  margin-bottom: 1rem;
}

.similar-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.similar-carousel::-webkit-scrollbar { height: 4px; }
.similar-carousel::-webkit-scrollbar-track { background: transparent; }
.similar-carousel::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }

.similar-item {
  flex-shrink: 0;
  width: 110px;
  cursor: pointer;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.similar-cover {
  width: 110px;
  height: 147px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.similar-item:hover .similar-cover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.4);
}

.similar-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ANIMATIONS */
.rating-section { text-align: center; }
.game-title, .info-text { display: none; }

@keyframes heartPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.fade-in { animation: fadeIn 0.7s ease; }
.slide-up { animation: slideUp 0.6s ease; }
.slide-up-delay { animation: slideUp 0.8s ease; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
