<template>
  <div class="activity-card" @click="goToGame">
    
    <!-- Header: Quién y Qué hizo -->
    <div class="friend-info">
      <img :src="activity.avatar_url || '/assets/default-avatar.png'" class="avatar" />
      <div class="action-text">
        <span class="username">{{ activity.username }}</span>
        <span class="action">
          {{ formatAction(activity) }}
        </span>
      </div>
    </div>

    <!-- Cover del Juego -->
    <div class="game-cover-wrapper">
      <img :src="activity.cover_url" class="game-img" />
      
      <!-- Rating (si existe) -->
      <div v-if="activity.rating" class="rating-badge">
        ★ {{ activity.rating }}
      </div>
    </div>

    <p class="game-title">{{ activity.title }}</p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  activity: Object
});

const router = useRouter();

const goToGame = () => {
  router.push(`/game/${props.activity.slug}`);
};

const formatAction = (act) => {
  if (act.status === 'played') return 'played';
  if (act.status === 'plan_to_play') return 'wants to play';
  if (act.status === 'playing') return 'is playing';
  if (act.status === 'dropped') return 'dropped';
  return 'updated';
};
</script>

<style scoped>
.activity-card {
  width: 160px;
  flex-shrink: 0;
  cursor: pointer;
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ccc;
}

.action-text {
  display: flex;
  flex-direction: column;
  font-size: 0.7rem;
  line-height: 1.1;
}

.username { font-weight: bold; color: #2D2D2D; }
.action { color: #666; }

.game-cover-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.game-img {
  width: 100%; height: 100%; object-fit: cover;
}

.activity-card:hover .game-cover-wrapper {
  transform: translateY(-3px);
  box-shadow: 0 8px 12px rgba(0,0,0,0.2);
}

.rating-badge {
  position: absolute;
  top: 5px; right: 5px;
  background: rgba(0,0,0,0.8);
  color: #FFD700;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
}

.game-title {
  margin-top: 5px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #444;
}
</style>