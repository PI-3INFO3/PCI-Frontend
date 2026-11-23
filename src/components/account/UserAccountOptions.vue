<script setup>
import { useAccountContext } from '@/composables/useAccountContext.js'

const conta = useAccountContext()
const tema = conta.tema
const trocarTema = conta.trocarTema
const sairConta = conta.sairConta
const inicio = conta.inicio
</script>

<template>
  <div class="opcoes">
    <ul>
      <li @click="trocarTema">
        <div class="lado-esquerdo">
          <ion-icon class="icon" name="sunny-outline"></ion-icon>
          Tema
        </div>
        <span class="tema-conf">{{ tema }}</span>
      </li>
      <li class="sair" @click="sairConta">
        <div class="lado-esquerdo">
          <ion-icon class="icon" name="log-out-outline"></ion-icon>
          Sair da conta
        </div>
      </li>
      <li class="voltar" @click="inicio">
        <div class="lado-esquerdo">
          <ion-icon class="icon" name="caret-back-outline"></ion-icon>
          Voltar para o inicio
        </div>
      </li>
    </ul>
  </div></template>

<style scoped src="@/assets/css/UserView-layout.css"></style>
<style scoped src="@/assets/css/UserView-controls.css"></style>