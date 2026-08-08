<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderSkeleton from './HeaderSkeleton.vue'
import FooterSkeleton from './FooterSkeleton.vue'
import HomeSkeleton from './HomeSkeleton.vue'
import ListaAmigosSkeleton from './ListaAmigosSkeleton.vue'
import NotificacoesSkeleton from './NotificacoesSkeleton.vue'
import ChatSkeleton from './NotificacoesSkeleton.vue'

const route = useRoute()

const mapaDeEsqueletos = {
  home: HomeSkeleton,
  amigos: ListaAmigosSkeleton,
  notificacoes: NotificacoesSkeleton,
  chat: ChatSkeleton,
}

const EsqueletoDoMeio = computed(() => mapaDeEsqueletos[route.name] || HomeSkeleton)
</script>

<template>
  <div>
    <HeaderSkeleton />
    <component :is="EsqueletoDoMeio" />
    <FooterSkeleton />
  </div>
</template>