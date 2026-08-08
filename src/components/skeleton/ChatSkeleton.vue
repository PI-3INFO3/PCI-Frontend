<script setup>
import SkeletonBox from './SkeletonBox.vue'
</script>

<template>
  <div class="chat-skeleton">
    <div class="balao-esq"><SkeletonBox height="36px" width="65%" radius="12px" /></div>
    <div class="balao-dir"><SkeletonBox height="36px" width="50%" radius="12px" /></div>
    <div class="balao-esq"><SkeletonBox height="36px" width="70%" radius="12px" /></div>
    <div class="balao-dir"><SkeletonBox height="36px" width="40%" radius="12px" /></div>
  </div>
</template>

<style scoped>
.chat-skeleton {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.balao-esq { align-self: flex-start; }
.balao-dir { align-self: flex-end; }
</style>