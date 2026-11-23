<script setup>
import { useEditorContext } from '@/composables/useEditorContext.js'

const editor = useEditorContext()
const menuAtivoAcima = editor.menuAtivoAcima
const clicarTextoNoFooter = editor.clicarTextoNoFooter
const clicarFormasNoFooter = editor.clicarFormasNoFooter
const clicarImagesNoFooter = editor.clicarImagesNoFooter
const clicarCamadasNoFooter = editor.clicarCamadasNoFooter
const deletarSelecionado = editor.deletarSelecionado
</script>

<template>
  <div class="ferramentas-container-fixo">
    <button class="tool-btn" :class="{ ativo: menuAtivoAcima === 'texto' }" @click="clicarTextoNoFooter">
      <ion-icon name="text-outline"></ion-icon>
      <span>Texto</span>
    </button>
    <button
      class="tool-btn"
      :class="{ ativo: menuAtivoAcima === 'formas' }"
      @click="clicarFormasNoFooter"
      >
      <ion-icon name="shapes-outline"></ion-icon>
      <span>Formas</span>
    </button>
    <button
      class="tool-btn"
      :class="{ ativo: menuAtivoAcima === 'images' }"
      @click="clicarImagesNoFooter"
      >
      <ion-icon name="images-outline"></ion-icon>
      <span>Imagens</span>
    </button>
    <button
      class="tool-btn"
      :class="{ ativo: menuAtivoAcima === 'camadas' }"
      @click="clicarCamadasNoFooter"
      >
      <ion-icon name="layers-outline"></ion-icon>
      <span>Camadas</span>
    </button>
    <button class="tool-btn" @click="deletarSelecionado">
      <ion-icon name="trash-outline"></ion-icon>
      <span>Excluir</span>
    </button>
  </div></template>

<style scoped src="@/assets/css/CriarEditor-layout.css"></style>
<style scoped src="@/assets/css/CriarEditor-controls.css"></style>
<style scoped src="@/assets/css/CriarEditor-panels.css"></style>