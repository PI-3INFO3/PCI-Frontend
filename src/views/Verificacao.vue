<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import ToastNotification from '../components/ToastNotifification.vue';

const router = useRouter();
const authStore = useAuthStore();

const codigo2fa = ref('');
const loading = ref(false);
const errorMessage = ref('');
const menuOpcoesAberto = ref(true);

const mensagem = ref('');
const tipoMensagem = ref('sucesso');
const mostrarMensagem = ref(false);

function exibirMensagem(texto, tipo = 'sucesso') {
  mensagem.value = texto;
  tipoMensagem.value = tipo;
  mostrarMensagem.value = true;
}

function fecharToast() {
  mostrarMensagem.value = false;
}

async function handleVerificacao() {
  if (codigo2fa.value.length < 6) {
    errorMessage.value = 'Por favor, insira o código de 6 dígitos.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    await authStore.verify2FA(codigo2fa.value);
    exibirMensagem('E-mail verificado com sucesso!', 'sucesso');
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail ??
      'Código inválido ou expirado. Tente novamente.';
  } finally {
    loading.value = false;
  }
}

async function reenviarCodigo() {
  try {
    if (authStore.resend2FACode) {
      await authStore.resend2FACode();
      exibirMensagem('Um novo código de verificação foi enviado para o seu e-mail.', 'sucesso');
    }
  } catch (err) {
    exibirMensagem('Erro ao reenviar código. Tente mais tarde.', 'erro');
  }
}

function cancelarAutenticacao() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="verificacao-tela-cheia">
    
    <img src="/logo-96x96.png" alt="SOUL Logo" class="logo-soul">

    <ToastNotification
      :mensagem="mensagem"
      :tipo="tipoMensagem"
      :mostrar="mostrarMensagem"
      @fechar="fecharToast"
    />
    
    <p class="texto-informativo">
      Autenticação de dois fatores. Enviamos um código para o seu E-mail. Insira-o abaixo. Insira o código de verificação.
    </p>

    <div v-if="errorMessage" class="error-feedback">{{ errorMessage }}</div>

    <!-- Formulário -->
    <form @submit.prevent="handleVerificacao">
      <div class="input-group">
        <input 
          id="codigo"
          v-model="codigo2fa"
          type="text"
          placeholder="xxxxxx"
          maxlength="6"
          required
          autocomplete="one-time-code"
        >
      </div>

      <button type="submit" :disabled="loading" class="btn-verificar">
        {{ loading ? 'Verificando...' : 'Verificar.' }}
      </button>
    </form>

    <div class="dropdown-opcoes">
      <button type="button" class="btn-dropdown-gatilho" @click="menuOpcoesAberto = !menuOpcoesAberto">
        <span>Opções</span>
        <ion-icon :name="menuOpcoesAberto ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
      </button>
      
      <div v-if="menuOpcoesAberto" class="conteudo-dropdown">
        <button type="button" class="opcao-item" @click="reenviarCodigo">Enviar novamente</button>
        <button type="button" class="opcao-item" @click="cancelarAutenticacao">Cancelar</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.verificacao-tela-cheia {
  width: 100vw;
  min-height: 100vh;
  background-color: #e3e3e3; 
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 30px;
  box-sizing: border-box;
}

.logo-soul {
  display: block;
  margin: 0 auto 30px auto;
  max-height: 90px;
  object-fit: contain;
}

.texto-informativo {
  color: #000000;
  font-size: 13.5px;
  font-weight: 700;
  text-align: center;
  line-height: 1.4;
  margin-bottom: 35px;
  max-width: 290px;
}

.error-feedback {
  color: #dc2626;
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 12px;
  text-align: center;
}

form {
  width: 100%;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.input-group {
  width: 100%;
  display: flex;
  justify-content: center;
}

input[type="text"] {
  width: 100%;
  padding: 11px 20px;
  border-radius: 40px;
  border: 1px solid #FF5700;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 4px;
  text-align: center;
  outline: none;
  background-color: #ffffff;
  color: #000000;
}

.btn-verificar {
  width: 100%;
  padding: 12px 0;
  border-radius: 43px;
  background-color: #FF5700;
  border: none;
  color: white;
  font-size: 15px;
  font-weight: bold;
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform .1s ease;
}

.btn-verificar:active {
  transform: scale(0.98);
}

.dropdown-opcoes {
  width: 100%;
  max-width: 280px;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Caixa superior "Opções" */
.btn-dropdown-gatilho {
  width: 100%;
  padding: 8px 14px;
  background-color: #e3e3e3;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  color: #000000;
  font-size: 15px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;
}

.conteudo-dropdown {
  width: 100%;
  background-color: #e3e3e3;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 6px 0;
}

.opcao-item {
  width: 100%;
  padding: 6px 14px;
  background: transparent;
  border: none;
  color: #000000;
  font-size: 14px;
  font-weight: bold;
  text-align: left;
  cursor: pointer;
}

.opcao-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>