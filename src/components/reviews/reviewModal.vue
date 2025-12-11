<template>
  <div class="modal-backdrop" @click.self="close">

    <div class="modal-box">
      <h3>YOUR REVIEW</h3>

      <textarea
        v-model="text"
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

const text = ref("");
const rating = ref(0);

const close = () => emit("close");

const submit = () => {
  if (!text.value.trim()) return;

  emit("submit", {
    text: text.value,
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
  background: #d3d3d3;
  width: 450px;
  padding: 2rem;
  border-radius: 6px;
  text-align: center;
}

.review-input {
  width: 100%;
  height: 120px;
  background: #c0c0c0;
  border: none;
  padding: 10px;
  font-size: .9rem;
}

.submit-btn {
  margin-top: 1rem;
  padding: 8px 16px;
  background: var(--brand-cyan);
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}
</style>
