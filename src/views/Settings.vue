<template>
  <div class="settings-page">
    <Nav />

    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando tu configuración...</p>
    </div>

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

      <div v-if="activeTab === 'PROFILE'" class="content-wrapper">
        <div class="form-column">
          <h3>Profile</h3>
          <div class="form-group">
            <label>Username</label>
            <input v-model="formData.username" type="text" disabled class="disabled-input" />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input v-model="formData.email" type="email" disabled class="disabled-input" />
          </div>
          <div class="form-group">
            <label>Bio</label>
            <textarea v-model="formData.bio" rows="5" placeholder="Cuéntanos algo sobre ti..."></textarea>
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
                 {{ isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
               </button>
            </div>
          </div>
          <div class="session-section">
            <hr class="divider" />
            <div class="session-row">
              <div class="session-info">
                <h4>Logout</h4>
                <p>Finalizar sesión en este dispositivo.</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'AVATAR'" class="content-wrapper">
        <div class="avatar-column">
          <h3>Change Avatar</h3>
          <p class="avatar-desc">Sube una imagen para personalizar tu perfil.</p>

          <div class="avatar-preview-container">
            <img 
              :src="previewAvatarUrl || currentAvatarUrl || '/assets/default-avatar.png'" 
              alt="Avatar Preview" 
              class="avatar-img"
              @error="handleImageError" 
            />
            
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              class="hidden-input"
              @change="handleFileSelect"
            />
          </div>

          <div class="avatar-actions">
            <button class="upload-btn" @click="$refs.fileInput.click()">
              SELECCIONAR IMAGEN
            </button>

            <button 
              v-if="selectedFile" 
              class="save-btn" 
              @click="uploadAvatar" 
              :disabled="isSaving"
            >
              {{ isSaving ? 'SUBIENDO...' : 'GUARDAR FOTO' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-tab">
        <p>La sección {{ activeTab }} está en construcción 🚧</p>
      </div>

    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Nav from '@/components/common/Nav.vue'
import Footer from '@/components/common/PageFooter.vue'
import api from '@/api/axios.js'
import LogoutButton from '@/components/auth/LogoutButton.vue';

const router = useRouter()

// --- ESTADO ---
const isLoading = ref(true) 
const activeTab = ref('PROFILE')
const tabs = ['PROFILE', 'AVATAR', 'NOTIFICATIONS']
const isSaving = ref(false)

// Datos del formulario Profile
const formData = ref({
  username: '',
  email: '',
  bio: '',
  pronoun: ''
})

// --- ESTADO AVATAR ---
const currentAvatarUrl = ref(null) // URL que viene del backend
const previewAvatarUrl = ref(null) // URL temporal para previsualizar lo que subes
const selectedFile = ref(null)     // El archivo en sí
const fileInput = ref(null)        // Referencia al input HTML

// --- CARGAR DATOS ---
onMounted(async () => {
  try {
    const { data } = await api.get('/users/me')
    
    currentAvatarUrl.value = data.avatar_url ? data.avatar_url : null

    formData.value = {
      username: data.username || '',
      email: data.email || '', 
      bio: data.bio || '',
      pronoun: data.pronouns || '' 
    }
    
    isLoading.value = false 

  } catch (error) {
    console.error('Error cargando settings:', error)
    if (error.response && error.response.status === 401) {
      alert("Sesión expirada.")
      router.push('/login') 
    } else {
      isLoading.value = false
    }
  }
})

// --- LÓGICA DE AVATAR ---

// 1. Cuando el usuario selecciona un archivo
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validar tipo (opcional)
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido.')
    return
  }

  selectedFile.value = file
  // Creamos una URL temporal para ver la imagen antes de subirla
  previewAvatarUrl.value = URL.createObjectURL(file)
}

// 2. Manejo de error si la imagen no carga
const handleImageError = (e) => {
  // Si falla la imagen, pone una por defecto (puedes poner una URL externa o local)
  e.target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
}

// 3. Subir el Avatar al Backend
const uploadAvatar = async () => {
  if (!selectedFile.value) return

  isSaving.value = true
  try {
    // IMPORTANTE: Para subir archivos se usa FormData
    const formDataAvatar = new FormData()
    formDataAvatar.append('avatar', selectedFile.value) 

    // Aquí asumimos que tienes una ruta POST /users/avatar
    // Si no la tienes, avísame para crearla en el backend
    const { data } = await api.post('/users/avatar', formDataAvatar, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    // Actualizamos la foto actual con la respuesta del servidor
    currentAvatarUrl.value = data.avatar_url 
    
    // Limpiamos el estado temporal
    selectedFile.value = null
    previewAvatarUrl.value = null
    
    alert('¡Avatar actualizado! 📸')

  } catch (error) {
    console.error('Error subiendo avatar:', error)
    alert('Hubo un error al subir la imagen. ¿Tu backend soporta carga de archivos?')
  } finally {
    isSaving.value = false
  }
}


// --- GUARDAR PERFIL (Texto) ---
const saveSettings = async () => {
  isSaving.value = true
  try {
    const payload = {
      bio: formData.value.bio || "", 
      pronouns: formData.value.pronoun || "",
      // No mandamos avatar_url aquí, eso se maneja en la otra pestaña
    }

    await api.put('/users/profile', payload)
    alert('¡Perfil actualizado correctamente! ✨')
    
  } catch (error) {
    console.error('Error guardando:', error)
    if (error.response?.status === 401) router.push('/login')
    else alert('Error al guardar.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
/* PANTALLA DE CARGA */
.loading-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(255, 255, 255, 0.95); z-index: 9999;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  color: #333; font-family: 'Inter', sans-serif;
}
.spinner {
  border: 4px solid #f3f3f3; border-top: 4px solid #00cc66; border-radius: 50%;
  width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Layout */
.settings-page { background-color: #e0e2e5; min-height: 100vh; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; }
.settings-container { width: 90%; max-width: 800px; margin: 40px auto; flex: 1; }
h1 { font-weight: 300; color: #333; margin-bottom: 20px; }
.header-section { border-bottom: 1px solid #ccc; margin-bottom: 30px; }
.tabs-row { display: flex; justify-content: space-between; align-items: center; }
.tabs-left a { text-decoration: none; color: #666; margin-right: 25px; font-size: 13px; text-transform: uppercase; font-weight: 600; padding-bottom: 10px; border-bottom: 3px solid transparent; display: inline-block; }
.tabs-left a.active { color: #00cc88; border-bottom-color: #00cc88; }
.deactivate-link { text-decoration: underline; color: #666; font-size: 11px; text-transform: uppercase; }

.content-wrapper { display: flex; justify-content: center; }

/* Estilos Formulario Profile */
.form-column { width: 100%; max-width: 600px; }
.form-column h3 { font-size: 14px; color: #444; margin-bottom: 20px; font-weight: normal; }
.form-group { margin-bottom: 15px; position: relative; }
.form-group label { display: block; font-size: 13px; color: #555; margin-bottom: 5px; }
.form-group input, .form-group textarea, .form-group select { width: 100%; background-color: #444; border: none; border-radius: 4px; padding: 10px; color: #fff; font-size: 14px; box-sizing: border-box; }
.form-group input:focus, .form-group textarea:focus { outline: 2px solid #666; }
.disabled-input { background-color: #333; color: #888; cursor: not-allowed; }
.row-group { display: flex; gap: 20px; }
.half { flex: 1; }
.bottom-row { align-items: flex-end; }
.actions-right { flex: 1; display: flex; justify-content: flex-end; }
.save-btn { background-color: #00cc66; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; font-size: 12px; cursor: pointer; text-transform: uppercase; }
.save-btn:hover { background-color: #00b359; }
.save-btn:disabled { background-color: #888; cursor: not-allowed; }

/* --- ESTILOS AVATAR (NUEVO) --- */
.avatar-column {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.avatar-desc { color: #666; font-size: 0.9rem; margin-bottom: 20px; }
.avatar-preview-container {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  background-color: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hidden-input { display: none; }
.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 200px;
}
.upload-btn {
  background-color: #444;
  color: white;
  border: 1px solid #666;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background 0.2s;
}
.upload-btn:hover { background-color: #555; }

/* Logout Styles */
.session-section { margin-top: 40px; }
.divider { border: 0; border-top: 1px solid #ccc; margin-bottom: 20px; }
.session-row { display: flex; justify-content: space-between; align-items: center; }
.session-info h4 { font-size: 13px; color: #444; margin: 0 0 4px 0; text-transform: uppercase; }
.session-info p { font-size: 12px; color: #666; margin: 0; }

@media (max-width: 768px) { .tabs-row { flex-direction: column; align-items: flex-start; gap: 10px; } }
</style>