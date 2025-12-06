<template>
  <div class="register-wrapper">
    <button class="close-x" @click="$emit('close')">×</button>

    <div class="header">
      <div class="cube-icon">
        <img src="/assets/logo.png" alt="Logo" />
      </div>
      <h2>Join Hitboxd</h2>
    </div>

    <form @submit.prevent="register" class="vertical-form">
      <div class="form-group">
        <label for="email">Email address</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          class="retro-input"
        >
      </div>

      <div class="form-group">
        <label for="username">Username</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          class="retro-input"
        >
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          class="retro-input"
        >
      </div>

      <div class="actions">
        <button type="submit" class="btn-join" :disabled="isLoading">
          {{ isLoading ? 'CREATING...' : 'JOIN' }}
        </button>
      </div>
    </form>
    
    <div class="footer-link">
      <p>Already a member? <a href="#" @click.prevent="$emit('switch')">Sign In</a></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/axios'

const emit = defineEmits(['switch', 'close'])

const username = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)

const register = () => {
  isLoading.value = true

  api.post('auth/register', {
    username: username.value,
    email: email.value,
    password: password.value
  })
  .then(response => {
    console.log(response);
    emit('switch');
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    isLoading.value = false;
  });
}
</script>

<style scoped>
.register-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-x {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  line-height: 1;
}
.close-x:hover { color: #000; }

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.cube-icon img {
  width: 50px;
  height: auto;
  margin-bottom: 15px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

h2 {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  color: #2D2D2D;
  font-size: 1.6rem;
  margin: 0;
}

.vertical-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-family: 'Inter', sans-serif;
  color: #555;
  font-size: 0.95rem;
  font-weight: 500;
}

.retro-input {
  background-color: #9CA3AF;
  border: none;
  border-radius: 4px;
  padding: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  outline: none;
  width: 100%;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}
.retro-input:focus { background-color: #88909c; }

.actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.btn-join {
  background-color: #00AEEF;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 40px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  text-transform: uppercase;
  transition: transform 0.1s, filter 0.1s;
  letter-spacing: 0.5px;
}

.btn-join:hover { filter: brightness(1.1); }
.btn-join:active { transform: translateY(1px); }

.footer-link {
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #666;
}
.footer-link a {
  color: #00AEEF;
  font-weight: bold;
  text-decoration: none;
}
.footer-link a:hover { text-decoration: underline; }
</style>
