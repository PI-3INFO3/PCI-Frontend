<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as fabric from 'fabric'

const router = useRouter()
const route = useRoute()

const canvasRef = ref(null)
let fabricCanvas = null

const imgUrl = route.query.img 
const templateTitulo = route.query.titulo || 'Design'

const inicializarCanvas = () => {
  if (!canvasRef.value || !imgUrl) return

  const larguraDisponivel = Math.min(window.innerWidth - 40, 750)
  const alturaDisponivel = larguraDisponivel * 1.3

  fabricCanvas = new fabric.Canvas(canvasRef.value, {
    width: larguraDisponivel,
    height: alturaDisponivel,
    backgroundColor: 'black'
  })

  const imagemElemento = new Image()
  imagemElemento.src = imgUrl

  imagemElemento.onload = () => {
    const imgMovel = new fabric.Image(imagemElemento, {
      borderColor: '#FF5700',
      cornerColor: '#FF5700',
      cornerSize: 10,
      transparentCorners: false
    })

    const escalaLargura = fabricCanvas.width / imagemElemento.width
    const escalaAltura = fabricCanvas.height / imagemElemento.height
    let escalaPerfeita = Math.min(escalaLargura, escalaAltura)
    
    imgMovel.set({
      scaleX: escalaPerfeita,
      scaleY: escalaPerfeita
    })

    fabricCanvas.add(imgMovel)
    fabricCanvas.centerObject(imgMovel)
    fabricCanvas.sendObjectToBack(imgMovel)
    fabricCanvas.renderAll()
  }

  imagemElemento.onerror = (err) => {
    console.error("Erro físico ao baixar o arquivo de imagem do template:", err)
  }

  window.addEventListener('keydown', lidarComTeclado)
}

const adicionarTexto = () => {
  if (!fabricCanvas) return

  const textoEditavel = new fabric.IText('Altere o Texto', {
    left: fabricCanvas.width / 4,
    top: fabricCanvas.height / 3,
    fontFamily: 'sans-serif',
    fontSize: 28,
    fill: "#ffffff",
    stroke: '#fffff', 
    strokeWidth: 0,
    borderColor: '#FF5700',
    cornerColor: '#FF5700', 
    cornerSize: 10,
    transparentCorners: false
  })

  fabricCanvas.add(textoEditavel)
  fabricCanvas.setActiveObject(textoEditavel)
  fabricCanvas.bringToFront(textoEditavel) 
  fabricCanvas.renderAll()
}

const adicionarImagemPronta = (urlDaImagem) => {
  if (!fabricCanvas) return

  fabric.Image.fromURL(urlDaImagem).then((img) => {
    img.scaleToWidth(120)

    img.set({
      left: (fabricCanvas.width) / 2,
      top: (fabricCanvas.height - img.getScaledHeight()) / 2, 
      borderColor: '#FF5700',
      cornerColor: '#FF5700', 
      cornerSize: 10,
      transparentCorners: false
    })

    fabricCanvas.add(img)
    fabricCanvas.setActiveObject(img)
    fabricCanvas.bringToFront(img)
    fabricCanvas.renderAll()
  }).catch((err) => {
    console.error("Erro ao carregar elemento gráfico:", err)
  })
}

const deletarSelecionado = () => {
  if (!fabricCanvas) return
  
  const objetoAtivo = fabricCanvas.getActiveObject()
  if (objetoAtivo) {
    fabricCanvas.remove(objetoAtivo)
    fabricCanvas.discardActiveObject()
    fabricCanvas.renderAll()
  }
}

const lidarComTeclado = (evento) => {
  if (evento.key === 'Delete' || evento.key === 'Backspace') {
    const ativo = fabricCanvas?.getActiveObject()
    if (ativo && ativo.type === 'i-text' && ativo.isEditing) {
      return
    }
    deletarSelecionado()
  }
}

const exeportadorDesing = () => {
  if (!fabricCanvas) return

  const dataURL = fabricCanvas.toDataURL({
    format: 'png',
    quality: 1
  })

  const link = document.createElement('a')
  link.download = `editado-${templateTitulo}.png`
  link.href = dataURL
  link.click()
}

onMounted(() => {
  inicializarCanvas()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', lidarComTeclado)
  if (fabricCanvas) {
    fabricCanvas.dispose()
  }
})
</script>

<template>
  <div class="editor-interface">
    <header class="editor-header">
      <button class="btn-voltar" @click="router.push('/')"> Voltar </button>
      <h1 class="titulo-projeto">{{ templateTitulo }}</h1>
      <button class="btn-exportar" @click="exeportadorDesing"> Salvar</button>
    </header>

    <main class="canvas-area">
      <div class="canvas-container">
        <canvas ref="canvasRef"></canvas>
      </div>
    </main>

    <footer class="editor-footer">
      <button class="tool-btn" @click="adicionarTexto">
        <span>✏️</span> Texto
      </button>
      
      <button class="tool-btn" @click="adicionarImagemPronta('https://r2.dev')">
        <span>🖼️</span> Sticker 1
      </button>

      <button class="tool-btn" @click="adicionarImagemPronta('https://gstatic.com')">
        <span>⭐</span> Estrela
      </button>

      <button class="tool-btn btn-deletar" @click="deletarSelecionado">
        <span>🗑️</span> Apagar
      </button>
    </footer>
  </div>
</template>

<style scoped>
.editor-interface {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #0f172a;
  color: #f8fafc;
  font-family: system-ui, sans-serif;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #1e293b;
  border-bottom: 1px solid #334155;
}

.titulo-projeto { font-size: 16px; font-weight: 600; margin: 0; max-width: 40%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.btn-voltar, .btn-exportar {
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-voltar { background-color: #334155; color: #f8fafc; }
.btn-exportar { background-color: #FF5700; color: white; }

.canvas-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  width: 100%;
  box-shadow: border-box;
  overflow: auto;
  scrollbar-width: none;
}

.canvas-container {
  background-color: #ffffff;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
}

.editor-footer {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px;
  background-color: #1e293b;
  border-top: 1px solid #334155;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #ffff;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;
}
.tool-btn span { font-size: 22px; }
.tool-btn:focus { color: #FF5700; }
</style>
