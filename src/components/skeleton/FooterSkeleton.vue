<script setup>
import SkeletonBox from './SkeletonBox.vue'
</script>

<template>
  <footer class="footer-skeleton">
    <div class="navbar-skeleton">
      <SkeletonBox v-for="n in 4" :key="n" width="26px" height="26px" radius="8px" />
    </div>
    <SkeletonBox class="fab-skeleton" width="60px" height="60px" radius="50%" />
  </footer>
</template>

<style scoped>
.footer-skeleton {
  border-top: var(--cor-borda) 2px solid;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  background: var(--cor-fundo);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 10px 0;
}

.navbar-skeleton {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
}

.fab-skeleton {
  position: fixed;
  right: 18px;
  bottom: 100px;
}
</style>