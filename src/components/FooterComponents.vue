<template>
  <footer class="navbar">
    <nav>
      <ul>
        <li>
          <span
            class="btn"
            :class="{ active: ativo === 'menu' }"
            @click="ativo = 'menu'"
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

      <button class="fab">+</button>
    </nav>
  </footer>
</template>

<script setup>
import { ref } from 'vue'

const ativo = ref('menu') 
</script>

<style>
</style>