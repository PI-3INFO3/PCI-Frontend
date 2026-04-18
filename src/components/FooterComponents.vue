        <script setup>
        import { ref } from 'vue'
        
        const abriMenu = ref(false)
        const ativo = ref('menu') 
        </script>
<template>
  <footer>
    <div class="navbar">
    <nav>
      <ul>
        <li>
          <span
            class="btn"
            :class="{ active: ativo === 'menu' }"
            @click="abriMenu = true "
          >
            <ion-icon name="menu"></ion-icon>
          </span>
        </li>

        <li>
          <span
            class="btn"
            :class="{ active: ativo === 'star' }"
            @click="ativo = 'star'"
          >
            <ion-icon name="star-outline"></ion-icon>
          </span>
        </li>

        <li>
          <span
            class="btn"
            :class="{ active: ativo === 'folder' }"
            @click="ativo = 'folder'"
          >
            <ion-icon name="folder-open-outline"></ion-icon>
          </span>
        </li>

        <li>
          <span
            class="btn"
            :class="{ active: ativo === 'grid' }"
            @click="ativo = 'grid'"
          >
            <ion-icon name="grid-outline"></ion-icon>
          </span>
        </li>
      </ul>
      <div 
      v-if="abriMenu"
    class="overlay"
    @click="abriMenu = false"></div>

    <aside :class="['sidebar', {open: abriMenu}]">
<h2>Menu</h2>


</aside>
      <button class="fab">+</button>
    </nav>
    </div>
  </footer>
</template>


<style>
</style>