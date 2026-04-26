<template>
  <div class="review-card">
    <div class="review-content">
      <div class="review-meta">
        <p class="review-user">@{{ review.user_name }}</p>

        <h3 class="review-game-title">{{ review.game_title }}</h3>

        <div class="rating-stars">
          <StarRating :modelValue="review.rating" disabled />
        </div>

        <p class="review-text">{{ review.review_text }}</p>
      </div>

      <div class="game-image-container">
        <img :src="gameImage" :alt="review.game_title" class="game-cover-mini" />
      </div>
    </div>
  </div>
</template>

<script setup>
// Importa el componente StarRating que tienes en tu estructura
import StarRating from "@/components/reviews/starRating.vue";
import { defineProps } from 'vue';

const props = defineProps({
  review: {
    type: Object,
    required: true,
    // Estructura esperada: { id, user_name, game_title, review_text, rating, ... }
  },
  gameImage: {
    type: String,
    required: false,
    default: '/assets/placeholder-cover.png' // Fallback si no hay imagen
  }
});
</script>

<style scoped>
.review-card {
  background: #bfbfbf; /* Color gris de placeholder del diseño */
  padding: 1rem;
  border-radius: 4px;
  color: #303030;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.review-card:hover {
    background: #a8a8a8;
}

.review-content {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.review-meta {
  flex-grow: 1;
}

.review-user {
  font-weight: bold;
  font-size: 0.8rem;
  margin-bottom: 3px;
  text-transform: uppercase;
}

.review-game-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.review-text {
  margin-top: 6px;
  font-size: 0.9rem;
  font-style: italic;
  max-height: 40px; /* Limita la altura para el extracto de dos líneas */
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Miniatura de la portada del juego a la derecha */
.game-image-container {
  width: 50px;
  height: 75px; /* Relación de aspecto 2:3 para la portada */
  background-color: #888;
  flex-shrink: 0;
  border-radius: 2px;
  overflow: hidden;
}

.game-cover-mini {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Estilos de responsividad para que la tarjeta se vea bien en diferentes tamaños */
@media (max-width: 500px) {
  .review-card {
    padding: 0.8rem;
  }
  .review-game-title {
    font-size: 1rem;
  }
  .review-text {
    font-size: 0.85rem;
  }
}
</style>
