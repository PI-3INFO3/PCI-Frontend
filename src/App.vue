```vue
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

const mostrarLayout = computed(() => {
  return (
    authStore.isAuthenticated &&
    !rotasSemLayout.includes(rotaAtual.value)
  )
})

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

    <!-- Páginas COM layout -->
    <Transition name="layout-fade" mode="out-in">
      <div v-if="mostrarLayout" :key="'layout-' + rotaAtual" class="app-layout">

        <HeaderComponent />

        <RouterView v-slot="{ Component }">
          <Transition name="page-fade" mode="out-in">
            <component
              :is="Component"
              :key="rotaAtual"
            />
          </Transition>
        </RouterView>

        <FooterComponent />

      </div>

      <!-- Páginas SEM layout -->
      <div
        v-else
        :key="'sem-layout-' + rotaAtual"
        class="no-layout"
      >
        <RouterView v-slot="{ Component }">
          <component
            :is="Component"
            :key="rotaAtual"
          />
        </RouterView>
      </div>
    </Transition>

  </template>
</template>

<style>
/* =========================
   TRANSIÇÃO DO LAYOUT
========================= */

.layout-fade-enter-active,
.layout-fade-leave-active {
  transition: opacity 0.3s ease;
}

.layout-fade-enter-from,
.layout-fade-leave-to {
  opacity: 0;
}

.layout-fade-enter-to,
.layout-fade-leave-from {
  opacity: 1;
}


/* =========================
   TRANSIÇÃO DAS PÁGINAS
========================= */

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

.page-fade-enter-to,
.page-fade-leave-from {
  opacity: 1;
}
</style>
```
