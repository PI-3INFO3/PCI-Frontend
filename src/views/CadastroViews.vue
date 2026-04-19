<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const ativo = ref('')

const nome = ref('')
const email = ref('')
const senha = ref('')
const confirmarSenha = ref('')

function proximaEtapa() {
  if (!nome.value || !email.value || !senha.value || !confirmarSenha.value) {
    alert('Preencha todos os campos')
    return
  }

  if (senha.value !== confirmarSenha.value) {
    alert('As senhas não coincidem')
    return
  }

  router.push('/')
}
</script>

<template>
  <img src="/public/logo-96x96.png" alt="logo">

  <form @submit.prevent="proximaEtapa">
    <legend><span>Cadastre-se</span></legend>

    <div class="input-box"
      :class="{active: ativo === 'Nome'}"
      @click="ativo = 'Nome'"
    >
      <ion-icon name="person-outline"></ion-icon>
      <input v-model="nome" type="text" placeholder="Nome" required>
    </div>

    <div class="input-box"
      :class="{active: ativo === 'Email'}"
      @click="ativo = 'Email'"
    >
      <ion-icon name="mail-outline"></ion-icon>
      <input v-model="email" type="email" placeholder="Email" required>
    </div>

    <div class="input-box"
      :class="{active: ativo === 'Senha'}"
      @click="ativo = 'Senha'"
    >
      <ion-icon name="lock-closed-outline"></ion-icon>
      <input v-model="senha" type="password" placeholder="Senha" required>
    </div>

    <div class="input-box"
      :class="{active: ativo === 'Confirmar'}"
      @click="ativo = 'Confirmar'"
    >
      <ion-icon name="eye-off-outline"></ion-icon>
      <input v-model="confirmarSenha" type="password" placeholder="Confirmar senha" required>
    </div>

    <button type="submit">Cadastrar?</button>
  </form>
</template>
<script setup>
</script>

<style scoped>
*{
  margin:0;
  padding: 0;
  box-sizing: border-box;
}

img{
  display: block;
  margin: 20px auto;
  margin-top: -5px;
 filter:  
 drop-shadow(0 6px 1px rgba(0,0,0,0.10))
drop-shadow(0 0 4px rgba(0,0,0,0.1));
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
span{
    border: none;
    border: transparent;
    text-shadow: 0px 5px 5px rgba(0,0,0,.30);
}
/* INPUT + ÍCONE */
.input-box {
  position: relative;
  width: 260px;
  border-radius: 20px; 
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  transition: transform .3s ease;
}
.input-box.active{ 
transform: scale(1.1);
box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
}

.input-box input {
  width: 100%;
  padding: 12px 20px 12px 45px;

  border-radius: 40px;
  border: 2px solid #FF5700;

  font-size: 14px;
  outline: none;
}

/* ÍCONE */
.input-box ion-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);

  font-size: 18px;
  color: #000;
}

/* BOTÃO */
button {
  padding: 10px 80px;
  border-radius: 40px;
  background-color: #FF5700;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition:  transform 10s ease-in-out;

}
button:active{
transform: scale(1.1);
}
</style>