<template>
  <div class="page-wrapper">
    <div class="catalog-container">

      <!-- HEADER ROW -->
      <div class="header-row">
        <!-- Search with autocomplete -->
        <div class="search-wrapper" ref="searchWrapperRef">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search all games..."
            class="catalog-search-input"
            @input="onSearchInput"
            @focus="searchFocused = true"
            @keyup.enter="triggerFullSearch"
          />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch" title="Clear">×</button>

          <!-- Autocomplete dropdown -->
          <div v-if="searchFocused && searchQuery.trim() && (suggestionsLoading || suggestions.length)" class="suggestions-dropdown">
            <div v-if="suggestionsLoading" class="suggestions-loading">
              <div class="mini-spinner"></div>
            </div>
            <template v-else>
              <div
                v-for="game in suggestions"
                :key="game.igdb_id || game.id_game"
                class="suggestion-item"
                @mousedown.prevent="goToGame(game.slug)"
              >
                <img :src="game.cover_url" :alt="game.title" class="suggestion-cover" />
                <div class="suggestion-info">
                  <span class="suggestion-title">{{ game.title }}</span>
                  <span class="suggestion-year">{{ releaseYear(game) }}</span>
                </div>
              </div>
              <button class="see-all-suggestion" @mousedown.prevent="triggerFullSearch">
                See all results for "{{ searchQuery }}" →
              </button>
            </template>
          </div>
        </div>

        <!-- Filters toggle -->
        <button
          class="filter-toggle-btn"
          :class="{ active: showFilters || hasActiveFilters }"
          @click="showFilters = !showFilters"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filters
          <span v-if="hasActiveFilters" class="filter-badge">{{ activeFilterCount }}</span>
        </button>

        <!-- View toggle -->
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="Grid view">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </button>
          <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" title="List view">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- FILTER PANEL (collapsible) -->
      <transition name="filter-slide">
        <div v-if="showFilters" class="filter-panel">
          <div class="filter-groups">
            <!-- Genre -->
            <div class="filter-group">
              <h4 class="filter-label">Genre</h4>
              <div class="genre-chips">
                <span
                  v-for="g in GENRE_OPTIONS"
                  :key="g.value"
                  class="filter-chip"
                  :class="{ active: activeGenre === g.value }"
                  @click="toggleGenre(g.value)"
                >{{ g.label }}</span>
              </div>
            </div>

            <!-- Year range -->
            <div class="filter-group">
              <h4 class="filter-label">Year</h4>
              <div class="year-inputs">
                <input v-model="yearFrom" type="number" placeholder="From" min="1970" max="2025" class="year-input" />
                <span class="year-dash">–</span>
                <input v-model="yearTo" type="number" placeholder="To" min="1970" max="2025" class="year-input" />
              </div>
            </div>

            <!-- Sort -->
            <div class="filter-group">
              <h4 class="filter-label">Sort by</h4>
              <div class="sort-chips">
                <span
                  v-for="s in SORT_OPTIONS"
                  :key="s.value"
                  class="filter-chip"
                  :class="{ active: sortBy === s.value }"
                  @click="sortBy = s.value"
                >{{ s.label }}</span>
              </div>
            </div>
          </div>

          <button v-if="hasActiveFilters" class="clear-filters-btn" @click="clearFilters">
            Clear all filters
          </button>
        </div>
      </transition>

      <!-- RECENTLY VIEWED -->
      <div v-if="recentlyViewed.length && !isSearching" class="recently-section fade-in">
        <h3 class="section-title">RECENTLY VIEWED</h3>
        <div class="recently-row">
          <div
            v-for="g in recentlyViewed"
            :key="g.slug"
            class="recently-item"
            @click="goToGame(g.slug)"
          >
            <img :src="g.cover_url" :alt="g.title" class="recently-cover" />
            <span class="recently-title">{{ g.title }}</span>
          </div>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="library-content fade-in">

        <!-- SEARCH / GENRE RESULTS -->
        <div v-if="isSearching" class="search-results-container">
          <div class="results-header">
            <h3 class="section-title">
              <span v-if="activeGenre && !searchQuery.trim()">BROWSING: {{ activeGenre }}</span>
              <span v-else>SEARCH RESULTS</span>
              <span v-if="!searchLoading && processedResults.length" class="result-count">({{ processedResults.length }})</span>
            </h3>
          </div>

          <div v-if="searchLoading" class="loading-grid">
            <div v-for="n in 12" :key="n" class="skeleton-card"></div>
          </div>

          <template v-else-if="processedResults.length">
            <!-- Grid view -->
            <div v-if="viewMode === 'grid'" class="results-grid">
              <div
                class="grid-item"
                v-for="game in processedResults"
                :key="game.id_game || game.igdb_id"
              >
                <GameCard :game="game" />
              </div>
            </div>

            <!-- List view -->
            <div v-else class="results-list">
              <div
                class="list-item"
                v-for="game in processedResults"
                :key="game.id_game || game.igdb_id"
                @click="goToGame(game.slug)"
              >
                <img :src="game.cover_url" :alt="game.title" class="list-cover" />
                <div class="list-info">
                  <span class="list-title">{{ game.title }}</span>
                  <span class="list-meta">{{ game.developer || 'Unknown' }} · {{ releaseYear(game) }}</span>
                </div>
                <div class="list-pop">
                  <span class="pop-label">{{ popularityLabel(game.popularity) }}</span>
                </div>
                <svg class="list-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
              </div>
            </div>
          </template>

          <div v-else class="no-results">
            <p>No games found<span v-if="searchQuery"> for "{{ searchQuery }}"</span><span v-if="activeGenre"> in {{ activeGenre }}</span>.</p>
          </div>
        </div>

        <!-- DEFAULT VIEW: Carousels -->
        <div v-else class="default-view">
          <section class="game-section">
            <h3 class="section-title">POPULAR GAMES THIS WEEK</h3>
            <div class="carousel-wrapper">
              <button class="nav-btn left" @click="scrollRow('trending', -1)">&#8249;</button>
              <div class="carousel-track" id="trending">
                <template v-if="trendingLoading">
                  <div v-for="n in 8" :key="n" class="carousel-item"><div class="skeleton-card"></div></div>
                </template>
                <template v-else>
                  <div class="carousel-item" v-for="game in trendingGames" :key="game.id_game">
                    <GameCard :game="game" />
                  </div>
                </template>
              </div>
              <button class="nav-btn right" @click="scrollRow('trending', 1)">&#8250;</button>
            </div>
          </section>

          <section class="game-section">
            <h3 class="section-title">TOP RATED</h3>
            <div class="carousel-wrapper">
              <button class="nav-btn left" @click="scrollRow('top', -1)">&#8249;</button>
              <div class="carousel-track" id="top">
                <template v-if="topLoading">
                  <div v-for="n in 8" :key="n" class="carousel-item"><div class="skeleton-card"></div></div>
                </template>
                <template v-else>
                  <div class="carousel-item" v-for="game in topGames" :key="game.id_game">
                    <GameCard :game="game" />
                  </div>
                </template>
              </div>
              <button class="nav-btn right" @click="scrollRow('top', 1)">&#8250;</button>
            </div>
          </section>

          <section class="game-section">
            <h3 class="section-title">NEW RELEASES</h3>
            <div class="carousel-wrapper">
              <button class="nav-btn left" @click="scrollRow('new', -1)">&#8249;</button>
              <div class="carousel-track" id="new">
                <template v-if="newLoading">
                  <div v-for="n in 8" :key="n" class="carousel-item"><div class="skeleton-card"></div></div>
                </template>
                <template v-else>
                  <div class="carousel-item" v-for="game in newGames" :key="game.id_game">
                    <GameCard :game="game" />
                  </div>
                </template>
              </div>
              <button class="nav-btn right" @click="scrollRow('new', 1)">&#8250;</button>
            </div>
          </section>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'
import GameCard from '@/components/common/GameCard.vue'

const router = useRouter()

document.title = 'Games Catalog — Hitboxd'

const GENRE_OPTIONS = [
  { label: 'Adventure',  value: 'Adventure' },
  { label: 'RPG',        value: 'Role-playing (RPG)' },
  { label: 'Shooter',    value: 'Shooter' },
  { label: 'Strategy',   value: 'Strategy' },
  { label: 'Simulation', value: 'Simulator' },
  { label: 'Puzzle',     value: 'Puzzle' },
  { label: 'Fighting',   value: 'Fighting' },
  { label: 'Platform',   value: 'Platform' },
  { label: 'Sports',     value: 'Sport' },
  { label: 'Racing',     value: 'Racing' },
  { label: 'Indie',      value: 'Indie' },
  { label: 'Arcade',     value: 'Arcade' },
]

const SORT_OPTIONS = [
  { label: 'Default',    value: 'default' },
  { label: 'A → Z',      value: 'az' },
  { label: 'Z → A',      value: 'za' },
  { label: 'Newest',     value: 'year_desc' },
  { label: 'Oldest',     value: 'year_asc' },
  { label: 'Popular',    value: 'popular' },
]

// Carousels (separate loading states for skeletons)
const trendingGames = ref([])
const topGames = ref([])
const newGames = ref([])
const trendingLoading = ref(true)
const topLoading = ref(true)
const newLoading = ref(true)

// Search + autocomplete
const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const searchFocused = ref(false)
const suggestions = ref([])
const suggestionsLoading = ref(false)
let searchTimer = null
let suggestTimer = null
const searchWrapperRef = ref(null)

// Filters
const showFilters = ref(false)
const activeGenre = ref(null)
const yearFrom = ref('')
const yearTo = ref('')
const sortBy = ref('default')
const viewMode = ref('grid')

// Recently viewed
const recentlyViewed = ref([])

// --- COMPUTED ---

const isSearching = computed(() => searchQuery.value.trim() !== '' || activeGenre.value !== null)

const hasActiveFilters = computed(() =>
  activeGenre.value !== null || yearFrom.value !== '' || yearTo.value !== '' || sortBy.value !== 'default'
)

const activeFilterCount = computed(() => {
  let c = 0
  if (activeGenre.value) c++
  if (yearFrom.value || yearTo.value) c++
  if (sortBy.value !== 'default') c++
  return c
})

const processedResults = computed(() => {
  let results = [...searchResults.value]

  if (yearFrom.value) {
    const from = parseInt(yearFrom.value)
    results = results.filter(g => {
      const y = g.release_date ? new Date(g.release_date).getFullYear() : 0
      return y >= from
    })
  }
  if (yearTo.value) {
    const to = parseInt(yearTo.value)
    results = results.filter(g => {
      const y = g.release_date ? new Date(g.release_date).getFullYear() : 9999
      return y <= to
    })
  }

  switch (sortBy.value) {
    case 'az':       results.sort((a, b) => a.title.localeCompare(b.title)); break
    case 'za':       results.sort((a, b) => b.title.localeCompare(a.title)); break
    case 'year_desc':results.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0)); break
    case 'year_asc': results.sort((a, b) => new Date(a.release_date || 0) - new Date(b.release_date || 0)); break
    case 'popular':  results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)); break
  }

  return results
})

// --- HELPERS ---

const releaseYear = (game) => {
  if (!game.release_date) return '—'
  const y = new Date(game.release_date).getFullYear()
  return isNaN(y) ? '—' : y
}

const popularityLabel = (pop) => {
  if (!pop) return ''
  if (pop > 500) return 'Very popular'
  if (pop > 100) return 'Popular'
  if (pop > 20) return 'Known'
  return 'Niche'
}

// --- SEARCH ---

const onSearchInput = () => {
  clearTimeout(suggestTimer)
  clearTimeout(searchTimer)

  if (!searchQuery.value.trim()) {
    suggestions.value = []
    searchResults.value = []
    searchFocused.value = true
    return
  }

  // Autocomplete suggestions (fast, lightweight)
  suggestionsLoading.value = true
  suggestTimer = setTimeout(async () => {
    try {
      const { data } = await api.get(`/games/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
      suggestions.value = Array.isArray(data) ? data.slice(0, 6) : []
    } catch (err) {
      logger.error('Autocomplete error:', err)
      suggestions.value = []
    } finally {
      suggestionsLoading.value = false
    }
  }, 200)

  // Full search results (slightly slower debounce)
  searchLoading.value = true
  searchTimer = setTimeout(async () => {
    try {
      const { data } = await api.get(`/games/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
      searchResults.value = Array.isArray(data) ? data : []
    } catch (err) {
      logger.error('Catalog search error:', err)
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 350)
}

const triggerFullSearch = () => {
  searchFocused.value = false
  if (!searchQuery.value.trim()) return
  router.push({ name: 'SearchResults', query: { q: searchQuery.value.trim() } })
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  suggestions.value = []
  activeGenre.value = null
}

const goToGame = (slug) => {
  searchFocused.value = false
  router.push(`/game/${slug}`)
}

// --- GENRE FILTER ---

const toggleGenre = async (genreValue) => {
  if (activeGenre.value === genreValue) {
    activeGenre.value = null
    searchResults.value = []
    return
  }
  activeGenre.value = genreValue
  searchQuery.value = ''
  suggestions.value = []
  searchLoading.value = true
  try {
    const { data } = await api.get(`/games/popular?genre=${encodeURIComponent(genreValue)}&limit=48`)
    searchResults.value = Array.isArray(data) ? data : []
  } catch (err) {
    logger.error('Genre filter error:', err)
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const clearFilters = () => {
  activeGenre.value = null
  yearFrom.value = ''
  yearTo.value = ''
  sortBy.value = 'default'
  searchResults.value = []
}

// --- CAROUSELS ---

const scrollRow = (id, direction) => {
  const container = document.getElementById(id)
  if (!container) return
  const scrollAmount = 500
  const currentScroll = container.scrollLeft
  const maxScroll = container.scrollWidth - container.clientWidth
  const tolerance = 5
  if (direction === 1) {
    container.scrollTo({ left: currentScroll >= maxScroll - tolerance ? 0 : currentScroll + scrollAmount, behavior: 'smooth' })
  } else {
    container.scrollTo({ left: currentScroll <= tolerance ? maxScroll : currentScroll - scrollAmount, behavior: 'smooth' })
  }
}

const fetchGames = async () => {
  // Fetch independently so skeletons appear per-section
  api.get('/games/trending?limit=24').then(res => {
    trendingGames.value = res.data
    trendingLoading.value = false
    topGames.value = res.data.slice().sort(() => Math.random() - 0.5)
    topLoading.value = false
  }).catch(err => {
    logger.error('Error fetching trending:', err)
    trendingLoading.value = false
    topLoading.value = false
  })

  api.get('/games/new?limit=24').then(res => {
    newGames.value = res.data
    newLoading.value = false
  }).catch(err => {
    logger.error('Error fetching new releases:', err)
    newLoading.value = false
  })
}

// --- OUTSIDE CLICK ---

const handleOutsideClick = (e) => {
  if (searchWrapperRef.value && !searchWrapperRef.value.contains(e.target)) {
    searchFocused.value = false
  }
}

// --- RECENTLY VIEWED ---

const loadRecentlyViewed = () => {
  try {
    recentlyViewed.value = JSON.parse(localStorage.getItem('hitboxd_recently_viewed') || '[]')
  } catch {
    recentlyViewed.value = []
  }
}

onMounted(() => {
  fetchGames()
  loadRecentlyViewed()
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  clearTimeout(searchTimer)
  clearTimeout(suggestTimer)
})
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.catalog-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  position: relative;
  overflow-x: hidden;
}

/* ─── HEADER ROW ─────────────────────────────────── */

.header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;
  flex-wrap: wrap;
}

/* Search */
.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 220px;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  pointer-events: none;
}

.catalog-search-input {
  width: 100%;
  padding: 9px 36px 9px 36px;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  outline: none;
  background: white;
  color: #2d2d2d;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.catalog-search-input:focus {
  border-color: var(--brand-cyan, #00AEEF);
  box-shadow: 0 0 0 3px rgba(0, 174, 239, 0.12);
}

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
  padding: 0 2px;
  transition: color 0.2s;
}

.clear-search:hover { color: #555; }

/* Autocomplete */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  z-index: 200;
  max-height: 360px;
  overflow-y: auto;
}

.suggestions-loading {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid #e5e7eb;
  border-top-color: var(--brand-cyan, #00AEEF);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.suggestion-item:hover { background: #f3f4f6; }

.suggestion-cover {
  width: 30px;
  height: 40px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
}

.suggestion-info {
  display: flex;
  flex-direction: column;
}

.suggestion-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2d2d2d;
}

.suggestion-year {
  font-size: 0.72rem;
  color: #888;
}

.see-all-suggestion {
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-top: 1px solid #eee;
  color: var(--brand-cyan);
  font-size: 0.82rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.see-all-suggestion:hover { background: #f3f4f6; }

/* Filter toggle */
.filter-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  color: #555;
  white-space: nowrap;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  position: relative;
}

.filter-toggle-btn:hover,
.filter-toggle-btn.active {
  border-color: var(--brand-cyan);
  color: var(--brand-cyan);
  background: rgba(0,174,239,0.05);
}

.filter-badge {
  background: var(--brand-cyan);
  color: white;
  border-radius: 9999px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 5px;
  line-height: 1.4;
}

/* View toggle */
.view-toggle {
  display: flex;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.view-toggle button {
  background: white;
  border: none;
  padding: 8px 10px;
  cursor: pointer;
  color: #888;
  transition: background 0.15s, color 0.15s;
  display: flex;
  align-items: center;
}

.view-toggle button.active {
  background: var(--brand-cyan);
  color: white;
}

.view-toggle button:not(.active):hover {
  background: #f3f4f6;
  color: #555;
}

/* ─── FILTER PANEL ───────────────────────────────── */

.filter-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.2rem 1.5rem;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.filter-groups {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 160px;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #888;
  text-transform: uppercase;
  margin: 0 0 8px 0;
}

.genre-chips,
.sort-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-chip {
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1.5px solid #ddd;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  color: #555;
  background: #fafafa;
  transition: all 0.15s;
  user-select: none;
}

.filter-chip:hover {
  border-color: var(--brand-cyan);
  color: var(--brand-cyan);
}

.filter-chip.active {
  background: var(--brand-cyan);
  border-color: var(--brand-cyan);
  color: white;
}

.year-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.year-input {
  width: 80px;
  padding: 6px 8px;
  border: 1.5px solid #ddd;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #2d2d2d;
  outline: none;
  transition: border-color 0.2s;
}

.year-input:focus { border-color: var(--brand-cyan); }
.year-dash { color: #aaa; font-size: 0.9rem; }

.clear-filters-btn {
  margin-top: 1rem;
  background: none;
  border: none;
  color: #e63946;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s;
}

.clear-filters-btn:hover { color: #c0392b; }

/* Filter transition */
.filter-slide-enter-active,
.filter-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.filter-slide-enter-from,
.filter-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.filter-slide-enter-to,
.filter-slide-leave-from {
  opacity: 1;
  max-height: 400px;
}

/* ─── RECENTLY VIEWED ────────────────────────────── */

.recently-section {
  margin-top: 1.5rem;
}

.recently-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scroll-snap-type: x mandatory;
}

.recently-row::-webkit-scrollbar { height: 3px; }
.recently-row::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }

.recently-item {
  flex-shrink: 0;
  width: 90px;
  cursor: pointer;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.recently-cover {
  width: 90px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  transition: transform 0.2s, box-shadow 0.2s;
}

.recently-item:hover .recently-cover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}

.recently-title {
  font-size: 0.68rem;
  font-weight: 600;
  color: #555;
  text-align: center;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;
}

/* ─── SEARCH RESULTS ─────────────────────────────── */

.search-results-container {
  margin-top: 1.5rem;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.result-count {
  color: #999;
  font-size: 0.85rem;
  font-weight: 400;
  margin-left: 6px;
}

/* Grid */
.results-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.grid-item { width: 180px; }
.grid-item:nth-child(4n + 1) { --hover-color: var(--brand-red); }
.grid-item:nth-child(4n + 2) { --hover-color: var(--brand-cyan); }
.grid-item:nth-child(4n + 3) { --hover-color: var(--brand-green); }
.grid-item:nth-child(4n)     { --hover-color: var(--brand-yellow); }

/* List */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  border: 1px solid #eee;
}

.list-item:hover {
  background: #f0f9ff;
  transform: translateX(3px);
  border-color: var(--brand-cyan);
}

.list-cover {
  width: 36px;
  height: 48px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
}

.list-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.list-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2d2d2d;
}

.list-meta {
  font-size: 0.75rem;
  color: #888;
}

.list-pop {
  flex-shrink: 0;
}

.pop-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #aaa;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 9999px;
}

.list-arrow {
  color: #ccc;
  flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}

.list-item:hover .list-arrow {
  color: var(--brand-cyan);
  transform: translateX(3px);
}

/* No results */
.no-results {
  text-align: center;
  margin-top: 40px;
  font-size: 1.1rem;
  color: #888;
}

/* ─── SKELETON ───────────────────────────────────── */

.loading-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.skeleton-card {
  width: 180px;
  aspect-ratio: 3/4;
  border-radius: 6px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ─── CAROUSELS ──────────────────────────────────── */

.default-view { margin-top: 1.5rem; }

.game-section {
  margin-bottom: 3rem;
  padding: 0 30px;
}

.section-title {
  font-family: 'Courier Prime', monospace;
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 10px;
  margin-top: 1.2rem;
}

.carousel-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
}

.carousel-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 15px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  scroll-behavior: smooth;
  flex: 1;
  min-width: 0;
  width: 100%;
}

.carousel-track::-webkit-scrollbar { display: none; }

.carousel-item {
  min-width: 180px;
  width: 180px;
  scroll-snap-align: start;
  flex-shrink: 0;
}

.carousel-item:nth-child(4n + 1) { --hover-color: var(--brand-red); }
.carousel-item:nth-child(4n + 2) { --hover-color: var(--brand-cyan); }
.carousel-item:nth-child(4n + 3) { --hover-color: var(--brand-green); }
.carousel-item:nth-child(4n)     { --hover-color: var(--brand-yellow); }

.nav-btn {
  background: white;
  border: 1px solid #ccc;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1;
  color: #555;
  transition: all 0.2s;
  flex-shrink: 0;
  z-index: 2;
  padding-bottom: 4px;
}

.nav-btn:hover {
  background: var(--brand-cyan, #00AEEF);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.nav-btn.left { margin-right: 10px; }
.nav-btn.right { margin-left: 10px; }

/* ─── ANIMATIONS ─────────────────────────────────── */

.fade-in { animation: fadeIn 0.6s ease; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── RESPONSIVE ─────────────────────────────────── */

@media (max-width: 1024px) {
  .catalog-container { padding: 1.5rem; }
}

@media (max-width: 768px) {
  .header-row { gap: 8px; }
  .search-wrapper { max-width: 100%; }
  .carousel-item, .grid-item { min-width: 100px; width: 100px; }
  .skeleton-card { width: 100px; }
  .section-title { font-size: 1.1rem; }
  .results-grid { gap: 10px; justify-content: center; }
  .filter-groups { flex-direction: column; gap: 1rem; }
}
</style>
