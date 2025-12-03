<template>
  <div class="login-bar">
    <form @submit.prevent="login" class="compact-form">
      <button type="button" class="close-x" @click="$emit('close')">×</button>
      <div class="field-col">
        <label for="username" class="field-label">Username</label>
        <input 
          type="text" 
          id="username" 
          v-model="email" 
          class="retro-input"
        >
      </div>

      <div class="field-col">
        <div class="label-row">
          <label for="password" class="field-label">Password</label>
          <a href="#" class="forgot-link">Forgotten?</a>
        </div>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          class="retro-input"
        >
      </div>

      <div class="actions-col">
        <div class="remember-row">
          <input type="checkbox" id="remember" class="retro-checkbox" v-model="rememberMe">
          <label for="remember" class="remember-label">Remember me</label>
        </div>
        
        <button type="submit" class="btn-signin" :disabled="isLoading">
          {{ isLoading ? '...' : 'SIGN IN' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

defineEmits(['switch', 'close'])

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const rememberMe = ref(false) 

const login = () => {
  isLoading.value = true
  const API_URL = 'https://api-proyecto-production-519c.up.railway.app/api'; 
  
  axios.post(`${API_URL}/auth/login`, {
    email: email.value,
    password: password.value
  })
  .then(response => {
     console.log("Login exitoso", response.data);
     const token = response.data.token;
     if (rememberMe.value) {
       localStorage.setItem('token', token);
     } else {
       sessionStorage.setItem('token', token);
     }
     window.location.reload(); 
  })
  .catch(error => {
    console.error("Error", error);
    alert("Usuario o contraseña incorrectos");
  })
  .finally(() => {
    isLoading.value = false;
  })
}
</script>

<style scoped>
.login-bar {
  display: flex;
  align-items: center;
}

.compact-form {
  display: flex;
  align-items: flex-end; 
  gap: 15px;
}

.close-x {
  background: none;
  border: none;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 5px;
  margin-right: 5px;
  line-height: 1;
  align-self: center; 
}
.close-x:hover { color: #000; }

.field-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.field-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem; 
  color: #666;
  font-weight: 600;
  text-transform: uppercase; 
}

.forgot-link {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #FF4444; 
  text-decoration: none;
  font-weight: 600;
}
.forgot-link:hover { text-decoration: underline; }

.retro-input {
  background-color: #9CA3AF; 
  border: none;
  border-radius: 3px;
  height: 28px; 
  width: 140px;
  padding: 0 8px;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}
.retro-input:focus { background-color: #88909c; }

.actions-col {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 28px; 
}

.remember-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.retro-checkbox {
  accent-color: #757575; 
  cursor: pointer;
}

.remember-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #666;
  white-space: nowrap;
}

.btn-signin {
  background-color: #00AEEF; 
  color: white;
  border: none;
  border-radius: 3px;
  padding: 0 16px;
  height: 28px; 
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.btn-signin:hover {
  background-color: #00CC66;
}

@media (max-width: 768px) {
  .compact-form {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .retro-input { width: 100%; height: 36px; }
  .btn-signin { height: 36px; width: 100%; }
  
  .actions-col {
    flex-direction: row;
    justify-content: space-between;
    height: auto;
  }
  
  .close-x {
    align-self: flex-end;
    font-size: 1.5rem;
    margin-bottom: -10px;
  }
}
</style>