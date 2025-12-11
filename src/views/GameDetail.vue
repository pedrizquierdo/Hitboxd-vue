<template>
  <div class="page-wrapper">

    <Nav />
    
    <div class="game-detail-container">
      <div class="bg-texture"></div>

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
          </div>

        </div>
      </div>
      <div class="content-box-main slide-up">

        <div class="left-section">
          
          <div class="description-box card">
            <h3>GAME DESCRIPTION</h3>
            <p>{{ game.description || "No description available." }}</p>
          </div>
        </div>

        <div class="right-section card">
          <h3 class="section-title">MY ACTIVITY</h3>

          <div class="activity-buttons">
            <button 
              class="btn status played" 
              :class="{ 'active-status': userStatus === 'played' }"
              @click="setUserStatus('played')"
            >
              Played
            </button>
            
            <button 
              class="btn status pending" 
              :class="{ 'active-status': userStatus === 'pending' }"
              @click="setUserStatus('pending')"
            >
              Pending
            </button>
            
            <button 
              class="btn status abandoned" 
              :class="{ 'active-status': userStatus === 'abandoned' }"
              @click="setUserStatus('abandoned')"
            >
              Abandoned
            </button>
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
            :key="review.id_review"
            class="review-card card fade-in"
          >
            <div class="review-meta">
              <span class="review-author">Reviewed by <strong>{{ review.username || 'Anonymous' }}</strong></span> 
              <span class="review-date">{{ formatDate(review.created_at) }}</span>
            </div>
            
            <div class="review-rating-stars">
              <StarRating :model-value="review.rating" disabled />
            </div>
            
            <p class="review-text">{{ review.content || review.text || 'No content provided.' }}</p>

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
import Nav from '@/components/common/Nav.vue'

const game = ref({})
const reviews = ref([])
const userRating = ref(0)
const showReviewModal = ref(false)
const userStatus = ref(null) 

const releaseYear = computed(() => {
  const date = game.value?.release_date;
  if (!date) return "N/A";
  
  const year = new Date(date).getFullYear();
  return isNaN(year) ? "N/A" : year;
});

const route = useRoute()

// Función de utilidad para formatear la fecha
const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

const setUserStatus = (status) => {
  userStatus.value = userStatus.value === status ? null : status;
  console.log('Nuevo estado de juego:', userStatus.value);
}

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
    const payload = {
        id_game: route.params.id, 
        content: data.content,     
        rating: data.rating,       
    };
    
    await api.post('/reviews', payload)

    showReviewModal.value = false
    await fetchReviews()

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
  background-image: url('/assets/bg-texture.jpg');
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

.game-header-container {
    position: relative;
    width: 100%;
    margin: 0 -2rem 1rem -2rem; 
}

.background-box {
    width: 100%;
    height: 300px; 
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
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
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
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
    line-height: 1;
    margin: 0;
}

.info-text-header {
    font-size: 1.1rem;
    color: #2D2D2D; 
    margin: 5px 0 0 0;
}

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

.game-title, .info-text {
  display: none; 
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

.btn.status:hover {
  transform: scale(1.05);
}

.btn.status.active-status {
    transform: scale(1.05);
}

.played.active-status {
    background: var(--brand-green); 
    color: white;
}
.pending.active-status {
    background: var(--brand-yellow); 
    color: black; 
}
.abandoned.active-status {
    background: var(--brand-red); 
    color: white;
}

.played:hover:not(.active-status) { 
    background: var(--brand-green); 
    color: white; 
}
.pending:hover:not(.active-status) { 
    background: var(--brand-yellow); 
    color: black; 
}
.abandoned:hover:not(.active-status) { 
    background: var(--brand-red); 
    color: white; 
}

.reviews-section {
  margin-top: 3rem;
  max-width: 100%;
  padding: 0 2rem; 
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
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform .2s ease;
}

.review-card:hover {
  transform: translateY(-3px);
}

.review-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #555;
    margin-bottom: 0.5rem;
}

.review-rating-stars {
    margin-bottom: 0.5rem;
}

.review-author strong {
    color: #2d2d2d;
}

.review-text {
    margin-top: 0.5rem;
    line-height: 1.4;
}

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