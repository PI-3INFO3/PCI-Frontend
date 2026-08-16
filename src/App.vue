<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(() => {
  if (!auth.isAuthenticated) {
    const temaLocal = localStorage.getItem('tema') || 'Claro'
    document.body.classList.toggle('dark', temaLocal === 'Escuro')
  }
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>