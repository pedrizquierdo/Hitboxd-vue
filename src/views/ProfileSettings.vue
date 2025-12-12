<template>
  <div class="settings-page">
    <Nav />

    <transition name="fade">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '⚠️' }}</span>
        <p>{{ toast.message }}</p>
      </div>
    </transition>

    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-box">
        <h3>Are you absolutely sure?</h3>
        <p>This action cannot be undone. You will lose all your data immediately.</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="confirm-delete-btn" @click="confirmDeleteAccount">Yes, Delete Account</button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading settings...</p>
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
            <a 
              href="#" 
              class="deactivate-link" 
              :class="{ active: activeTab === 'DEACTIVATE' }"
              @click.prevent="activeTab = 'DEACTIVATE'"
            >
              DEACTIVATE ACCOUNT
            </a>
          </div>
        </div>
      </div>

      <!-- TAB PROFILE -->
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
            <textarea v-model="formData.bio" rows="5" placeholder="Tell us something about yourself..."></textarea>
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
               <button class="save-btn" @click="saveProfile" :disabled="isSaving">
                 {{ isSaving ? 'SAVING...' : 'SAVE CHANGES' }}
               </button>
            </div>
          </div>
          
          <div class="session-section">
            <hr class="divider" />
            <div class="session-row">
              <div class="session-info">
                <h4>Logout</h4>
                <p>End session on this device.</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <!-- TAB AVATAR (CORREGIDO: URL & PIXEL ART) -->
      <div v-else-if="activeTab === 'AVATAR'" class="content-wrapper">
        <div class="avatar-column">
          <h3>Change Avatar</h3>
          <p class="avatar-desc">Choose a pixel art style or paste an image URL.</p>

          <!-- Previsualización -->
          <div class="avatar-preview-container">
            <!-- Mostramos lo que hay en el input (preview) o lo que ya tiene guardado -->
            <img 
              :src="avatarForm.url || currentAvatarUrl || '/assets/default-avatar.png'" 
              alt="Avatar Preview" 
              class="avatar-img"
              @error="handleImageError" 
            />
          </div>

          <div class="avatar-actions">
            <!-- Botón Mágico: Randomize -->
            <button class="random-btn" @click="generateRandomAvatar">
              🎲 RANDOM PIXEL ART
            </button>

            <div class="divider-text">or paste URL</div>

            <!-- Input de URL Manual -->
            <input 
              type="text" 
              v-model="avatarForm.url" 
              placeholder="https://imgur.com/..." 
              class="url-input"
            />

            <!-- Guardar -->
            <button 
              class="save-btn avatar-save" 
              @click="saveAvatar" 
              :disabled="isSaving"
            >
              {{ isSaving ? 'SAVING...' : 'SAVE NEW AVATAR' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'NOTIFICATIONS'" class="content-wrapper">
        <div class="form-column">
          <h3>Notification Preferences</h3>
          <p class="section-desc">Choose how you want us to communicate with you.</p>
          
          <div class="notif-section">
            <h4 class="sub-header">Email</h4>
            <label class="toggle-row">
              <div class="toggle-info"><span class="toggle-title">Weekly Digest</span><span class="toggle-desc">Receive a summary of your weekly activity.</span></div>
              <div class="toggle-switch"><input type="checkbox" v-model="notifSettings.weeklyDigest"><span class="slider"></span></div>
            </label>
            <label class="toggle-row">
              <div class="toggle-info"><span class="toggle-title">Product Updates</span><span class="toggle-desc">News about new features and improvements.</span></div>
              <div class="toggle-switch"><input type="checkbox" v-model="notifSettings.productUpdates"><span class="slider"></span></div>
            </label>
          </div>

          <div class="notif-section">
            <h4 class="sub-header">Application</h4>
            <label class="toggle-row">
              <div class="toggle-info"><span class="toggle-title">Mentions</span><span class="toggle-desc">Notify me when someone mentions me.</span></div>
              <div class="toggle-switch"><input type="checkbox" v-model="notifSettings.mentions"><span class="slider"></span></div>
            </label>
            <label class="toggle-row">
              <div class="toggle-info"><span class="toggle-title">Security</span><span class="toggle-desc">Alerts for unusual login attempts.</span></div>
              <div class="toggle-switch"><input type="checkbox" v-model="notifSettings.security" disabled><span class="slider disabled-slider"></span></div>
            </label>
          </div>
          <div class="actions-right" style="margin-top: 20px;">
             <button class="save-btn" @click="fakeSaveNotifs">UPDATE PREFERENCES</button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'DEACTIVATE'" class="content-wrapper">
        <div class="form-column danger-zone">
          <h3 class="danger-title">Deactivate Account</h3>
          <div class="danger-box">
            <p><strong>Are you sure you want to delete your account?</strong></p>
            <p>This action is permanent and cannot be undone. All your data, progress, and settings will be lost immediately.</p>
            
            <ul class="danger-list">
              <li>Your profile will be removed.</li>
              <li>Your game history will be deleted.</li>
              <li>You will be logged out immediately.</li>
            </ul>

            <button class="delete-btn" @click="showDeleteModal = true" :disabled="isSaving">
              {{ isSaving ? 'DELETING...' : 'YES, DELETE MY ACCOUNT' }}
            </button>
          </div>
        </div>
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

// --- SISTEMA DE TOAST ---
const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3500)
}

// --- MODAL DE BORRADO ---
const showDeleteModal = ref(false)

// Datos de perfil
const formData = ref({ username: '', email: '', bio: '', pronoun: '' })
const notifSettings = ref({ weeklyDigest: true, productUpdates: false, mentions: true, security: true })

// --- ESTADO AVATAR (Simplificado para URL) ---
const currentAvatarUrl = ref(null) 
const avatarForm = ref({ url: '' }) 

// --- CARGAR DATOS ---
onMounted(async () => {
  try {
    const { data } = await api.get('/users/me')
    
    currentAvatarUrl.value = data.avatar_url
    // Inicializamos el input con la URL actual para que el usuario la vea/edite
    avatarForm.value.url = data.avatar_url || ''

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
      router.push('/') 
    } else {
      isLoading.value = false
    }
  }
})

// --- ACTIONS ---

// 1. DELETE ACCOUNT
const confirmDeleteAccount = async () => {
  showDeleteModal.value = false;
  isSaving.value = true;
  
  try {
      // Llamada real para desactivar/borrar cuenta si tienes el endpoint
      await api.put('/users/softdelete'); 
      
      localStorage.removeItem('token'); 
      localStorage.removeItem(import.meta.env.VITE_KEY_STORAGE || 'isAuthenticated');
      router.push('/');
  } catch (error) {
      showToast('Error deleting account', error);
  } finally {
      isSaving.value = false;
  }
}

// 2. GUARDAR PERFIL (Texto)
const saveProfile = async () => {
  isSaving.value = true
  try {
    const payload = {
      bio: formData.value.bio || "", 
      pronouns: formData.value.pronoun || "",
    }

    await api.put('/users/profile', payload)
    showToast('Profile updated successfully! ✨', 'success')
    
  } catch (error) {
    console.error('Error guardando:', error)
    if (error.response?.status === 401) router.push('/')
    else showToast('Error saving profile.', 'error')
  } finally {
    isSaving.value = false
  }
}

// 3. NOTIFICACIONES FAKE
const fakeSaveNotifs = () => {
  isSaving.value = true;
  setTimeout(() => {
    isSaving.value = false;
    showToast('Preferences updated successfully 👍', 'success')
  }, 800);
}

// 4. LÓGICA DE AVATAR (URL / DiceBear)
const generateRandomAvatar = () => {
  // Generamos una semilla aleatoria
  const randomSeed = Math.random().toString(36).substring(7);
  // Asignamos la nueva URL al input y a la vista previa
  avatarForm.value.url = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${randomSeed}`;
}

const handleImageError = (e) => {
  // Fallback si la URL no es válida
  e.target.src = "https://placehold.co/150x150?text=Invalid+URL"
}

const saveAvatar = async () => {
  if (!avatarForm.value.url) return;

  isSaving.value = true
  try {
    // Usamos el endpoint PUT /users/profile que ya soporta 'avatar_url'
    await api.put('/users/profile', {
      avatar_url: avatarForm.value.url
    })

    // Actualizamos la variable de estado principal
    currentAvatarUrl.value = avatarForm.value.url
    showToast('Avatar updated! 📸', 'success')
    
    // Opcional: Recargar para actualizar el Navbar
    setTimeout(() => window.location.reload(), 1000);

  } catch (error) {
    console.error('Error guardando avatar:', error)
    showToast('Error updating avatar.', 'error')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
/* LOADING */
.loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.95); z-index: 9999; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #333; font-family: 'Inter', sans-serif; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #00cc66; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* TOAST */
.toast-notification {
  position: fixed; top: 20px; right: 20px; z-index: 10000;
  padding: 15px 20px; border-radius: 6px;
  display: flex; align-items: center; gap: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 14px; font-weight: 600; color: white;
  min-width: 280px;
}
.toast-notification.success { background-color: #00cc66; }
.toast-notification.error { background-color: #ff4444; }
.toast-icon { font-size: 18px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-20px); }

/* MODAL */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6); z-index: 10000;
  display: flex; justify-content: center; align-items: center;
}
.modal-box {
  background: white; padding: 30px; border-radius: 8px;
  width: 90%; max-width: 400px; text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
.modal-box h3 { margin-top: 0; color: #333; }
.modal-box p { color: #666; font-size: 14px; margin-bottom: 25px; }
.modal-actions { display: flex; gap: 10px; justify-content: center; }
.cancel-btn { background: #eee; color: #333; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
.confirm-delete-btn { background: #ff4444; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
.cancel-btn:hover { background: #ddd; }
.confirm-delete-btn:hover { background: #cc0000; }

/* Layout */
.settings-page { background-color: #e0e2e5; min-height: 100vh; display: flex; flex-direction: column; font-family: 'Inter', sans-serif; }
.settings-container { width: 90%; max-width: 800px; margin: 40px auto; flex: 1; }
h1 { font-weight: 300; color: #333; margin-bottom: 20px; }
.header-section { border-bottom: 1px solid #ccc; margin-bottom: 30px; }
.tabs-row { display: flex; justify-content: space-between; align-items: center; }
.tabs-left a { text-decoration: none; color: #666; margin-right: 25px; font-size: 13px; text-transform: uppercase; font-weight: 600; padding-bottom: 10px; border-bottom: 3px solid transparent; display: inline-block; }
.tabs-left a.active { color: #00cc88; border-bottom-color: #00cc88; }
.deactivate-link { text-decoration: underline; color: #666; font-size: 11px; text-transform: uppercase; cursor: pointer; }
.deactivate-link.active { color: #ff4444; font-weight: bold; text-decoration: none; }

.content-wrapper { display: flex; justify-content: center; }

/* Forms Common */
.form-column { width: 100%; max-width: 600px; }
.form-column h3 { font-size: 14px; color: #444; margin-bottom: 20px; font-weight: normal; }
.section-desc { font-size: 13px; color: #666; margin-bottom: 20px; margin-top: -15px; }
.form-group { margin-bottom: 15px; position: relative; }
.form-group label { display: block; font-size: 13px; color: #555; margin-bottom: 5px; }
.form-group input, .form-group textarea, .form-group select { width: 100%; background-color: #444; border: none; border-radius: 4px; padding: 10px; color: #fff; font-size: 14px; box-sizing: border-box; }
.form-group input:focus, .form-group textarea:focus { outline: 2px solid #666; }
.disabled-input { background-color: #333; color: #888; cursor: not-allowed; }
.row-group { display: flex; gap: 20px; } .half { flex: 1; } .bottom-row { align-items: flex-end; } .actions-right { flex: 1; display: flex; justify-content: flex-end; }
.save-btn { background-color: #00cc66; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; font-size: 12px; cursor: pointer; text-transform: uppercase; transition: 0.2s;}
.save-btn:hover { background-color: #00b359; } .save-btn:disabled { background-color: #888; cursor: not-allowed; }

/* Avatar Styles (CORREGIDO) */
.avatar-column { width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.avatar-desc { color: #666; font-size: 0.9rem; margin-bottom: 20px; }
.avatar-preview-container { width: 150px; height: 150px; border-radius: 50%; overflow: hidden; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 20px; background-color: #ccc; display: flex; justify-content: center; align-items: center; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-actions { display: flex; flex-direction: column; gap: 15px; width: 100%; max-width: 280px; }

.random-btn { background-color: #6A0DAD; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: background 0.2s; }
.random-btn:hover { background-color: #550a8c; }

.divider-text { font-size: 0.8rem; color: #888; margin: 5px 0; }
.url-input { background-color: #fff; border: 1px solid #ccc; padding: 10px; border-radius: 4px; width: 100%; color: #333; font-size: 0.9rem; }
.avatar-save { width: 100%; margin-top: 10px; }

/* Notifications Styles */
.notif-section { margin-bottom: 25px; border-bottom: 1px solid #dcdcdc; padding-bottom: 15px; }
.notif-section:last-child { border-bottom: none; }
.sub-header { color: #00cc66; font-size: 12px; text-transform: uppercase; margin-bottom: 15px; font-weight: 700; }
.toggle-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; cursor: pointer; }
.toggle-info { display: flex; flex-direction: column; max-width: 80%; }
.toggle-title { font-size: 14px; font-weight: 600; color: #333; }
.toggle-desc { font-size: 12px; color: #777; margin-top: 2px; }
.toggle-switch { position: relative; width: 44px; height: 24px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #444; transition: .4s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: #00cc66; } input:checked + .slider:before { transform: translateX(20px); }
.disabled-slider { opacity: 0.6; cursor: not-allowed; }

/* Danger Zone */
.danger-zone .danger-title { color: #ff4444; font-weight: bold; border-bottom: 2px solid #ff4444; padding-bottom: 10px; display: inline-block; }
.danger-box { background-color: #fff0f0; border: 1px solid #ffcccc; padding: 20px; border-radius: 8px; color: #cc0000; }
.danger-box p { margin-bottom: 15px; font-size: 14px; }
.danger-list { margin-bottom: 20px; padding-left: 20px; font-size: 13px; color: #aa0000; }
.danger-list li { margin-bottom: 5px; }
.delete-btn { background-color: #ff4444; color: white; border: none; padding: 12px 20px; border-radius: 4px; font-weight: bold; font-size: 13px; cursor: pointer; width: 100%; transition: background 0.3s; }
.delete-btn:hover { background-color: #cc0000; } .delete-btn:disabled { background-color: #ffaaaa; cursor: not-allowed; }

/* Logout */
.session-section { margin-top: 40px; }
.divider { border: 0; border-top: 1px solid #ccc; margin-bottom: 20px; }
.session-row { display: flex; justify-content: space-between; align-items: center; }
.session-info h4 { font-size: 13px; color: #444; margin: 0 0 4px 0; text-transform: uppercase; }
.session-info p { font-size: 12px; color: #666; margin: 0; }

@media (max-width: 768px) { .tabs-row { flex-direction: column; align-items: flex-start; gap: 10px; } }
</style>