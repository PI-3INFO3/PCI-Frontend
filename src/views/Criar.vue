<script setup>
import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    nextTick
} from 'vue'

import { useRoute, useRouter } from 'vue-router'

import * as fabric from 'fabric'

import { removeBackground } from '@imgly/background-removal'

// FONTES
import '@fontsource/poppins'
import '@fontsource/roboto'
import '@fontsource/montserrat'
import '@fontsource/oswald'
import '@fontsource/bebas-neue'
import '@fontsource/lato'
import '@fontsource/pacifico'

const router = useRouter()
const route = useRoute()

const canvasRef = ref(null)
const canvasAreaRef = ref(null)

let fabricCanvas = null

const templateTitulo = route.query.titulo || 'Design'

/*
|--------------------------------------------------------------------------
| ESTADOS
|--------------------------------------------------------------------------
*/

const fonteImagemAtual = ref(route.query.img || null)

const imagemPrincipal = ref(null)

const fotoOriginalBase = ref(route.query.img || null)

const removendoFundo = ref(false)
const progressoRemocao = ref(0)

const extraindoObjeto = ref(false)
const progressoExtracao = ref(0)

/*
|--------------------------------------------------------------------------
| SELEÇÃO MANUAL
|--------------------------------------------------------------------------
*/

const modoSelecaoArea = ref(false)

const extraindoArea = ref(false)
const progressoArea = ref(0)

/*
|--------------------------------------------------------------------------
| REMENDO
|--------------------------------------------------------------------------
*/

const corRemendo = ref('#FFFF')

/*
|--------------------------------------------------------------------------
| MENUS
|--------------------------------------------------------------------------
*/

const menuAtivoAcima = ref('nenhum')

/*
|--------------------------------------------------------------------------
| TEXTO
|--------------------------------------------------------------------------
*/

const tamanhoFonte = ref(30)

const corTexto = ref('#ffffff')

const fonteSelecionada = ref('Poppins')

/*
|--------------------------------------------------------------------------
| FONTES DISPONÍVEIS
|--------------------------------------------------------------------------
*/

const fontesDisponiveis = [
    'Poppins',
    'Roboto',
    'Montserrat',
    'Oswald',
    'Bebas Neue',
    'Lato',
    'Pacifico',
    'Arial',
    'Verdana',
    'Georgia',
    'Times New Roman',
    'Courier New'
]

/*
|--------------------------------------------------------------------------
| PALETA DE CORES DO TEXTO
|--------------------------------------------------------------------------
|
| No computador:
|   - pode ter quantas cores quiser.
|
| No celular:
|   - mostramos apenas as 2 primeiras.
|
*/

const coresTexto = ref([
    '#ffffff',
    '#FF5700',
    '#111111'
])

const quantidadeMaximaCoresMobile = 3
const quantidadeMaximaCoresDesktop = 5

const ehMobile = ref(window.innerWidth <= 600)
const coresVisiveis =
    computed(() => {

        const limite = ehMobile.value
            ? quantidadeMaximaCoresMobile
            : quantidadeMaximaCoresDesktop

        return coresTexto.value.slice(0, limite)
    })/*
|--------------------------------------------------------------------------
| ALTERAÇÃO DO TAMANHO DA TELA
|--------------------------------------------------------------------------
*/

function verificarTamanhoTela() {
    ehMobile.value = window.innerWidth <= 600
}

/*
|--------------------------------------------------------------------------
| ADICIONAR COR
|--------------------------------------------------------------------------
*/

function adicionarCorTexto() {
       /*
     * LIMITE (celular ou computador)
     */

    const limiteAtual = ehMobile.value
        ? quantidadeMaximaCoresMobile
        : quantidadeMaximaCoresDesktop

    if (
        coresTexto.value.length >= limiteAtual
    ) {

        alert(
            ehMobile.value
                ? 'No celular você pode ter até 3 cores na paleta.'
                : 'No computador você pode ter até 5 cores na paleta.'
        )

        return
    }
    const novaCor = '#00A8FF'

    coresTexto.value.push(novaCor)

    corTexto.value = novaCor

    atualizarAtributosTexto()
}

/*
|--------------------------------------------------------------------------
| ALTERAR UMA COR DA PALETA
|--------------------------------------------------------------------------
*/

function alterarCorDaPaleta(index, cor) {
    if (!cor) {
        return
    }

    coresTexto.value[index] = cor

    corTexto.value = cor

    atualizarAtributosTexto()
}

/*
|--------------------------------------------------------------------------
| REMOVER COR
|--------------------------------------------------------------------------
*/

function removerCorTexto(index) {
    if (coresTexto.value.length <= 1) {
        alert(
            'Você precisa manter pelo menos uma cor.'
        )
        return
    }

    coresTexto.value.splice(index, 1)

    const novaCor =
        coresTexto.value[
            Math.min(
                index,
                coresTexto.value.length - 1
            )
        ]

    corTexto.value = novaCor

    atualizarAtributosTexto()
}

/*
|--------------------------------------------------------------------------
| CARREGAR IMAGEM
|--------------------------------------------------------------------------
*/

function carregarImagem(url) {
    return new Promise((resolve, reject) => {
        if (!url) {
            reject(
                new Error(
                    'URL da imagem não informada.'
                )
            )
            return
        }

        const imgElemento = new Image()

        imgElemento.onload = () => {
            resolve(imgElemento)
        }

        imgElemento.onerror = () => {
            reject(
                new Error(
                    `Não foi possível carregar a imagem: ${url}`
                )
            )
        }

        imgElemento.crossOrigin = 'anonymous'

        imgElemento.src = url
    })
}

/*
|--------------------------------------------------------------------------
| SUBSTITUIR IMAGEM PRINCIPAL
|--------------------------------------------------------------------------
*/

async function substituirImagemPrincipal(
    novaUrl,
    manterTransform = false
) {
    if (!fabricCanvas || !novaUrl) {
        console.warn(
            'Canvas ou URL da imagem não disponível.'
        )
        return
    }

    const imagemAnterior =
        imagemPrincipal.value

    try {
        const imgElemento =
            await carregarImagem(novaUrl)

        const novaImg =
            new fabric.FabricImage(
                imgElemento,
                {
                    borderColor: '#FF5700',
                    cornerColor: '#FF5700',
                    cornerSize: 10,
                    transparentCorners: false,

                    selectable: false,
                    evented: false
                }
            )

        if (
            manterTransform &&
            imagemAnterior
        ) {
            novaImg.set({
                left:
                    imagemAnterior.left,
                top:
                    imagemAnterior.top,
                scaleX:
                    imagemAnterior.scaleX,
                scaleY:
                    imagemAnterior.scaleY,
                angle:
                    imagemAnterior.angle,
                originX:
                    imagemAnterior.originX,
                originY:
                    imagemAnterior.originY
            })
        } else {
            const larguraCanvas =
                fabricCanvas.getWidth()

            const alturaCanvas =
                fabricCanvas.getHeight()

            const escalaLargura =
                (larguraCanvas * 0.85) /
                imgElemento.width

            const escalaAltura =
                (alturaCanvas * 0.60) /
                imgElemento.height

            const escalaPerfeita =
                Math.min(
                    escalaLargura,
                    escalaAltura
                )

            novaImg.set({
                scaleX:
                    escalaPerfeita,
                scaleY:
                    escalaPerfeita
            })

            novaImg.setCoords()

            fabricCanvas.centerObject(
                novaImg
            )
        }

        if (imagemAnterior) {
            fabricCanvas.remove(
                imagemAnterior
            )
        }

        fabricCanvas.add(novaImg)

        fabricCanvas.sendObjectToBack(
            novaImg
        )

        novaImg.setCoords()

        imagemPrincipal.value =
            novaImg

        fabricCanvas.requestRenderAll()

        console.log(
            'Imagem atualizada com sucesso.'
        )
    } catch (erro) {
        console.error(
            'Erro ao carregar imagem:',
            erro
        )

        alert(
            'Não foi possível carregar essa imagem. ' +
            'Tente usar PNG, JPG ou WEBP.'
        )
    }
}

/*
|--------------------------------------------------------------------------
| INICIALIZAR CANVAS
|--------------------------------------------------------------------------
*/

async function inicializarCanvas() {
    await nextTick()

    if (
        !canvasRef.value ||
        !canvasAreaRef.value
    ) {
        console.error(
            'Elementos do canvas não encontrados.'
        )
        return
    }

    const larguraDisponivel =
        canvasAreaRef.value.clientWidth

    const alturaDisponivel =
        canvasAreaRef.value.clientHeight

    if (
        larguraDisponivel <= 0 ||
        alturaDisponivel <= 0
    ) {
        console.error(
            'Área do canvas possui tamanho inválido.'
        )
        return
    }

    fabricCanvas =
        new fabric.Canvas(
            canvasRef.value,
            {
                width:
                    larguraDisponivel,
                height:
                    alturaDisponivel,

                backgroundColor:
                    '#262626',

                preserveObjectStacking:
                    true,

                selection: true
            }
        )

    if (fonteImagemAtual.value) {
        await substituirImagemPrincipal(
            fonteImagemAtual.value,
            false
        )
    }

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
            if (
                !modoSelecaoArea.value
            ) {
                menuAtivoAcima.value =
                    'nenhum'
            }
        }
    )

    window.addEventListener(
        'keydown',
        lidarComTeclado
    )

    window.addEventListener(
        'resize',
        redimensionarCanvas
    )

    window.addEventListener(
        'resize',
        verificarTamanhoTela
    )
}

/*
|--------------------------------------------------------------------------
| REDIMENSIONAR CANVAS
|--------------------------------------------------------------------------
*/

function redimensionarCanvas() {
    if (
        !fabricCanvas ||
        !canvasAreaRef.value
    ) {
        return
    }

    const largura =
        canvasAreaRef.value.clientWidth

    const altura =
        canvasAreaRef.value.clientHeight

    if (
        largura <= 0 ||
        altura <= 0
    ) {
        return
    }

    fabricCanvas.setDimensions({
        width: largura,
        height: altura
    })

    fabricCanvas.requestRenderAll()
}

/*
|--------------------------------------------------------------------------
| IDENTIFICAR SELEÇÃO
|--------------------------------------------------------------------------
*/

function lidarComSelecao(evento) {
    const objetoAtivo =
        evento?.selected?.[0]

    if (!objetoAtivo) {
        return
    }

    /*
     * TEXTO
     */

    if (
        objetoAtivo.type === 'i-text' ||
        objetoAtivo.type === 'text' ||
        objetoAtivo.type === 'textbox'
    ) {
        menuAtivoAcima.value =
            'texto'

        tamanhoFonte.value =
            objetoAtivo.fontSize || 30

        corTexto.value =
            objetoAtivo.fill || '#ffffff'

        fonteSelecionada.value =
            objetoAtivo.fontFamily ||
            'Poppins'

        return
    }

    /*
     * FORMAS
     */

    if (
        objetoAtivo.type === 'rect' ||
        objetoAtivo.type === 'circle' ||
        objetoAtivo.type === 'triangle' ||
        objetoAtivo.type === 'polygon'
    ) {
        menuAtivoAcima.value =
            'formas'

        return
    }

    if (!modoSelecaoArea.value) {
        menuAtivoAcima.value =
            'nenhum'
    }
}

/*
|--------------------------------------------------------------------------
| MENUS
|--------------------------------------------------------------------------
*/

function clicarTextoNoFooter() {
    if (
        menuAtivoAcima.value ===
        'texto'
    ) {
        menuAtivoAcima.value =
            'nenhum'

        return
    }

    menuAtivoAcima.value =
        'texto'

    const objetoAtivo =
        fabricCanvas?.getActiveObject()

    if (
        !objetoAtivo ||
        !(
            objetoAtivo.type ===
                'i-text' ||
            objetoAtivo.type ===
                'text' ||
            objetoAtivo.type ===
                'textbox'
        )
    ) {
        adicionarTexto()
    }
}

function clicarImagesNoFooter() {
    menuAtivoAcima.value =
        menuAtivoAcima.value ===
        'images'
            ? 'nenhum'
            : 'images'
}

function clicarFormasNoFooter() {
    menuAtivoAcima.value =
        menuAtivoAcima.value ===
        'formas'
            ? 'nenhum'
            : 'formas'
}

/*
|--------------------------------------------------------------------------
| TEXTO
|--------------------------------------------------------------------------
*/

function adicionarTexto() {
    if (!fabricCanvas) {
        return
    }

    const textoEditavel =
        new fabric.IText(
            'Seus',
            {
                left:
                    fabricCanvas.getWidth() /
                    3,

                top:
                    fabricCanvas.getHeight() /
                    1.5,

                fontFamily:
                    fonteSelecionada.value,

                fontSize:
                    tamanhoFonte.value,

                fill:
                    corTexto.value,

                fontWeight:
                    'bold',

                borderColor:
                    '#FF5700',

                cornerColor:
                    '#FF5700',

                cornerSize:
                    10,

                transparentCorners:
                    false,

                selectable:
                    true,

                evented:
                    true
            }
        )

    fabricCanvas.add(
        textoEditavel
    )

    fabricCanvas.setActiveObject(
        textoEditavel
    )

    fabricCanvas.bringObjectToFront(
        textoEditavel
    )

    fabricCanvas.requestRenderAll()
}

/*
|--------------------------------------------------------------------------
| ALTERAR COR DO TEXTO
|--------------------------------------------------------------------------
*/

function mudarCorTextoPredefinida(
    cor
) {
    corTexto.value = cor

    atualizarAtributosTexto()
}

/*
|--------------------------------------------------------------------------
| ALTERAR FONTE
|--------------------------------------------------------------------------
*/

function mudarFonteTexto() {
    if (!fabricCanvas) {
        return
    }

    const objetoAtivo =
        fabricCanvas.getActiveObject()

    if (
        !objetoAtivo ||
        !(
            objetoAtivo.type ===
                'i-text' ||
            objetoAtivo.type ===
                'text' ||
            objetoAtivo.type ===
                'textbox'
        )
    ) {
        return
    }

    objetoAtivo.set({
        fontFamily:
            fonteSelecionada.value
    })

    objetoAtivo.setCoords()

    fabricCanvas.requestRenderAll()
}

/*
|--------------------------------------------------------------------------
| ATUALIZAR TEXTO
|--------------------------------------------------------------------------
*/

function atualizarAtributosTexto() {
    if (!fabricCanvas) {
        return
    }

    const objetoAtivo =
        fabricCanvas.getActiveObject()

    if (
        objetoAtivo &&
        (
            objetoAtivo.type ===
                'i-text' ||
            objetoAtivo.type ===
                'text' ||
            objetoAtivo.type ===
                'textbox'
        )
    ) {
        objetoAtivo.set({
            fontSize:
                parseInt(
                    tamanhoFonte.value
                ) || 30,

            fill:
                corTexto.value,

            fontFamily:
                fonteSelecionada.value
        })

        objetoAtivo.setCoords()

        fabricCanvas.requestRenderAll()
    }
}

/*
|--------------------------------------------------------------------------
| FORMAS
|--------------------------------------------------------------------------
*/

/*
 * Configuração comum das formas.
 */

function configuracaoForma(
    cor = '#FF5700'
) {
    return {
        fill: cor,

        stroke: '#FF5700',

        strokeWidth: 0,

        borderColor: '#FF5700',

        cornerColor: '#FF5700',

        cornerSize: 10,

        transparentCorners: false,

        selectable: true,

        evented: true
    }
}

/*
|--------------------------------------------------------------------------
| RETÂNGULO
|--------------------------------------------------------------------------
*/

function adicionarRetangulo() {
    if (!fabricCanvas) {
        return
    }

    const retangulo =
        new fabric.Rect({
            ...configuracaoForma(),

            left:
                fabricCanvas.getWidth() /
                3,

            top:
                fabricCanvas.getHeight() /
                2,

            width: 100,

            height: 100
        })

    fabricCanvas.add(
        retangulo
    )

    fabricCanvas.setActiveObject(
        retangulo
    )

    fabricCanvas.bringObjectToFront(
        retangulo
    )

    fabricCanvas.requestRenderAll()
}

/*
|--------------------------------------------------------------------------
| CÍRCULO
|--------------------------------------------------------------------------
*/

function adicionarCirculo() {
    if (!fabricCanvas) {
        return
    }

    const circulo =
        new fabric.Circle({
            ...configuracaoForma(),

            left:
                fabricCanvas.getWidth() /
                3,

            top:
                fabricCanvas.getHeight() /
                2,

            radius: 50
        })

    fabricCanvas.add(
        circulo
    )

    fabricCanvas.setActiveObject(
        circulo
    )

    fabricCanvas.bringObjectToFront(
        circulo
    )

    fabricCanvas.requestRenderAll()
}

/*
|--------------------------------------------------------------------------
| TRIÂNGULO
|--------------------------------------------------------------------------
*/

function adicionarTriangulo() {
    if (!fabricCanvas) {
        return
    }

    const triangulo =
        new fabric.Triangle({
            ...configuracaoForma(),

            left:
                fabricCanvas.getWidth() /
                2,

            top:
                fabricCanvas.getHeight() /
                2,

            width: 110,

            height: 100,

            fill: '#FF5700'
        })

    fabricCanvas.add(
        triangulo
    )

    fabricCanvas.setActiveObject(
        triangulo
    )

    fabricCanvas.bringObjectToFront(
        triangulo
    )

    fabricCanvas.requestRenderAll()
}

/*
|--------------------------------------------------------------------------
| ESTRELA
|--------------------------------------------------------------------------
*/

function criarPontosEstrela(
    centroX,
    centroY,
    raioExterno,
    raioInterno,
    quantidadePontas = 5
) {
    const pontos = []

    const totalPontos =
        quantidadePontas * 2

    for (
        let i = 0;
        i < totalPontos;
        i++
    ) {
        const angulo =
            -Math.PI / 2 +
            (Math.PI * 2 * i) /
                totalPontos

        const raio =
            i % 2 === 0
                ? raioExterno
                : raioInterno

        pontos.push({
            x:
                centroX +
                Math.cos(angulo) *
                    raio,

            y:
                centroY +
                Math.sin(angulo) *
                    raio
        })
    }

    return pontos
}

function adicionarEstrela() {
    if (!fabricCanvas) {
        return
    }

    const pontos =
        criarPontosEstrela(
            60,
            60,
            60,
            28,
            5
        )

    const estrela =
        new fabric.Polygon(
            pontos,
            {
                ...configuracaoForma(),

                left:
                    fabricCanvas.getWidth() /
                    2,

                top:
                    fabricCanvas.getHeight() /
                    2,

                originX:
                    'center',

                originY:
                    'center',

                fill:
                    '#FF5700'
            }
        )

    fabricCanvas.add(
        estrela
    )

    fabricCanvas.setActiveObject(
        estrela
    )

    fabricCanvas.bringObjectToFront(
        estrela
    )

    fabricCanvas.requestRenderAll()
}

/*
|--------------------------------------------------------------------------
| COR DA FORMA
|--------------------------------------------------------------------------
*/

function alterarCorForma(cor) {
    if (!fabricCanvas) {
        return
    }

    const objetoAtivo =
        fabricCanvas.getActiveObject()

    if (!objetoAtivo) {
        return
    }

    if (
        objetoAtivo.type !== 'rect' &&
        objetoAtivo.type !== 'circle' &&
        objetoAtivo.type !== 'triangle' &&
        objetoAtivo.type !== 'polygon'
    ) {
        return
    }

    objetoAtivo.set({
        fill: cor
    })

    objetoAtivo.setCoords()

    fabricCanvas.requestRenderAll()
}

/*
|--------------------------------------------------------------------------
| DELETAR
|--------------------------------------------------------------------------
*/

function deletarSelecionado() {
    if (!fabricCanvas) {
        return
    }

    const objetoAtivo =
        fabricCanvas.getActiveObject()

    if (!objetoAtivo) {
        return
    }

    if (
        objetoAtivo ===
        imagemPrincipal.value
    ) {
        return
    }

    fabricCanvas.remove(
        objetoAtivo
    )

    fabricCanvas.discardActiveObject()

    fabricCanvas.requestRenderAll()

    menuAtivoAcima.value =
        'nenhum'
}

/*
|--------------------------------------------------------------------------
| TECLADO
|--------------------------------------------------------------------------
*/

function lidarComTeclado(evento) {
    if (
        evento.key !== 'Delete' &&
        evento.key !== 'Backspace'
    ) {
        return
    }

    const ativo =
        fabricCanvas?.getActiveObject()

    if (
        ativo &&
        (
            ativo.type ===
                'i-text' ||
            ativo.type ===
                'text' ||
            ativo.type ===
                'textbox'
        ) &&
        ativo.isEditing
    ) {
        return
    }

    deletarSelecionado()
}

/*
|--------------------------------------------------------------------------
| REMOVER FUNDO
|--------------------------------------------------------------------------
*/

async function removerFundo() {
    if (
        !fonteImagemAtual.value ||
        removendoFundo.value
    ) {
        return
    }

    removendoFundo.value =
        true

    progressoRemocao.value =
        0

    try {
        const blob =
            await removeBackground(
                fonteImagemAtual.value,
                {
                    output: {
                        format:
                            'image/png',
                        quality:
                            0.9
                    },

                    progress: (
                        chave,
                        atual,
                        total
                    ) => {
                        if (
                            total > 0
                        ) {
                            progressoRemocao.value =
                                Math.min(
                                    100,
                                    Math.round(
                                        (
                                            atual /
                                            total
                                        ) *
                                            100
                                    )
                                )
                        }
                    }
                }
            )

        if (!blob) {
            throw new Error(
                'A IA não retornou uma imagem.'
            )
        }

        const cutoutUrl =
            URL.createObjectURL(
                blob
            )

        fonteImagemAtual.value =
            cutoutUrl

        await substituirImagemPrincipal(
            cutoutUrl,
            true
        )

        fabricCanvas?.requestRenderAll()
    } catch (erro) {
        console.error(
            'Falha ao remover fundo:',
            erro
        )

        alert(
            'Não foi possível remover o fundo dessa imagem. ' +
            'Verifique sua conexão e tente novamente.'
        )
    } finally {
        removendoFundo.value =
            false

        progressoRemocao.value =
            0
    }
}

/*
|--------------------------------------------------------------------------
| EXTRAIR OBJETO PRINCIPAL
|--------------------------------------------------------------------------
*/

async function extrairObjetoFlutuante() {
    if (
        !fotoOriginalBase.value ||
        extraindoObjeto.value
    ) {
        return
    }

    extraindoObjeto.value =
        true

    progressoExtracao.value =
        0

    try {
        const blob =
            await removeBackground(
                fotoOriginalBase.value,
                {
                    output: {
                        format:
                            'image/png',
                        quality:
                            0.9
                    },

                    progress: (
                        chave,
                        atual,
                        total
                    ) => {
                        if (
                            total > 0
                        ) {
                            progressoExtracao.value =
                                Math.min(
                                    100,
                                    Math.round(
                                        (
                                            atual /
                                            total
                                        ) *
                                            100
                                    )
                                )
                        }
                    }
                }
            )

        if (!blob) {
            throw new Error(
                'A IA não retornou uma imagem.'
            )
        }

        const cutoutUrl =
            URL.createObjectURL(
                blob
            )

        const imgElemento =
            await carregarImagem(
                cutoutUrl
            )

        const novoObjeto =
            new fabric.FabricImage(
                imgElemento,
                {
                    borderColor:
                        '#FF5700',

                    cornerColor:
                        '#FF5700',

                    cornerSize:
                        10,

                    transparentCorners:
                        false,

                    selectable:
                        true,

                    evented:
                        true
                }
            )

        if (
            imagemPrincipal.value
        ) {
            novoObjeto.set({
                left:
                    imagemPrincipal.value.left,

                top:
                    imagemPrincipal.value.top,

                scaleX:
                    imagemPrincipal.value.scaleX,

                scaleY:
                    imagemPrincipal.value.scaleY,

                angle:
                    imagemPrincipal.value.angle,

                originX:
                    imagemPrincipal.value.originX,

                originY:
                    imagemPrincipal.value.originY
            })
        }

        novoObjeto.setCoords()

        fabricCanvas.add(
            novoObjeto
        )

        fabricCanvas.bringObjectToFront(
            novoObjeto
        )

        fabricCanvas.setActiveObject(
            novoObjeto
        )

        fabricCanvas.requestRenderAll()
    } catch (erro) {
        console.error(
            'Falha ao extrair objeto:',
            erro
        )

        alert(
            'Não foi possível extrair um objeto dessa imagem. ' +
            'Verifique sua conexão e tente novamente.'
        )
    } finally {
        extraindoObjeto.value =
            false

        progressoExtracao.value =
            0
    }
}

/*
|--------------------------------------------------------------------------
| SELEÇÃO MANUAL
|--------------------------------------------------------------------------
*/

let selecaoRect = null
let selecaoInicio = null

function ativarModoSelecaoArea() {
    if (
        !fabricCanvas ||
        !imagemPrincipal.value
    ) {
        alert(
            'Carregue uma imagem primeiro.'
        )
        return
    }

    modoSelecaoArea.value =
        true

    menuAtivoAcima.value =
        'nenhum'

    fabricCanvas.discardActiveObject()

    fabricCanvas.selection =
        false

    fabricCanvas.skipTargetFind =
        true

    fabricCanvas.defaultCursor =
        'crosshair'

    fabricCanvas.requestRenderAll()

    fabricCanvas.on(
        'mouse:down',
        iniciarSelecaoArea
    )

    fabricCanvas.on(
        'mouse:move',
        atualizarSelecaoArea
    )

    fabricCanvas.on(
        'mouse:up',
        finalizarSelecaoArea
    )
}

function desativarModoSelecaoArea() {
    if (!fabricCanvas) {
        return
    }

    modoSelecaoArea.value =
        false

    fabricCanvas.selection =
        true

    fabricCanvas.skipTargetFind =
        false

    fabricCanvas.defaultCursor =
        'default'

    fabricCanvas.off(
        'mouse:down',
        iniciarSelecaoArea
    )

    fabricCanvas.off(
        'mouse:move',
        atualizarSelecaoArea
    )

    fabricCanvas.off(
        'mouse:up',
        finalizarSelecaoArea
    )

    if (selecaoRect) {
        fabricCanvas.remove(
            selecaoRect
        )

        selecaoRect = null
    }

    selecaoInicio = null

    fabricCanvas.requestRenderAll()
}

function iniciarSelecaoArea(
    evento
) {
    if (
        !fabricCanvas ||
        !modoSelecaoArea.value
    ) {
        return
    }

    const pointer =
        evento.scenePoint

    if (!pointer) {
        console.warn(
            'Não foi possível obter a posição do mouse.'
        )
        return
    }

    selecaoInicio = {
        x: pointer.x,
        y: pointer.y
    }

    selecaoRect =
        new fabric.Rect({
            left:
                pointer.x,

            top:
                pointer.y,

            width: 0,

            height: 0,

            fill:
                'rgba(255, 87, 0, 0.15)',

            stroke:
                '#FF5700',

            strokeDashArray:
                [6, 4],

            strokeWidth:
                2,

            selectable:
                false,

            evented:
                false
        })

    fabricCanvas.add(
        selecaoRect
    )

    fabricCanvas.requestRenderAll()
}

function atualizarSelecaoArea(
    evento
) {
    if (
        !selecaoRect ||
        !selecaoInicio ||
        !fabricCanvas
    ) {
        return
    }

    const pointer =
        evento.scenePoint

    if (!pointer) {
        return
    }

    const largura =
        pointer.x -
        selecaoInicio.x

    const altura =
        pointer.y -
        selecaoInicio.y

    selecaoRect.set({
        left:
            largura < 0
                ? pointer.x
                : selecaoInicio.x,

        top:
            altura < 0
                ? pointer.y
                : selecaoInicio.y,

        width:
            Math.abs(largura),

        height:
            Math.abs(altura)
    })

    selecaoRect.setCoords()

    fabricCanvas.requestRenderAll()
}

async function finalizarSelecaoArea() {
    if (!selecaoRect) {
        return
    }

    const areaSelecionada = {
        left:
            selecaoRect.left,

        top:
            selecaoRect.top,

        width:
            selecaoRect.width,

        height:
            selecaoRect.height
    }

    desativarModoSelecaoArea()

    if (
        areaSelecionada.width < 15 ||
        areaSelecionada.height < 15
    ) {
        return
    }

    await extrairObjetoDaArea(
        areaSelecionada
    )
}



/*
|--------------------------------------------------------------------------
| EXTRAIR OBJETO DA ÁREA
|--------------------------------------------------------------------------
*/

async function extrairObjetoDaArea(
    area
) {
    if (
        !fotoOriginalBase.value ||
        !imagemPrincipal.value
    ) {
        return
    }

    if (extraindoArea.value) {
        return
    }

    extraindoArea.value =
        true

    progressoArea.value =
        0

    try {
        const base =
            imagemPrincipal.value

        const relX =
            (area.left -
                base.left) /
            base.scaleX

        const relY =
            (area.top -
                base.top) /
            base.scaleY

        const relW =
            area.width /
            base.scaleX

        const relH =
            area.height /
            base.scaleY

        const imgOriginal =
            await carregarImagem(
                fotoOriginalBase.value
            )

        const cropX =
            Math.max(
                0,
                relX
            )

        const cropY =
            Math.max(
                0,
                relY
            )

        const cropW =
            Math.min(
                relW,
                imgOriginal.width -
                    cropX
            )

        const cropH =
            Math.min(
                relH,
                imgOriginal.height -
                    cropY
            )

        if (
            cropW <= 0 ||
            cropH <= 0
        ) {
            throw new Error(
                'Área selecionada fica fora da imagem.'
            )
        }

        const canvasTemp =
            document.createElement(
                'canvas'
            )

        canvasTemp.width =
            Math.round(cropW)

        canvasTemp.height =
            Math.round(cropH)

        const ctx =
            canvasTemp.getContext(
                '2d'
            )

        if (!ctx) {
            throw new Error(
                'Não foi possível criar o contexto 2D.'
            )
        }

        ctx.drawImage(
            imgOriginal,
            cropX,
            cropY,
            cropW,
            cropH,
            0,
            0,
            canvasTemp.width,
            canvasTemp.height
        )

        const recorteBlob =
            await new Promise(
                (resolve) => {
                    canvasTemp.toBlob(
                        resolve,
                        'image/png'
                    )
                }
            )

        if (!recorteBlob) {
            throw new Error(
                'Não foi possível recortar a área.'
            )
        }

        let blobFinal =
            recorteBlob

        try {
            const blobLimpo =
                await removeBackground(
                    recorteBlob,
                    {
                        output: {
                            format:
                                'image/png',
                            quality:
                                0.9
                        },

                        progress: (
                            chave,
                            atual,
                            total
                        ) => {
                            if (
                                total > 0
                            ) {
                                progressoArea.value =
                                    Math.min(
                                        100,
                                        Math.round(
                                            (
                                                atual /
                                                total
                                            ) *
                                                100
                                        )
                                    )
                            }
                        }
                    }
                )

            if (blobLimpo) {
                blobFinal =
                    blobLimpo
            }
        } catch (erroIA) {
            console.warn(
                'IA não conseguiu limpar essa área, usando recorte simples:',
                erroIA
            )
        }

        const urlFinal =
            URL.createObjectURL(
                blobFinal
            )

        const imgFinal =
            await carregarImagem(
                urlFinal
            )

        const novoObjeto =
            new fabric.FabricImage(
                imgFinal,
                {
                    left:
                        area.left,

                    top:
                        area.top,

                    scaleX:
                        base.scaleX,

                    scaleY:
                        base.scaleY,

                    borderColor:
                        '#FF5700',

                    cornerColor:
                        '#FF5700',

                    cornerSize:
                        10,

                    transparentCorners:
                        false,

                    selectable:
                        true,

                    evented:
                        true
                }
            )

        novoObjeto.setCoords()

        fabricCanvas.add(
            novoObjeto
        )

        fabricCanvas.bringObjectToFront(
            novoObjeto
        )

        fabricCanvas.setActiveObject(
            novoObjeto
        )

        fabricCanvas.requestRenderAll()
    } catch (erro) {
        console.error(
            'Falha ao extrair área:',
            erro
        )

        alert(
            'Não foi possível extrair essa área. ' +
            'Tente selecionar uma região maior ou com um objeto mais definido.'
        )
    } finally {
        extraindoArea.value =
            false

        progressoArea.value =
            0
    }
}

/*
|--------------------------------------------------------------------------
| REMENDO
|--------------------------------------------------------------------------
*/

function adicionarRemendo() {
    if (!fabricCanvas) {
        return
    }

    const remendo =
        new fabric.Rect({
            left:
                fabricCanvas.getWidth() /
                2,

            top:
                fabricCanvas.getHeight() /
                2,

            originX:
                'center',

            originY:
                'center',

            fill:
                corRemendo.value,

            width:
                80,

            height:
                80,

            borderColor:
                '#FF5700',

            cornerColor:
                '#FF5700',

            cornerSize:
                10,

            selectable:
                true,

            evented:
                true
        })

    fabricCanvas.add(
        remendo
    )

    fabricCanvas.setActiveObject(
        remendo
    )

    fabricCanvas.requestRenderAll()
}

/*
|--------------------------------------------------------------------------
| TROCAR IMAGEM
|--------------------------------------------------------------------------
*/

async function trocarImagemPrincipal(
    evento
) {
    const file =
        evento?.target?.files?.[0]

    if (!file) {
        return
    }

    if (
        !file.type.startsWith(
            'image/'
        )
    ) {
        alert(
            'Selecione uma imagem PNG, JPG ou WEBP.'
        )

        evento.target.value =
            ''

        return
    }

    try {
        const novaUrl =
            URL.createObjectURL(
                file
            )

        fonteImagemAtual.value =
            novaUrl

        fotoOriginalBase.value =
            novaUrl

        await substituirImagemPrincipal(
            novaUrl,
            false
        )
    } catch (erro) {
        console.error(
            'Erro ao trocar imagem:',
            erro
        )

        alert(
            'Não foi possível trocar a imagem.'
        )
    } finally {
        if (
            evento?.target
        ) {
            evento.target.value =
                ''
        }
    }
}

/*
|--------------------------------------------------------------------------
| FUNDO
|--------------------------------------------------------------------------
*/

function trocarCorFundo(cor) {
    if (!fabricCanvas) {
        return
    }

    fabricCanvas.backgroundColor =
        cor === 'transparent'
            ? 'rgba(0,0,0,0)'
            : cor

    fabricCanvas.requestRenderAll()
}

/*
|--------------------------------------------------------------------------
| EXPORTAR
|--------------------------------------------------------------------------
*/

function exeportadorDesing() {
    if (!fabricCanvas) {
        return
    }

    fabricCanvas.discardActiveObject()

    fabricCanvas.requestRenderAll()

    const dataURL =
        fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1
        })

    const link =
        document.createElement(
            'a'
        )

    link.download =
        `editado-${templateTitulo}.png`

    link.href =
        dataURL

    document.body.appendChild(
        link
    )

    link.click()

    document.body.removeChild(
        link
    )
}

/*
|--------------------------------------------------------------------------
| MOUNT / UNMOUNT
|--------------------------------------------------------------------------
*/

onMounted(() => {
    inicializarCanvas()

    verificarTamanhoTela()
})

onBeforeUnmount(() => {
    window.removeEventListener(
        'keydown',
        lidarComTeclado
    )

    window.removeEventListener(
        'resize',
        redimensionarCanvas
    )

    window.removeEventListener(
        'resize',
        verificarTamanhoTela
    )

    if (fabricCanvas) {
        fabricCanvas.off(
            'mouse:down',
            iniciarSelecaoArea
        )

        fabricCanvas.off(
            'mouse:move',
            atualizarSelecaoArea
        )

        fabricCanvas.off(
            'mouse:up',
            finalizarSelecaoArea
        )

        fabricCanvas.dispose()

        fabricCanvas = null
    }
})
</script>

<template>
    <div class="editor-interface">

        <!-- HEADER -->
        <header class="editor-header">

            <button
                class="header-btn"
                @click="router.push('/')"
            >
                <ion-icon name="arrow-back"></ion-icon>
            </button>

            <button class="header-btn">
                <ion-icon name="home-outline"></ion-icon>
            </button>

            <div class="header-spacer"></div>

            <button class="header-btn">
                <ion-icon name="people-outline"></ion-icon>
            </button>

            <button
                class="header-btn"
                @click="exeportadorDesing"
            >
                <ion-icon name="download-outline"></ion-icon>
            </button>

        </header>

        <!-- CANVAS -->
        <main
            ref="canvasAreaRef"
            class="canvas-area"
        >

            <canvas ref="canvasRef"></canvas>

            <div
                v-if="modoSelecaoArea"
                class="aviso-selecao"
            >
                Desenhe um retângulo ao redor do objeto que você quer extrair
            </div>

            <div
                v-if="extraindoArea"
                class="aviso-selecao"
            >
                Extraindo... {{ progressoArea }}%
            </div>

        </main>

        <!-- FOOTER -->
        <footer class="editor-footer">

            <!-- PAINEL TEXTO -->
          <!-- PAINEL TEXTO -->
<div
    v-if="menuAtivoAcima === 'texto'"
    class="painel-flutuante aba-superior-texto"
>
    <div class="texto-controles">

        <!-- FONTE -->
        <label class="controle-fonte">
            <span>Fonte</span>

            <select
                v-model="fonteSelecionada"
                @change="mudarFonteTexto"
            >
                <option
                    v-for="fonte in fontesDisponiveis"
                    :key="fonte"
                    :value="fonte"
                >
                    {{ fonte }}
                </option>
            </select>
        </label>

        <!-- TAMANHO -->
        <label class="controle-tamanho">
            <span>Tamanho</span>

            <input
                v-model.number="tamanhoFonte"
                type="number"
                min="8"
                max="200"
                @input="atualizarAtributosTexto"
            />
        </label>

        <!-- CORES -->
        <div class="cores-texto">

            <div
                v-for="(cor, index) in coresVisiveis"
                :key="`${cor}-${index}`"
                class="cor-personalizada"
            >
                <!-- BOTÃO DA COR -->
                <label
                    class="cor-texto"
                    :style="{
                        backgroundColor: cor
                    }"
                    :title="`Cor ${cor}`"
                >
                    <input
                        type="color"
                        :value="cor"
                        @input="
                            alterarCorDaPaleta(
                                index,
                                $event.target.value
                            )
                        "
                    />
                </label>

                <!-- APAGAR -->
                <button
                    v-if="!ehMobile || coresTexto.length > 1"
                    class="apagar-cor"
                    title="Apagar cor"
                    @click="removerCorTexto(index)"
                >
                    ×
                </button>
            </div>

            <!-- ADICIONAR -->
            <button
                class="botao-adicionar-cor"
                title="Criar nova cor"
                @click="adicionarCorTexto"
            >
                +
            </button>
 
        </div>
 <input
                            type="color"
                            v-model="corRemendo"
                            class="seletor-cor"
                            title="Escolha a cor do remendo"
                        />
    </div>
</div>
            <!-- PAINEL IMAGENS -->
            <div
                v-if="menuAtivoAcima === 'images'"
                class="painel-flutuante aba-superior-img"
            >

                <div class="img-secao">

                

                    <button
                        class="botao-acao"
                        :disabled="extraindoObjeto"
                        @click="extrairObjetoFlutuante"
                    >

                        <ion-icon name="copy-outline"></ion-icon>

                        <span v-if="!extraindoObjeto">
                            Extrair objeto (manter fundo)
                        </span>

                        <span v-else>
                            Extraindo...
                            {{ progressoExtracao }}%
                        </span>

                    </button>

                    <button
                        class="botao-acao"
                        @click="ativarModoSelecaoArea"
                    >

                        <ion-icon name="scan-outline"></ion-icon>

                        <span>
                            Selecionar área e extrair
                        </span>

                    </button>

                    <label class="botao-acao label-upload">

                        <ion-icon name="image-outline"></ion-icon>

                        <span>
                            Trocar imagem
                        </span>

                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            class="input-oculto"
                            @change="trocarImagemPrincipal"
                        />

                    </label>

                </div>

                <div class="img-secao">

                    <span class="label-fonte">
                        Cobrir buraco
                    </span>

                    <div class="remendo-controles">

                        <input
                            type="color"
                            v-model="corRemendo"
                            class="seletor-cor"
                            title="Escolha a cor do remendo"
                        />

                        <button
                            class="botao-acao"
                            @click="adicionarRemendo"
                        >

                            <ion-icon name="square-outline"></ion-icon>

                            <span>
                                Adicionar remendo
                            </span>

                        </button>

                    </div>

                </div>

                <div class="img-secao">

                    <span class="label-fonte">
                        Fundo do canvas
                    </span>

                    <div class="cores-predefinidas">

                        <button
                            class="circulo-cor branco"
                            @click="
                                trocarCorFundo(
                                    '#ffffff'
                                )
                            "
                        ></button>

                        <button
                            class="circulo-cor laranja"
                            @click="
                                trocarCorFundo(
                                    '#FF5700'
                                )
                            "
                        ></button>

                        <button
                            class="circulo-cor escuro"
                            @click="
                                trocarCorFundo(
                                    '#111111'
                                )
                            "
                        ></button>

                        <button
                            class="circulo-cor transp-borda"
                            @click="
                                trocarCorFundo(
                                    'transparent'
                                )
                            "
                        ></button>

                    </div>

                </div>

            </div>

            <!-- PAINEL FORMAS -->
          <!-- PAINEL FORMAS -->
<div
    v-if="menuAtivoAcima === 'formas'"
    class="painel-flutuante aba-superior-formas"
>

    <!-- FORMAS -->
    <div class="formas-lista">

        <button
            class="forma-btn"
            @click="adicionarRetangulo"
        >
            <ion-icon
                name="square-outline"
            ></ion-icon>

            <span>
                Retângulo
            </span>
        </button>

        <button
            class="forma-btn"
            @click="adicionarCirculo"
        >
            <ion-icon
                name="ellipse-outline"
            ></ion-icon>

            <span>
                Círculo
            </span>
        </button>

        <button
            class="forma-btn"
            @click="adicionarTriangulo"
        >
            <ion-icon
                name="triangle-outline"
            ></ion-icon>

            <span>
                Triângulo
            </span>
        </button>

        <button
            class="forma-btn"
            @click="adicionarEstrela"
        >
            <ion-icon
                name="star-outline"
            ></ion-icon>

            <span>
                Estrela
            </span>
        </button>

    </div>

    <!-- COR DA FORMA -->
    <div class="cor-forma-controle">

        <span>
            Cor
        </span>

        <input
            type="color"
            value="#FFFF"
            class="seletor-cor-forma"
            @input="
                alterarCorForma(
                    $event.target.value
                )
            "
        />

    </div>

</div>
  <!-- BARRA FIXA -->
            <div class="ferramentas-container-fixo">

                <button
                    class="tool-btn"
                    :class="{
                        ativo:
                            menuAtivoAcima === 'texto'
                    }"
                    @click="clicarTextoNoFooter"
                >

                    <ion-icon name="text-outline"></ion-icon>

                    <span>
                        Texto
                    </span>

                </button>

                <button
                    class="tool-btn"
                    :class="{
                        ativo:
                            menuAtivoAcima === 'formas'
                    }"
                    @click="clicarFormasNoFooter"
                >

                    <ion-icon name="shapes-outline"></ion-icon>

                    <span>
                        Formas
                    </span>

                </button>

                <button
                    class="tool-btn"
                    :class="{
                        ativo:
                            menuAtivoAcima === 'images'
                    }"
                    @click="clicarImagesNoFooter"
                >

                    <ion-icon name="images-outline"></ion-icon>

                    <span>
                        Imagens
                    </span>

                </button>

                <button
                    class="tool-btn"
                    @click="deletarSelecionado"
                >

                    <ion-icon name="trash-outline"></ion-icon>

                    <span>
                        Excluir
                    </span>

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
    display: flex;
    flex-direction: column;

    width: 100vw;
    height: 100vh;

    overflow: hidden;

    font-family: system-ui, sans-serif;
}

.editor-header {
    flex: 0 0 50px;

    display: flex;
    align-items: center;

    width: 100%;

    padding: 0 16px;

    background-color: #FF5700;
}

.header-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;

    background: transparent;
    border: none;

    color: white;

    cursor: pointer;
}

.header-btn ion-icon {
    font-size: 25px;
}

.header-spacer {
    flex: 1;
}

.canvas-area {
    position: relative;

    flex: 1 1 auto;

    min-height: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;

    background-color: #262626;

    overflow: hidden;
}

.canvas-area canvas {
    display: block;
}

.aviso-selecao {
    position: absolute;

    top: 12px;
    left: 50%;

    transform: translateX(-50%);

    z-index: 15;

    padding: 8px 16px;

    background: rgba(
        30,
        30,
        30,
        0.9
    );

    border: 1px solid #FF5700;

    border-radius: 20px;

    color: white;

    font-size: 13px;

    white-space: nowrap;

    pointer-events: none;
}

.editor-footer {
    position: relative;

    flex: 0 0 56px;

    width: 100%;

    z-index: 20;
}

.painel-flutuante {
    position: absolute;

    left: 0;
    right: 0;

    bottom: 100%;

    z-index: 30;

    box-shadow:
        0 -6px 16px
        rgba(
            0,
            0,
            0,
            0.35
        );
}

.aba-superior-texto {
    height: 60px;

    display: flex;
    align-items: center;

    padding: 0 16px;

    background-color: #1e1e1e;

    border-bottom:
        1px solid #2d2d2d;
}

.texto-controles {
    display: flex;
    align-items: center;

    gap: 20px;

    color: white;
}

.texto-controles label {
    display: flex;
    align-items: center;

    gap: 8px;

    font-size: 13px;
}

.texto-controles input {
    width: 70px;

    padding: 6px;

    border: 1px solid #555;

    border-radius: 6px;

    background: #111;

    color: white;
}

.cores-texto {
    display: flex;

    gap: 8px;
}

.cor-texto {
    width: 24px;
    height: 24px;

    border-radius: 50%;

    border: 2px solid white;

    cursor: pointer;
}

.cor-texto.branco {
    background: white;
}

.cor-texto.laranja {
    background: #FF5700;
}

.cor-texto.preto {
    background: #111;
}

.aba-superior-img {
    max-height: 340px;

    overflow-y: auto;

    display: flex;
    flex-direction: column;

    justify-content: center;

    gap: 18px;

    padding: 16px;

    background-color: #1e1e1e;

    border-bottom:
        1px solid #2d2d2d;
}

.img-secao {
    display: flex;
    flex-direction: column;

    gap: 10px;
}

.botao-acao {
    display: flex;
    align-items: center;

    gap: 10px;

    width: fit-content;

    padding: 10px 14px;

    background: transparent;

    border: 1px solid #FF5700;

    border-radius: 10px;

    color: white;

    font-size: 14px;

    cursor: pointer;
}

.botao-acao:hover {
    background:
        rgba(
            255,
            87,
            0,
            0.1
        );
}

.botao-acao:disabled {
    opacity: 0.6;

    cursor: not-allowed;
}

.botao-acao ion-icon {
    font-size: 18px;

    color: #FF5700;
}

.label-upload {
    position: relative;
}

.input-oculto {
    display: none;
}

.label-fonte {
    color: white;

    font-size: 13px;
}

.remendo-controles {
    display: flex;
    align-items: center;

    gap: 10px;
}

.seletor-cor {
    width: 40px;
    height: 34px;

    padding: 0;

    border: 1px solid #555;

    border-radius: 6px;

    background: transparent;

    cursor: pointer;
}

.cores-predefinidas {
    display: flex;
    align-items: center;

    gap: 10px;
}

.circulo-cor {
    width: 24px;
    height: 24px;

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

.circulo-cor.escuro {
    background-color: #111111;
}

.circulo-cor.transp-borda {
    background-color: transparent;

    border: 2px solid white;

    background-image:
        linear-gradient(
            45deg,
            #666 25%,
            transparent 25%
        ),
        linear-gradient(
            -45deg,
            #666 25%,
            transparent 25%
        ),
        linear-gradient(
            45deg,
            transparent 75%,
            #666 75%
        ),
        linear-gradient(
            -45deg,
            transparent 75%,
            #666 75%
        );

    background-size: 8px 8px;

    background-position:
        0 0,
        0 4px,
        4px -4px,
        -4px 0;
}

.aba-superior-formas {
    height: 70px;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 30px;

    background-color: #1e1e1e;

    border-bottom:
        1px solid #2d2d2d;
}

.forma-btn {
    display: flex;
    align-items: center;

    gap: 8px;

    padding: 8px 14px;

    border: 1px solid #FF5700;

    border-radius: 8px;

    background: transparent;

    color: white;

    cursor: pointer;
}

.forma-btn ion-icon {
    font-size: 20px;

    color: #FF5700;
}

.ferramentas-container-fixo {
    height: 56px;

    display: flex;
    align-items: center;
    justify-content: space-around;

    width: 100%;

    background-color: #1e1e1e;

    position: relative;

    z-index: 40;
}

.tool-btn {
    display: flex;

    flex-direction: column;

    align-items: center;
    justify-content: center;

    gap: 2px;

    width: 70px;
    height: 56px;

    background: transparent;

    border: none;

    color: #ffffff;

    cursor: pointer;

    font-size: 11px;
}

.tool-btn ion-icon {
    font-size: 22px;
}

.tool-btn:hover {
    color: #FF5700;
}

.tool-btn.ativo {
    color: #FF5700;
}

@media (max-width: 600px) {
    .editor-header {
        padding: 0 8px;
    }

    .tool-btn {
        width: 60px;
    }

    .aba-superior-img {
        max-height: 300px;
    }

    .botao-acao {
        font-size: 13px;
    }
}
/* =========================================================
   TEXTO
========================================================= */

.aba-superior-texto {
    min-height: 76px;

    display: flex;

    align-items: center;

    padding: 10px 16px;

    background-color: #1e1e1e;

    border-bottom:
        1px solid #2d2d2d;

    overflow-x: auto;
}

.texto-controles {
    display: flex;

    align-items: center;

    gap: 18px;

    color: white;

    width: 100%;
}

.controle-fonte {
    display: flex;

    align-items: center;

    gap: 8px;

    font-size: 13px;

    white-space: nowrap;
}

.controle-fonte select {
    min-width: 150px;

    padding: 7px 10px;

    border: 1px solid #555;

    border-radius: 6px;

    background: #111;

    color: white;

    outline: none;

    cursor: pointer;
}

.controle-fonte select:focus {
    border-color: #FF5700;
}

.controle-tamanho {
    display: flex;

    align-items: center;

    gap: 8px;

    font-size: 13px;

    white-space: nowrap;
}

.controle-tamanho input {
    width: 65px;

    padding: 7px;

    border: 1px solid #555;

    border-radius: 6px;

    background: #111;

    color: white;

    outline: none;
}

/* =========================================================
   PALETA DE CORES
========================================================= */

.cores-texto {
    display: flex;

    align-items: center;

    gap: 8px;

    flex-wrap: nowrap;
}

.cor-personalizada {
    position: relative;

    display: flex;

    align-items: center;

    justify-content: center;
}

.cor-texto {
    position: relative;

    display: block;

    width: 30px;

    height: 30px;

    border-radius: 50%;

    border: 2px solid white;

    cursor: pointer;

    overflow: hidden;

    flex-shrink: 0;
}

.cor-texto input {
    position: absolute;

    width: 100%;

    height: 100%;

    opacity: 0;

    cursor: pointer;

    top: 0;

    left: 0;
}

.apagar-cor {
    position: absolute;

    top: -8px;

    right: -8px;

    width: 17px;

    height: 17px;

    padding: 0;

    border: none;

    border-radius: 50%;

    background: #333;

    color: white;

    font-size: 12px;

    line-height: 17px;

    cursor: pointer;

    z-index: 5;
}

.apagar-cor:hover {
    background: #FF5700;
}

.botao-adicionar-cor {
    width: 30px;

    height: 30px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 50%;

    border: 1px dashed #777;

    background: transparent;

    color: white;

    font-size: 20px;

    cursor: pointer;

    flex-shrink: 0;
}

.botao-adicionar-cor:hover {
    border-color: #FF5700;

    color: #FF5700;
}

/* =========================================================
   FORMAS
========================================================= */

.aba-superior-formas {
    min-height: 110px;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 30px;

    padding: 15px;

    background-color: #1e1e1e;

    border-bottom:
        1px solid #2d2d2d;
}

.formas-lista {
    display: flex;

    align-items: center;

    gap: 12px;

    flex-wrap: wrap;

    justify-content: center;
}

.forma-btn {
    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;

    gap: 5px;

    min-width: 75px;

    min-height: 60px;

    padding: 8px 12px;

    border: 1px solid #FF5700;

    border-radius: 8px;

    background: transparent;

    color: white;

    cursor: pointer;

    transition: 0.2s;
}

.forma-btn:hover {
    background:
        rgba(
            255,
            87,
            0,
            0.12
        );
}

.forma-btn ion-icon {
    font-size: 22px;

    color: #FF5700;
}

.cor-forma-controle {
    display: flex;

    align-items: center;

    gap: 8px;

    color: white;

    font-size: 13px;

    white-space: nowrap;
}

.seletor-cor-forma {
    width: 38px;

    height: 32px;

    padding: 0;

    border: 1px solid #555;

    border-radius: 6px;

    background: transparent;

    cursor: pointer;
}

/* =========================================================
   CELULAR
========================================================= */

@media (max-width: 600px) {

    .aba-superior-texto {
        min-height: 105px;

        padding: 10px;

        overflow-x: auto;
    }

    .texto-controles {
        gap: 10px;

        min-width: max-content;
    }

    .controle-fonte select {
        min-width: 125px;
    }

    .cores-texto {
        gap: 7px;
    }

    .cor-texto {
        width: 27px;

        height: 27px;
    }

    .botao-adicionar-cor {
        width: 27px;

        height: 27px;
    }

    .aba-superior-formas {
        min-height: 130px;

        gap: 12px;

        flex-direction: column;

        overflow-y: auto;
    }

    .formas-lista {
        gap: 8px;
    }

    .forma-btn {
        min-width: 65px;

        min-height: 55px;

        padding: 6px 8px;

        font-size: 11px;
    }

    .forma-btn ion-icon {
        font-size: 20px;
    }
}
</style>