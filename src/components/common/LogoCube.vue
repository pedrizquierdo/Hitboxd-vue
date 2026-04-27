<template>
  <svg
    :width="size"
    :height="Math.round(size * 1.16)"
    viewBox="0 0 100 116"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ spinning: animated }"
    aria-hidden="true"
  >
    <polygon points="50,10 93.3,35 50,60 6.7,35" fill="#38B6FF" />

    <polygon points="6.7,35 50,60 50,110 6.7,85" fill="#FF3131" />

    <polygon points="50,60 93.3,35 93.3,85 50,110" fill="#00D26A" />

    <polygon points="65,58.3 78.3,50.7 78.3,66.7 65,74.3" fill="#FFDE59" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 100 },
  animated: { type: Boolean, default: false },
})
</script>

<style scoped>
@keyframes cube-spin {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}

.spinning {
  animation: cube-spin 3s linear infinite;
  transform-origin: center;
  transform-style: preserve-3d;
}

@media (prefers-reduced-motion: reduce) {
  .spinning {
    animation: none;
  }
}
</style>
