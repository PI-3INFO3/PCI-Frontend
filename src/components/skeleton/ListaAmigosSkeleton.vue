<script setup>
import  SkeletonBox from './SkeletonBox.vue';
</script>

<template>
  <div class="lista-skeleton">
    <SkeletonBox height="26px" width="140px" radius="6px" />
    <SkeletonBox height="42px" radius="8px" />

    <div class="item-skeleton" v-for="n in 5" :key="n">
      <SkeletonBox width="44px" height="44px" radius="50%" />
      <div class="textos-skeleton">
        <SkeletonBox height="14px" width="60%" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.lista-skeleton {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.item-skeleton {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--cor-borda);
}
.textos-skeleton { flex: 1; }
</style>