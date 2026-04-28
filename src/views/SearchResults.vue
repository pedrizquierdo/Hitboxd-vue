<template>
  <div class="search-page">
    <div class="search-header">
      <h1>Results for <span class="query-highlight">"{{ q }}"</span></h1>
      <p class="result-count" v-if="hasSearched && !isLoading">
        {{ total }} games found
      </p>
    </div>

    <div v-if="isLoading" class="loading-grid">
      <div v-for="n in 24" :key="n" class="skeleton-card"></div>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchResults(currentPage)">Retry</button>
    </div>

    <div v-else-if="hasSearched && results.length === 0" class="empty-state">
      <p>No games found for "{{ q }}"</p>
      <p class="empty-hint">Try a shorter search or check the spelling</p>
    </div>

    <div v-else class="results-grid">
      <GameCard
        v-for="game in results"
        :key="game.igdb_id || game.id_game"
        :game="game"
      />
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="fetchResults(currentPage - 1)"
      >← Prev</button>

      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>

      <button
        :disabled="currentPage === totalPages"
        @click="fetchResults(currentPage + 1)"
      >Next →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/axios.js'
import GameCard from '@/components/common/GameCard.vue'

const route = useRoute()
const q = computed(() => route.query.q || '')

const results = ref([])
const total = ref(0)
const currentPage = ref(1)
const isLoading = ref(false)
const hasSearched = ref(false)
const error = ref(null)
const LIMIT = 24

const totalPages = computed(() => Math.ceil(total.value / LIMIT))

const fetchResults = async (page = 1) => {
  if (!q.value || q.value.trim().length < 2) return

  window.scrollTo(0, 0)
  isLoading.value = true
  error.value = null

  try {
    const { data } = await api.get('/games/search-page', {
      params: { q: q.value, page, limit: LIMIT },
    })
    results.value = data.results
    total.value = data.total
    currentPage.value = page
    hasSearched.value = true
  } catch {
    error.value = 'Error al buscar juegos. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchResults())

watch(q, () => {
  currentPage.value = 1
  fetchResults(1)
})
</script>

<style scoped>
.search-page {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0 4rem;
}

.search-header {
  margin-bottom: 2rem;
}

h1 {
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--text-secondary, #555);
  margin: 0;
}

.query-highlight {
  color: var(--brand-cyan, #00aeef);
  font-weight: 600;
}

.result-count {
  font-size: 0.85rem;
  color: var(--text-muted, #999);
  margin-top: 4px;
  margin-bottom: 0;
}

.results-grid,
.loading-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}

.skeleton-card {
  aspect-ratio: 3/4;
  border-radius: var(--radius-md, 6px);
  background: linear-gradient(
    90deg,
    var(--card-bg, #f3f4f6) 25%,
    color-mix(in srgb, var(--card-bg, #f3f4f6) 70%, white) 50%,
    var(--card-bg, #f3f4f6) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary, #555);
}

.error-state button {
  margin-top: 1rem;
  padding: 8px 20px;
  border-radius: var(--radius-md, 6px);
  border: 1px solid var(--border-color, #d1d5db);
  background: var(--card-bg, #fff);
  color: var(--text-primary, #2d2d2d);
  cursor: pointer;
}

.error-state button:hover {
  border-color: var(--brand-cyan, #00aeef);
}

.empty-hint {
  font-size: 0.85rem;
  color: var(--text-muted, #999);
  margin-top: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 2rem;
  padding-bottom: 2rem;
}

.pagination button {
  padding: 8px 20px;
  border-radius: var(--radius-md, 6px);
  border: 1px solid var(--border-color, #d1d5db);
  background: var(--card-bg, #fff);
  color: var(--text-primary, #2d2d2d);
  cursor: pointer;
  transition: border-color 0.2s;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  border-color: var(--brand-cyan, #00aeef);
}

.page-info {
  font-size: 0.9rem;
  color: var(--text-secondary, #555);
}
</style>
