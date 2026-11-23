<script setup>
import { useEditorContext } from '@/composables/useEditorContext.js'

const editor = useEditorContext()

const canvasAreaRef = editor.canvasAreaRef
const canvasRef = editor.canvasRef
const mostrarUpload = editor.mostrarUpload
const arquivoSelecionado = editor.arquivoSelecionado
const inputArquivoRef = editor.inputArquivoRef
const erroUpload = editor.erroUpload
const enviandoUpload = editor.enviandoUpload
const abrirSeletorDeArquivo = editor.abrirSeletorDeArquivo
const soltarArquivoParaCriar = editor.soltarArquivoParaCriar
const selecionarArquivoParaCriar = editor.selecionarArquivoParaCriar
const criarDesignAPartirDoUpload = editor.criarDesignAPartirDoUpload
const comecarDoZero = editor.comecarDoZero
</script>

<template>
  <main ref="canvasAreaRef" class="canvas-area">
    <canvas ref="canvasRef"></canvas>

    <div v-if="mostrarUpload" class="overlay-upload">
      <div
        class="area-upload"
        :class="{ 'tem-arquivo': arquivoSelecionado }"
        @click="abrirSeletorDeArquivo"
        @dragover.prevent
        @drop.prevent="soltarArquivoParaCriar"
      >
        <input
          ref="inputArquivoRef"
          type="file"
          accept=".pdf,.pptx,.jpg,.jpeg,.png"
          class="input-oculto"
          @change="selecionarArquivoParaCriar"
        />

        <template v-if="!arquivoSelecionado">
          <ion-icon name="cloud-upload-outline"></ion-icon>

          <p>
            Toque para escolher um arquivo
            ou arraste aqui
          </p>

          <span class="formatos-aceitos">
            PDF, PowerPoint (.pptx), JPG ou PNG
          </span>
        </template>

        <template v-else>
          <ion-icon name="document-outline"></ion-icon>

          <p>{{ arquivoSelecionado.name }}</p>

          <span class="formatos-aceitos">
            Toque para trocar o arquivo
          </span>
        </template>
      </div>

      <p v-if="erroUpload" class="mensagem-erro">
        {{ erroUpload }}
      </p>

      <button
        class="btn-criar"
        :disabled="!arquivoSelecionado || enviandoUpload"
        @click="criarDesignAPartirDoUpload"
      >
        {{
          enviandoUpload
            ? 'Processando arquivo...'
            : 'Criar design'
        }}
      </button>

      <button
        class="btn-comecar-vazio"
        @click="comecarDoZero"
      >
        ou comece do zero, sem arquivo
      </button>
    </div>
  </main>
</template>

<style scoped src="@/assets/css/CriarEditor-layout.css"></style>
<style scoped src="@/assets/css/CriarEditor-panels.css"></style>