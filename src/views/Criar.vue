O ChatGPT disse:
Sim. O problema principal do seu código é que você está usando fabric como variável global, mas no projeto com Fabric 7.4.0 é muito mais seguro importar as classes diretamente. Além disso, vamos deixar o limite de 3 cores salvas na paleta, funcionando tanto no celular quanto no computador.

Também vou manter o carregamento das fontes pelo WebFontLoader.

1. Instale as dependências
npm install fabric@^7.4.0 webfontloader

2. Use este componente completo
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
    Canvas,
    FabricImage,
    IText,
    Rect,
    Circle,
    Triangle,
    Polygon
} from 'fabric'

import WebFont from 'webfontloader'

const router = useRouter()
const route = useRoute()

// =====================================================
// REFERÊNCIAS
// =====================================================

const canvasRef = ref(null)
const canvasAreaRef = ref(null)

let fabricCanvas = null

const imgUrl = route.query.img
const templateTitulo = route.query.titulo || 'Design'

// =====================================================
// MENUS
// =====================================================

const menuAtivoAcima = ref('nenhum')

// =====================================================
// TEXTO
// =====================================================

const tamanhoFonte = ref(30)
const corTexto = ref('#FFFFFF')
const fonteTexto = ref('Roboto')

// =====================================================
// FONTES
// =====================================================

const fontesDisponiveis = [
    'Roboto',
    'Poppins',
    'Montserrat',
    'Open Sans',
    'Lato',
    'Oswald',
    'Raleway',
    'Nunito',
    'Ubuntu',
    'Merriweather',
    'Playfair Display',
    'Bebas Neue',
    'Pacifico',
    'Dancing Script',
    'Lobster',
    'Roboto Condensed',
    'Roboto Slab',
    'Inter'
]

const fontesCarregadas = new Set()

// =====================================================
// PALETA
// MÁXIMO 3 CORES
// =====================================================

const LIMITE_CORES = 3

const coresTexto = ref([
    '#FFFFFF',
    '#000000',
    '#FF5700'
])

// =====================================================
// CARREGAR FONTE
// =====================================================

const carregarFonte = (nomeFonte) => {

    return new Promise((resolve) => {

        if (fontesCarregadas.has(nomeFonte)) {
            resolve()
            return
        }

        WebFont.load({

            google: {
                families: [
                    `${nomeFonte}:400,500,600,700`
                ]
            },

            active: () => {

                fontesCarregadas.add(nomeFonte)

                resolve()
            },

            inactive: () => {

                console.warn(
                    `Fonte não carregada: ${nomeFonte}`
                )

                resolve()
            }
        })
    })
}

// =====================================================
// INICIALIZAR CANVAS
// =====================================================

const inicializarCanvas = () => {

    if (
        !canvasRef.value ||
        !canvasAreaRef.value
    ) {
        return
    }

    const largura =
        canvasAreaRef.value.clientWidth

    const altura =
        canvasAreaRef.value.clientHeight

    fabricCanvas = new Canvas(
        canvasRef.value,
        {
            width: largura,
            height: altura,

            backgroundColor: '#262626',

            preserveObjectStacking: true,

            selection: true
        }
    )

    // =================================================
    // CONFIGURAÇÃO MOBILE
    // =================================================

    if (fabricCanvas.upperCanvasEl) {

        fabricCanvas.upperCanvasEl.style.touchAction =
            'none'

        fabricCanvas.upperCanvasEl.style.userSelect =
            'none'

        fabricCanvas.upperCanvasEl.style.webkitUserSelect =
            'none'
    }

    if (fabricCanvas.lowerCanvasEl) {

        fabricCanvas.lowerCanvasEl.style.touchAction =
            'none'
    }

    // =================================================
    // IMAGEM DE FUNDO
    // =================================================

    if (imgUrl) {

        const imagemElemento = new Image()

        imagemElemento.crossOrigin = 'anonymous'

        imagemElemento.src = imgUrl

        imagemElemento.onload = () => {

            if (!fabricCanvas) return

            const imagem =
                new FabricImage(
                    imagemElemento,
                    {
                        selectable: false,
                        evented: false
                    }
                )

            const escalaLargura =
                (fabricCanvas.width * 0.85) /
                imagemElemento.width

            const escalaAltura =
                (fabricCanvas.height * 0.60) /
                imagemElemento.height

            const escala =
                Math.min(
                    escalaLargura,
                    escalaAltura
                )

            imagem.set({
                scaleX: escala,
                scaleY: escala
            })

            fabricCanvas.add(imagem)

            fabricCanvas.centerObject(imagem)

            fabricCanvas.sendObjectToBack(imagem)

            fabricCanvas.requestRenderAll()
        }

        imagemElemento.onerror = () => {

            console.error(
                'Erro ao carregar imagem:',
                imgUrl
            )
        }
    }

    // =================================================
    // SELEÇÃO
    // =================================================

    fabricCanvas.on(
        'selection:created',
        lidarComSelecao
    )

    fabricCanvas.on(
        'selection:updated',
        lidarComSelecao
    )

    fabricCanvas.on(
        'selection:cleared',
        () => {

            menuAtivoAcima.value =
                'nenhum'
        }
    )

    // =================================================
    // DUPLO CLIQUE NO TEXTO
    // =================================================

    fabricCanvas.on(
        'mouse:dblclick',
        (evento) => {

            const objeto =
                evento.target

            if (
                objeto &&
                objeto.type === 'i-text'
            ) {

                fabricCanvas.setActiveObject(
                    objeto
                )

                objeto.enterEditing()

                objeto.selectAll()

                menuAtivoAcima.value =
                    'texto'

                atualizarControlesDoTexto(
                    objeto
                )

                fabricCanvas.requestRenderAll()
            }
        }
    )

    // =================================================
    // MOVIMENTO
    // =================================================

    fabricCanvas.on(
        'object:moving',
        () => {

            fabricCanvas.requestRenderAll()
        }
    )

    // =================================================
    // REDIMENSIONAMENTO
    // =================================================

    fabricCanvas.on(
        'object:scaling',
        () => {

            fabricCanvas.requestRenderAll()
        }
    )

    // =================================================
    // TECLADO
    // =================================================

    window.addEventListener(
        'keydown',
        lidarComTeclado
    )
}

// =====================================================
// CONTROLES DO TEXTO
// =====================================================

const atualizarControlesDoTexto = (objeto) => {

    tamanhoFonte.value =
        objeto.fontSize || 30

    corTexto.value =
        typeof objeto.fill === 'string'
            ? objeto.fill
            : '#FFFFFF'

    fonteTexto.value =
        objeto.fontFamily || 'Roboto'
}

// =====================================================
// SELEÇÃO DE OBJETO
// =====================================================

const lidarComSelecao = (evento) => {

    const objeto =
        evento.selected?.[0]

    if (!objeto) {

        menuAtivoAcima.value =
            'nenhum'

        return
    }

    // TEXTO
    if (
        objeto.type === 'i-text'
    ) {

        menuAtivoAcima.value =
            'texto'

        atualizarControlesDoTexto(
            objeto
        )

        return
    }

    // FORMAS
    if (
        objeto.type === 'rect' ||
        objeto.type === 'circle' ||
        objeto.type === 'triangle' ||
        objeto.type === 'polygon'
    ) {

        menuAtivoAcima.value =
            'formas'

        return
    }

    menuAtivoAcima.value =
        'nenhum'
}

// =====================================================
// BOTÃO TEXTO
// =====================================================

const clicarTextoNoFooter = async () => {

    console.log('Botão texto pressionado')

    if (
        menuAtivoAcima.value === 'texto'
    ) {

        menuAtivoAcima.value =
            'nenhum'

        return
    }

    menuAtivoAcima.value =
        'texto'

    if (!fabricCanvas) {

        console.error(
            'Canvas ainda não foi inicializado.'
        )

        return
    }

    const objeto =
        fabricCanvas.getActiveObject()

    if (
        !objeto ||
        objeto.type !== 'i-text'
    ) {

        await adicionarTexto()
    }
}

// =====================================================
// BOTÃO FORMAS
// =====================================================

const clicarFormasNoFooter = () => {

    console.log('Botão formas pressionado')

    if (
        menuAtivoAcima.value === 'formas'
    ) {

        menuAtivoAcima.value =
            'nenhum'

        return
    }

    menuAtivoAcima.value =
        'formas'
}

// =====================================================
// BOTÃO IMAGENS
// =====================================================

const clicarImagesNoFooter = () => {

    console.log('Botão imagens pressionado')

    if (
        menuAtivoAcima.value === 'images'
    ) {

        menuAtivoAcima.value =
            'nenhum'

        return
    }

    menuAtivoAcima.value =
        'images'
}

// =====================================================
// ADICIONAR TEXTO
// =====================================================

const adicionarTexto = async () => {

    if (!fabricCanvas) {

        console.error(
            'Fabric Canvas não existe.'
        )

        return
    }

    await carregarFonte(
        fonteTexto.value
    )

    const texto =
        new IText(
            'Seu texto',
            {

                left:
                    fabricCanvas.width / 2,

                top:
                    fabricCanvas.height / 2,

                originX:
                    'center',

                originY:
                    'center',

                fontFamily:
                    fonteTexto.value,

                fontSize:
                    Number(tamanhoFonte.value),

                fill:
                    corTexto.value,

                fontWeight:
                    'bold',

                editable:
                    true,

                selectable:
                    true,

                evented:
                    true,

                padding:
                    8,

                cornerColor:
                    '#FF5700',

                cornerStrokeColor:
                    '#FF5700',

                borderColor:
                    '#FF5700',

                cornerSize:
                    12,

                transparentCorners:
                    false,

                objectCaching:
                    false
            }
        )

    fabricCanvas.add(texto)

    fabricCanvas.setActiveObject(texto)

    fabricCanvas.bringObjectToFront(texto)

    menuAtivoAcima.value =
        'texto'

    fabricCanvas.requestRenderAll()

    // =================================================
    // ENTRAR NO TEXTO
    // =================================================

    requestAnimationFrame(() => {

        if (!fabricCanvas) return

        fabricCanvas.setActiveObject(texto)

        texto.enterEditing()

        texto.selectAll()

        fabricCanvas.requestRenderAll()
    })
}

// =====================================================
// MUDAR COR
// =====================================================

const mudarCorTextoPredefinida = (cor) => {

    corTexto.value =
        cor

    atualizarAtributosTexto()
}

// =====================================================
// ATRIBUTOS DO TEXTO
// =====================================================

const atualizarAtributosTexto = () => {

    if (!fabricCanvas) return

    const objeto =
        fabricCanvas.getActiveObject()

    if (
        !objeto ||
        objeto.type !== 'i-text'
    ) {
        return
    }

    objeto.set({

        fontSize:
            Number(tamanhoFonte.value),

        fill:
            corTexto.value
    })

    objeto.setCoords()

    fabricCanvas.requestRenderAll()
}

// =====================================================
// ALTERAR FONTE
// =====================================================

const atualizarFonteTexto = async () => {

    if (!fabricCanvas) return

    const objeto =
        fabricCanvas.getActiveObject()

    if (
        !objeto ||
        objeto.type !== 'i-text'
    ) {
        return
    }

    await carregarFonte(
        fonteTexto.value
    )

    objeto.set({
        fontFamily:
            fonteTexto.value
    })

    objeto.setCoords()

    fabricCanvas.requestRenderAll()
}

// =====================================================
// ADICIONAR COR
// MÁXIMO 3
// =====================================================

const adicionarCorPaleta = () => {

    const cor =
        corTexto.value.toUpperCase()

    // Já existe
    if (
        coresTexto.value.includes(cor)
    ) {

        return
    }

    // Limite
    if (
        coresTexto.value.length >=
        LIMITE_CORES
    ) {

        alert(
            'Você pode salvar no máximo 3 cores.'
        )

        return
    }

    coresTexto.value.push(cor)
}

// =====================================================
// APAGAR COR
// =====================================================

const apagarCorPaleta = (cor) => {

    coresTexto.value =
        coresTexto.value.filter(
            item => item !== cor
        )
}

// =====================================================
// RETÂNGULO
// =====================================================

const adicionarRetangulo = () => {

    if (!fabricCanvas) return

    const tamanho = 100

    const objeto =
        new Rect({

            left:
                fabricCanvas.width / 2,

            top:
                fabricCanvas.height / 2,

            originX:
                'center',

            originY:
                'center',

            width:
                tamanho,

            height:
                tamanho,

            fill:
                'transparent',

            stroke:
                '#FF5700',

            strokeWidth:
                3,

            selectable:
                true,

            evented:
                true,

            cornerColor:
                '#FF5700',

            cornerStrokeColor:
                '#FF5700',

            borderColor:
                '#FF5700',

            cornerSize:
                12,

            transparentCorners:
                false
        })

    adicionarObjetoCanvas(objeto)
}

// =====================================================
// CÍRCULO
// =====================================================

const adicionarCirculo = () => {

    if (!fabricCanvas) return

    const objeto =
        new Circle({

            left:
                fabricCanvas.width / 2,

            top:
                fabricCanvas.height / 2,

            originX:
                'center',

            originY:
                'center',

            radius:
                50,

            fill:
                'transparent',

            stroke:
                '#FF5700',

            strokeWidth:
                3,

            selectable:
                true,

            evented:
                true,

            cornerColor:
                '#FF5700',

            cornerStrokeColor:
                '#FF5700',

            borderColor:
                '#FF5700',

            cornerSize:
                12,

            transparentCorners:
                false
        })

    adicionarObjetoCanvas(objeto)
}

// =====================================================
// TRIÂNGULO
// =====================================================

const adicionarTriangulo = () => {

    if (!fabricCanvas) return

    const objeto =
        new Triangle({

            left:
                fabricCanvas.width / 2,

            top:
                fabricCanvas.height / 2,

            originX:
                'center',

            originY:
                'center',

            width:
                110,

            height:
                100,

            fill:
                'transparent',

            stroke:
                '#FF5700',

            strokeWidth:
                3,

            selectable:
                true,

            evented:
                true,

            cornerColor:
                '#FF5700',

            cornerStrokeColor:
                '#FF5700',

            borderColor:
                '#FF5700',

            cornerSize:
                12,

            transparentCorners:
                false
        })

    adicionarObjetoCanvas(objeto)
}

// =====================================================
// ESTRELA
// =====================================================

const adicionarEstrela = () => {

    if (!fabricCanvas) return

    const pontos = []

    const pontas = 5

    const raioExterno = 55

    const raioInterno = 25

    for (
        let i = 0;
        i < pontas * 2;
        i++
    ) {

        const raio =
            i % 2 === 0
                ? raioExterno
                : raioInterno

        const angulo =
            (Math.PI / pontas) * i -
            Math.PI / 2

        pontos.push({

            x:
                Math.cos(angulo) * raio,

            y:
                Math.sin(angulo) * raio
        })
    }

    const objeto =
        new Polygon(
            pontos,
            {

                left:
                    fabricCanvas.width / 2,

                top:
                    fabricCanvas.height / 2,

                originX:
                    'center',

                originY:
                    'center',

                fill:
                    'transparent',

                stroke:
                    '#FF5700',

                strokeWidth:
                    3,

                selectable:
                    true,

                evented:
                    true,

                cornerColor:
                    '#FF5700',

                cornerStrokeColor:
                    '#FF5700',

                borderColor:
                    '#FF5700',

                cornerSize:
                    12,

                transparentCorners:
                    false
            }
        )

    adicionarObjetoCanvas(objeto)
}

// =====================================================
// ADICIONAR OBJETO
// =====================================================

const adicionarObjetoCanvas = (objeto) => {

    if (!fabricCanvas) return

    fabricCanvas.add(objeto)

    fabricCanvas.setActiveObject(objeto)

    fabricCanvas.bringObjectToFront(objeto)

    fabricCanvas.requestRenderAll()
}

// =====================================================
// DELETAR
// =====================================================

const deletarSelecionado = () => {

    console.log('Lixeira pressionada')

    if (!fabricCanvas) return

    const objeto =
        fabricCanvas.getActiveObject()

    if (!objeto) {

        return
    }

    if (
        objeto.selectable === false
    ) {

        return
    }

    fabricCanvas.remove(objeto)

    fabricCanvas.discardActiveObject()

    fabricCanvas.requestRenderAll()

    menuAtivoAcima.value =
        'nenhum'
}

// =====================================================
// TECLADO
// =====================================================

const lidarComTeclado = (evento) => {

    if (!fabricCanvas) return

    const objeto =
        fabricCanvas.getActiveObject()

    if (!objeto) return

    if (
        objeto.type === 'i-text' &&
        objeto.isEditing
    ) {

        return
    }

    if (
        evento.key === 'Delete' ||
        evento.key === 'Backspace'
    ) {

        evento.preventDefault()

        deletarSelecionado()
    }
}

// =====================================================
// EXPORTAR
// =====================================================

const exportarDesign = () => {

    if (!fabricCanvas) return

    fabricCanvas.discardActiveObject()

    fabricCanvas.requestRenderAll()

    const dataURL =
        fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        })

    const link =
        document.createElement('a')

    link.download =
        `editado-${templateTitulo}.png`

    link.href =
        dataURL

    link.click()
}

// =====================================================
// REDIMENSIONAR
// =====================================================

const redimensionarCanvas = () => {

    if (
        !fabricCanvas ||
        !canvasAreaRef.value
    ) {

        return
    }

    fabricCanvas.setDimensions({

        width:
            canvasAreaRef.value.clientWidth,

        height:
            canvasAreaRef.value.clientHeight
    })

    fabricCanvas.requestRenderAll()
}

// =====================================================
// MOUNT
// =====================================================

onMounted(() => {

    inicializarCanvas()

    window.addEventListener(
        'resize',
        redimensionarCanvas
    )
})

// =====================================================
// UNMOUNT
// =====================================================

onBeforeUnmount(() => {

    window.removeEventListener(
        'keydown',
        lidarComTeclado
    )

    window.removeEventListener(
        'resize',
        redimensionarCanvas
    )

    if (fabricCanvas) {

        fabricCanvas.dispose()

        fabricCanvas = null
    }
})
</script>

<template>

    <div class="editor-interface">

        <!-- ========================================= -->
        <!-- HEADER -->
        <!-- ========================================= -->

        <header class="editor-header">

            <button
                type="button"
                class="header-btn"
                @click="router.push('/')"
            >

                <ion-icon
                    name="arrow-back"
                />

            </button>

            <button
                type="button"
                class="header-btn"
                @click="router.push('/')"
            >

                <ion-icon
                    name="home-outline"
                />

            </button>

            <div class="header-spacer"></div>

            <button
                type="button"
                class="header-btn"
            >

                <ion-icon
                    name="people-outline"
                />

            </button>

            <button
                type="button"
                class="header-btn"
                @click="exportarDesign"
            >

                <ion-icon
                    name="download-outline"
                />

            </button>

        </header>


        <!-- ========================================= -->
        <!-- CANVAS -->
        <!-- ========================================= -->

        <main
            ref="canvasAreaRef"
            class="canvas-area"
        >

            <canvas
                ref="canvasRef"
            />

        </main>


        <!-- ========================================= -->
        <!-- FOOTER -->
        <!-- ========================================= -->

        <footer class="editor-footer">


            <!-- ===================================== -->
            <!-- TEXTO -->
            <!-- ===================================== -->

            <div
                v-if="menuAtivoAcima === 'texto'"
                class="aba-superior-texto"
            >

                <!-- PALETA -->

                <div class="cores-predefinidas">

                    <div
                        v-for="cor in coresTexto"
                        :key="cor"
                        class="cor-paleta-item"
                    >

                        <button
                            type="button"
                            class="circulo-cor"
                            :style="{
                                backgroundColor: cor
                            }"
                            @click="mudarCorTextoPredefinida(cor)"
                        />

                        <button
                            type="button"
                            class="apagar-cor"
                            @click.stop="apagarCorPaleta(cor)"
                        >
                            ×
                        </button>

                    </div>


                    <!-- COLOR PICKER -->

                    <input
                        type="color"
                        v-model="corTexto"
                        @input="atualizarAtributosTexto"
                        class="seletor-cor"
                    />


                    <!-- ADICIONAR COR -->

                    <button
                        type="button"
                        class="botao-adicionar-cor"
                        @click="adicionarCorPaleta"
                        :disabled="
                            coresTexto.length >= LIMITE_CORES
                        "
                    >
                        +
                    </button>

                </div>


                <!-- TAMANHO -->

                <div class="controle-tamanho">

                    <span class="prefixo-tamanho">
                        T
                    </span>

                    <input
                        v-model.number="tamanhoFonte"
                        @input="atualizarAtributosTexto"
                        type="number"
                        min="8"
                        max="200"
                        class="input-tamanho-numero"
                    />

                </div>


                <!-- FONTE -->

                <div class="controle-fonte">

                    <select
                        v-model="fonteTexto"
                        @change="atualizarFonteTexto"
                        class="select-fonte-custom"
                    >

                        <option
                            v-for="fonte in fontesDisponiveis"
                            :key="fonte"
                            :value="fonte"
                            :style="{
                                fontFamily: fonte
                            }"
                        >

                            {{ fonte }}

                        </option>

                    </select>

                </div>

            </div>


            <!-- ===================================== -->
            <!-- IMAGENS -->
            <!-- ===================================== -->

            <div
                v-if="menuAtivoAcima === 'images'"
                class="aba-superior-img"
            >

                <span>
                    Imagens
                </span>

            </div>


            <!-- ===================================== -->
            <!-- FORMAS -->
            <!-- ===================================== -->

            <div
                v-if="menuAtivoAcima === 'formas'"
                class="aba-superior-formas"
            >

                <button
                    type="button"
                    class="forma-opcao-btn"
                    @click="adicionarRetangulo"
                >

                    <ion-icon
                        name="square-outline"
                    />

                </button>


                <button
                    type="button"
                    class="forma-opcao-btn"
                    @click="adicionarCirculo"
                >

                    <ion-icon
                        name="ellipse-outline"
                    />

                </button>


                <button
                    type="button"
                    class="forma-opcao-btn"
                    @click="adicionarTriangulo"
                >

                    <ion-icon
                        name="triangle-outline"
                    />

                </button>


                <button
                    type="button"
                    class="forma-opcao-btn"
                    @click="adicionarEstrela"
                >

                    <ion-icon
                        name="star-outline"
                    />

                </button>

            </div>


            <!-- ===================================== -->
            <!-- BARRA PRINCIPAL -->
            <!-- ===================================== -->

            <div class="ferramentas-container-fixo">

                <button
                    type="button"
                    class="tool-btn"
                    :class="{
                        ativo:
                            menuAtivoAcima === 'texto'
                    }"
                    @click="clicarTextoNoFooter"
                >

                    <ion-icon
                        name="text-outline"
                    />

                    <span>Texto</span>

                </button>


                <button
                    type="button"
                    class="tool-btn"
                    :class="{
                        ativo:
                            menuAtivoAcima === 'formas'
                    }"
                    @click="clicarFormasNoFooter"
                >

                    <ion-icon
                        name="shapes-outline"
                    />

                    <span>Formas</span>

                </button>


                <button
                    type="button"
                    class="tool-btn"
                    :class="{
                        ativo:
                            menuAtivoAcima === 'images'
                    }"
                    @click="clicarImagesNoFooter"
                >

                    <ion-icon
                        name="images-outline"
                    />

                    <span>Imagens</span>

                </button>


                <button
                    type="button"
                    class="tool-btn"
                    @click="deletarSelecionado"
                >

                    <ion-icon
                        name="trash-outline"
                    />

                    <span>Apagar</span>

                </button>

            </div>

        </footer>

    </div>

</template>

<style scoped>

* {
    box-sizing: border-box;
}

.editor-interface {

    width: 100vw;
    height: 100dvh;

    display: flex;
    flex-direction: column;

    overflow: hidden;

    background: #262626;

    color: white;

    font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
}

/* ==========================================
   HEADER
========================================== */

.editor-header {

    height: 50px;

    min-height: 50px;

    display: flex;

    align-items: center;

    gap: 8px;

    padding:
        0 12px;

    background:
        #FF5700;

    z-index: 20;
}

.header-btn {

    width: 40px;
    height: 40px;

    display: flex;

    align-items: center;
    justify-content: center;

    border: none;

    background: transparent;

    color: white;

    padding: 0;

    cursor: pointer;

    touch-action: manipulation;

    -webkit-tap-highlight-color: transparent;
}

.header-btn ion-icon {

    font-size: 24px;
}

.header-btn:active {

    transform:
        scale(.9);
}

.header-spacer {

    flex: 1;
}

/* ==========================================
   CANVAS
========================================== */

.canvas-area {

    flex: 1;

    min-height: 0;

    width: 100%;

    display: flex;

    align-items: center;
    justify-content: center;

    background:
        #262626;

    overflow: hidden;

    position: relative;
}

/* ==========================================
   FOOTER
========================================== */

.editor-footer {

    width: 100%;

    flex-shrink: 0;

    display: flex;

    flex-direction: column;

    background:
        #171717;

    border-top:
        1px solid #FF5700;

    position: relative;

    z-index: 30;
}

/* ==========================================
   MENU TEXTO
========================================== */

.aba-superior-texto {

    width: 100%;

    min-height: 58px;

    display: flex;

    align-items: center;

    gap: 14px;

    padding:
        8px 12px;

    background:
        #202020;

    border-bottom:
        1px solid #333;

    overflow-x: auto;

    overflow-y: hidden;

    -webkit-overflow-scrolling: touch;
}

.aba-superior-texto::-webkit-scrollbar {

    display: none;
}

/* ==========================================
   CORES
========================================== */

.cores-predefinidas {

    display: flex;

    align-items: center;

    gap: 12px;

    flex-shrink: 0;
}

.cor-paleta-item {

    position: relative;

    width: 30px;
    height: 30px;

    flex-shrink: 0;
}

.circulo-cor {

    width: 30px;
    height: 30px;

    padding: 0;

    border:
        2px solid #555;

    border-radius: 50%;

    cursor: pointer;

    touch-action: manipulation;
}

.circulo-cor:active {

    transform:
        scale(.85);
}

.apagar-cor {

    position: absolute;

    top: -7px;
    right: -7px;

    width: 17px;
    height: 17px;

    display: flex;

    align-items: center;
    justify-content: center;

    padding: 0;

    border: none;

    border-radius: 50%;

    background:
        #ff3030;

    color: white;

    font-size: 12px;

    line-height: 1;

    cursor: pointer;

    z-index: 10;
}

.apagar-cor:active {

    transform:
        scale(.85);
}

.seletor-cor {

    width: 30px;
    height: 30px;

    padding: 0;

    border:
        2px solid #FF5700;

    border-radius: 50%;

    overflow: hidden;

    flex-shrink: 0;

    background: transparent;
}

.botao-adicionar-cor {

    width: 30px;
    height: 30px;

    display: flex;

    align-items: center;
    justify-content: center;

    padding: 0;

    border:
        1px solid #FF5700;

    border-radius: 50%;

    background:
        transparent;

    color:
        #FF5700;

    font-size: 22px;

    cursor: pointer;

    touch-action: manipulation;
}

.botao-adicionar-cor:disabled {

    opacity: .3;

    cursor:
        not-allowed;
}

.botao-adicionar-cor:active:not(:disabled) {

    background:
        #FF5700;

    color:
        white;
}

/* ==========================================
   TAMANHO
========================================== */

.controle-tamanho {

    height: 34px;

    display: flex;

    align-items: center;

    flex-shrink: 0;

    padding:
        0 10px;

    border:
        1px solid #FF5700;

    border-radius:
        18px;
}

.prefixo-tamanho {

    color:
        #FF5700;

    font-weight:
        bold;

    margin-right:
        4px;
}

.input-tamanho-numero {

    width:
        40px;

    border:
        none;

    outline:
        none;

    background:
        transparent;

    color:
        white;

    text-align:
        center;

    font-size:
        14px;
}

.input-tamanho-numero::-webkit-inner-spin-button {

    -webkit-appearance:
        none;
}

/* ==========================================
   FONTE
========================================== */

.controle-fonte {

    flex-shrink: 0;
}

.select-fonte-custom {

    height:
        34px;

    min-width:
        125px;

    max-width:
        150px;

    padding:
        0 12px;

    border:
        1px solid #FF5700;

    border-radius:
        18px;

    outline:
        none;

    background:
        #202020;

    color:
        white;

    font-size:
        13px;

    cursor:
        pointer;
}

.select-fonte-custom option {

    background:
        #202020;

    color:
        white;
}

/* ==========================================
   FORMAS
========================================== */

.aba-superior-formas {

    height:
        58px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    gap:
        30px;

    background:
        #202020;

    border-bottom:
        1px solid #333;
}

.forma-opcao-btn {

    width:
        45px;

    height:
        45px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    padding:
        0;

    border:
        none;

    background:
        transparent;

    color:
        white;

    cursor:
        pointer;

    touch-action:
        manipulation;
}

.forma-opcao-btn ion-icon {

    font-size:
        27px;
}

.forma-opcao-btn:active {

    color:
        #FF5700;

    transform:
        scale(.85);
}

/* ==========================================
   IMAGENS
========================================== */

.aba-superior-img {

    height:
        100px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    background:
        #202020;

    color:
        #aaa;
}

/* ==========================================
   BARRA PRINCIPAL
========================================== */

.ferramentas-container-fixo {

    width:
        100%;

    height:
        64px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        space-around;

    background:
        #171717;
}

.tool-btn {

    width:
        25%;

    height:
        58px;

    display:
        flex;

    flex-direction:
        column;

    align-items:
        center;

    justify-content:
        center;

    gap:
        2px;

    padding:
        0;

    border:
        none;

    background:
        transparent;

    color:
        #ddd;

    cursor:
        pointer;

    touch-action:
        manipulation;

    -webkit-tap-highlight-color:
        transparent;
}

.tool-btn ion-icon {

    font-size:
        23px;
}

.tool-btn span {

    font-size:
        10px;
}

.tool-btn:active {

    transform:
        scale(.9);
}

.tool-btn.ativo {

    color:
        #FF5700;
}

/* ==========================================
   CELULAR
========================================== */

@media (max-width: 600px) {

    .aba-superior-texto {

        gap:
            10px;

        padding:
            8px 10px;
    }

    .select-fonte-custom {

        min-width:
            115px;

        max-width:
            130px;
    }

    .ferramentas-container-fixo {

        height:
            62px;
    }

    .tool-btn {

        height:
            58px;
    }
}

</style>