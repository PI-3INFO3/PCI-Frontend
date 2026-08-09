<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '12px' },
  radius: { type: String, default: '8px' },
})
</script>

<template>
  <div
    class="skeleton-bloco"
    :style="{ width, height, borderRadius: radius }"
  ></div>
</template>

<style scoped>
.skeleton-bloco {
  background: linear-gradient(
    90deg,
    var(--cor-fundo-secundaria) 25%,
    var(--cor-borda) 50%,
    var(--cor-fundo-secundaria) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-pulso 1.4s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes skeleton-pulso {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>