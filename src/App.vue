<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import AppSkeleton from './components/skeleton/AppSkeleton.vue'
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
import { useAuthStore } from './stores/auth'
import { rotasPublicas, rotasSemLayout } from './router'

const carregando = ref(true)
const router = useRouter()
const authStore = useAuthStore()

const rotaAtual = computed(() => router.currentRoute.value.name)

const mostrarLayout = computed(() =>
  authStore.isAuthenticated && !rotasSemLayout.includes(rotaAtual.value)
)

onMounted(async () => {
  const inicio = Date.now()
  await router.isReady()

  if (rotasPublicas.includes(rotaAtual.value)) {
    carregando.value = false
    return
  }

  const minimoVisivel = 600
  const decorrido = Date.now() - inicio
  const espera = Math.max(0, minimoVisivel - decorrido)

  setTimeout(() => {
    carregando.value = false
  }, espera)
})
</script>

<template>
  <AppSkeleton v-if="carregando" />

  <template v-else>
    <transition name="fade">
      <HeaderComponent v-if="mostrarLayout" key="header" />
    </transition>

    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>

    <transition name="fade">
      <FooterComponent v-if="mostrarLayout" key="footer" />
    </transition>
  </template>
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