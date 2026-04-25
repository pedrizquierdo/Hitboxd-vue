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
    ><svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></span>
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