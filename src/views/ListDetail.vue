<template>
  <div class="list-detail-page">
    <Nav />
    
    <div v-if="isLoading" class="loading-container">
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
          
          <div>
            <button @click="saveListDetails" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Guardando...' : 'Guardar Detalles' }}
            </button>
            
            <button @click="confirmDeleteList" class="btn-delete" :disabled="isSaving">
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
            
            <button @click="removeGame(game.id_item)" class="btn-remove" title="Eliminar juego de la lista">
                &times;
            </button>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Nav from "@/components/common/Nav.vue";
import api from "@/api/axios.js";

const route = useRoute();
const router = useRouter();

// Obtenemos el listId de los parámetros de la ruta
const listId = route.params.listId; 

const isLoading = ref(true);
const isSaving = ref(false); // Para deshabilitar botones mientras se guarda
const listData = ref({ games: [] });

// Variables editables (inicializadas después de la carga)
const editableTitle = ref('');
const editableDescription = ref('');

// --- Carga de la lista ---
const fetchListDetails = async () => {
  if (!listId) {
    isLoading.value = false;
    return;
  }
  
  try {
    isLoading.value = true;
    const response = await api.get(`/lists/${listId}`);
    listData.value = response.data;
    
    // Inicializar los campos editables con los datos cargados
    editableTitle.value = listData.value.title;
    editableDescription.value = listData.value.description;

  } catch (error) {
    console.error("Error cargando detalles de lista:", error);
    // Establecer la lista como vacía para activar el error-container
    listData.value = { games: [] }; 
  } finally {
    isLoading.value = false;
  }
};

// --- Gestión de detalles (Título/Descripción) ---
const saveListDetails = async () => {
    isSaving.value = true;
    try {
        // Asegúrate de que tu backend tiene una ruta PUT/PATCH como /lists/:listId
        await api.put(`/lists/${listId}`, {
            title: editableTitle.value,
            description: editableDescription.value
        });
        alert("Lista actualizada con éxito.");
    } catch (error) {
        console.error("Error guardando detalles de lista:", error);
        alert("Error al guardar los detalles de la lista.");
    } finally {
        isSaving.value = false;
    }
};

// --- Gestión de Eliminación de la Lista ---
const confirmDeleteList = async () => {
    if (confirm(`¿Estás seguro de que deseas eliminar la lista "${listData.value.title}" permanentemente? Esta acción no se puede deshacer.`)) {
        isSaving.value = true; // Usamos la misma bandera
        try {
            // Utilizamos la ruta DELETE que ya definiste en lists.routes
            await api.delete(`/lists/${listId}`);
            alert("Lista eliminada con éxito.");
            router.push({ name: 'UserProfile' }); // Redirigir al perfil
        } catch (error) {
            console.error("Error eliminando lista:", error);
            alert("Error al eliminar la lista. Verifica que seas el propietario.");
        } finally {
            isSaving.value = false;
        }
    }
};

// --- Gestión de Juegos ---
const removeGame = async (itemId) => {
    if (!confirm("¿Deseas eliminar este juego de la lista?")) return;

    try {
        // NOTA: Necesitas una ruta en tu backend para eliminar items de una lista.
        // Ejemplo de ruta necesaria: DELETE /lists/:listId/items/:itemId
        // Como esa ruta no está en tu `lists.routes`, es un TODO importante.
        console.log(`TODO: Implementar DELETE /lists/${listId}/items/${itemId}`);
        
        // Simulación:
        // await api.delete(`/lists/${listId}/items/${itemId}`); 
        
        // Refrescar la lista después de la eliminación exitosa (simulada o real)
        listData.value.games = listData.value.games.filter(game => game.id_item !== itemId);
        // await fetchListDetails(); 

    } catch (error) {
        console.error("Error eliminando juego:", error);
        alert("No se pudo eliminar el juego de la lista.");
    }
};

onMounted(() => {
  fetchListDetails();
});
</script>

<style scoped>
/* Estilos Básicos */
.list-detail-page {
    background-color: #f8f9fa;
    min-height: 100vh;
}

.loading-container, .error-container {
    padding-top: 100px;
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
}
.error-title {
    color: #cc0000;
}

.content-container {
    width: 90%;
    max-width: 900px;
    margin: 40px auto;
}

/* 1. Header/Edición */
.list-header {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    margin-bottom: 30px;
}

.list-title-input {
    font-size: 28px;
    font-weight: bold;
    border: none;
    width: 100%;
    margin-bottom: 10px;
    padding: 5px 0;
    border-bottom: 2px solid transparent;
    transition: border-bottom-color 0.3s;
    color: #222;
}

.list-title-input:focus {
    outline: none;
    border-bottom-color: #00aaff;
}

.list-description-input {
    width: 100%;
    border: 1px solid #ddd;
    padding: 10px;
    min-height: 80px;
    margin-bottom: 20px;
    border-radius: 4px;
    resize: vertical;
    font-size: 14px;
    color: #555;
}

.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    border-top: 1px solid #f0f0f0;
    padding-top: 15px;
}

.list-info-text {
    font-size: 13px;
    color: #888;
    text-transform: uppercase;
    font-weight: 500;
    margin: 0;
}

.btn-primary {
    background: #00aaff;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
}
.btn-primary:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.btn-delete {
    background: none;
    color: #cc0000;
    border: 1px solid #cc0000;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    margin-left: 10px;
    transition: all 0.2s;
}

.btn-delete:hover:not(:disabled) {
    background: #cc0000;
    color: white;
}
.btn-delete:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 2. Gestión de Juegos */
.section-title {
    font-size: 16px;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
    margin-bottom: 20px;
    font-weight: 600;
}

.empty-state {
    padding: 40px;
    text-align: center;
    background: #f0f0f0;
    border-radius: 8px;
    color: #666;
}

.list-games-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.list-item-card {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #eee;
    padding: 10px 15px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.game-cover {
    width: 60px;
    height: 90px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 15px;
    transition: transform 0.2s;
}
.game-link:hover .game-cover {
    transform: scale(1.05);
}

.item-info {
    flex-grow: 1;
}

.game-title-link {
    text-decoration: none;
    color: inherit;
}
.game-title-link:hover h3 {
    color: #00aaff;
}

.item-info h3 {
    font-size: 16px;
    margin: 0;
    font-weight: bold;
}
.game-comment {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
    margin-bottom: 0;
}
.game-position {
    display: block;
    font-size: 10px;
    color: #aaa;
    margin-top: 5px;
    font-weight: bold;
}


.btn-remove {
    margin-left: 20px;
    background: #fcebeb;
    border: 1px solid #f9dcdc;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    color: #cc0000;
    font-weight: bold;
    font-size: 16px;
    transition: background 0.2s;
}
.btn-remove:hover {
    background: #cc0000;
    color: white;
}
</style>