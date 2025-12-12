<template>
  <button 
    @click="handleLogout" 
    :class="['btn-logout', { 'is-minimal': minimal }]"
    type="button"
  >
    <span v-if="!minimal">🚪 </span> 
    LOG OUT
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router';
import api from '@/api/axios';

defineProps({
  minimal: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();

const handleLogout = async () => {
  // 1. Try to notify backend
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error("Warning: Server did not respond to logout, forcing local logout.");
  }

  // 2. Local Cleanup
  // Asegúrate que esta variable de entorno exista, si no, usa un string fijo como 'token'
  const storageKey = import.meta.env.VITE_KEY_STORAGE || 'token';
  
  localStorage.removeItem(storageKey);
  sessionStorage.removeItem(storageKey);
  localStorage.removeItem('user_data'); 
  localStorage.removeItem('token'); // Por si acaso usas este nombre común también

  // 3. Redirect to Landing Page
  router.push('/login'); // O router.push('/') dependiendo de tu ruta pública
};
</script>

<style scoped>
/* Base Style (Red Button) */
.btn-logout {
  background-color: #FF4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  transition: background 0.2s;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-logout:hover {
  background-color: #CC0000;
}

/* Minimal Style (For Nav Dropdowns) */
.btn-logout.is-minimal {
  background-color: transparent;
  color: #2d2d2d;
  padding: 0;
  border-radius: 0;
  font-weight: 500;
  text-transform: none;
  font-size: 0.85rem;
  width: 100%;
  text-align: left;
  display: block;
}

.btn-logout.is-minimal:hover {
  background-color: transparent;
  color: #00AEEF;
}
</style>