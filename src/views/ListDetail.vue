<template>
  <div class="list-detail-page">
    <Nav />

    <transition name="fade">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '⚠️' }}</span>
        <p>{{ toast.message }}</p>
      </div>
    </transition>

    <div v-if="showDeleteListModal" class="modal-overlay">
      <div class="modal-box">
        <h3>¿Eliminar Lista?</h3>
        <p>Estás a punto de eliminar la lista <strong>"{{ listData.title }}"</strong>. Esta acción es permanente.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showDeleteListModal = false">Cancelar</button>
          <button class="btn-confirm-delete" @click="executeDeleteList">Sí, eliminar lista</button>
        </div>
      </div>
    </div>

    <div v-if="showRemoveGameModal" class="modal-overlay">
      <div class="modal-box">
        <h3>¿Quitar juego?</h3>
        <p>¿Seguro que deseas eliminar este juego de tu lista?</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeRemoveGameModal">Cancelar</button>
          <button class="btn-confirm-delete" @click="executeRemoveGame">Sí, quitar juego</button>
        </div>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando lista...</p>
    </div>
    
    <div v-else-if="!listData.id_list" class="error-container">
      <h2 class="error-title">Lista no encontrada</h2>
      <p>Parece que el ID de la lista no es válido o no tienes acceso.</p>
      <button @click="router.push({ name: 'UserProfile' })" class="btn-primary">
        Volver a mi perfil
      </button>
    </div>

    <div v-else class="content-container">
      
      <header class="list-header">
        
        <input 
          v-model="editableTitle" 
          class="list-title-input" 
          placeholder="Título de la lista"
        />
        
        <textarea 
          v-model="editableDescription" 
          class="list-description-input" 
          placeholder="Añade una descripción (opcional)"
        ></textarea>

        <div class="header-actions">
          <p class="list-info-text">{{ listData.games.length }} JUEGOS | Creada por: {{ listData.username || 'Tú' }}</p>
          
          <div class="btn-group">
            <button @click="saveListDetails" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Guardando...' : 'Guardar Detalles' }}
            </button>
            
            <button @click="showDeleteListModal = true" class="btn-delete" :disabled="isSaving">
              Eliminar Lista
            </button>
          </div>
        </div>
      </header>
      
      <section class="game-management">
        <h2 class="section-title">Juegos en la lista</h2>
        
        <div v-if="listData.games.length === 0" class="empty-state">
            <p>Aún no hay juegos en esta lista. ¡Añade el primero!</p>
        </div>

        <div v-else class="list-games-grid">
          <div 
            v-for="game in listData.games" 
            :key="game.id_game" 
            class="list-item-card"
          >
            <router-link :to="{ name: 'GameDetail', params: { id: game.slug || game.id_game } }" class="game-link">
              <img :src="game.cover_url || '/default-cover.png'" class="game-cover" :alt="game.title"/>
            </router-link>

            <div class="item-info">
                <router-link :to="{ name: 'GameDetail', params: { id: game.slug || game.id_game } }" class="game-title-link">
                    <h3>{{ game.title }}</h3>
                </router-link>
                <p v-if="game.comment" class="game-comment">{{ game.comment }}</p>
                <small class="game-position">#{{ game.position }}</small>
            </div>
            
            <button @click="openRemoveGameModal(game.id_item)" class="btn-remove" title="Eliminar juego de la lista">
                &times;
            </button>
          </div>
        </div>
      </section>

    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Nav from "@/components/common/Nav.vue";
import Footer from "@/components/common/PageFooter.vue";
import api from "@/api/axios.js";

const route = useRoute();
const router = useRouter();
const listId = route.params.listId; 

// --- ESTADOS ---
const isLoading = ref(true);
const isSaving = ref(false);
const listData = ref({ games: [] });
const editableTitle = ref('');
const editableDescription = ref('');

// --- SISTEMA DE TOASTS ---
const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3500);
}

// --- MODALES ---
const showDeleteListModal = ref(false);
const showRemoveGameModal = ref(false);
const gameToRemoveId = ref(null);

// --- CARGA ---
const fetchListDetails = async () => {
  if (!listId) {
    isLoading.value = false;
    return;
  }
  try {
    isLoading.value = true;
    const response = await api.get(`/lists/${listId}`);
    listData.value = response.data;
    editableTitle.value = listData.value.title;
    editableDescription.value = listData.value.description;
  } catch (error) {
    console.error("Error cargando detalles:", error);
    listData.value = { games: [] }; 
    showToast("Error al cargar la lista", "error");
  } finally {
    isLoading.value = false;
  }
};

// --- GUARDAR DETALLES ---
const saveListDetails = async () => {
    isSaving.value = true;
    try {
        await api.put(`/lists/${listId}`, {
            title: editableTitle.value,
            description: editableDescription.value
        });
        showToast("Lista actualizada con éxito ✨");
    } catch (error) {
        console.error("Error guardando:", error);
        showToast("Error al guardar cambios", "error");
    } finally {
        isSaving.value = false;
    }
};

// --- ELIMINAR LISTA COMPLETA ---
const executeDeleteList = async () => {
    showDeleteListModal.value = false;
    isSaving.value = true;
    try {
        await api.delete(`/lists/${listId}`);
        showToast("Lista eliminada correctamente 👋");
        setTimeout(() => {
            router.push({ name: 'UserProfile' });
        }, 1000);
    } catch (error) {
        console.error("Error eliminando lista:", error);
        showToast("Error al eliminar la lista", "error");
        isSaving.value = false;
    }
};

// --- ELIMINAR JUEGO ---
const openRemoveGameModal = (itemId) => {
    gameToRemoveId.value = itemId;
    showRemoveGameModal.value = true;
}

const closeRemoveGameModal = () => {
    gameToRemoveId.value = null;
    showRemoveGameModal.value = false;
}

const executeRemoveGame = async () => {
    if (!gameToRemoveId.value) return;
    
    // Cerramos modal y mostramos "guardando" visualmente si quieres
    showRemoveGameModal.value = false;
    
    try {
        // AQUÍ VA TU LLAMADA REAL AL BACKEND
        // await api.delete(`/lists/${listId}/items/${gameToRemoveId.value}`); 
        
        console.log(`Simulando eliminación del item: ${gameToRemoveId.value}`);
        
        // Actualizamos UI localmente
        listData.value.games = listData.value.games.filter(game => game.id_item !== gameToRemoveId.value);
        
        showToast("Juego eliminado de la lista");
    } catch (error) {
        console.error("Error eliminando juego:", error);
        showToast("No se pudo eliminar el juego", "error");
    } finally {
        gameToRemoveId.value = null;
    }
};

onMounted(() => {
  fetchListDetails();
});
</script>

<style scoped>
/* GENERAL */
.list-detail-page { background-color: #f8f9fa; min-height: 100vh; font-family: 'Inter', sans-serif; }
.loading-container, .error-container { padding-top: 100px; text-align: center; max-width: 900px; margin: 0 auto; }
.error-title { color: #cc0000; }
.content-container { width: 90%; max-width: 900px; margin: 40px auto; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #00aaff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* TOASTS */
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

/* MODALES */
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
.modal-box h3 { margin-top: 0; color: #333; margin-bottom: 10px; }
.modal-box p { color: #666; font-size: 14px; margin-bottom: 25px; line-height: 1.5; }
.modal-actions { display: flex; gap: 10px; justify-content: center; }
.btn-cancel { background: #eee; color: #333; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
.btn-confirm-delete { background: #ff4444; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
.btn-cancel:hover { background: #ddd; }
.btn-confirm-delete:hover { background: #cc0000; }

/* HEADER */
.list-header { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 30px; }
.list-title-input { font-size: 28px; font-weight: bold; border: none; width: 100%; margin-bottom: 10px; padding: 5px 0; border-bottom: 2px solid transparent; transition: border-bottom-color 0.3s; color: #222; background: transparent; }
.list-title-input:focus { outline: none; border-bottom-color: #00aaff; }
.list-description-input { width: 100%; border: 1px solid #ddd; padding: 10px; min-height: 80px; margin-bottom: 20px; border-radius: 4px; resize: vertical; font-size: 14px; color: #555; background: #fafafa; }
.list-description-input:focus { outline: 1px solid #00aaff; background: white; }

.header-actions { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; border-top: 1px solid #f0f0f0; padding-top: 15px; }
.list-info-text { font-size: 13px; color: #888; text-transform: uppercase; font-weight: 500; margin: 0; }
.btn-group { display: flex; gap: 10px; }

/* BOTONES */
.btn-primary { background: #00aaff; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #0088cc; }
.btn-primary:disabled { background: #ccc; cursor: not-allowed; }

.btn-delete { background: none; color: #cc0000; border: 1px solid #cc0000; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; transition: all 0.2s; }
.btn-delete:hover:not(:disabled) { background: #cc0000; color: white; }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

/* LISTA DE JUEGOS */
.section-title { font-size: 16px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 20px; font-weight: 600; }
.empty-state { padding: 40px; text-align: center; background: #f0f0f0; border-radius: 8px; color: #666; }
.list-games-grid { display: flex; flex-direction: column; gap: 10px; }

.list-item-card { display: flex; align-items: center; background: white; border: 1px solid #eee; padding: 10px 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: transform 0.2s; }
.list-item-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.05); }

.game-cover { width: 60px; height: 90px; object-fit: cover; border-radius: 4px; margin-right: 15px; }
.item-info { flex-grow: 1; }
.game-title-link { text-decoration: none; color: inherit; }
.game-title-link:hover h3 { color: #00aaff; }
.item-info h3 { font-size: 16px; margin: 0; font-weight: bold; }
.game-comment { font-size: 12px; color: #666; margin-top: 5px; margin-bottom: 0; }
.game-position { display: block; font-size: 10px; color: #aaa; margin-top: 5px; font-weight: bold; }

.btn-remove { margin-left: 20px; background: #fcebeb; border: 1px solid #f9dcdc; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; color: #cc0000; font-weight: bold; font-size: 16px; transition: background 0.2s; display: flex; align-items: center; justify-content: center; padding-bottom: 2px; }
.btn-remove:hover { background: #cc0000; color: white; }
</style>