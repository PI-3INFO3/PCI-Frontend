<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ToastNotification from '../components/ToastNotifification.vue'

const router = useRouter()
const authStore = useAuthStore()

const ativo = ref('')
const nome = ref('')
const email = ref('')
const senha = ref('')
const confirmarSenha = ref('')

const mostrarSenha = ref(false)
const mostrarConfirmarSenha = ref(false)

const mensagem = ref('')
const tipoMensagem = ref('sucesso')
const mostrarMensagem = ref(false)

function exibirMensagem(texto, tipo = 'sucesso') {
  mensagem.value = texto
  tipoMensagem.value = tipo
  mostrarMensagem.value = true
}

function fecharToast() {
  mostrarMensagem.value = false
}

async function proximaEtapa() {
  if (!nome.value || !email.value || !senha.value || !confirmarSenha.value) {
    alert('Preencha todos os campos')
    return
  }

  if (senha.value !== confirmarSenha.value) {
    alert('As senhas não coincidem')
    return
  }

  const tipoUsuario = sessionStorage.getItem('user_type')
  if (!tipoUsuario) {
    alert('Erro: tipo de usuário não selecionado')
    return
  }

  await authStore.register({
    name: nome.value,
    email: email.value,
    password: senha.value,
    user_type: tipoUsuario
  })

  if (!authStore.error) {
    exibirMensagem('Cadastro realizado com sucesso!', 'sucesso')
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } else {
    exibirMensagem(authStore.error, 'erro')
  }
}
</script>

<template>
  <div class="pagina-tipo">
  <img src="/icons/logo-96x96.png" alt="logo">
  <ToastNotification 
    :mensagem="mensagem" 
    :tipo="tipoMensagem" 
    :mostrar="mostrarMensagem"
    @fechar="fecharToast"
  />
  <form @submit.prevent="proximaEtapa">
    <legend><span>Cadastre-se</span></legend>

  
    <div class="input-box" :class="{active: ativo === 'Nome'}" @click="ativo = 'Nome'">
      <ion-icon name="person-outline"></ion-icon>
      <input v-model="nome" type="text" placeholder="Nome" required>
    </div>

    <div class="input-box" :class="{active: ativo === 'Email'}" @click="ativo = 'Email'">
      <ion-icon name="mail-outline"></ion-icon>
      <input v-model="email" type="email" placeholder="Email" required>
    </div>

    <div class="input-box" :class="{active: ativo === 'Senha'}" @click="ativo = 'Senha'">
      <ion-icon
        :name="mostrarSenha ? 'lock-open-outline' : 'lock-closed-outline'"
        class="icon-senha"
        @click.stop="mostrarSenha = !mostrarSenha"
      ></ion-icon>
      <input v-model="senha" :type="mostrarSenha ? 'text' : 'password'" placeholder="Senha" required>
    </div>

    <div class="input-box" :class="{active: ativo === 'Confirmar'}" @click="ativo = 'Confirmar'">
      <ion-icon
        :name="mostrarConfirmarSenha ? 'eye-outline' : 'eye-off-outline'"
        class="icon-olho"
        @click.stop="mostrarConfirmarSenha = !mostrarConfirmarSenha"
      ></ion-icon>
      <input v-model="confirmarSenha" :type="mostrarConfirmarSenha ? 'text' : 'password'" placeholder="Confirmar senha" required>
    </div>

    <button class="cdt" type="submit">Cadastrar</button>
  </form>
</div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  
}

.pagina-tipo{
  min-height: 100vh;
  background-color: #fff;
  color: #000;
  padding-top: 20px;
}
img {
  display: block;
  margin: 20px auto;
  margin-top: -5px;
  filter: drop-shadow(0 6px 1px rgba(0,0,0,0.10)) drop-shadow(0 0 4px rgba(0,0,0,0.1));
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

legend {
  font-size: 42px;
  font-weight: 800;
  color: #FF5700;
}

span {
  border: none;
  text-shadow: 0px 5px 5px rgba(0,0,0,.30);
}

.icon-senha, .icon-olho {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  z-index: 10;
}

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  
  width: 300px;            
  min-height: 60px;        
  padding: 0 10px;         
  border-radius: 10px;
  font-weight: 700;
  font-size: 18px;
  color: #000;
  background: #fff;
  border: 2px solid #FF5700;
  
  display: flex;
  justify-content: space-between; 
  align-items: center;
  text-align: left;
  z-index: 9999;
  user-select: none;
  
  
  animation: 
    descer 0.5s ease-out forwards,
    movi 1s ease-in-out infinite 0.5s;
}

.toast.erro {
  background-color: #dc3545;
  color: #fff;
  border: 1px solid #dc3545;
}

.fechar-toast {
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 15px;
  color: inherit;
}

@keyframes descer {
  0% {
    top: -120px; 
    opacity: 0;
  }
  100% {
    top: 20px; 
    opacity: 1;
  }
}

@keyframes movi {
  0% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(.95);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}

.input-box {
  position: relative;
  width: 260px;
  border-radius: 20px; 
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  transition: transform .3s ease;
}

.input-box.active { 
  transform: scale(1.1);
}

.input-box input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border-radius: 40px;
  border: 2px solid #FF5700;
  font-size: 14px;
  outline: none;
}

.input-box ion-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #000;
}

.cdt {
  padding: 10px 80px;
  border-radius: 40px;
  background-color: #FF5700;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.cdt:active {
  transform: scale(1.1);
}
/* =========================
   COMPUTADOR / PROJETOR
   ========================= */
@media (min-width: 1025px) {

  .pagina-tipo {
    padding-top: 45px;
  }

  .pagina-tipo > img {
    width: 120px;
    height: 120px;
    margin: 10px auto 35px;
  }

  form {
    gap: 28px;
  }

  legend {
    font-size: 58px;
    margin-bottom: 15px;
  }

  .input-box {
    width: 500px;
  }

  .input-box input {
    padding: 18px 25px 18px 58px;
    font-size: 19px;
  }

  .input-box ion-icon {
    left: 20px;
    font-size: 26px;
  }

  .icon-senha,
  .icon-olho {
    font-size: 26px;
  }

  .cdt {
    padding: 16px 140px;
    font-size: 22px;
  }
}
</style>
