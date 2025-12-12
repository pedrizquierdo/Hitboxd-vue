<template>
  <button 
    @click="handleLogout" 
    :class="['btn-logout', { 'is-minimal': minimal }]"
    type="button"
  >
    <span v-if="!minimal">🚪 </span> 
    Cerrar Sesión
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router';
import api from '@/api/axios';

// Recibimos una propiedad para saber si debe verse como texto simple o botón
defineProps({
  minimal: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();

const handleLogout = async () => {
  // 1. Intentar avisar al backend (para borrar cookie HttpOnly)
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error("Aviso: El servidor no respondió al logout, forzando cierre local.");
  }

  // 2. Limpieza Local (Usando tu variable de entorno)
  const storageKey = import.meta.env.VITE_KEY_STORAGE;
  
  // Limpiamos ambos por seguridad (ya que tu login usa uno u otro según 'Remember me')
  localStorage.removeItem(storageKey);
  sessionStorage.removeItem(storageKey);
  
  // Limpiamos cualquier rastro de usuario
  localStorage.removeItem('user_data'); 

  // 3. Redirigir al Login (o al Landing)
  router.push('/login');
};
</script>

<style scoped>
/* Estilo Base (Botón Rojo para Settings) */
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

/* Estilo Minimal (Texto plano para el Nav Dropdown) */
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
  color: #00AEEF; /* Tu color cyan de marca */
}
</style>