<script setup lang="ts">
import FooterComponents from "../components/FooterComponent.vue";
import HeaderComponent from "../components/HeaderComponent.vue";
</script>

<template>
  <div class="favoritos-container">
    <h2>Favoritos</h2>
    <div class="em-breve">
      <ion-icon name="star-outline"></ion-icon>
      <p>Em breve você poderá favoritar seus projetos por aqui.</p>
    </div>
  </div>
</template>

<style scoped>
.favoritos-container {
  padding: 16px;
  padding-bottom: 100px;
}
h2 {
  margin-left: 10px;
  margin-bottom: 16px;
  color: var(--cor-texto);
}
.em-breve {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--cor-texto-secundario);
  padding: 40px 20px;
  text-align: center;
}
.em-breve ion-icon {
  font-size: 40px;
  color: #ff7500;
}
</style>
