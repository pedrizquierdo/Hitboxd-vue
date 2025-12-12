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
          
          <div class="activity-header-row">
            <h3 class="section-title">MY ACTIVITY</h3>

            <button 
              class="fav-btn" 
              :class="{ 'is-active': isFavorite }" 
              @click="toggleFavorite"
              title="Añadir a favoritos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="fav-icon">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </button>
          </div>
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
            
            <div 
              class="review-content-wrapper"
              :class="{ 'has-spoilers-hidden': review.has_spoilers && !review.showContent }"
            >
                <p class="review-text">{{ review.content || review.text || 'No content provided.' }}</p>

                <div 
                    v-if="review.has_spoilers && !review.showContent" 
                    class="spoiler-overlay"
                >
                    <button 
                        class="spoiler-btn"
                        @click.stop="toggleSpoiler(review)"
                        title="Click para revelar spoilers"
                    >
                        SPOILERS
                    </button>
                </div>
            </div>
            
            <div class="review-actions">
                <button 
                class="like-btn" 
                :class="{ 'liked': review.is_liked }" 
                @click="toggleLike(review)"
                title="Like this review"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span class="like-count">{{ review.likes || 0 }}</span>
              </button>

              <button
                v-if="review.id_user !== currentUserId"
                class="report-btn"
                :class="{ 'reported': review.is_reported }"
                @click="toggleReport(review)"
                title="Report this review"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                  viewBox="0 0 24 24" class="flag-icon">
                  <path d="M3 3v18h2v-6h4l1 2h7V5h-7l-1-2H3z"/>
                </svg>
              </button>

            </div>
          </div>
        </div>
      </div>

      <ReviewModal 
        v-if="showReviewModal"
        @close="showReviewModal = false" 
        @submit="submitReview"
      />

      <ReportModal 
        v-if="showReportModal"
        @close="closeReportModal"
        @submit="submitReport"
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
import ReportModal from '@/components/reviews/reportModal.vue'
import Footer from '@/components/common/PageFooter.vue'
import Nav from '@/components/common/Nav.vue'

const game = ref({})
const reviews = ref([])
const userRating = ref(0)
const showReviewModal = ref(false)
const showReportModal = ref(false)
const isFavorite = ref(false)
const selectedReviewId = ref(null)
const userStatus = ref(null) 

const currentUserId = Number(localStorage.getItem("user_id"));

const releaseYear = computed(() => {
  const date = game.value?.release_date;
  if (!date) return "N/A";
  
  const year = new Date(date).getFullYear();
  return isNaN(year) ? "N/A" : year;
});

const route = useRoute()

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
    reviews.value = res.data.map(review => ({
      ...review,
      showContent: !review.has_spoilers, 
      is_reported: review.is_reported || false
    }))
  } catch (err) {
    console.error("Error loading reviews:", err)
  }
}

// 2. Función para cargar el estado del usuario (Status, Rating y Favorito)
const fetchUserActivity = async () => {
  try {
    // Usamos el endpoint checkStatus que ya tienes en el backend
    const res = await api.get(`activity/check/${route.params.id}`)
    
    if (res.data) {
      // Sincronizamos los datos del backend con el frontend
      userStatus.value = res.data.status
      userRating.value = res.data.rating
      // Convertimos a booleano por seguridad (0/1 a false/true)
      isFavorite.value = Boolean(res.data.is_favorite)
    }
  } catch (err) {
    console.error("Error cargando actividad del usuario:", err)
  }
}

const submitReview = async (data) => {
  try {
    const payload = {
        id_game: route.params.id, 
        content: data.content,      
        rating: data.rating,  
        has_spoilers: data.has_spoilers, 
    };
    
    await api.post('/reviews', payload)

    showReviewModal.value = false
    await fetchReviews() 

  } catch (err) {
    console.error("Error submitting review:", err)
  }
}

const toggleSpoiler = (review) => {
    review.showContent = !review.showContent; 
}

const toggleLike = async (review) => {
    const previousLikedState = review.is_liked;
    const previousLikesCount = review.likes || 0;

    review.is_liked = !review.is_liked;
    review.likes = review.is_liked 
        ? previousLikesCount + 1 
        : previousLikesCount - 1;

    try {
        await api.post(`/reviews/${review.id_review}/like`);
    } catch (err) {
        console.error("Error toggling like:", err);
        review.is_liked = previousLikedState;
        review.likes = previousLikesCount;
    }
}

const toggleReport = (review) => {
    if (review.id_user === currentUserId) return; 

    selectedReviewId.value = review.id_review
    showReportModal.value = true
}

// 3. Función para activar/desactivar el corazón
const toggleFavorite = async () => {
  // Cambio optimista (cambia la UI inmediatamente antes de que responda el servidor)
  isFavorite.value = !isFavorite.value

  try {
    // Enviamos solo lo necesario, el backend usará COALESCE para mantener el status/rating actual
    await api.post('/activity', {
      gameId: route.params.id,
      isFavorite: isFavorite.value
    })
  } catch (err) {
    // Si falla, revertimos el cambio visual
    isFavorite.value = !isFavorite.value
    console.error("Error actualizando favorito:", err)
  }
}

const closeReportModal = () => {
    showReportModal.value = false
    selectedReviewId.value = null
}

const submitReport = async (reason) => {
    try {
      await api.post(`/reviews/${selectedReviewId.value}/report`, {
        reason: reason
      })

      // Actualizar la review marcada como reportada
      const review = reviews.value.find(r => r.id_review === selectedReviewId.value)
      if (review) review.is_reported = true

      closeReportModal()
    } catch (err) {
      console.error("Error sending report:", err)
    }
}

onMounted(() => {
  fetchGameDetail()
  fetchReviews()
  fetchUserActivity()
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
    padding: 0; 
    margin: 0; 
    min-height: 50px;
}

/* --- ESTILOS PARA EL EFECTO SPOILER (BLUR Y OVERLAY) --- */

.review-content-wrapper {
    position: relative;
    margin-top: 1rem;
    border-radius: 4px;
    overflow: hidden; 
}

/* Aplica el filtro blur al texto cuando los spoilers están ocultos */
.review-content-wrapper.has-spoilers-hidden .review-text {
    filter: blur(5px);
    transition: filter 0.3s ease;
    user-select: none; 
}

/* El overlay */
.spoiler-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(45, 45, 45, 0.95); /* Fondo oscuro casi sólido */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
}

/* BOTÓN SPOILER ESTILIZADO */
.spoiler-btn {
    background-color: #2d2d2d; /* Fondo oscuro que contraste un poco */
    color: #ffffff;
    font-size: 0.9rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 10px 24px;
    border: 2px solid #888; /* Contorno gris */
    border-radius: 50px; /* Borde completamente redondo (pill shape) */
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.spoiler-btn:hover {
    background-color: #444; /* Un poco más claro al hover */
    border-color: #fff; /* Borde blanco al hover para resaltar */
    transform: scale(1.05);
}

/* --- ESTILOS PARA BOTONES DE ACCIÓN (LIKE) --- */

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

.like-btn:hover {
    background-color: rgba(0,0,0,0.05);
    transform: scale(1.1);
}

.heart-icon {
    fill: #888; 
    transition: fill 0.2s;
}

.like-btn.liked {
    color: #ff4757; 
}

.like-btn.liked .heart-icon {
    fill: #ff4757;
    animation: heartPop 0.3s ease-out;
}

.like-count {
    font-weight: 600;
    font-family: sans-serif;
}

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

.report-btn:hover {
  background-color: rgba(0,0,0,0.05);
  transform: scale(1.1);
  color: #e63946;
}

.report-btn.reported {
  color: #e63946;
  cursor: default;
}

.flag-icon {
  transition: 0.2s;
}

/* Contenedor para alinear Título y Corazón */
.activity-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem; /* Espacio antes de los botones de status */
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0; /* Opcional: una línea separadora sutil */
}

.section-title {
  margin: 0; /* Quitamos margen para que se alinee bien con el botón */
}

/* El botón del corazón */
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

.fav-btn:hover {
  background-color: rgba(0,0,0,0.05);
  transform: scale(1.1);
}

.fav-icon {
  width: 28px;
  height: 28px;
  color: #ccc; /* Color gris cuando está desactivado */
  transition: color 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Estado Activo (Like) */
.fav-btn.is-active .fav-icon {
  color: #ff4757; /* Rojo corazón */
  transform: scale(1.1);
}

@keyframes heartPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* ESTILOS PARA ANIMACIONES */
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