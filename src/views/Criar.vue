<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import designsApi from '@/api/designsApi'

const router = useRouter()
const route = useRoute()

const canvasRef = ref(null)
const canvasAreaRef = ref(null)
let fabricCanvas = null

const designId = route.params.id
const design = ref(null)
const templateTitulo = ref('Design')
const salvando = ref(false)

const menuAtivoAcima = ref('nenhum')
const tamanhoFonte = ref(30)
const corTexto = ref('#ffffff')

const camadas = ref([])

const objetoSelecionado = ref(null)

function criarObjetoDeElemento(elemento) {
    const propsComuns = {
        left: elemento.posicao_x,
        top: elemento.posicao_y,
        borderColor: '#FF5700',
        cornerColor: '#FF5700',
        cornerSize: 10,
        transparentCorners: false,
    }

    if (elemento.type === 'shape') {
        const propsForma = {
            ...propsComuns,
            fill: 'transparent',
            stroke: elemento.color || '#FF5700',
            strokeWidth: elemento.stroke_width || 3,
        }
        const objetoForma = elemento.shape_type === 'circle'
            ? new fabric.Circle({ ...propsForma, radius: elemento.width / 2 })
            : new fabric.Rect({ ...propsForma, width: elemento.width, height: elemento.heigth })

        objetoForma.elementId = elemento.id
        objetoForma.elementType = 'shape'
        return Promise.resolve(objetoForma)
    }

    if (elemento.type === 'image') {
        return new Promise((resolve) => {
            const imagemElemento = new window.Image()
            imagemElemento.crossOrigin = 'anonymous'
            imagemElemento.src = elemento.content
            imagemElemento.onload = () => {
                const imgFabric = new fabric.Image(imagemElemento, propsComuns)
                imgFabric.scaleToWidth(elemento.width)
                if (imgFabric.getScaledHeight() !== elemento.heigth) {
                    imgFabric.scaleToHeight(elemento.heigth)
                }
                imgFabric.elementId = elemento.id
                imgFabric.elementType = 'image'
                resolve(imgFabric)
            }
        })
    }

    const ehTitulo = elemento.type === 'title'
    const textoFabric = new fabric.IText(elemento.content || '', {
        ...propsComuns,
        width: elemento.width,
        fontFamily: 'sans-serif',
        fontSize: ehTitulo ? 32 : 16,
        fontWeight: ehTitulo ? 'bold' : 'normal',
        fill: elemento.color || '#ffffff',
    })
    textoFabric.elementId = elemento.id
    textoFabric.elementType = elemento.type
    return Promise.resolve(textoFabric)
}

async function carregarDesignNoCanvas() {
    const { data } = await designsApi.obterDesign(designId)
    design.value = data
    templateTitulo.value = data.name || 'Design'

    for (const elemento of data.elements) {
        const objeto = await criarObjetoDeElemento(elemento)
        fabricCanvas.add(objeto)
    }
    fabricCanvas.renderAll()
    atualizarListaCamadas()
}

const inicializarCanvas = async () => {
    if (!canvasRef.value || !canvasAreaRef.value || !designId) return

    const larguraDisponivel = canvasAreaRef.value.clientWidth
    const alturaDisponivel = canvasAreaRef.value.clientHeight

    fabricCanvas = new fabric.Canvas(canvasRef.value, {
        width: larguraDisponivel,
        height: alturaDisponivel,
        backgroundColor: 'var(--cor-fundo-secundaria)',
    })

    await carregarDesignNoCanvas()

    fabricCanvas.on('selection:created', lidarComSelecao)
    fabricCanvas.on('selection:updated', lidarComSelecao)
    fabricCanvas.on('selection:cleared', () => {
        menuAtivoAcima.value = 'nenhum'
        objetoSelecionado.value = null
    })
    fabricCanvas.on('object:added', atualizarListaCamadas)
    fabricCanvas.on('object:removed', atualizarListaCamadas)
    fabricCanvas.on('object:modified', atualizarListaCamadas)
    fabricCanvas.on('text:editing:exited', atualizarListaCamadas)

    window.addEventListener('keydown', lidarComTeclado)
}

const lidarComSelecao = (e) => {
    const objetoAtivo = e.selected[0]
    objetoSelecionado.value = objetoAtivo || null

    if (objetoAtivo && objetoAtivo.type === 'i-text') {
        menuAtivoAcima.value = 'texto'
        tamanhoFonte.value = objetoAtivo.fontSize
        corTexto.value = objetoAtivo.fill
    } else {
        menuAtivoAcima.value = 'nenhum'
    }
}

const clicarTextoNoFooter = () => {
    if (menuAtivoAcima.value === 'texto') {
        menuAtivoAcima.value = 'nenhum'
    } else {
        menuAtivoAcima.value = 'texto'
        const objetoAtivo = fabricCanvas?.getActiveObject()
        if (!objetoAtivo || objetoAtivo.type !== 'i-text') {
            adicionarTexto()
        }
    }
}

const clicarImagesNoFooter = () => {
    menuAtivoAcima.value = menuAtivoAcima.value === 'images' ? 'nenhum' : 'images'
}

const clicarFormasNoFooter = () => {
    menuAtivoAcima.value = menuAtivoAcima.value === 'formas' ? 'nenhum' : 'formas'
}

const clicarCamadasNoFooter = () => {
    if (menuAtivoAcima.value === 'camadas') {
        menuAtivoAcima.value = 'nenhum'
    } else {
        menuAtivoAcima.value = 'camadas'
        atualizarListaCamadas()
    }
}


function rotuloDoObjeto(objeto) {
    if (objeto.type === 'i-text') {
        const texto = objeto.text?.trim()
        return texto ? texto.slice(0, 24) : (objeto.elementType === 'title' ? 'Título' : 'Texto')
    }
    if (objeto.type === 'image') return 'Imagem'
    if (objeto.type === 'rect') return 'Retângulo'
    if (objeto.type === 'circle') return 'Círculo'
    return 'Elemento'
}

function gerarMiniatura(objeto) {
    try {
        return objeto.toDataURL({ format: 'png', multiplier: 0.6 })
    } catch (erro) {
        return null
    }
}

function atualizarListaCamadas() {
    if (!fabricCanvas) return
    camadas.value = [...fabricCanvas.getObjects()]
        .reverse()
        .map((objeto) => ({ objeto, thumbnail: gerarMiniatura(objeto) }))
}

function selecionarCamada(objeto) {
    fabricCanvas.setActiveObject(objeto)
    objetoSelecionado.value = objeto
    fabricCanvas.renderAll()
}

async function persistirOrdemDasCamadas() {
    const idsEmOrdem = fabricCanvas.getObjects()
        .map((objeto) => objeto.elementId)
        .filter(Boolean)

    if (idsEmOrdem.length > 0) {
        await designsApi.reordenarCamadas(designId, idsEmOrdem)
    }
}

async function moverCamadaParaCima(objeto) {
    fabricCanvas.bringForward(objeto)
    fabricCanvas.renderAll()
    atualizarListaCamadas()
    await persistirOrdemDasCamadas()
}

async function moverCamadaParaBaixo(objeto) {
    fabricCanvas.sendBackwards(objeto)
    fabricCanvas.renderAll()
    atualizarListaCamadas()
    await persistirOrdemDasCamadas()
}

const adicionarTexto = () => {
    if (!fabricCanvas) return
    const textoEditavel = new fabric.IText('Seus', {
        left: fabricCanvas.width / 3,
        top: fabricCanvas.height / 1.5,
        fontFamily: 'sans-serif',
        fontSize: 30,
        fill: '#ffffff',
        fontWeight: 'bold',
        borderColor: '#FF5700',
        cornerColor: '#FF5700',
        cornerSize: 10,
        transparentCorners: false,
    })
    textoEditavel.elementType = 'text'

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
            fill: corTexto.value,
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
        cornerSize: 10,
    })
    retangulo.elementType = 'shape'
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
        cornerSize: 10,
    })
    circulo.elementType = 'shape'
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
    link.download = `editado-${templateTitulo.value}.png`
    link.href = dataURL
    link.click()
}

function objetoFabricParaElemento(objeto) {
    const base = {
        id: objeto.elementId ?? null, 
        posicao_x: Math.round(objeto.left),
        posicao_y: Math.round(objeto.top),
        width: Math.round(objeto.width * objeto.scaleX),
        heigth: Math.round(objeto.height * objeto.scaleY),
    }

    if (objeto.type === 'i-text') {
        return {
            ...base,
            type: objeto.elementType === 'title' ? 'title' : 'text',
            content: objeto.text,
            color: objeto.fill,
        }
    }

    if (objeto.type === 'image') {
        return { ...base, type: 'image', content: objeto.getSrc(), color: '' }
    }

    if (objeto.type === 'rect' || objeto.type === 'circle') {
        return {
            ...base,
            type: 'shape',
            shape_type: objeto.type,
            stroke_width: objeto.strokeWidth,
            color: objeto.stroke,
            content: '',
        }
    }

    return null
}

async function salvarDesign() {
    if (!fabricCanvas || salvando.value) return
    salvando.value = true
    try {
        const elementos = fabricCanvas
            .getObjects()
            .map((objeto, index) => {
                const elemento = objetoFabricParaElemento(objeto)
                return elemento ? { ...elemento, layer_order: index } : null
            })
            .filter(Boolean)

        const { data } = await designsApi.salvarElementos(designId, elementos)

        data.elements.forEach((elementoSalvo, index) => {
            const objeto = fabricCanvas.getObjects()[index]
            if (objeto && !objeto.elementId) objeto.elementId = elementoSalvo.id
        })
    } finally {
        salvando.value = false
    }
}

onMounted(() => { inicializarCanvas() })
onBeforeUnmount(() => {
    window.removeEventListener('keydown', lidarComTeclado)
    if (fabricCanvas) {
        fabricCanvas.off('object:added', atualizarListaCamadas)
        fabricCanvas.off('object:removed', atualizarListaCamadas)
        fabricCanvas.off('object:modified', atualizarListaCamadas)
        fabricCanvas.off('text:editing:exited', atualizarListaCamadas)
        fabricCanvas.dispose()
    }
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
            <button class="header-btn" @click="salvarDesign" :disabled="salvando">
                <ion-icon name="save-outline"></ion-icon>
            </button>
            <button class="header-btn" @click="exeportadorDesing">
                <ion-icon name="download-outline"></ion-icon>
            </button>
        </header>

        <main ref="canvasAreaRef" class="canvas-area">
            <canvas ref="canvasRef"></canvas>
        </main>

        <footer class="editor-footer">
            <div v-if="menuAtivoAcima === 'texto'" class="aba-superior-texto"></div>
            <div v-if="menuAtivoAcima === 'images'" class="aba-superior-img"></div>
            <div v-if="menuAtivoAcima === 'formas'" class="aba-superior-formas"></div>

            <div v-if="menuAtivoAcima === 'camadas'" class="aba-superior-camadas">
                <div v-if="!camadas.length" class="camadas-vazio">Nenhum elemento no canvas ainda.</div>
                <div
                    v-for="(camada, index) in camadas"
                    :key="camada.objeto.elementId ?? index"
                    class="camada-item"
                    :class="{ ativa: camada.objeto === objetoSelecionado }"
                    @click="selecionarCamada(camada.objeto)"
                >
                    <div class="camada-thumb">
                        <img v-if="camada.thumbnail" :src="camada.thumbnail" :alt="rotuloDoObjeto(camada.objeto)" />
                        <ion-icon v-else name="image-outline"></ion-icon>
                    </div>
                    <span class="camada-nome">{{ rotuloDoObjeto(camada.objeto) }}</span>
                    <div class="camada-acoes">
                        <button
                            class="camada-btn"
                            :disabled="index === 0"
                            @click.stop="moverCamadaParaCima(camada.objeto)"
                            title="Trazer pra frente"
                        >
                            <ion-icon name="chevron-up-outline"></ion-icon>
                        </button>
                        <button
                            class="camada-btn"
                            :disabled="index === camadas.length - 1"
                            @click.stop="moverCamadaParaBaixo(camada.objeto)"
                            title="Enviar pra trás"
                        >
                            <ion-icon name="chevron-down-outline"></ion-icon>
                        </button>
                    </div>
                </div>
            </div>

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
                <button class="tool-btn" :class="{ ativo: menuAtivoAcima === 'camadas' }" @click="clicarCamadasNoFooter">
                    <ion-icon name="layers-outline"></ion-icon>
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
.header-btn ion-icon { font-size: 25px; }
.canvas-area {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    background-color: #262626;
    overflow: hidden;
}
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
.aba-superior-formas {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 30px;
    background-color: var(--cor-fundo-secundaria);
    border-bottom: 1px solid #2d2d2d;
}
.aba-superior-camadas {
    max-height: 220px;
    overflow-y: auto;
    background-color: var(--cor-fundo-secundaria);
    border-bottom: 1px solid #2d2d2d;
    padding: 8px 0;
}
.camadas-vazio {
    color: var(--cor-texto-secundario, #999);
    font-size: 13px;
    text-align: center;
    padding: 12px;
}
.camada-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    cursor: pointer;
    border-bottom: 1px solid #2d2d2d;
}
.camada-thumb {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 6px;
    border: 1px solid #2d2d2d;
    background-color: #1a1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
.camada-thumb img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
.camada-thumb ion-icon {
    color: var(--cor-texto-secundario, #666);
    font-size: 16px;
}
.camada-item.ativa {
    background-color: rgba(255, 87, 0, 0.15);
}
.camada-nome {
    flex: 1;
    color: var(--cor-texto);
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.camada-acoes {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
}
.camada-btn {
    background: transparent;
    border: 1px solid #FF5700;
    border-radius: 6px;
    color: #FF5700;
    cursor: pointer;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.camada-btn:disabled {
    opacity: 0.3;
    cursor: default;
}
.ferramentas-container-fixo {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    background-color: var(--cor-fundo-secundaria);
}
.tool-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--cor-fundo-secundaria);
    border: none;
    color: var(--cor-texto);
    cursor: pointer;
    font-size: 11px;
    gap: 2px;
    width: 70px;
}
.tool-btn ion-icon { font-size: 22px; }
.tool-btn.ativo { color: #FF5700; }
</style>