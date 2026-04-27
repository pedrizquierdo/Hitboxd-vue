<template>
  <svg
    :width="size"
    :height="Math.round(size * 1.16)"
    viewBox="0 0 100 116"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ spinning: animated }"
    aria-hidden="true"
  >
    <!-- top face -->
    <polygon points="50,7 93,31 50,55 7,31"   fill="#4FC3F7" />
    <!-- left face -->
    <polygon points="7,31 50,55 50,107 7,83"  fill="#EF5350" />
    <!-- right face -->
    <polygon points="50,55 93,31 93,83 50,107" fill="#4CAF50" />
    <!-- yellow diamond — geometric centre of right face (71.5, 69) -->
    <polygon points="71.5,62 76,66 71.5,75 67,71" fill="#FDD835" />
  </svg>
</template>

<script setup>
defineProps({
  size:     { type: Number, default: 40 },
  animated: { type: Boolean, default: false },
});
</script>

<style scoped>
@keyframes cube-spin {
  0%   { transform: scaleX(1);  filter: brightness(1); }
  25%  { transform: scaleX(0);  filter: brightness(1); }
  26%  { transform: scaleX(-1); filter: brightness(0.85); }
  50%  { transform: scaleX(1);  filter: brightness(0.85); }
  75%  { transform: scaleX(0);  filter: brightness(0.85); }
  76%  { transform: scaleX(1);  filter: brightness(1); }
  100% { transform: scaleX(1);  filter: brightness(1); }
}

.spinning {
  animation: cube-spin 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  transform-origin: center;
}

@media (prefers-reduced-motion: reduce) {
  .spinning { animation: none; }
}
</style>
