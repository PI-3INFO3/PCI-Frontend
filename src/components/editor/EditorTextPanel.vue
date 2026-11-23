<script setup>
import { useEditorContext } from '@/composables/useEditorContext.js'

const editor = useEditorContext()
const fonteSelecionada = editor.fonteSelecionada
const fontesDisponiveis = editor.fontesDisponiveis
const mudarFonteTexto = editor.mudarFonteTexto
const tamanhoFonte = editor.tamanhoFonte
const atualizarAtributosTexto = editor.atualizarAtributosTexto
const corTexto = editor.corTexto
const pesoTexto = editor.pesoTexto
const estiloTexto = editor.estiloTexto
const alternarEstiloTexto = editor.alternarEstiloTexto
const alinhamentoTexto = editor.alinhamentoTexto
const coresTexto = editor.coresTexto
const mudarCorTextoPredefinida = editor.mudarCorTextoPredefinida
const adicionarCorTexto = editor.adicionarCorTexto

function alternarNegrito() {
  pesoTexto.value = pesoTexto.value === 'bold' ? 'normal' : 'bold'
  atualizarAtributosTexto()
}

function alternarItalico() {
  estiloTexto.value = estiloTexto.value === 'italic' ? 'normal' : 'italic'
  atualizarAtributosTexto()
}

function alinharTexto(alinhamento) {
  alinhamentoTexto.value = alinhamento
  atualizarAtributosTexto()
}
</script>

<template>
  <div class="aba-superior-texto">
    <select v-model="fonteSelecionada" @change="mudarFonteTexto">
      <option v-for="fonte in fontesDisponiveis" :key="fonte" :value="fonte">
        {{ fonte }}
      </option>
    </select>
    <input
      v-model.number="tamanhoFonte"
      type="number"
      min="8"
      max="200"
      @input="atualizarAtributosTexto"
      />
    <input v-model="corTexto" type="color" @input="atualizarAtributosTexto" />
    <button
      class="controle-btn"
      :class="{ ativo: pesoTexto === 'bold' }"
      @click="alternarNegrito"
      >
      <b>B</b>
    </button>
    <button
      class="controle-btn"
      :class="{ ativo: estiloTexto === 'italic' }"
      @click="alternarItalico"
      >
      <i>I</i>
    </button>
    <button
      class="controle-btn"
      title="Sublinhado (Ctrl+U)"
      @click="alternarEstiloTexto('underline')"
      >
     <u>U</u></button>
    <button
      class="controle-btn"
      title="Alinhar à esquerda"
      @click="alinharTexto('left')"
      >
     ⇤</button>
    <button
      class="controle-btn"
      title="Centralizar"
      @click="alinharTexto('center')"
      >
     ≡</button>
    <button
      class="controle-btn"
      title="Alinhar à direita"
      @click="alinharTexto('right')"
      >
     ⇥</button>
    <button
      v-for="cor in coresTexto"
      :key="cor"
      class="cor-btn"
      :style="{ backgroundColor: cor }"
      @click="mudarCorTextoPredefinida(cor)"
      >
     </button>
    <button class="controle-add" @click="adicionarCorTexto">
      +
    </button>
  </div></template>

<style scoped src="@/assets/css/CriarEditor-layout.css"></style>
<style scoped src="@/assets/css/CriarEditor-controls.css"></style>
<style scoped src="@/assets/css/CriarEditor-panels.css"></style>