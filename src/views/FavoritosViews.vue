<script setup>
import HeaderComponent from '../components/HeaderComponet.vue'
import FooterComponents from '../components/FooterComponents.vue'
import { ref } from 'vue'

const favoritos = ref([])
</script>

<template>
  <div>
    <HeaderComponent />
<div v-if="favoritos.length > 0">
    <div 
    v-for="favorito in favoritos" 
    :key="favorito.id">
    <p>{{ favorito.name }}</p>
    </div>
</div>

<div v-else class="sem-favoritos">
    <img src="/public/interrogacao.png" alt="">

    <p>Você não tem favoritos ainda.</p>

</div>



    <FooterComponents />
  </div>
</template>
<style scoped>
.sem-favoritos {
  min-height: calc(100vh - 250px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.sem-favoritos img {
  width: 80px;
  margin-bottom: 15px;
}

</style>