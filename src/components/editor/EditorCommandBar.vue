<script setup>
import { useEditorContext } from '@/composables/useEditorContext.js'

const editor = useEditorContext()
const mostrarUpload = editor.mostrarUpload
const possuiSelecao = editor.possuiSelecao
const anguloSelecionado = editor.anguloSelecionado
const desfazer = editor.desfazer
const refazer = editor.refazer
const copiarSelecionado = editor.copiarSelecionado
const colarSelecionado = editor.colarSelecionado
const duplicarSelecionado = editor.duplicarSelecionado
const ordenarSelecionado = editor.ordenarSelecionado
const rotacionarSelecionado = editor.rotacionarSelecionado
const alterarAnguloSelecionado = editor.alterarAnguloSelecionado
</script>

<template>
  <div v-if="!mostrarUpload" class="editor-command-bar" role="toolbar" aria-label="Edição">
    <button title="Desfazer (Ctrl+Z)" @click="desfazer">
  <ion-icon name="arrow-undo-outline"></ion-icon></button>
    <button title="Refazer (Ctrl+Y)" @click="refazer">
  <ion-icon name="arrow-redo-outline"></ion-icon></button>
    <button
      title="Copiar (Ctrl+C)"
      :disabled="!possuiSelecao"
      @click="copiarSelecionado"
      >
     <ion-icon name="copy-outline"></ion-icon></button>
    <button title="Colar (Ctrl+V)" @click="colarSelecionado">
  <ion-icon name="clipboard-outline"></ion-icon></button>
    <button
      title="Duplicar (Ctrl+D)"
      :disabled="!possuiSelecao"
      @click="duplicarSelecionado"
      >
     <ion-icon name="duplicate-outline"></ion-icon></button>
    <button
      title="Trazer para frente"
      :disabled="!possuiSelecao"
      @click="ordenarSelecionado(true)"
      >
     <ion-icon name="arrow-up-outline"></ion-icon></button>
    <button
      title="Enviar para trás"
      :disabled="!possuiSelecao"
      @click="ordenarSelecionado(false)"
      >
     <ion-icon name="arrow-down-outline"></ion-icon></button>
    <button
      title="Girar 90° à esquerda"
      :disabled="!possuiSelecao"
      @click="rotacionarSelecionado(-90)"
      >
     ↶ 90°</button>
    <label class="rotacao-label">Rotação
      <input
        type="number"
        v-model.number="anguloSelecionado"
        step="1"
        min="0"
        max="359"
        :disabled="!possuiSelecao"
        @change="alterarAnguloSelecionado"
        />
       °
    </label>
    <button
      title="Girar 90° à direita"
      :disabled="!possuiSelecao"
      @click="rotacionarSelecionado(90)"
      >
     90° ↷</button>
  </div></template>

<style scoped src="@/assets/css/CriarEditor-layout.css"></style>
<style scoped src="@/assets/css/CriarEditor-controls.css"></style>
<style scoped src="@/assets/css/CriarEditor-panels.css"></style>