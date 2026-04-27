<template>
  <Transition name="loader">
    <div v-if="visible" class="loader-overlay">
      <LogoCube :size="64" :animated="true" />
    </div>
  </Transition>
</template>

<script setup>
import LogoCube from '@/components/common/LogoCube.vue';

defineProps({
  visible: { type: Boolean, required: true },
});
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--bg-main, #F2F3F5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-enter-active { transition: opacity 0.2s ease; }
.loader-leave-active { transition: opacity 0.35s ease 0.1s; }
.loader-enter-from,
.loader-leave-to     { opacity: 0; }
</style>
