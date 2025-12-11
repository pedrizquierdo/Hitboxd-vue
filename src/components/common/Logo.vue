<template>
  <router-link :to="destination" class="logo-link">
    <div class="logo-container">
      <span class="cube-icon">
        <img src="/assets/logo.png" alt="Hitboxd Logo" class="logo-img"/>
      </span>
      <span class="brand-name">Hitboxd</span>
    </div>
  </router-link>
</template>

<script setup>
defineOptions({ name: 'HitboxdLogo' });

import { computed } from 'vue';

const destination = computed(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // ✅ CORRECCIÓN: Si hay token, va al path '/home' de la ruta HomeFeed
    return token ? '/home' : '/';
});
</script>

<style scoped>
/* (Styles remain the same) */
.logo-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 1.3rem;
  color: #2D2D2D;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.5px;
}

.logo-img {
  width: 32px;
  height: auto;
  display: block;
}

.brand-name {
  position: relative;
  top: 1px;
}
</style>
