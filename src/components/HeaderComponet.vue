<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const fotoPerfil = computed(() =>
  auth.user?.profile_photo?.url || ''
)

function irParaPerfil() {
  router.push('/user')
}

function inicio() {
  router.push('/')
}
</script>
<template>
  <header class="header">
    <div class="logo">
      <img src="/logo-48x48.png" alt="soul." class="logo-img"
      @click.stop="inicio">
    
    <div class="user-card">
      <div class="foto-container" @click.stop="irParaPerfil">
      <img
      v-if="fotoPerfil"
      :src="fotoPerfil"
      alt="Foto do usuário"
      />

  <ion-icon
    v-else
    class="foto-icon"
    name="person-circle-outline">
  </ion-icon>
</div>

      </div>
    </div>
  

    <div class="search-container">
      <div class="search-wrapper">
        <ion-icon name="search-outline" class="search-icon"></ion-icon>
        <input type="text" class="search-bar" placeholder="Buscar...">
      </div>
    </div>

  </header>
</template>

<style scoped>
.header {
  padding: 16px 16px 12px 16px;
  background-color: var(--cor-fundo);
}

.logo {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}

.search-container {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  width: 100%;
  transition: transform 0.2s ease-in-out;
}

.search-container:focus-within {
  transform: scale(1.05);
}

.search-wrapper {
  position: relative;
  width: 90%;
}


.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: var(--cor-texto);
}

.foto-container img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ff6b00;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  transform: translateZ(0);
}

.foto-icon {
  font-size: 50px;
  color: var(--cor-texto-secundario);
}

.btn-mais {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 18px;
  height: 18px;
  background: #ff6b00;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
}

.search-bar {
  width: 100%;
  height: 42px;
  border: 2px solid #FF6B00;
  border-radius: 30px;
  padding-left: 50px;
  padding-right: 16px;
  background-color: transparent;
  color: var(--cor-texto);
  font-size: 15px;
  outline: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.45);
}
.visualizador {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.foto-grande {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #fff;
}
.search-bar:focus {
  animation: mudarSombra 1s ease-in-out;
}

@keyframes mudarSombra {
  0% {
    box-shadow: 0 4px 15px rgba(255, 107, 0, 0.8);
    border-color: #FF6B00;
  }

  50% {
    box-shadow: 0 4px 20px rgba(255, 107, 0, 1);
  }

  100% {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.10);
  }
}
</style>