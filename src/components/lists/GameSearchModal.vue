<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Select a Game</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <input 
        v-model="searchQuery" 
        @input="searchGames" 
        type="text" 
        placeholder="Type to search..." 
        class="search-input"
        ref="searchInputRef"
      />

      <div class="results-list">
        <div v-if="isSearching" class="loading-text">Searching...</div>

        <div 
          v-for="game in searchResults" 
          :key="game.id_game || game.id" 
          class="result-item" 
          @click="selectGame(game)"
        >
          <img :src="game.cover_url || 'https://via.placeholder.com/90x128'" alt="Cover" />
          <div class="game-info">
            <span class="game-name">{{ game.title || game.name }}</span>
            <span class="game-year">
              {{ formatYear(game.release_date || game.first_release_date) }}
            </span>
          </div>
        </div>
        
        <div v-if="!isSearching && searchQuery.length > 2 && searchResults.length === 0" class="no-results">
          No games found.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import api from '@/api/axios.js' // Asegúrate que la ruta sea correcta

// Definimos los eventos que este componente envía al padre
const emit = defineEmits(['close', 'select-game'])

const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const searchInputRef = ref(null)
let searchTimeout = null

// Enfocar el input automáticamente al abrir
onMounted(() => {
  nextTick(() => {
    searchInputRef.value?.focus()
  })
})

const formatYear = (dateString) => {
  if (!dateString) return ''
  if (typeof dateString === 'number') {
    return new Date(dateString * 1000).getFullYear()
  }
  return new Date(dateString).getFullYear()
}

const searchGames = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    isSearching.value = true
    try {
      const { data } = await api.get('/games/search', { 
        params: { q: searchQuery.value } 
      })
      
      searchResults.value = data.map(game => ({
        ...game,
        cover_url: game.cover_url 
          ? game.cover_url.replace('t_thumb', 't_cover_big') 
          : 'https://via.placeholder.com/90x128?text=No+Cover',
        year: game.release_date 
          ? new Date(game.release_date).getFullYear() 
          : 'N/A'
      }))
      
    } catch (error) {
      console.error('Error buscando juegos:', error)
    } finally {
      isSearching.value = false
    }
  }, 500)
}

const selectGame = (game) => {
  // Enviamos el juego seleccionado al padre
  emit('select-game', game)
}
</script>

<style scoped>
/* ESTILOS EXCLUSIVOS DEL MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #2c2c2c;
  width: 400px;
  max-height: 80vh;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h3 {
  color: #fff;
  margin: 0;
  font-weight: 400;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
}

.search-input {
  width: 100%;
  padding: 12px;
  background: #1f1f1f;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  font-size: 15px;
  margin-bottom: 15px;
  box-sizing: border-box; /* Importante para que no se salga */
}

.search-input:focus {
  outline: 2px solid #00cc66;
  border-color: transparent;
}

.loading-text {
  color: #888;
  text-align: center;
  padding: 10px;
  font-size: 13px;
}

.results-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  background: #333;
  transition: background 0.2s;
}

.result-item:hover {
  background: #444;
}

.result-item img {
  width: 40px;
  height: 56px;
  object-fit: cover;
  border-radius: 2px;
}

.game-info {
  display: flex;
  flex-direction: column;
}

.game-name {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.game-year {
  color: #888;
  font-size: 12px;
}

.no-results {
  color: #888;
  text-align: center;
  margin-top: 20px;
}
</style>