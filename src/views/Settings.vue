<template>
  <div class="settings-page">
    <Nav />

    <div class="settings-container">
      
      <div class="header-section">
        <h1>Account Settings</h1>
        
        <div class="tabs-row">
          <div class="tabs-left">
            <a 
              v-for="tab in tabs" 
              :key="tab"
              href="#" 
              :class="{ active: activeTab === tab }"
              @click.prevent="activeTab = tab"
            >
              {{ tab }}
            </a>
          </div>
          <div class="tabs-right">
            <a href="#" class="deactivate-link">DEACTIVATE ACCOUNT</a>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'PROFILE'" class="content-grid">
        
        <div class="form-column">
          <h3>Profile</h3>

          <div class="form-group">
            <label>Username</label>
            <input v-model="formData.username" type="text" placeholder="Username" />
            <span class="edit-icon">✎</span> 
          </div>

          <div class="row-group">
            <div class="form-group half">
              <label>Given name</label>
              <input v-model="formData.given_name" type="text" />
            </div>
            <div class="form-group half">
              <label>Family Name</label>
              <input v-model="formData.family_name" type="text" />
            </div>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input v-model="formData.email" type="email" disabled class="disabled-input" />
          </div>

          <div class="row-group">
            <div class="form-group half">
              <label>Location</label>
              <input v-model="formData.location" type="text" />
            </div>
            <div class="form-group half">
              <label>Website</label>
              <input v-model="formData.website" type="text" />
            </div>
          </div>

          <div class="form-group">
            <label>Bio</label>
            <textarea v-model="formData.bio" rows="5"></textarea>
          </div>

          <div class="row-group bottom-row">
            <div class="form-group half">
              <label>Pronoun</label>
              <select v-model="formData.pronoun">
                <option value="">Select...</option>
                <option value="he/him">he/him</option>
                <option value="she/her">she/her</option>
                <option value="they/them">they/them</option>
              </select>
            </div>
            
            <div class="actions-right">
               <button class="save-btn" @click="saveSettings" :disabled="isSaving">
                 {{ isSaving ? 'SAVING...' : 'SAVE CHANGES' }}
               </button>
            </div>
          </div>
        </div>

        <div class="favorites-column">
          <h3 class="fav-title">Favorite Games</h3>
          <div class="fav-grid">
            <div 
              v-for="(slot, index) in 4" 
              :key="index" 
              class="fav-slot"
              @click="openGameSelector(index)"
            >
              <div v-if="favoriteGames[index]" class="fav-game-poster">
                <img :src="favoriteGames[index].cover_url" alt="Game cover" />
                <button class="remove-fav" @click.stop="removeFavorite(index)">×</button>
              </div>
              
              <div v-else class="fav-placeholder">
                <div class="plus-circle">+</div>
              </div>
            </div>
          </div>
          <p class="drag-hint">Click to add. Drag poster to reorder (Coming soon).</p>
        </div>

      </div>

      <div v-else class="empty-tab">
        <p>Settings for {{ activeTab }} are under construction 🚧</p>
      </div>

    </div>
    
    <GameSearchModal 
      v-if="showSearchModal"
      @close="closeModal"
      @select-game="handleGameSelected"
    />

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Nav from '@/components/common/Nav.vue'
import Footer from '@/components/common/Footer.vue'
// IMPORTAMOS EL NUEVO COMPONENTE
import GameSearchModal from '@/components/lists/GameSearchModal.vue' 
import api from '@/api/axios.js'

const router = useRouter()

// --- ESTADO ---
const activeTab = ref('PROFILE')
const tabs = ['PROFILE', 'AUTH', 'AVATAR', 'CONNECTIONS', 'NOTIFICATIONS', 'STORES & STREAMING', 'DATA']
const isSaving = ref(false)

// Datos del formulario
const formData = ref({
  username: '',
  given_name: '',
  family_name: '',
  email: '',
  location: '',
  website: '',
  bio: '',
  pronoun: ''
})

const favoriteGames = ref([null, null, null, null])

// --- CARGAR DATOS ---
onMounted(async () => {
  try {
    const { data } = await api.get('/users/me')
    
    formData.value = {
      username: data.username || '',
      given_name: data.given_name || '',
      family_name: data.family_name || '',
      email: data.email || '', 
      location: data.location || '',
      website: data.website || '',
      bio: data.bio || '',
      pronoun: data.pronoun || ''
    }

    // if (data.favorites) {
    //    data.favorites.forEach((game, i) => { if(i < 4) favoriteGames.value[i] = game })
    // }

  } catch (error) {
    console.error('Error cargando settings:', error)
    if (error.response && error.response.status === 401) {
      router.push('/login') 
    }
  }
})

// --- GUARDAR ---
const saveSettings = async () => {
  isSaving.value = true
  try {
    // PREPARACIÓN DE DATOS BLINDADA CONTRA ERRORES 500
    const payload = {
      // 1. Si la bio está vacía, enviamos null para que el backend mantenga la anterior
      //    o enviamos el texto si existe.
      bio: formData.value.bio || null,
      
      // 2. Mapeamos 'pronoun' (tu front) a 'pronouns' (lo que pide el back).
      //    Si no hay selección, enviamos null.
      pronouns: formData.value.pronoun || null, 
      
      // 3. ESTE ERA EL CULPABLE DEL ERROR 500:
      // El backend espera recibir 'avatar_url' obligatoriamente para la query SQL.
      // Como no tenemos input de avatar, enviamos null explícitamente.
      avatar_url: null 
    }

    console.log('Enviando payload:', payload) // Para que veas en consola qué se envía

    // Hacemos el PUT a la ruta correcta
    await api.put('/users/profile', payload)
    
    alert('Perfil actualizado correctamente ✨')
    
  } catch (error) {
    console.error('Error guardando:', error)
    
    if (error.response) {
       console.log('Datos del error:', error.response.data) // Mira esto si vuelve a fallar
       
       if (error.response.status === 401) {
          alert('Tu sesión expiró. Inicia sesión de nuevo.')
          router.push('/login')
       } else {
          alert(`Error del servidor: ${error.response.status}. Intenta más tarde.`)
       }
    } else {
       alert('Error de conexión.')
    }
  } finally {
    isSaving.value = false
  }
}

// --- LÓGICA DE FAVORITOS Y MODAL ---
const removeFavorite = (index) => {
  favoriteGames.value[index] = null
}

const showSearchModal = ref(false)
const currentSlotIndex = ref(null) 

const openGameSelector = (index) => {
  currentSlotIndex.value = index
  showSearchModal.value = true
}

// Esta función recibe el juego desde el componente hijo
const handleGameSelected = (game) => {
  if (currentSlotIndex.value !== null) {
    favoriteGames.value[currentSlotIndex.value] = game
  }
  closeModal()
}

const closeModal = () => {
  showSearchModal.value = false
  currentSlotIndex.value = null
}
</script>

<style scoped>
/* Layout Principal */
.settings-page {
  background-color: #e0e2e5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

.settings-container {
  width: 90%;
  max-width: 1200px;
  margin: 40px auto;
  flex: 1;
}

/* Header y Tabs */
h1 {
  font-weight: 300;
  color: #333;
  margin-bottom: 20px;
}

.header-section {
  border-bottom: 1px solid #ccc;
  margin-bottom: 30px;
}

.tabs-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs-left a {
  text-decoration: none;
  color: #666;
  margin-right: 25px;
  font-size: 13px;
  text-transform: uppercase;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 3px solid transparent;
  display: inline-block;
}

.tabs-left a.active {
  color: #00cc88; 
  border-bottom-color: #00cc88;
}

.deactivate-link {
  text-decoration: underline;
  color: #666;
  font-size: 11px;
  text-transform: uppercase;
}

/* Grid de Contenido */
.content-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 60px;
}

/* --- ESTILOS DEL FORMULARIO --- */
.form-column h3 {
  font-size: 14px;
  color: #444;
  margin-bottom: 20px;
  font-weight: normal;
}

.form-group {
  margin-bottom: 15px;
  position: relative;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #555;
  margin-bottom: 5px;
}

.form-group input, 
.form-group textarea,
.form-group select {
  width: 100%;
  background-color: #444; 
  border: none;
  border-radius: 4px;
  padding: 10px;
  color: #fff;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus, .form-group textarea:focus {
  outline: 2px solid #666;
}

.disabled-input {
  background-color: #333; 
  color: #888;
  cursor: not-allowed;
}

.row-group {
  display: flex;
  gap: 20px;
}

.half {
  flex: 1;
}

.edit-icon {
  position: absolute;
  right: 10px;
  top: 32px;
  color: #888;
  cursor: pointer;
}

/* Botón Guardar */
.bottom-row {
  align-items: flex-end; 
}

.actions-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.save-btn {
  background-color: #00cc66; 
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  text-transform: uppercase;
}

.save-btn:hover {
  background-color: #00b359;
}

.save-btn:disabled {
  background-color: #888;
  cursor: not-allowed;
}

/* --- ESTILOS DE FAVORITOS --- */
.fav-title {
  color: #888;
  font-size: 13px;
  margin-bottom: 15px;
  font-weight: 600;
  text-transform: uppercase;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
  display: block;
}

.fav-grid {
  display: flex;
  gap: 12px;
}

.fav-slot {
  flex: 1;
  aspect-ratio: 2/3;
  background-color: #666;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.fav-slot:hover {
  background-color: #555;
}

/* El círculo oscuro detrás del + */
.fav-placeholder .plus-circle {
  width: 40px; 
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* --- COLORES ESPECÍFICOS PARA CADA SLOT --- */
.fav-slot:nth-child(1) .plus-circle { color: #00e054; }
.fav-slot:nth-child(2) .plus-circle { color: #40bcf4; }
.fav-slot:nth-child(3) .plus-circle { color: #ffc000; }
.fav-slot:nth-child(4) .plus-circle { color: #ff5c5c; }

/* Estilos de la imagen cuando ya hay juego */
.fav-game-poster {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.fav-game-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-fav {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4444;
  color: white;
  border: 2px solid #e0e2e5; 
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
  font-weight: bold;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.drag-hint {
  font-size: 11px;
  color: #888;
  margin-top: 15px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .tabs-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .fav-grid {
    justify-content: space-between;
  }
  
  .fav-slot {
    flex: 1;
    height: auto;
    aspect-ratio: 2/3;
  }
}
</style>