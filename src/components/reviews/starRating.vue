<template>
  <div 
    class="star-wrap" 
    :class="{ 'disabled-cursor': disabled }"
    @mouseleave="resetHover"
  >
    <span
      v-for="n in 5"
      :key="n"
      class="star"
      :class="{ 
        'active': n <= (disabled ? modelValue : (hoverValue || modelValue))
      }"
      @click="disabled ? null : update(n)"
      @mouseover="disabled ? null : setHover(n)"
    >★</span>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  disabled: Boolean
});

const emit = defineEmits(["update:modelValue"]);

const hoverValue = ref(0);

const setHover = (value) => {
  hoverValue.value = value;
};

const resetHover = () => {
  hoverValue.value = 0;
};

const update = (value) => {
  // Deseleccionar el rating
  const newRating = value === props.modelValue ? 0 : value;
  emit("update:modelValue", newRating);
};
</script>

<style scoped>
.star-wrap {
  font-size: 1.6rem;
  /* CAMBIO CLAVE: Color base (estrella vacía) gris claro */
  color: #c9c9c9; 
  cursor: pointer;
  display: inline-flex; 
}

.star-wrap.disabled-cursor {
  cursor: default;
}

.star {
  margin: 0 3px;
  transition: color 0.15s ease;
}

.active {
  /* Color de estrella llena */
  color: var(--brand-cyan, #00AEEF); 
}
</style>