<template>
  <div class="activity-card" @click="goToGame">

    <img
      :src="activity.cover_url || '/assets/placeholder-game.png'"
      :alt="activity.title"
      class="cover-img"
      loading="lazy"
    />

    <div class="top-overlay">
      <img
        :src="activity.avatar_url || '/assets/default-avatar.png'"
        class="avatar"
        alt=""
      />
      <div class="action-text">
        <span class="friend-name">{{ activity.username }}</span>
        <span class="action">{{ formatAction(activity) }}</span>
      </div>
    </div>

    <div class="bottom-overlay">
      <span class="game-title">{{ activity.title }}</span>
      <span v-if="activity.rating" class="mini-stars">
        <svg
          v-for="n in filledStarCount"
          :key="'f' + n"
          width="10" height="10" viewBox="0 0 24 24" fill="currentColor"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
        <svg
          v-if="hasHalfStar"
          key="half"
          width="10" height="10" viewBox="0 0 24 24" fill="currentColor"
        >
          <defs>
            <clipPath id="half-act">
              <rect x="0" y="0" width="12" height="24"/>
            </clipPath>
          </defs>
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            clip-path="url(#half-act)"
          />
        </svg>
      </span>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  activity: Object
});

const router = useRouter();

const goToGame = () => {
  router.push(`/game/${props.activity.slug}`);
};

const formatAction = (act) => {
  if (act.status === 'played')       return 'played';
  if (act.status === 'plan_to_play') return 'wants to play';
  if (act.status === 'playing')      return 'is playing';
  if (act.status === 'dropped')      return 'dropped';
  return 'updated';
};

const filledStarCount = computed(() => Math.floor(props.activity.rating || 0));
const hasHalfStar     = computed(() => (props.activity.rating || 0) % 1 >= 0.5);
</script>

<style scoped>
.activity-card {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid transparent;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.5);
  border-color: var(--brand-cyan, #00AEEF);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.top-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 6px 6px 20px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%);
  display: flex;
  align-items: center;
  gap: 5px;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255,255,255,0.4);
  flex-shrink: 0;
}

.action-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.friend-name {
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action {
  font-size: 0.6rem;
  color: rgba(255,255,255,0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottom-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px 6px 6px;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.game-title {
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  line-height: 1.2;
}

.mini-stars {
  display: flex;
  gap: 1px;
  color: var(--brand-cyan, #00AEEF);
}
</style>
