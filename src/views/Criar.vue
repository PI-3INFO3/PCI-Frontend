<script setup>
import { useRoute } from 'vue-router'
import CriarEditorSessao from '@/components/editor/CriarEditorSessao.vue'

const route = useRoute()
</script>

<template>
  <CriarEditorSessao
    :key="String(route.params.id || 'novo')"
  />
</template>