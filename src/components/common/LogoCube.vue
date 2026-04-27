<template>
  <svg
    :width="size"
    :height="Math.round(size * 1.05)"
    viewBox="0 0 100 105"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ spinning: animated }"
    aria-hidden="true"
  >
    <polygon points="50,15 85,35 50,55 15,35" fill="#4FC3F7" />
    <polygon points="15,35 50,55 50,90 15,70" fill="#EF5350" />
    <polygon points="50,55 85,35 85,70 50,90" fill="#4CAF50" />
    <polygon points="67,56 72,59 67,62 62,59"  fill="#FDD835" />
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
  .spinning {
    animation: none;
  }
}
</style>
