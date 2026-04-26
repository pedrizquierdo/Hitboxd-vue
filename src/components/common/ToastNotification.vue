<template>
  <transition name="toast-fade">
    <div v-if="toast.show" class="toast-notification" :class="toast.type">
      <p>{{ toast.message }}</p>
    </div>
  </transition>
</template>

<script setup>
import { useToastStore } from '@/stores/toastStore'

const toast = useToastStore()
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  padding: 15px 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: 600;
  color: white;
  min-width: 280px;
}
.toast-notification p {
  margin: 0;
}
.toast-notification.success { background-color: #00cc66; }
.toast-notification.error   { background-color: #ff4444; }

.toast-fade-enter-active,
.toast-fade-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.toast-fade-enter-from,
.toast-fade-leave-to     { opacity: 0; transform: translateY(-16px); }
</style>
