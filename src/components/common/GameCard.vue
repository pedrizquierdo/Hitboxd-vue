<template>
  <div class="game-card">
    <img 
      :src="game.cover_url || '/assets/placeholder-game.png'" 
      :alt="game.title" 
      loading="lazy" 
    />
    
    <div class="game-overlay">
      <span class="game-title">{{ game.title }}</span>
    </div>
  </div>
</template>


<script setup>
defineProps({
  game: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.game-card {
  width: 100%;
  aspect-ratio: 3/4;
  background-color: #757575;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
  border: 2px solid transparent; 
}

.game-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0,0,0,0.5);
  border-color: var(--hover-color, #00AEEF); 
}

.game-card:hover .game-overlay {
  opacity: 1;
}

.game-overlay {
  position: absolute;
  bottom: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 30%, transparent 100%);
  display: flex; align-items: flex-end; padding: 10px 5px 5px;
  opacity: 0; transition: opacity 0.2s ease;
}

.game-title {
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  line-height: 1.2;
}
</style>