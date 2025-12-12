<template>
  <div v-if="open" class="modal-backdrop">
    <div class="modal">

      <h2>CREATE NEW LIST</h2>

      <input 
        v-model="listName"
        type="text"
        placeholder="LIST NAME"
      />

      <textarea 
        v-model="description"
        placeholder="Description..."
      ></textarea>

      <input 
        v-model="searchQuery"
        @input="searchGames"
        @focus="searchGames"
        type="text"
        placeholder="Search..."
      />

      <div v-if="searchResults.length > 0" class="search-results">
        <div 
          v-for="game in searchResults"
          :key="game.id_game" 
          class="result-item"
        >
          <div class="game-info">
            <img v-if="game.cover_url" :src="game.cover_url" class="game-cover" />
            <span>{{ game.title || game.name }}</span>
          </div>
          <button @click="addGame(game)">ADD</button>
        </div>
      </div>
      
      <h3>SELECTED GAMES</h3>
      <div class="selected-games">
        <div 
          v-for="game in selectedGames"
          :key="game.id_game" 
          class="selected-game"
        >
          <span>{{ game.title || game.name }}</span>
          <button @click="removeGame(game.id_game)">DELETE</button>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close">CANCEL</button>
        <button @click="createList">CREATE LIST</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import axios from "@/api/axios"

const props = defineProps({
  open: Boolean
})

const emits = defineEmits(["close", "created"])

// --- ESTADOS ---
const listName = ref("")
const description = ref("")
const searchQuery = ref("")
const searchResults = ref([])
const allGamesCache = ref([])
const selectedGames = ref([])

const close = () => emits("close")

// --- LÓGICA DE BÚSQUEDA ---
const fetchAllGames = async () => {
    if (allGamesCache.value.length > 0) return;
    try {
        const res = await axios.get('/games/trending?limit=100'); 
        if (res.data && Array.isArray(res.data)) {
            allGamesCache.value = res.data;
        }
    } catch (error) {
        console.error("Error cargando caché de juegos:", error);
    }
};

const searchGames = async () => {
  const query = searchQuery.value.trim();
  if (query.length < 2) {
    await fetchAllGames();
    if (query.length === 1) {
        searchResults.value = allGamesCache.value.filter(game => 
            (game.title || game.name).toLowerCase().includes(query.toLowerCase())
        );
    } else {
        searchResults.value = allGamesCache.value;
    }
    return;
  }

  try {
    const { data } = await axios.get(`/games/search?q=${query}`);
    searchResults.value = data;
  } catch (error) {
    console.error("Error looking for games:", error);
    searchResults.value = [];
  }
}

// --- GESTIÓN DE JUEGOS (CORREGIDO id -> id_game) ---
const addGame = (game) => {
  // ⭐ Verificamos usando id_game
  if (!selectedGames.value.some(g => g.id_game === game.id_game)) {
    selectedGames.value.push(game)
  }
}

const removeGame = (idToRemove) => {
  // ⭐ Filtramos usando id_game
  selectedGames.value = selectedGames.value.filter(g => g.id_game !== idToRemove)
}

// --- CREAR LISTA ---
const createList = async () => {
  if (!listName.value.trim()) {
    console.log("The list needs a name")
    return
  }

  try {
    // 1. Crear la lista (Cabecera)
    console.log("Creating list...");
    const createPayload = {
      title: listName.value, 
      description: description.value,
    }

    const { data: createData } = await axios.post("/lists", createPayload) 
    
    // El backend puede devolver { id: ... } o { insertId: ... }
    const newListId = createData.id || createData.insertId; 
    console.log("list created with id:", newListId);

    if (!newListId) throw new Error("No se recibió el ID de la nueva lista.");
    
    // 2. Agregar juegos
    if (selectedGames.value.length > 0) {
      console.log(`Intentando agregar ${selectedGames.value.length} juegos...`);
      
      for (const game of selectedGames.value) {
        try {
            // ⭐ CORRECCIÓN CLAVE: Usar id_game para validar
            if (!game.id_game) {
                console.warn("Juego sin id_game ignorado:", game);
                continue; 
            }

            console.log(`Agregando juego ${game.id_game} a lista ${newListId}`);
            
            // ⭐ CORRECCIÓN: Enviamos gameId: game.id_game
            await axios.post(`/lists/${newListId}/games`, { 
              gameId: game.id_game, 
              comment: "" 
            });

        } catch (gameError) {
            console.error(`Error al agregar el juego ${game.title}:`, gameError);
        }
      }
    }

    // 3. Obtener resultado final
    const { data: listDetails } = await axios.get(`/lists/${newListId}`)

    emits("created", listDetails)
    close()

    // Limpieza
    listName.value = ""
    description.value = ""
    searchQuery.value = ""
    searchResults.value = []
    selectedGames.value = []

  } catch (error) {
    console.error("Error FATAL creando lista:", error)
    console.log("Hubo un error al crear la lista.")
  }
}
</script>

<style scoped>
/* Estilos sin cambios, mantengo el diseño oscuro */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #333;
  color: #fff;
  padding: 20px;
  border-radius: 5px;
  width: 90%;
  max-width: 800px; 
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.7);
  max-height: 90vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.modal h2 {
  grid-column: 1 / -1;
  text-align: center;
  margin-top: 0;
  font-size: 24px;
  color: #00aaff;
  border-bottom: 2px solid #555;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.modal h3 {
    grid-column: 1 / -1;
    margin-top: 10px;
    margin-bottom: 5px;
    font-size: 16px;
    color: #00aaff;
    border-bottom: 1px dashed #555;
    padding-bottom: 5px;
}

.modal input[type="text"], 
.modal textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #555;
  border-radius: 3px;
  background: #222;
  color: #f0f0f0;
  box-sizing: border-box;
}

.modal textarea {
  min-height: 120px;
  resize: vertical;
  grid-column: 1 / 2;
}

.modal input:nth-of-type(1) {
  grid-column: 1 / 2;
  margin-top: 15px;
}

.search-results {
    grid-column: 1 / 2;
    border: 1px solid #555;
    max-height: 150px;
    overflow-y: auto;
    margin-bottom: 20px;
    border-radius: 4px;
    background: #444;
}

.result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    border-bottom: 1px solid #333;
    color: #fff;
}

.game-info {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden; 
    white-space: nowrap; 
    text-overflow: ellipsis;
}

.game-cover {
    width: 30px; 
    height: 40px;
    object-fit: cover;
    border-radius: 2px;
}

.result-item:last-child {
    border-bottom: none;
}

.result-item button {
    background: #27ae60;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-weight: bold;
    flex-shrink: 0;
}

.selected-games {
    grid-column: 2 / 3;
    grid-row: 2 / span 5;
    background: #222;
    border: 1px solid #555;
    padding: 15px;
    border-radius: 4px;
    overflow-y: auto;
    max-height: 100%; 
}

.selected-game {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #444;
    padding: 8px;
    margin-bottom: 5px;
    border-radius: 3px;
    color: #fff;
}

.selected-game button {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
}

.modal-footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #555;
  margin-top: 10px;
}

.modal-footer button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.modal-footer button:first-child {
  background: #7f8c8d;
  color: white;
}

.modal-footer button:last-child {
  background: #00aaff;
  color: white;
}
</style>