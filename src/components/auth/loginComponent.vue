<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <label for="email">Correo Electronico</label>
      <input type="email" id="email" name="email" v-model="email">

      <label for="password">Contraseña</label>
      <input type="password" id="password" name="password" v-model="password">

      <button type="submit">Login</button>
    </form>
    <div class="register">
      <p>No tienes una cuenta?</p>
      <button type="button" @click="$emit('switch')">Registrarse</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

defineEmits(['switch'])
const email = ref('')
const password = ref('')

const API_URL = 'https://api-proyecto-production-519c.up.railway.app/api'

const login = () => {
  axios.post(`${API_URL}/auth/login`, {
    email: email.value,
    password: password.value
  })
    .then(response => {
      console.log("Login exitoso", response.data)
    })
    .catch(error => {
      console.error("Error de Login", error);
      alert("Credenciales incorrectas. Por favor, intenta de nuevo.");
    })
}

</script>

<style scoped>
div {
  width: 100%;
}

h1 {
  color: #2D2D2D;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px; 
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
}

button[type="submit"] {
  background-color: #00CC66; 
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
}

.login, .register {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.login button, .register button {
  background: none;
  border: none;
  color: #00AEEF;
  text-decoration: underline;
  cursor: pointer;
}
</style>
