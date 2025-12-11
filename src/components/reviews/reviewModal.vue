<template>
  <div class="modal-backdrop" @click.self="close">

    <div class="modal-box">
      <h3>YOUR REVIEW</h3>

      <textarea
        v-model="content"
        class="review-input"
        placeholder="Share your opinion about this game!"
      ></textarea>

      <div class="rating-block">
        <p>RATING</p>
        <StarRating v-model="rating" />
      </div>

      <div class="spoiler-block">
          <input type="checkbox" id="hasSpoilers" v-model="hasSpoilers">
          <label for="hasSpoilers">⚠️ Esta reseña contiene Spoilers</label>
      </div>
      <button class="submit-btn" @click="submit">SUBMIT</button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import StarRating from './starRating.vue';

const emit = defineEmits(["close", "submit"]);

const content = ref(""); 
const rating = ref(0);
// NUEVA VARIABLE: Para manejar si contiene spoilers
const hasSpoilers = ref(false); 

const close = () => emit("close");

const submit = () => {
  if (!content.value.trim()) return;

  // Enviamos los datos con los nombres esperados por el controlador: content, rating y has_spoilers
  emit("submit", {
    content: content.value, 
    rating: rating.value,
    has_spoilers: hasSpoilers.value, // <- NUEVO DATO
  });

  // Opcional: limpiar los campos después de enviar
  content.value = "";
  rating.value = 0;
  hasSpoilers.value = false;
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
  z-index: 1000; /* Asegurar que esté encima de todo */
}

.modal-box {
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

/* NUEVOS ESTILOS PARA SPOILERS */
.spoiler-block {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    font-size: 0.9rem;
}

.spoiler-block input[type="checkbox"] {
    transform: scale(1.3);
    cursor: pointer;
}

.spoiler-block label {
    font-weight: 500;
}
/* FIN NUEVOS ESTILOS */

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