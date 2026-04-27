<template>
  <div
    class="star-wrap"
    :class="{ 'disabled-cursor': disabled }"
    @mouseleave="resetHover"
  >
    <span
      v-for="n in 5"
      :key="n"
      class="star"
      @mousemove="disabled ? null : setHover($event, n)"
      @click="disabled ? null : update($event, n)"
    >
      <svg class="star-svg star-base" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>

      <svg class="star-svg star-half" :class="{ active: getLeftActive(n) }" viewBox="0 0 24 24" fill="currentColor">
        <defs>
          <clipPath :id="`left-${uid}-${n}`">
            <rect x="0" y="0" width="12" height="24"/>
          </clipPath>
        </defs>
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          :clip-path="`url(#left-${uid}-${n})`"
        />
      </svg>

      <svg class="star-svg star-half" :class="{ active: getRightActive(n) }" viewBox="0 0 24 24" fill="currentColor">
        <defs>
          <clipPath :id="`right-${uid}-${n}`">
            <rect x="12" y="0" width="12" height="24"/>
          </clipPath>
        </defs>
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          :clip-path="`url(#right-${uid}-${n})`"
        />
      </svg>
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  disabled: Boolean
});

const emit = defineEmits(['update:modelValue']);

const uid = Math.random().toString(36).slice(2);
const hoverValue = ref(0);

const displayValue = computed(() =>
  props.disabled ? props.modelValue : (hoverValue.value || props.modelValue)
);

const getLeftActive  = (n) => displayValue.value >= n - 0.5;
const getRightActive = (n) => displayValue.value >= n;

const setHover = (event, n) => {
  const rect = event.currentTarget.getBoundingClientRect();
  hoverValue.value = (event.clientX - rect.left) < rect.width / 2 ? n - 0.5 : n;
};

const resetHover = () => {
  hoverValue.value = 0;
};

const update = (event, n) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const clicked = (event.clientX - rect.left) < rect.width / 2 ? n - 0.5 : n;
  emit('update:modelValue', clicked === props.modelValue ? 0 : clicked);
};
</script>

<style scoped>
.star-wrap {
  font-size: 1.6rem;
  cursor: pointer;
  display: inline-flex;
  gap: 6px;
}

.star-wrap.disabled-cursor {
  cursor: default;
}

.star {
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
}

.star-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 1em;
  height: 1em;
}

.star-base {
  color: #c9c9c9;
}

.star-half {
  color: #c9c9c9;
  transition: color 0.15s ease;
}

.star-half.active {
  color: var(--brand-cyan, #00AEEF);
}
</style>
