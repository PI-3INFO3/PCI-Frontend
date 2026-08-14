<script setup>
import { ref, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import AppSkeleton from './components/skeleton/AppSkeleton.vue'

const carregando = ref(true)
const router = useRouter()

const rotasSemEsqueleto = ['login','cadastro','tipodeusuario','chat']

onMounted(async () => {
  const inicio = Date.now()
  await router.isReady()

  const rotaAtual = router.currentRoute.value.name
  if(rotasSemEsqueleto.includes(rotaAtual)){
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

  <RouterView v-else v-slot="{ Component }">
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