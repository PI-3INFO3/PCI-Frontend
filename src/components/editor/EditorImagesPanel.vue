<script setup>
import { useEditorContext } from '@/composables/useEditorContext.js'

const editor = useEditorContext()
const abrirSeletorDeImagem = editor.abrirSeletorDeImagem
const imagensBiblioteca = editor.imagensBiblioteca
const adicionarImagemBiblioteca = editor.adicionarImagemBiblioteca
const proximaPaginaImagens = editor.proximaPaginaImagens
const carregandoBiblioteca = editor.carregandoBiblioteca
const carregarImagensBiblioteca = editor.carregarImagensBiblioteca
const inputImagemRef = editor.inputImagemRef
const adicionarImagemAoCanvas = editor.adicionarImagemAoCanvas
</script>

<template>
  <div class="aba-superior-img">
    <button class="opcao-imagem" @click="abrirSeletorDeImagem">
      <ion-icon name="image-outline"></ion-icon>
      <span>Adicionar imagem</span>
    </button>
    <div class="biblioteca-imagens" v-if="imagensBiblioteca.length">
      <button
        v-for="imagem in imagensBiblioteca"
        :key="imagem.id"
        class="biblioteca-item"
        :title="imagem.description || 'Minha imagem'"
        @click="adicionarImagemBiblioteca(imagem)"
        >
        <img :src="imagem.miniatura" :alt="imagem.description || 'Imagem salva'" />
      </button>
    </div>
    <button
      v-if="proximaPaginaImagens"
      :disabled="carregandoBiblioteca"
      @click="carregarImagensBiblioteca"
      >
      Carregar mais imagens
    </button>
    <input
      ref="inputImagemRef"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      class="input-oculto"
      @change="adicionarImagemAoCanvas"
      />
  </div></template>

<style scoped src="@/assets/css/CriarEditor-layout.css"></style>
<style scoped src="@/assets/css/CriarEditor-controls.css"></style>
<style scoped src="@/assets/css/CriarEditor-panels.css"></style>