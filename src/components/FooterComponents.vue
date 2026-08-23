<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const abriMenu = ref(false)

function fecharMenu() {
  abriMenu.value = false
}
</script>

<template>
  <div class="overlay" v-if="abriMenu" @click="fecharMenu"></div>

  <aside :class="['sidebar', { open: abriMenu }]">
    <img src="/logo-72x72.png" alt="soul." class="logo-img" />

    <ul class="sidebar-menu"><li>
  <router-link to="/meus-projetos" class="sidebar-link" @click="fecharMenu">
    <ion-icon name="book-outline"></ion-icon>
    <span>Meus projetos</span>
  </router-link>
</li>
      <li>
        <div class="sidebar-link">
          <ion-icon name="bookmark-outline"></ion-icon>
          <span>Projetos em andamento</span>
        </div>
      </li>
      <li>
        <router-link to="/notificacoes" class="sidebar-link" @click="fecharMenu">
          <ion-icon name="notifications-outline"></ion-icon>
          <span>Notificação</span>
        </router-link>
      </li>
      <li>
        <router-link to="/amigos" class="sidebar-link" @click="fecharMenu">
          <ion-icon name="chatbubbles-outline"></ion-icon>
          <span>Chat</span>
        </router-link>
      </li>
    </ul>
  </aside>


  <footer>
    <div class="navbar">
      <nav>
        <ul>
          <li>
            <span class="btn" @click="abriMenu = true">
              <ion-icon name="menu"></ion-icon>
            </span>
          </li>
          <li>
            <router-link to="/favoritos" class="btn" :class="{ active: route.name === 'favoritos' }">
              <ion-icon name="star-outline"></ion-icon>
            </router-link>
          </li>
          <li>
            <router-link to="/designs" class="btn" :class="{ active: route.name === 'designs' }">
              <ion-icon name="folder-open-outline"></ion-icon>
            </router-link>
          </li>
          <li>
            <router-link to="/" class="btn" :class="{ active: route.name === 'home' }">
              <ion-icon name="grid-outline"></ion-icon>
            </router-link>
          </li>
        </ul>
        <router-link to="/criar">
          <button class="fab">+</button>
        </router-link>
        </nav>
    </div>
  </footer>
</template>

<style scoped>
.logo-img{
  margin-right: 140px;
  margin-bottom: 50px;
}
.sidebar h2 {
  color: var(--cor-texto);
  margin-bottom: 15px;
}

.sidebar-logo{
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 30px;
  font-size: 22px;
  font-weight: 800;
  color: #FF7500;
}
.sidebar-logo ion-icon{
  font-size: 18px;
}

.sidebar-menu{
  list-style: none;
  border: none;
}

.sidebar-link{
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  text-decoration: none;
  color: var(--cor-texto);
}

.sidebar-link ion-icon{
  font-size: 22px;
  color: #FF7500;
  flex-shrink: 0;
}
.sidebar-link{
  font-size: 18px;
}

</style>