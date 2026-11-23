<script setup>
import { useAccountContext } from '@/composables/useAccountContext.js'

const conta = useAccountContext()
const nome = conta.nome
const email = conta.email
const fotoPerfil = conta.fotoPerfil
const expandido = conta.expandido
const inputFoto = conta.inputFoto
const abrirVisualizadorFoto = conta.abrirVisualizadorFoto
const acionarInputFoto = conta.acionarInputFoto
const trocarFoto = conta.trocarFoto
const alternarExpansao = conta.alternarExpansao
</script>

<template>
  <div class="conta">
    <h1>Conta</h1>
    <div class="user-card">
      <div class="foto-container" @click.stop="abrirVisualizadorFoto">
        <img v-if="fotoPerfil" :src="fotoPerfil" alt="Foto de Perfil">
        <ion-icon v-else class="foto-icon" name="person-circle-outline"></ion-icon>
        <button type="button" class="btn-mais" @click.stop="acionarInputFoto">+</button>
        <input ref="inputFoto" type="file" accept="image/*" @change="trocarFoto" hidden>
      </div>
      <div class="info">
        <span class="nome">{{ nome }}</span>
        <span class="email">{{ email }}</span>
      </div>
      <div class="arrow-trigger" @click.stop="alternarExpansao">
        <ion-icon
          class="arrow"
          :name="expandido ? 'caret-down-outline' : 'caret-forward-outline'"
          >
         </ion-icon>
      </div>
    </div>
    <button class="adicionar" type="button">
      Adicionar nova conta
    </button>
  </div></template>

<style scoped src="@/assets/css/UserView-layout.css"></style>
<style scoped src="@/assets/css/UserView-controls.css"></style>