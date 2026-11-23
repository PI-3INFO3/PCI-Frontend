<script setup>
import { useAccountContext } from '@/composables/useAccountContext.js'

const conta = useAccountContext()
const visualizadorAberto = conta.visualizadorAberto
const fotoPerfil = conta.fotoPerfil
const nome = conta.nome
const fecharVisualizadorFoto = conta.fecharVisualizadorFoto
</script>

<template>
  <Transition name="fade">
    <div v-if="visualizadorAberto" class="modal-overlay" @click="fecharVisualizadorFoto">
      <button class="modal-close" @click.stop="fecharVisualizadorFoto">✕</button>
      <div class="modal-body" @click.stop>
        <div class="card-image-modal">
          <div class="blur-bg" :style="{ backgroundImage: `url(${fotoPerfil})` }"></div>
          <img :src="fotoPerfil" :alt="nome">
        </div>
        <p class="modal-title">{{ nome }}</p>
      </div>
    </div>
  </Transition></template>

<style scoped src="@/assets/css/UserView-layout.css"></style>
<style scoped src="@/assets/css/UserView-controls.css"></style>