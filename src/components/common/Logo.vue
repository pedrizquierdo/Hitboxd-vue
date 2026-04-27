<template>
  <router-link :to="destination" class="logo-link">
    <div class="logo-container">
      <LogoCube :size="32" :animated="false" />
      <span class="brand-name">Hitboxd</span>
    </div>
  </router-link>
</template>

<script setup>
defineOptions({ name: 'HitboxdLogo' });

import { computed } from 'vue';
import LogoCube from '@/components/common/LogoCube.vue';

const destination = computed(() => {
  const storageKey = import.meta.env.VITE_KEY_STORAGE
  const token = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
  return token ? '/home' : '/';
});
</script>

<style scoped>
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

.brand-name {
  position: relative;
  top: 1px;
}
</style>
