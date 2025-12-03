<template>
  <div class="modal-overlay" @click.self="$emit('close')">  
    <div class="modal-content">
      <loginComponent 
        v-if="currentView === 'login'" 
        @switch="currentView = 'register'"
        @close="$emit('close')" 
      />
      <registerComponent 
        v-else 
        @switch="currentView = 'login'" 
        @close="$emit('close')" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import loginComponent from './loginComponent.vue'
import registerComponent from './registerComponent.vue'

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
  z-index: 1000;
  background: transparent; 
}

.modal-content {
  position: absolute;
  top: 5px; 
  right: 1rem; 
  
  @media (min-width: 1300px) {
    right: calc((100vw - 1200px) / 2 + 2rem);
  }

  background: #E3E4E8 ; 
  padding: 1.5rem;
  width: auto;
  animation: slideDown 0.2s ease-out;
}

.modal-content::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
    background-image: url('/assets/bg-texture.jpg'); 
  background-repeat: repeat;
  background-size: 400px; 
  opacity: 0.1; 
  pointer-events: none;
  z-index: 0; 
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-body {
  position: relative;
  z-index: 1;
}

</style>