<template>
  <div 
    class="modal-overlay" 
    :class="{ 'is-dark': currentView === 'register' }"
    @click.self="$emit('close')"
  >
    <div 
      class="modal-content" 
      :class="{ 'is-centered': currentView === 'register' }"
    >
      <div class="modal-body">
        <Transition name="fade" mode="out-in">
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
        </Transition>

      </div>
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
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 1000;
  background: transparent;
  display: flex;
  align-items: center; 
  justify-content: center;
  transition: background-color 0.3s ease;
}

.modal-overlay.is-dark {
  background-color: rgba(0, 0, 0, 0.6); 
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  position: absolute;
  top: -30rem;
  left: 17.5rem;
  background-color: #E3E4E8;
  border-radius: 4px;
  padding: 10px 15px;  
  position: relative; 
  overflow: hidden;
  z-index: 1; 
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-content::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url('/assets/bg-texture.jpg');
  background-repeat: repeat;
  background-size: 400px;
  opacity: 0.1; 
  z-index: -1;
  pointer-events: none;
}

.modal-content.is-centered {
  position: relative;
  top: auto; 
  right: auto;
  left: auto;
  margin: 0;
  min-width: 420px;
  max-width: 90vw;
  padding: 2.5rem;  
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-content {
    right: 1rem; left: 1rem; width: auto;
  }
  .modal-content.is-centered {
    margin-top: 20px;
  }
}
</style>