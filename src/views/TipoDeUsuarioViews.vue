<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const selecionado = ref(null)
const erro = ref(false)

const opcoes = [
  { nome: 'Pessoal', icon: 'person-outline' },
  { nome: 'Educacional', icon: 'school-outline' },
  { nome: 'Profissional', icon: 'briefcase-outline' }
]

function selecionar(valor) {
  selecionado.value = valor
  erro.value = false
}

function proximaEtapa() {
  if (!selecionado.value) {
    erro.value = true
    return
  }

  const mapTipos = {
    'Pessoal': 'personal',
    'Educacional': 'educational',
    'Profissional': 'professional'
  }

  sessionStorage.setItem('user_type', mapTipos[selecionado.value])
  
  router.push('/Cadastro')
}
</script>

<template>
  <img src="/icons/logo-96x96.png" alt="logo">

  <form @submit.prevent="proximaEtapa">

    <div class="select-box">

      <div class="select">
        Sua conta é: </div>

      <div class="select-opcoes">
        <ul>
          <li v-for="opcao in opcoes" 
            :key="opcao.nome" @click="selecionar(opcao.nome)"
            :class="{ ativo: selecionado === opcao.nome }">
            <ion-icon :name="opcao.icon"></ion-icon>
            {{ opcao.nome }}
          </li>
        </ul>
      </div>

      <p v-if="erro" class="erro">
        Selecione uma opção para continuar
      </p>

    </div>

    <button type="submit" :disabled="!selecionado">
      Próxima etapa
    </button>

  </form>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

img {
  display: block;
  margin: 20px auto;
  filter:
    drop-shadow(0 6px 1px rgba(0, 0, 0, 0.10)) drop-shadow(0 0 4px rgba(0, 0, 0, 0.1));
}

.select-box {
  width: 260px;
  margin: 20px auto;
}

.select {
  font-weight: 800;
  font-size: 25px;
  padding: 12px;
  border: 2px solid #FF5700;
  border-radius: 40px;
  text-align: center;
  margin-bottom: 15px;
  background: #fff;
}

.select-opcoes {

  padding: 20px;
  border: 2px solid #FF5700;
  border-radius: 25px;
  background: #fff;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}

.select-opcoes ul li {
  font-weight: 800;
  list-style: none;
  margin-bottom: 15px;

  display: flex;
  align-items: center;
  gap: 10px;

  cursor: pointer;
  padding: 10px;
  border-radius: 10px;

  transition: 0.3s;
}


.select-opcoes ion-icon {
  font-size: 18px;
  color: black;
}

.ativo {
  background: #FF5700;
  color: white;
}

.ativo ion-icon {
  color: white;
}

.select-opcoes ul li:active {
  transform: scale(0.97);
}

.erro {
  color: red;
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
}


button {
  display: block;
  margin: 30px auto;
  padding: 10px 70px;

  border-radius: 40px;
  background-color: #FF5700;
  border: none;

  color: white;
  font-size: 18px;
  cursor: pointer;

  transition: 0.2s;
}

/* clique */
button:active {
  transform: scale(1.05);
}

button:disabled {
  background: #e3e3e3e3;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>