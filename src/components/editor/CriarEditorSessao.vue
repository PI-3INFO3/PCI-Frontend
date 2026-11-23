<script setup>
import { provide } from 'vue'

import { useCriarEditor } from '@/editor/CriarEditor/useCriarEditor.js'

import EditorHeader from '@/components/editor/EditorHeader.vue'
import EditorCommandBar from '@/components/editor/EditorCommandBar.vue'
import EditorCanvas from '@/components/editor/EditorCanvas.vue'
import EditorFooter from '@/components/editor/EditorFooter.vue'

const editor = useCriarEditor()

provide('pci-editor', editor)
</script>

<template>
  <div class="editor-interface">
    <EditorHeader />
    <EditorCommandBar />
    <EditorCanvas />
    <EditorFooter />
  </div>
</template>

<style scoped src="@/assets/css/CriarEditor-layout.css"></style>
<style scoped src="@/assets/css/CriarEditor-controls.css"></style>
<style scoped src="@/assets/css/CriarEditor-panels.css"></style>