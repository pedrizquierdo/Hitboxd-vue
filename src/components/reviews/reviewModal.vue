<template>
  <div class="modal-backdrop" @click.self="close">

    <div class="modal-box">
      <h3>YOUR REVIEW</h3>

      <textarea
        v-model="content"
        class="review-input"
        placeholder="Write your thoughts..."
      ></textarea>

      <div class="rating-block">
        <p>RATING</p>
        <StarRating v-model="rating" />
      </div>

      <button class="submit-btn" @click="submit">SUBMIT</button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import StarRating from './starRating.vue';

const emit = defineEmits(["close", "submit"]);

// Cambiado de 'text' a 'content' para coincidir con el backend
const content = ref(""); 
const rating = ref(0);

const close = () => emit("close");

const submit = () => {
  if (!content.value.trim()) return;

  // Enviamos los datos con los nombres esperados por el controlador: content y rating
  emit("submit", {
    content: content.value, 
    rating: rating.value,
  });
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-box {
  /* Fondo consistente con el diseño gris/blanco */
  background: #d3d3d3; 
  width: 450px;
  padding: 2rem;
  border-radius: 6px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.review-input {
  width: 100%;
  height: 120px;
  background: #c0c0c0;
  border: none;
  padding: 10px;
  font-size: .9rem;
  resize: none;
  border-radius: 4px;
}

.rating-block {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
}

.submit-btn {
  margin-top: 1rem;
  padding: 8px 16px;
  background: var(--brand-cyan);
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.15s;
}

.submit-btn:hover {
    transform: scale(1.02);
    background-color: #0095CC;
}
</style>