<script setup>
import { useEditorContext } from '@/composables/useEditorContext.js'

const editor = useEditorContext()
const router = editor.router
const mostrarUpload = editor.mostrarUpload
const paginaAtualIndex = editor.paginaAtualIndex
const quantidadePaginas = editor.quantidadePaginas
const salvando = editor.salvando
const voltarParaPaginaAnterior = editor.voltarParaPaginaAnterior
const irParaPaginaAnterior = editor.irParaPaginaAnterior
const irParaProximaPagina = editor.irParaProximaPagina
const salvarDesign = editor.salvarDesign
const exportarDesign = editor.exportarDesign
</script>

<template>
  <header class="editor-header">
    <button class="header-btn" title="Voltar" @click="voltarParaPaginaAnterior">
      <ion-icon name="arrow-back"></ion-icon>
    </button>
    <button class="header-btn" title="Início" @click="router.push('/')">
      <ion-icon name="home-outline"></ion-icon>
    </button>
    <div class="header-spacer"></div>
    <div v-if="!mostrarUpload" class="controle-paginas">
      <button
        class="header-btn"
        title="Página anterior"
        :disabled="paginaAtualIndex <= 0"
        @click="irParaPaginaAnterior"
        >
        <ion-icon name="chevron-back-outline"></ion-icon>
      </button>
      <span class="contador-paginas">
        {{ paginaAtualIndex + 1 }} /
        {{ quantidadePaginas }}
      </span>
      <button
        class="header-btn"
        title="Próxima página"
        :disabled=" paginaAtualIndex>= quantidadePaginas - 1 "
        @click="irParaProximaPagina"
        >
        <ion-icon name="chevron-forward-outline"></ion-icon>
      </button>
    </div>
    <button class="header-btn" title="Salvar" :disabled="salvando" @click="salvarDesign">
      <ion-icon name="save-outline"></ion-icon>
    </button>
    <button class="header-btn" title="Exportar página" @click="exportarDesign">
      <ion-icon name="download-outline"></ion-icon>
    </button>
  </header></template>

<style scoped src="@/assets/css/CriarEditor-layout.css"></style>
<style scoped src="@/assets/css/CriarEditor-controls.css"></style>
<style scoped src="@/assets/css/CriarEditor-panels.css"></style>