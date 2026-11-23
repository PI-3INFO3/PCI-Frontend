<script setup>
import { useEditorContext } from '@/composables/useEditorContext.js'
import EditorTextPanel from './EditorTextPanel.vue'
import EditorImagesPanel from './EditorImagesPanel.vue'
import EditorShapesPanel from './EditorShapesPanel.vue'
import EditorLayersPanel from './EditorLayersPanel.vue'
import EditorToolBar from './EditorToolBar.vue'

const editor = useEditorContext()
const menuAtivoAcima = editor.menuAtivoAcima
</script>

<template>
  <footer class="editor-footer">
      <EditorTextPanel v-if="menuAtivoAcima === 'texto'" />
      <EditorImagesPanel v-if="menuAtivoAcima === 'images'" />
      <EditorShapesPanel v-if="menuAtivoAcima === 'formas'" />
      <EditorLayersPanel v-if="menuAtivoAcima === 'camadas'" />
      <EditorToolBar />
  </footer></template>

<style scoped src="@/assets/css/CriarEditor-layout.css"></style>
<style scoped src="@/assets/css/CriarEditor-controls.css"></style>
<style scoped src="@/assets/css/CriarEditor-panels.css"></style>