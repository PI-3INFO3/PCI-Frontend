<script setup>
import { useEditorContext } from '@/composables/useEditorContext.js'

const editor = useEditorContext()
const formasDisponiveis = editor.formasDisponiveis
const adicionarForma = editor.adicionarForma
const inputSvgRef = editor.inputSvgRef
const importarSvgSimbolo = editor.importarSvgSimbolo
const simbolosDisponiveis = editor.simbolosDisponiveis
const adicionarSimbolo = editor.adicionarSimbolo
const alterarCorForma = editor.alterarCorForma
</script>

<template>
  <div class="aba-superior-formas">
    <button
      v-for="forma in formasDisponiveis"
      :key="forma.tipo"
      class="forma-visual"
      :title="forma.nome"
      @click="adicionarForma(forma.tipo)"
      >
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle v-if="forma.tipo === 'circle'" cx="32" cy="32" r="22" />
        <rect v-else-if="forma.tipo === 'rect'" x="9" y="17" width="46" height="30" rx="2" />
        <polygon v-else-if="forma.tipo === 'triangle'" points="32,8 56,54 8,54" />
        <polygon v-else points="32,6 38,25 58,25 42,37 48,57 32,45 16,57 22,37 6,25 26,25" />
      </svg>
    </button>
    <button
      class="opcao-imagem"
      title="Adicionar SVG simples à biblioteca pública"
      @click="inputSvgRef?.click()"
      >
      <ion-icon name="add-circle-outline"></ion-icon> Adicionar símbolo SVG
    </button>
    <input
      ref="inputSvgRef"
      type="file"
      accept=".svg,image/svg+xml"
      class="input-oculto"
      @change="importarSvgSimbolo"
      />
    <button
      v-for="simbolo in simbolosDisponiveis"
      :key="simbolo.id"
      class="forma-visual"
      :title="simbolo.name"
      @click="adicionarSimbolo(simbolo)"
      >
      <svg viewBox="0 0 100 100" aria-hidden="true"><path :d="simbolo.path_data" /></svg>
    </button>
    <input
      class="seletor-cor-forma"
      type="color"
      value="#FF5700"
      @input="alterarCorForma($event.target.value)"
      />
  </div></template>

<style scoped src="@/assets/css/CriarEditor-layout.css"></style>
<style scoped src="@/assets/css/CriarEditor-controls.css"></style>
<style scoped src="@/assets/css/CriarEditor-panels.css"></style>