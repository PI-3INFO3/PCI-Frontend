<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const rememberMe = ref(false)

const handleLogin = () => {

  console.log('Dados:', { 
    username: username.value, 
    password: password.value, 
    remember: rememberMe.value 
  })
}
</script>

<template>
  <div class="login-container">
    <img src="/logo-144x144.png" alt="Logo">
    
    <form @submit.prevent="handleLogin">
      <h2>Login</h2>

      <div class="input-group">
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          placeholder="Usuário" 
          required 
        >
      </div>

      <div class="input-group">
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          placeholder="Senha" 
          required
        >
      </div>

      <label class="checkbox-label">
        <input type="checkbox" v-model="rememberMe">
        Lembre de mim
      </label>
      
      <button type="submit">Entrar</button>
    </form>
    
    <p>Não tem conta? <a href="/register">Clique aqui</a></p>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

img {
  display: block;
  margin: 0 auto 20px auto;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px; 
}

h2 {
  font-size: 36px;
  font-weight: bold;
  color: #FF5700;
  margin: 0;
}

.input-group {
  width: 100%;
  display: flex;
  justify-content: center;
}

input[type="text"],
input[type="password"] {
  width: 80%;
  padding: 10px 45px; 
  border-radius: 40px;
  border: 2px solid #FF5700;
  font-size: 15px;
  outline: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); 
  
  transition: transform .2s ease, border-color .2s ease;
}

input:focus { 
  transform: scale(1.03); 
  border-color: #FF4500;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  cursor: pointer;
}

button {
  width: 85%;
  padding: 12px 0;
  border-radius: 43px;
  background-color: #FF5700;
  border: none;
  color: white;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform .1s ease, background-color .2s ease;
}

button:hover {
  background-color: #FF4500;
}

button:active {
  transform: scale(0.98); /* Efeito de clique físico para dentro, mais natural */
}

p {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 30px;
  font-size: 16px;
}

a {
  color: #FF5700;
  text-decoration: none;
  font-weight: bold;
}

a:active {
  text-decoration: underline;
}
</style>
