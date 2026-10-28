<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const mostrarSenha = ref(false)

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const rememberMe = ref(false)

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(email.value, password.value, rememberMe.value);
    await authStore.fetchUser();
    router.push('/');
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail ??
      'Erro ao entrar. Verifique suas credenciais.';
  } finally {
    loading.value = false;
  }
}

function irParaCadastro() {
  router.push('/tipo-de-usuario')
}
</script>

<template>
  <section class="pagina">
  <div class="login-container">
    <img
      src="/icons/logo-96x96.png"
      alt="Logo"
    >
    <form @submit.prevent="handleLogin">
      <h2>Login</h2>

      <div class="input-group">
        <ion-icon
          name="person-outline"
          class="icon-input"
        ></ion-icon>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          required
          autocomplete="email"
        >
      </div>

      <div class="input-group">
        <!-- O olho agora fica no mesmo lugar que o boneco -->
        <ion-icon
          :name="
            mostrarSenha
              ? 'eye-outline'
              : 'eye-off-outline'
          "
          class="icon-olho"
          @click.stop="mostrarSenha = !mostrarSenha"
        ></ion-icon>
        
        <input
          :type="mostrarSenha ? 'text' : 'password'"
          id="password"
          v-model="password"
          placeholder="Senha"
          required
          autocomplete="current-password"
        >
      </div>

      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="rememberMe"
        >
        Lembre de mim
      </label>

      <button
        type="submit"
        :disabled="loading"
      >
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
    <p>
      Não tem conta?
      <a
        @click.stop="irParaCadastro"
        class="pointer"
      >
        Clique aqui
      </a>
    </p>
  </div>
  </section>
</template>

<style scoped>
.pointer {
  cursor: pointer;
}

.pagina {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  overflow-y: auto;
  background: #ffffff;
  color: #111111;
  box-sizing: border-box;
}

.login-container {
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: clamp(1.25rem, 5vw, 2rem);
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-sizing: border-box;
  
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
  align-items: center;
  position: relative;
  transition: transform .2s ease;
}

.input-group:focus-within {
  transform: scale(1.03);
}

.input-group input {
  width: 80%;
  padding: 10px 45px; /* Mantém o espaçamento igual em ambos os inputs */
  border-radius: 40px;
  border: 2px solid #FF5700;
  font-size: 15px;
  outline: none;
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.15);
  background-color: transparent;
  transition: border-color .2s ease;
}

/* Borda no foco */
.input-group:focus-within input {
  border-color: #FF4500;
}

/* Ícone do Boneco (Esquerda) */
.icon-input {
  position: absolute;
  left: 14%;
  font-size: 20px;
  z-index: 2;
  pointer-events: none;
  color: #666;
}

/* Ícone do Olho (Agora também alinhado à Esquerda) */
.icon-olho {
  position: absolute;
  left: 14%; /* Alinhado perfeitamente com o boneco */
  font-size: 20px;
  z-index: 2;
  cursor: pointer;
  transition: transform .15s ease;
  color: #666;
}

.icon-olho:active {
  transform: scale(1.1);
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
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition:
    transform .1s ease,
    background-color .2s ease;
}

button:hover {
  background-color: #FF4500;
}

button:active {
  transform: scale(0.98);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  text-underline-position: under;
}


@media (max-width: 480px) {
  .pagina {
    padding: 1rem;
    background: #ffffff; 
  }
  .login-container {
    border: none;
    box-shadow: none; 
  }
  .botao {
    max-width: 100%; 
  }

}

@media (max-width: 480px) {
  .pagina, .login-container {
    padding: 1rem;
    background: #ffffff; 
    position: relative;
    min-height: 100vh;
  }
  
  .login-container, form {
    border: none;
    box-shadow: none; 
    padding: 0;
  }
}

</style>
