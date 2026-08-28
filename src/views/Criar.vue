<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const canvasRef = ref(null)
const canvasAreaRef = ref(null)
let fabricCanvas = null

const imgUrl = route.query.img
const templateTitulo = route.query.titulo || 'Design'

// ESTADOS PARA CONTROLE DE INTERFACE DINÂMICA
// 'nenhum' = Nenhuma aba aberta acima do footer
// 'texto'   = Abre as opções de texto acima do footer
// 'formas'  = Abre as opções de formas acima do footer
// 'images'  = Abre as opções de images acima do footer

const menuAtivoAcima = ref('nenhum')

// Estados para os inputs de texto do Fabric
const tamanhoFonte = ref(30)
const corTexto = ref('#ffffff')

const inicializarCanvas = () => {
    if (!canvasRef.value || !canvasAreaRef.value || !imgUrl) return

    const larguraDisponivel = canvasAreaRef.value.clientWidth
    const alturaDisponivel = canvasAreaRef.value.clientHeight

    fabricCanvas = new fabric.Canvas(canvasRef.value, {
        width: larguraDisponivel,
        height: alturaDisponivel,
        backgroundColor: 'var(--cor-fundo-secundaria)'
    })

    const imagemElemento = new Image()
    imagemElemento.src = imgUrl

    imagemElemento.onload = () => {
        const imgMovel = new fabric.Image(imagemElemento, {
            borderColor: '#FF5700',
            cornerColor: '#FF5700',
            cornerSize: 10,
            transparentCorners: false,
            selectable: false
        })

        const escalaLargura = (fabricCanvas.width * 0.85) / imagemElemento.width
        const escalaAltura = (fabricCanvas.height * 0.6) / imagemElemento.height
        let escalaPerfeita = Math.min(escalaLargura, escalaAltura)

        imgMovel.set({ scaleX: escalaPerfeita, scaleY: escalaPerfeita })

        fabricCanvas.add(imgMovel)
        fabricCanvas.centerObject(imgMovel)
        fabricCanvas.sendObjectToBack(imgMovel)
        fabricCanvas.renderAll()
    }

    // Ao selecionar texto na tela, abre automaticamente a aba de texto acima do footer
    fabricCanvas.on('selection:created', lidarComSelecao)
    fabricCanvas.on('selection:updated', lidarComSelecao)
    fabricCanvas.on('selection:cleared', () => {
        menuAtivoAcima.value = 'nenhum'
    })

    window.addEventListener('keydown', lidarComTeclado)
}

const lidarComSelecao = (e) => {
    const objetoAtivo = e.selected[0]
    if (objetoAtivo && objetoAtivo.type === 'i-text') {
        menuAtivoAcima.value = 'texto'
        tamanhoFonte.value = objetoAtivo.fontSize
        corTexto.value = objetoAtivo.fill
    } else {
        menuAtivoAcima.value = 'nenhum'
    }
}

// Controla a abertura das abas superiores sem sumir com o rodapé principal
const clicarTextoNoFooter = () => {
    if (menuAtivoAcima.value === 'texto') {
        menuAtivoAcima.value = 'nenhum'
    } else {
        menuAtivoAcima.value = 'texto'
        // Se não houver texto selecionado, cria um novo automaticamente
        const objetoAtivo = fabricCanvas?.getActiveObject()
        if (!objetoAtivo || objetoAtivo.type !== 'i-text') {
            adicionarTexto()
        }
    }
}

const clicarImagesNoFooter = () => {
    if (menuAtivoAcima.value === 'images') {
        menuAtivoAcima.value = 'nenhum'
    } else {
        menuAtivoAcima.value = 'images'
    }
}

const clicarFormasNoFooter = () => {
    if (menuAtivoAcima.value === 'formas') {
        menuAtivoAcima.value = 'nenhum'
    } else {
        menuAtivoAcima.value = 'formas'
    }
}


const adicionarTexto = () => {
    if (!fabricCanvas) return

    const textoEditavel = new fabric.IText('Seus', {
        left: fabricCanvas.width / 3,
        top: fabricCanvas.height / 1.5,
        fontFamily: 'sans-serif',
        fontSize: 30,
        fill: "#ffffff",
        fontWeight: 'bold',
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

const mudarCorTextoPredefinida = (cor) => {
    corTexto.value = cor
    atualizarAtributosTexto()
}

const atualizarAtributosTexto = () => {
    const objetoAtivo = fabricCanvas?.getActiveObject()
    if (objetoAtivo && objetoAtivo.type === 'i-text') {
        objetoAtivo.set({
            fontSize: parseInt(tamanhoFonte.value),
            fill: corTexto.value
        })
        fabricCanvas.renderAll()
    }
}

const adicionarRetangulo = () => {
    if (!fabricCanvas) return
    const retangulo = new fabric.Rect({
        left: fabricCanvas.width / 3,
        top: fabricCanvas.height / 2,
        fill: 'transparent',
        stroke: '#FF5700',
        strokeWidth: 3,
        width: 100,
        height: 100,
        borderColor: '#FF5700',
        cornerColor: '#FF5700',
        cornerSize: 10
    })
    fabricCanvas.add(retangulo)
    fabricCanvas.setActiveObject(retangulo)
    fabricCanvas.renderAll()
}

const adicionarCirculo = () => {
    if (!fabricCanvas) return
    const circulo = new fabric.Circle({
        left: fabricCanvas.width / 3,
        top: fabricCanvas.height / 2,
        fill: 'transparent',
        stroke: '#FF5700',
        strokeWidth: 3,
        radius: 50,
        borderColor: '#FF5700',
        cornerColor: '#FF5700',
        cornerSize: 10
    })
    fabricCanvas.add(circulo)
    fabricCanvas.setActiveObject(circulo)
    fabricCanvas.renderAll()
}

const deletarSelecionado = () => {
    if (!fabricCanvas) return
    const objetoAtivo = fabricCanvas.getActiveObject()
    if (objetoAtivo) {
        fabricCanvas.remove(objetoAtivo)
        fabricCanvas.discardActiveObject()
        fabricCanvas.renderAll()
        menuAtivoAcima.value = 'nenhum'
    }
}

const lidarComTeclado = (evento) => {
    if (evento.key === 'Delete' || evento.key === 'Backspace') {
        const ativo = fabricCanvas?.getActiveObject()
        if (ativo && ativo.type === 'i-text' && ativo.isEditing) return
        deletarSelecionado()
    }
}

const exeportadorDesing = () => {
    if (!fabricCanvas) return
    const dataURL = fabricCanvas.toDataURL({ format: 'png', quality: 1 })
    const link = document.createElement('a')
    link.download = `editado-${templateTitulo}.png`
    link.href = dataURL
    link.click()
}

onMounted(() => { inicializarCanvas() })
onBeforeUnmount(() => {
    window.removeEventListener('keydown', lidarComTeclado)
    if (fabricCanvas) fabricCanvas.dispose()
})
</script>

<template>
    <div class="editor-interface">

        <header class="editor-header">
            <button class="header-btn" @click="router.push('/')">
                <ion-icon name="arrow-back"></ion-icon>
            </button>
            <button class="header-btn">
                <ion-icon name="home-outline"></ion-icon>
            </button>

            <div class="header-spacer"></div>
            <button class="header-btn">
                <ion-icon name="people-outline"></ion-icon>
            </button>
            <button class="header-btn" @click="exeportadorDesing">
                <ion-icon name="download-outline"></ion-icon>
            </button>
        </header>

        <main ref="canvasAreaRef" class="canvas-area">
            <canvas ref="canvasRef"></canvas>
        </main>

        <footer class="editor-footer">

            <!-- CONTEINER CONDICIONAL: Aparece EXATAMENTE em cima do footer principal ao clicar em Texto -->
            <div v-if="menuAtivoAcima === 'texto'" class="aba-superior-texto">
            </div>
            
            <div v-if="menuAtivoAcima === 'images'" class="aba-superior-img">
                        </div>
            
            <!-- CONTEINER CONDICIONAL: Aparece EXATAMENTE em cima do footer principal ao clicar em Formas -->
            <div v-if="menuAtivoAcima === 'formas'" class="aba-superior-formas">
            </div>

            <!-- FOOTER PRINCIPAL: Fixo, imutável e sempre visível na base -->
            <div class="ferramentas-container-fixo">
                <button class="tool-btn" :class="{ ativo: menuAtivoAcima === 'texto' }" @click="clicarTextoNoFooter">
                    <ion-icon name="text-outline"></ion-icon>
                </button>

                <button class="tool-btn" :class="{ ativo: menuAtivoAcima === 'formas' }" @click="clicarFormasNoFooter">
                    <ion-icon name="shapes-outline"></ion-icon>
                </button>
                
                <button class="tool-btn" :class="{ ativo: menuAtivoAcima === 'images' }" @click="clicarImagesNoFooter">
                    <ion-icon name="images-outline"></ion-icon>
                </button>

                <button class="tool-btn" @click="deletarSelecionado">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            </div>

        </footer>

    </div>
</template>

<style scoped>
.editor-interface {
    display: flex;
  flex-direction: column;
    height: 100vh;
    width: 100vw;
    font-family: system-ui, sans-serif;
    overflow: hidden;
    box-sizing: border-box;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    background-color: #FF5700;
    height: 50px;
    width: 100%;
    box-sizing: border-box;
}

.header-btn {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.header-btn ion-icon {
    font-size: 25px;
}

.canvas-area {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    background-color: #262626;
    overflow: hidden;
}

/* ESTRUTURA GERAL DO FOOTER COMPACTO */
.editor-footer {
    width: 100%;
    border-top: 1px solid #FF5700;
    display: flex;
    flex-direction: column;
}

.aba-superior-texto {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background-color: var(--cor-fundo-secundaria);
    border-bottom: 1px solid #2d2d2d;
}

.aba-superior-img {
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background-color: var(--cor-fundo-secundaria);
    border-bottom: 1px solid #2d2d2d;
}

.cores-predefinidas {
    display: flex;
    gap: 10px;
    align-items: center;
}

.circulo-cor {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
}

.circulo-cor.branco {
    background-color: #ffffff;
}

.circulo-cor.laranja {
    background-color: #FF5700;
}

.circulo-cor.transp-borda {
    background-color: transparent;
    border: 2px solid #ffffff;
}

.controle-tamanho {
    display: flex;
    align-items: center;
    background: transparent;
    border: 1px solid #FF5700;
    border-radius: 20px;
    padding: 2px 10px;
    height: 26px;
}

.prefixo-tamanho {
    color: #FF5700;
    font-size: 14px;
    margin-right: 4px;
    font-weight: bold;
}

.input-tamanho-numero {
    background: transparent;
    border: none;
    color: white;
    width: 35px;
    text-align: center;
    font-size: 14px;
    outline: none;
}

/* Remove setas padrões do input number */
.input-tamanho-numero::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

.controle-fonte {
    display: flex;
    align-items: center;
    gap: 8px;
}

.label-fonte {
    color: #ffffff;
    font-size: 14px;
}

.select-fonte-custom {
    background: transparent;
    border: 1px solid #FF5700;
    color: white;
    border-radius: 20px;
    padding: 2px 12px;
    font-size: 13px;
    outline: none;
}

/* ==============================================================DIV DO MENU DE FORMAS (OPCIONAL ACIMA DO FOOTER)============================================================== */
.aba-superior-formas {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    background-color:var(--cor-fundo-secundaria);
    border-bottom: 1px solid #2d2d2d;
}

.forma-opcao-btn {
    background: transparent;
    border: none;
    color: white;
    font-size: 22px;
    cursor: pointer;
}

/* ==============================================================BARRA PRINCIPAL DE BAIXO FIXA E IMUTÁVEL============================================================== */
.ferramentas-container-fixo {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    background-color:var(--cor-fundo-secundaria);
}

.tool-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--cor-fundo-secundaria);
    border: none;
    color:var(--cor-texto);
    cursor: pointer;
    font-size: 11px;
    gap: 2px;
    width: 70px;
}

.tool-btn ion-icon {
    font-size: 22px;
}

.tool-btn.ativo {
    color: #FF5700;
}

</style>
