<script setup>
import { useEditorContext } from '@/composables/useEditorContext.js'

const editor = useEditorContext()
const camadas = editor.camadas
const objetoSelecionado = editor.objetoSelecionado
const selecionarCamada = editor.selecionarCamada
const rotuloDoObjeto = editor.rotuloDoObjeto
const moverCamadaParaCima = editor.moverCamadaParaCima
const moverCamadaParaBaixo = editor.moverCamadaParaBaixo
</script>

<template>
  <div class="aba-superior-camadas">
    <div v-if="!camadas.length" class="camadas-vazio">
      Nenhum elemento no canvas ainda.
    </div>
    <div
      v-for="(camada, index) in camadas"
      :key=" camada.objeto.clientId || camada.objeto.__uid || index "
      class="camada-item"
      :class="{ ativa: camada.objeto === objetoSelecionado }"
      @click="selecionarCamada(camada.objeto)"
      >
      <div class="camada-thumb">
        <img v-if="camada.thumbnail" :src="camada.thumbnail" :alt="rotuloDoObjeto(camada.objeto)" />
        <ion-icon v-else name="layers-outline"></ion-icon>
      </div>
      <span class="camada-nome">
        {{ rotuloDoObjeto(camada.objeto) }}
      </span>
      <div class="camada-acoes">
        <button
          class="camada-btn"
          :disabled="index === 0"
          @click.stop=" moverCamadaParaCima(camada.objeto) "
          >
          <ion-icon name="chevron-up-outline"></ion-icon>
        </button>
        <button
          class="camada-btn"
          :disabled="index === camadas.length - 1"
          @click.stop=" moverCamadaParaBaixo(camada.objeto) "
          >
          <ion-icon name="chevron-down-outline"></ion-icon>
        </button>
      </div>
    </div>
  </div></template>

<style scoped src="@/assets/css/CriarEditor-layout.css"></style>
<style scoped src="@/assets/css/CriarEditor-controls.css"></style>
<style scoped src="@/assets/css/CriarEditor-panels.css"></style>