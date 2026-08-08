<script setup>
import SkeletonBox from './SkeletonBox.vue'
</script>

<template>
  <main class="home-skeleton">
    <div class="linha linha-4">
      <SkeletonBox v-for="n in 4" :key="n" height="64px" radius="14px" />
    </div>

    <div class="linha linha-3">
      <SkeletonBox v-for="n in 3" :key="n" height="70px" radius="12px" />
    </div>

    <div class="linha linha-3">
      <SkeletonBox v-for="n in 3" :key="n" height="44px" radius="10px" />
    </div>

    <SkeletonBox height="160px" radius="14px" />

    <div class="linha linha-3">
      <SkeletonBox v-for="n in 3" :key="n" height="80px" radius="12px" />
    </div>

    <div class="linha linha-2">
      <SkeletonBox v-for="n in 2" :key="n" height="46px" radius="24px" />
    </div>
  </main>
</template>

<style scoped>
.home-skeleton {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 100px;
}

.linha {
  display: grid;
  gap: 10px;
}
.linha-4 { grid-template-columns: repeat(4, 1fr); }
.linha-3 { grid-template-columns: repeat(3, 1fr); }
.linha-2 { grid-template-columns: repeat(2, 1fr); }
</style>