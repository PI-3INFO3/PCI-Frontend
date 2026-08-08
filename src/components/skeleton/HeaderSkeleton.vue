<script setup>
import SkeletonBox from './SkeletonBox.vue'
</script>

<template>
  <header class="header-skeleton">
    <div class="logo-linha">
      <SkeletonBox width="90px" height="32px" radius="8px" />
      <SkeletonBox width="50px" height="50px" radius="50%" />
    </div>

    <div class="busca-linha">
      <SkeletonBox height="42px" radius="30px" />
    </div>
  </header>
</template>

<style scoped>
.header-skeleton {
  padding: 16px 16px 12px 16px;
  background-color: var(--cor-fundo);
}

.logo-linha {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.busca-linha {
  width: 90%;
  margin: 0 auto 16px auto;
}
</style>