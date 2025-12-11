<template>
  <div class="page-wrapper">

    <div class="game-detail-container">
      <div class="bg-texture"></div>

      <div class="cover-box fade-in">
        <img :src="game.cover_url" class="cover-img" alt="Game Cover" />
      </div>

      <div class="content-box slide-up">

        <div class="left-section">
          <h1 class="game-title">{{ game.title }}</h1>

          <p class="info-text">
            <strong>Developer:</strong> {{ game.developer || 'Unknown' }} •
            <strong>Release year:</strong> {{ releaseYear }}
          </p>

          <div class="description-box card">
            <h3>GAME DESCRIPTION</h3>
            <p>{{ game.description || "No description available." }}</p>
          </div>
        </div>

        <div class="right-section card">
          <h3 class="section-title">MY ACTIVITY</h3>

          <div class="activity-buttons">
            <button class="btn status played">Played</button>
            <button class="btn status pending">Pending</button>
            <button class="btn status abandoned">Abandoned</button>
          </div>

          <div class="rating-section">
            <p>Rate</p>
            <StarRating v-model="userRating" />
          </div>
        </div>
      </div>

      <div class="reviews-section slide-up-delay">
        <div class="reviews-header">
          <h2>REVIEWS</h2>
          <button class="write-review-btn" @click="showReviewModal = true">
            WRITE A REVIEW
          </button>
        </div>

        <div class="reviews-list">
          <div
            v-for="review in reviews"
            :key="review.id"
            class="review-card card fade-in"
          >
            <p class="review-text">{{ review.text }}</p>
            <StarRating :model-value="review.rating" disabled />
          </div>
        </div>
      </div>

      <ReviewModal
        v-if="showReviewModal"
        @close="showReviewModal = false"
        @submit="submitReview"
      />

    </div> <Footer />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/axios.js'

import ReviewModal from '@/components/reviews/reviewModal.vue'
import StarRating from '@/components/reviews/starRating.vue'
import Footer from '@/components/common/Footer.vue'

const game = ref({})
const reviews = ref([])
const userRating = ref(0)
const showReviewModal = ref(false)

const releaseYear = computed(() => {
  const date = game.value?.release_date;
  if (!date) return "N/A";

  const year = new Date(date).getFullYear();
  return isNaN(year) ? "N/A" : year;
});

const route = useRoute()

const fetchGameDetail = async () => {
  try {
    const res = await api.get(`games/${route.params.id}`)
    game.value = res.data
  } catch (err) {
    console.error("Error loading game:", err)
  }
}

const fetchReviews = async () => {
  try {
    const res = await api.get(`reviews/game/${route.params.id}`)
    reviews.value = res.data
  } catch (err) {
    console.error("Error loading reviews:", err)
  }
}

const submitReview = async (data) => {
  try {
    await api.post('/reviews', {
      id_game: route.params.id,
      ...data
    })

    showReviewModal.value = false
    fetchReviews()
  } catch (err) {
    console.error("Error submitting review:", err)
  }
}

onMounted(() => {
  fetchGameDetail()
  fetchReviews()
})
</script>

<style scoped>
/* Wrapper opcional para asegurar flujo */
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.game-detail-container {
  width: 100%;
  max-width: 1100px;
  margin: auto;
  padding: 2rem; /* Este padding ya no afectará al footer */
  padding-bottom: 4rem; /* Espacio extra antes del footer si quieres */
  position: relative;
  color: var(--text-main);
  flex: 1; /* Esto empuja el footer hacia abajo si hay poco contenido */
}

/* --- BACKGROUND --- */
.bg-texture {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url('/assets/bg-texture.jpg');
  background-size: 400px;
  opacity: 0.1;
  z-index: -1;
}

/* --- GAME COVER --- */
.cover-box {
  width: 100%;
  height: 340px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0,0,0,0.35);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
}

/* --- CONTENT AREA --- */
.content-box {
  display: flex;
  gap: 30px;
  margin-top: 2rem;
}

.left-section {
  width: 60%;
}

.right-section {
  width: 40%;
  background: var(--card-bg);
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

/* --- TITLES --- */
.game-title {
  font-family: 'Courier Prime', monospace;
  font-size: 2.6rem;
  margin-bottom: .5rem;
}

.info-text {
  color: #555;
  margin-bottom: 1.5rem;
}

/* — CARDS —*/
.card {
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.35);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 12px rgba(0,0,0,0.45);
}

/* --- ACTIVITY BUTTONS --- */
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
  transition: transform 0.15s ease;
}

.btn.status:hover {
  transform: scale(1.05);
}

.played { background: var(--brand-green); color: white; }
.pending { background: var(--brand-yellow); color: black; }
.abandoned { background: var(--brand-red); color: white; }

/* --- REVIEWS --- */
.reviews-section {
  margin-top: 3rem;
  max-width: 100%;
}

.reviews-list {
  margin-top: 1rem;
  max-height: 350px;
  overflow-y: auto;
  padding-right: 10px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.write-review-btn {
  background: var(--brand-cyan);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.15s;
}

.write-review-btn:hover {
  transform: scale(1.05);
  background-color: #0095CC;
}

.review-card {
  background: var(--card-bg);
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform .2s ease;
}

.review-card:hover {
  transform: translateY(-3px);
}

/* --- ANIMATIONS --- */
.fade-in {
  animation: fadeIn 0.7s ease;
}

.slide-up {
  animation: slideUp 0.6s ease;
}

.slide-up-delay {
  animation: slideUp 0.8s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
