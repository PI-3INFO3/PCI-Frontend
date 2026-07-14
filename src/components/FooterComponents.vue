<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const abriMenu = ref(false)
const route = useRoute()
</script>
<template>
  <footer>
    <div class="navbar">
    <nav>
      <ul>
        <li>
          <span
            class="btn"
            @click="abriMenu = true "
          >
          <!--:class="{ active: ativo === 'menu' }"-->
            <ion-icon name="menu"></ion-icon>
          </span>
        </li>

        
          <li>
            <span
              class="btn"
              @click="ativo = 'heart'"
            >
            <!-- :class="{ active: ativo === 'heart' }"-->
              <ion-icon name="heart-outline"></ion-icon>
            </span>
          </li>
        
<RouterLink to="/favoritos">
  <li>
    <span
      class="btn"
      :class="{ active: route.path === '/favoritos' }"
    >
      <ion-icon name="star-outline"></ion-icon>
    </span>
  </li>
</RouterLink>

<RouterLink to="/">
  <li>
    <span
      class="btn"
      :class="{ active: route.path === '/' }"
    >
      <ion-icon name="folder-open-outline"></ion-icon>
    </span>
  </li>
</RouterLink>

        <li>
          <span
            class="btn"
            @click="ativo = 'grid'"
          >
          <!-- :class="{ active: ativo === 'grid' }"-->
            <ion-icon name="grid-outline"></ion-icon>
          </span>
        </li>
      </ul>
      <div 
      v-if="abriMenu"
    class="overlay"
    @click="abriMenu = false"></div>

    <aside :class="['sidebar', {open: abriMenu}]">
      
      <img src="/logo-72x72.png" alt="soul." class="logo-img"
      >
      

</aside>
      <button class="fab">+</button>
    </nav>
    </div>
  </footer>
</template>


<style>
.logo-img{
  margin-right: 80px;
}
.sidebar h2 {
  color: var(--cor-texto);
  margin-bottom: 15px;
}
</style>