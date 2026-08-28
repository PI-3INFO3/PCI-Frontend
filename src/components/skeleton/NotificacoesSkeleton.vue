<script setup>
import SkeletonBox from './SkeletonBox.vue';
</script>

<template>
  <div class="notif-skeleton">
    <SkeletonBox height="26px" width="160px" radius="6px" />

    <div class="item-skeleton" v-for="n in 3" :key="n">
      <div class="info-skeleton">
        <SkeletonBox width="36px" height="36px" radius="50%" />
        <SkeletonBox height="12px" width="70%" />
      </div>
      <div class="acoes-skeleton">
        <SkeletonBox width="70px" height="28px" radius="6px" />
        <SkeletonBox width="70px" height="28px" radius="6px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.notif-skeleton {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.item-skeleton {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--cor-borda);
  gap: 12px;
}
.info-skeleton {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}
.acoes-skeleton { display: flex; gap: 6px; }
</style>