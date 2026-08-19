<script setup>
import { ref, onMounted, onUpdated, shallowRef, watch, computed } from "vue";
import { onBeforeRouteUpdate, RouterView, useRouter } from "vue-router";
import FooterComponents from "./components/FooterComponents.vue";
import AppSkeleton from "./components/skeleton/AppSkeleton.vue";
import { useAuthStore } from "./stores/auth";

const carregando = ref(true);
const router = useRouter();
const authStore = useAuthStore();
// const rotaAtual = ref("");

const rotasSemEsqueleto = ["login", "cadastro", "tipodeusuario", "chat"];

onMounted(async () => {
  const inicio = Date.now();
  await router.isReady();

  authStore.rotaAtual = router.currentRoute.value.name;
  if (rotasSemEsqueleto.includes(authStore.rotaAtual)) {
    carregando.value = false;
    return;
  }
  const minimoVisivel = 600;
  const decorrido = Date.now() - inicio;
  const espera = Math.max(0, minimoVisivel - decorrido);

  setTimeout(() => {
    carregando.value = false;
  }, espera);
});

const component = shallowRef(null);

const updateComponent = computed(() => {
  return router.currentRoute.value.components?.default;
});
</script>

<template>
  <AppSkeleton v-if="carregando" />

  <template v-else>
   
    <!-- <RouterView /> -->

    <!-- <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView> -->

    <router-view v-slot="{ Component, route }">
      <transition name="fade" >
        <component :is="Component" />
      </transition>
    </router-view>

    <FooterComponents />
  </template>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
