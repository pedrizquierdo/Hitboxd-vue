<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>
      
      <loginComponent v-if="currentView === 'login'" @switch="currentView = 'register'" />
      <registerComponent v-else @switch="currentView = 'login'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import loginComponent from './loginComponent.vue' // Tus archivos actuales
import registerComponent from './registerComponent.vue' // Tus archivos actuales

const props = defineProps({
  initialView: {
    type: String,
    default: 'login'
  }
})

defineEmits(['close'])

const currentView = ref(props.initialView)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6); 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #F2F3F5; 
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  border: 1px solid #d1d5db;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}
</style>