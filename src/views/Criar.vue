<script setup>
import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    nextTick,
    toRaw
} from 'vue'

import { useRoute, useRouter } from 'vue-router'
import designsApi from '@/api/designsApi'
import * as fabric from 'fabric'

const router = useRouter()
const route = useRoute()

const canvasRef = ref(null)
const canvasAreaRef = ref(null)

let fabricCanvas = null
let resizeObserver = null
let timerSalvamento = null
let carregandoDesign = false
let salvamentoPendente = false
let canvasLoadGeneration = 0
let trocandoPagina = false


const designId = ref(route.params.id || null)
const design = ref(null)
const templateTitulo = ref('Design')
const salvando = ref(false)
const mostrarUpload = ref(!designId.value)

const paginas = ref([])
const paginaAtualIndex = ref(0)

const larguraDocumento = ref(1080)
const alturaDocumento = ref(1080)
const fundoDocumento = ref('#FFFFFF')

const paginaAtual = computed(
    () => paginas.value[paginaAtualIndex.value] || null
)

const quantidadePaginas = computed(
    () => Math.max(paginas.value.length, 1)
)

const arquivoSelecionado = ref(null)
const enviandoUpload = ref(false)
const erroUpload = ref('')

const inputArquivoRef = ref(null)
const inputImagemRef = ref(null)

const EXTENSOES_ACEITAS = [
    '.pdf',
    '.pptx',
    '.jpg',
    '.jpeg',
    '.png'
]

const menuAtivoAcima = ref('nenhum')
const tamanhoFonte = ref(30)
const corTexto = ref('#ffffff')
const fonteSelecionada = ref('Poppins')
const pesoTexto = ref('bold')
const estiloTexto = ref('normal')
const alinhamentoTexto = ref('left')

const fontesDisponiveis = [
    'Poppins',
    'Arial',
    'Helvetica',
    'Georgia',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Trebuchet MS',
    'Impact',
    'sans-serif'
]

const coresTexto = ref([
    '#FFFFFF',
    '#FF5700',
    '#000000',
    '#FFD166',
    '#4CC9F0'
])

const camadas = ref([])
const objetoSelecionado = ref(null)

const ehTextoSelecionado = computed(
    () => ehTexto(fabricCanvas?.getActiveObject())
)

const ehFormaSelecionada = computed(
    () => ehForma(fabricCanvas?.getActiveObject())
)

const formasDisponiveis = [
    {
        tipo: 'rect',
        nome: 'Retângulo',
        icone: 'square-outline'
    },
    {
        tipo: 'circle',
        nome: 'Círculo',
        icone: 'ellipse-outline'
    },
    {
        tipo: 'triangle',
        nome: 'Triângulo',
        icone: 'triangle-outline'
    },
    {
        tipo: 'star',
        nome: 'Estrela',
        icone: 'star-outline'
    }
]

function ehTexto(objeto) {
    return !!objeto &&
        ['i-text', 'text', 'textbox'].includes(objeto.type)
}

function ehForma(objeto) {
    return !!objeto &&
        ['rect', 'circle', 'triangle', 'polygon'].includes(objeto.type)
}

function configurarObjeto(objeto, nome, tipo) {
    objeto.set({
        borderColor: '#FF5700',
        cornerColor: '#FF5700',
        cornerSize: 10,
        transparentCorners: false,
        selectable: true,
        evented: true,
        nomeCamada: nome,
        tipoCamada: tipo
    })

    if (!objeto.clientId) {
        objeto.clientId = crypto.randomUUID()
    }

    return objeto
}

function resolverUrlImagem(valor) {
    if (!valor || typeof valor !== 'string') return ''
    const url = valor.trim()
    if (!url) return ''
    if (/^(data:image\/|blob:|https?:\/\/)/i.test(url)) return url
    const baseApi = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/'
    try {
        const base = new URL(baseApi, window.location.origin)
        // Conteúdo relativo como /media/... deve ser relativo à raiz do servidor,
        // não ao caminho /api/.
        if (url.startsWith('/')) return new URL(url, base.origin).href
        return new URL(url, base).href
    } catch (erro) {
        console.error('[EDITOR] URL de imagem inválida:', url, erro)
        return ''
    }
}

function carregarImagem(url) {
    return new Promise((resolve, reject) => {
        const fonte = resolverUrlImagem(url)
        if (!fonte) {
            reject(new Error('A imagem não possui uma URL válida.'))
            return
        }
        const imagem = new window.Image()
        // Não definir crossOrigin para mídia local do próprio backend: isso pode
        // bloquear imagens quando o servidor não envia cabeçalhos CORS.
        imagem.onload = () => resolve(imagem)
        imagem.onerror = () => reject(new Error(`Não foi possível carregar a imagem: ${fonte}`))
        imagem.src = fonte
    })
}

async function criarImagemFabric(url, propriedades = {}) {
    const imagem = await carregarImagem(url)

    const objeto = new fabric.FabricImage(imagem, propriedades)

    configurarObjeto(
        objeto,
        propriedades.nomeCamada || 'Imagem',
        'imagem'
    )

    objeto.elementType = 'image'

    return objeto
}

function criarPontosEstrela(
    cx,
    cy,
    raioExterno,
    raioInterno,
    pontas = 5
) {
    const pontos = []

    for (let i = 0; i < pontas * 2; i++) {
        const angulo =
            -Math.PI / 2 +
            (Math.PI * 2 * i) / (pontas * 2)

        const raio =
            i % 2 === 0 ? raioExterno : raioInterno

        pontos.push({
            x: cx + Math.cos(angulo) * raio,
            y: cy + Math.sin(angulo) * raio
        })
    }

    return pontos
}

async function criarObjetoDeElemento(elemento) {
    const props = {
        // A miniatura interpreta posicao_x/posicao_y como o canto superior
        // esquerdo. Definimos a origem explicitamente porque o Fabric 7 pode
        // usar a origem central por padrão, deslocando cada objeto pela metade
        // da própria largura/altura e cortando figuras nas bordas da página.
        left: Number(elemento.posicao_x ?? elemento.x ?? 0),
        top: Number(elemento.posicao_y ?? elemento.y ?? 0),
        originX: 'left',
        originY: 'top',
        borderColor: '#FF5700',
        cornerColor: '#FF5700',
        cornerSize: 10,
        transparentCorners: false,
        selectable: true,
        evented: true
    }

    if (elemento.type === 'image') {
        const fonteImagem = elemento.content || elemento.image_url || elemento.url || elemento.data_url
        if (!fonteImagem) {
            console.error('[EDITOR] Elemento de imagem sem URL/content:', elemento)
            return null
        }

        const objeto = await criarImagemFabric(
            fonteImagem,
            {
                ...props,
                nomeCamada: 'Imagem',
                tipoCamada: 'imagem'
            }
        )

        const largura = Number(
            elemento.width || objeto.width || 1
        )

        const altura = Number(
            elemento.heigth ||
            elemento.height ||
            objeto.height ||
            1
        )

        objeto.set({
            scaleX: largura / (objeto.width || 1),
            scaleY: altura / (objeto.height || 1)
        })

        objeto.elementId = elemento.id
        objeto.clientId =
            elemento.client_id || crypto.randomUUID()

        objeto.setCoords()

        return objeto
    }

    if (elemento.type === 'shape') {
        const tipo = elemento.shape_type || 'rect'

        const largura = Math.max(
            Number(elemento.width || 100),
            1
        )

        const altura = Math.max(
            Number(
                elemento.heigth ||
                elemento.height ||
                100
            ),
            1
        )

        const configuracao = {
            ...props,
            fill: elemento.color || '#FF5700',
            stroke: elemento.stroke_color || '',
            strokeWidth: Number(elemento.stroke_width || 0)
        }

        let objeto

        if (tipo === 'circle') {
            objeto = new fabric.Circle({
                ...configuracao,
                radius: 50
            })
        } else if (tipo === 'triangle') {
            objeto = new fabric.Triangle({
                ...configuracao,
                width: largura,
                height: altura
            })
        } else if (tipo === 'star') {
            objeto = new fabric.Polygon(
                criarPontosEstrela(60, 60, 60, 28),
                {
                    ...configuracao,
                    originX: 'left',
                    originY: 'top'
                }
            )
        } else {
            objeto = new fabric.Rect({
                ...configuracao,
                width: largura,
                height: altura
            })
        }

        if (tipo === 'circle' || tipo === 'star') {
            objeto.set({
                scaleX: largura / Math.max(objeto.width || 1, 1),
                scaleY: altura / Math.max(objeto.height || 1, 1)
            })
        }

        const nome = {
            circle: 'Círculo',
            triangle: 'Triângulo',
            star: 'Estrela',
            rect: 'Retângulo'
        }[tipo] || 'Forma'

        configurarObjeto(objeto, nome, 'forma')

        objeto.elementId = elemento.id
        objeto.clientId =
            elemento.client_id || crypto.randomUUID()
        objeto.elementType = 'shape'
        objeto.shapeType = tipo

        objeto.setCoords()

        return objeto
    }

    const conteudoTexto = String(elemento.content || '')
    const alinhamento = elemento.text_align || 'left'
    const tamanhoFonteOriginal = Number(
        elemento.font_size || elemento.fontSize || 18
    )
    const posicaoY = Math.max(Number(elemento.posicao_y ?? elemento.y ?? 0), 0)
    const alturaPagina = Math.max(Number(alturaDocumento.value) || 1080, 1)

    // Identifica títulos mesmo quando o PPTX não usa um placeholder de título.
    const ehTitulo = elemento.type === 'title' || (
        tamanhoFonteOriginal >= 44 &&
        conteudoTexto.trim().length <= 100 &&
        posicaoY < alturaPagina * 0.55
    )

    const larguraCaixaOriginal = Math.max(
        Number(elemento.width) || 1,
        1
    )
    const larguraPagina = Math.max(
        Number(larguraDocumento.value) || 1080,
        1
    )
    const leftOriginal = Number(elemento.posicao_x ?? elemento.x ?? 0)
    const larguraDisponivelNaPagina = Math.max(
        larguraPagina - Math.max(leftOriginal, 0),
        1
    )
    const larguraCaixa = Math.min(
        larguraCaixaOriginal,
        larguraDisponivelNaPagina
    )

    // A miniatura usa fillText(..., maxWidth), não quebra automaticamente
    // uma frase longa. IText + scaleX reproduz esse comportamento no editor.
    // A posição de alinhamento é calculada abaixo; deixar o alinhamento interno
    // do Fabric ativo aplicaria center/right uma segunda vez e deslocaria o texto.
    let objeto = new fabric.IText(conteudoTexto, {
        ...props,
        fontFamily: elemento.font_family || 'Arial',
        fontSize: tamanhoFonteOriginal,
        // A miniatura usa peso normal quando font_weight não está definido.
        // Não inferir negrito pelo tamanho/posição: isso altera a largura do texto
        // e faz o alinhamento divergir da prévia.
        fontWeight: elemento.font_weight || 'normal',
        fontStyle: elemento.font_style || 'normal',
        fill: elemento.color || '#ffffff',
        textAlign: 'left',
        splitByGrapheme: false
    })

    const larguraNatural = Math.max(Number(objeto.width) || 1, 1)
    const escalaInicialX = Math.min(1, larguraCaixa / larguraNatural)
    const larguraRenderizada = larguraNatural * escalaInicialX

    let deslocamentoX = 0
    if (alinhamento === 'center') {
        deslocamentoX = (larguraCaixa - larguraRenderizada) / 2
    } else if (alinhamento === 'right') {
        deslocamentoX = larguraCaixa - larguraRenderizada
    }

    objeto.set({
        left: props.left + deslocamentoX,
        scaleX: escalaInicialX
    })

    objeto.editorPositionOffsetX = deslocamentoX
    objeto.editorOriginalWidth = larguraCaixaOriginal
    objeto.editorInitialScaleX = escalaInicialX

    configurarObjeto(
        objeto,
        ehTitulo ? 'Título' : 'Texto',
        'texto'
    )

    objeto.elementId = elemento.id
    objeto.clientId =
        elemento.client_id || crypto.randomUUID()
    objeto.elementType = elemento.type

    objeto.setCoords()

    return objeto
}

/*
 * O canvas acompanha a área disponível, enquanto o viewport mantém a página
 * inteira centralizada e responsiva sem modificar as coordenadas dos objetos.
 */
function ajustarVisualizacaoCanvas() {
    if (!fabricCanvas || !canvasAreaRef.value) return

    const area = canvasAreaRef.value.getBoundingClientRect()
    const larguraArea = Math.floor(area.width)
    const alturaArea = Math.floor(area.height)

    if (larguraArea <= 0 || alturaArea <= 0) return

    const largura = Math.max(Number(larguraDocumento.value) || 1080, 1)
    const altura = Math.max(Number(alturaDocumento.value) || 1080, 1)

    const margem = Math.min(
        24,
        Math.floor(Math.min(larguraArea, alturaArea) * 0.05)
    )

    // Calcula uma única escala para caber a página inteira no palco.
    const escala = Math.min(
        Math.max(larguraArea - margem * 2, 1) / largura,
        Math.max(alturaArea - margem * 2, 1) / altura
    )

    const larguraVisivel = largura * escala
    const alturaVisivel = altura * escala
    const deslocamentoX = (larguraArea - larguraVisivel) / 2
    const deslocamentoY = (alturaArea - alturaVisivel) / 2

    // Use o viewport nativo do Fabric para escalar a página. Transformar o
    // wrapper via CSS escala a arte visual, mas pode deixar os controles,
    // hit-testing e limites do canvas em coordenadas diferentes (objetos
    // parecem deslocados/cortados em relação à miniatura).
    fabricCanvas.setDimensions({
        width: Math.max(Math.round(larguraVisivel), 1),
        height: Math.max(Math.round(alturaVisivel), 1)
    })

    fabricCanvas.setViewportTransform([
        escala, 0,
        0, escala,
        0, 0
    ])
    fabricCanvas.clipPath = null
    fabricCanvas.backgroundColor = fundoDocumento.value || '#FFFFFF'

    const wrapper = fabricCanvas.wrapperEl

    if (wrapper) {
        wrapper.style.setProperty('position', 'absolute', 'important')
        wrapper.style.setProperty('left', `${deslocamentoX}px`, 'important')
        wrapper.style.setProperty('top', `${deslocamentoY}px`, 'important')
        wrapper.style.setProperty('width', `${Math.round(larguraVisivel)}px`, 'important')
        wrapper.style.setProperty('height', `${Math.round(alturaVisivel)}px`, 'important')
        wrapper.style.setProperty('margin', '0', 'important')
        wrapper.style.setProperty('transform-origin', 'top left', 'important')
        wrapper.style.setProperty('transform', 'none', 'important')
        wrapper.style.setProperty('z-index', '1', 'important')
    }

    // Recalcula as coordenadas de interação após alterar as dimensões/viewport.
    fabricCanvas.calcOffset()
    fabricCanvas.requestRenderAll()
}

function adicionarFundoPagina() {
    if (!fabricCanvas) return

    // A página é o próprio fundo do canvas nativo; não vira uma camada.
    fabricCanvas.backgroundColor = fundoDocumento.value || '#FFFFFF'
    fabricCanvas.clipPath = null
    fabricCanvas.requestRenderAll()
}

function manterFundoNoFundo() {
    if (!fabricCanvas) return

    const fundo = fabricCanvas.getObjects().find(
        objeto => objeto.__editorBackground
    )

    if (fundo) {
        fabricCanvas.sendObjectToBack(fundo)
    }
}

function atualizarRecorteDaPagina() {
    if (!fabricCanvas) return

    // Sem clipPath: as bordas nativas do canvas coincidem com as da página.
    // Isso evita o recorte se deslocar ou ser aplicado duas vezes no zoom.
    fabricCanvas.clipPath = null
}

function normalizarDimensoesPagina(pagina) {
    const largura = Math.max(Number(pagina.width) || 1080, 1)
    const altura = Math.max(Number(pagina.height) || 1080, 1)
    const elementos = Array.isArray(pagina.elements) ? pagina.elements : []

    // Designs importados antigos guardaram 960x540, mas seus elementos
    // continuam nas coordenadas nativas 1920x1080. Não dependemos do nome
    // da página, porque a API pode chamá-la de "Página 1" ou outro nome.
    const limiteX = elementos.reduce((maximo, elemento) => {
        const x = Number(elemento.posicao_x ?? elemento.x ?? 0)
        const w = Math.max(Number(elemento.width ?? 0), 0)
        return Math.max(maximo, x + w)
    }, largura)

    const limiteY = elementos.reduce((maximo, elemento) => {
        const y = Number(elemento.posicao_y ?? elemento.y ?? 0)
        const h = Math.max(Number(elemento.heigth ?? elemento.height ?? 0), 0)
        return Math.max(maximo, y + h)
    }, altura)

    const fatorX = limiteX / largura
    const fatorY = limiteY / altura
    const proporcao = largura / altura
    const fatoresCompatíveis = Math.abs(fatorX - fatorY) < 0.55
    const fatorEstimado = Math.round((fatorX + fatorY) / 2)

    const dimensoesIncompatíveis =
        proporcao > 1.5 && proporcao < 2.05 &&
        fatorX > 1.45 && fatorY > 1.45 &&
        fatoresCompatíveis &&
        fatorEstimado >= 2 && fatorEstimado <= 3 &&
        Math.abs(fatorX - fatorEstimado) < 0.55 &&
        Math.abs(fatorY - fatorEstimado) < 0.55

    if (dimensoesIncompatíveis) {
        console.warn(
            '[EDITOR] Dimensões da página normalizadas pelas coordenadas dos elementos:',
            pagina.name || 'Página sem nome',
            `${largura}x${altura} -> ${largura * fatorEstimado}x${altura * fatorEstimado}`
        )

        return {
            ...pagina,
            width: largura * fatorEstimado,
            height: altura * fatorEstimado
        }
    }

    return { ...pagina, width: largura, height: altura }
}

/*
 * Deduplica por identidade, id persistido e client_id. Isso impede que
 * registros repetidos na resposta da API virem camadas visuais duplicadas.
 */
function obterObjetosUnicos({ incluirFundo = false } = {}) {
    if (!fabricCanvas) return []

    const resultado = []
    const vistosPorObjeto = new Set()
    const vistosPorId = new Set()
    const vistosPorClientId = new Set()

    for (const objeto of fabricCanvas.getObjects()) {
        const objetoReal = toRaw(objeto)

        if (vistosPorObjeto.has(objetoReal)) continue
        if (!incluirFundo && objetoReal.__editorBackground) continue

        const id = objetoReal.elementId != null
            ? String(objetoReal.elementId)
            : ''
        const clientId = objetoReal.clientId
            ? String(objetoReal.clientId)
            : ''

        if (id && vistosPorId.has(id)) continue
        if (clientId && vistosPorClientId.has(clientId)) continue

        vistosPorObjeto.add(objetoReal)
        if (id) vistosPorId.add(id)
        if (clientId) vistosPorClientId.add(clientId)
        resultado.push(objetoReal)
    }

    return resultado
}

function obterElementosDaPagina(pagina) {
    return Array.isArray(pagina?.elements)
        ? pagina.elements
        : []
}

async function popularCanvasComDesign(
    data,
    indicePagina = 0
) {
    const canvasDaCarga = fabricCanvas

    if (!canvasDaCarga) return

    // Cada carregamento recebe uma geração. Se a tela for desmontada
    // ou outro carregamento começar, o anterior será cancelado com segurança.
    const geracaoDaCarga = ++canvasLoadGeneration
    const cargaAindaAtiva = () =>
        fabricCanvas === canvasDaCarga &&
        canvasLoadGeneration === geracaoDaCarga

    carregandoDesign = true

    try {
        design.value = data
        templateTitulo.value = data.name || 'Design'

        let listaPaginas = Array.isArray(data.pages)
            ? [...data.pages].sort(
                (a, b) =>
                    (a.page_order ?? 0) -
                    (b.page_order ?? 0)
            )
            : []

        /*
         * Compatibilidade com respostas antigas que retornam
         * apenas "elements", sem a lista "pages".
         */
        if (!listaPaginas.length) {
            listaPaginas = [
                {
                    id: null,
                    name: 'Página 1',
                    page_order: 0,
                    width: data.width || 1080,
                    height: data.height || 1080,
                    background_color: '#FFFFFF',
                    elements: Array.isArray(data.elements)
                        ? data.elements
                        : []
                }
            ]
        }

        listaPaginas = listaPaginas.map(normalizarDimensoesPagina)

        paginas.value = listaPaginas

        paginaAtualIndex.value = Math.min(
            Math.max(indicePagina, 0),
            paginas.value.length - 1
        )

        const pagina = paginaAtual.value

        larguraDocumento.value =
            Number(pagina?.width) || 1080

        alturaDocumento.value =
            Number(pagina?.height) || 1080

        fundoDocumento.value =
            pagina?.background_color || '#FFFFFF'

        if (!cargaAindaAtiva()) return

        canvasDaCarga.discardActiveObject()
        canvasDaCarga.clear()
        canvasDaCarga.backgroundColor = fundoDocumento.value || '#FFFFFF'

        atualizarRecorteDaPagina()
        adicionarFundoPagina()
        ajustarVisualizacaoCanvas()

        const idsVistos = new Set()
        const clientIdsVistos = new Set()
        const elementos = [
            ...obterElementosDaPagina(pagina)
        ].filter(elemento => {
            const id = elemento.id != null ? String(elemento.id) : ''
            const clientId = elemento.client_id
                ? String(elemento.client_id)
                : ''

            if (id && idsVistos.has(id)) {
                console.warn('[CAMADAS] Registro repetido ignorado pelo id:', id)
                return false
            }

            if (clientId && clientIdsVistos.has(clientId)) {
                console.warn('[CAMADAS] Registro repetido ignorado pelo client_id:', clientId)
                return false
            }

            if (id) idsVistos.add(id)
            if (clientId) clientIdsVistos.add(clientId)
            return true
        }).sort(
            (a, b) =>
                (a.layer_order ?? 0) -
                (b.layer_order ?? 0)
        )

        for (const elemento of elementos) {
            // Não continua carregando imagens para um canvas que já foi
            // desmontado ou substituído enquanto a operação assíncrona aguardava.
            if (!cargaAindaAtiva()) return

            try {
                const objeto = await criarObjetoDeElemento(elemento)

                // criarObjetoDeElemento pode aguardar o download de uma imagem.
                // Verifica novamente antes de usar o canvas após esse await.
                if (!cargaAindaAtiva()) {
                    if (objeto && typeof objeto.dispose === 'function') {
                        objeto.dispose()
                    }
                    return
                }

                if (objeto) {
                    canvasDaCarga.add(objeto)
                }
            } catch (erro) {
                // Um cancelamento durante o carregamento não é uma falha
                // de elemento e não deve gerar dezenas de mensagens no console.
                if (!cargaAindaAtiva()) return

                console.error(
                    `[EDITOR] Falha ao carregar elemento ${elemento.id}`,
                    erro
                )
            }
        }

        await nextTick()
        await new Promise(resolve => requestAnimationFrame(resolve))

        // O componente pode ter sido desmontado durante o próximo frame.
        if (!cargaAindaAtiva()) return

        ajustarVisualizacaoCanvas()

        if (!cargaAindaAtiva()) return

        canvasDaCarga.requestRenderAll()
        atualizarListaCamadas()
    } finally {
        // Uma carga antiga não pode liberar o estado de uma carga mais nova.
        if (canvasLoadGeneration === geracaoDaCarga) {
            carregandoDesign = false
        }
    }
}

async function inicializarCanvas() {
    await nextTick()

    if (!canvasRef.value || !canvasAreaRef.value) return

    // Aguarda o layout do Vue e do navegador antes de medir o palco.
    await new Promise(resolve => requestAnimationFrame(resolve))

    const caixa = canvasAreaRef.value.getBoundingClientRect()
    const largura = Math.floor(caixa.width)
    const altura = Math.floor(caixa.height)

    if (largura <= 0 || altura <= 0) {
        console.error('[EDITOR] A área do canvas ainda não tem dimensões válidas.')
        return
    }

    fabricCanvas = new fabric.Canvas(canvasRef.value, {
        width: largura,
        height: altura,
        backgroundColor: '#FFFFFF',
        preserveObjectStacking: true,
        selection: true,
        renderOnAddRemove: true
    })

    fabricCanvas.on(
        'selection:created',
        lidarComSelecao
    )

    fabricCanvas.on(
        'selection:updated',
        lidarComSelecao
    )

    fabricCanvas.on('selection:cleared', () => {
        objetoSelecionado.value = null

        if (
            ![
                'camadas',
                'images',
                'formas'
            ].includes(menuAtivoAcima.value)
        ) {
            menuAtivoAcima.value = 'nenhum'
        }
    })

    const atualizarEAvisar = () => {
        atualizarListaCamadas()

        if (!carregandoDesign) {
            agendarSalvamento()
        }
    }

    fabricCanvas.on('object:added', atualizarEAvisar)
    fabricCanvas.on('object:removed', atualizarEAvisar)
    fabricCanvas.on('object:modified', atualizarEAvisar)
    fabricCanvas.on('text:editing:exited', atualizarEAvisar)

    window.addEventListener('keydown', lidarComTeclado)

    resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
            ajustarVisualizacaoCanvas()
        })
    })

    resizeObserver.observe(canvasAreaRef.value)

    if (designId.value) {
        try {
            const { data } =
                await designsApi.obterDesign(designId.value)

            await popularCanvasComDesign(data)

            mostrarUpload.value = false
        } catch (erro) {
            console.error(
                '[EDITOR] Erro ao carregar design:',
                erro
            )

            erroUpload.value =
                'Não foi possível carregar este design.'
        }
    } else {
        ajustarVisualizacaoCanvas()
    }
}

function lidarComSelecao(evento) {
    const objeto =
        evento?.selected?.[0] ||
        fabricCanvas?.getActiveObject()

    objetoSelecionado.value = objeto || null

    if (ehTexto(objeto)) {
        menuAtivoAcima.value = 'texto'
        tamanhoFonte.value = Number(objeto.fontSize || 30)
        corTexto.value = objeto.fill || '#ffffff'
        fonteSelecionada.value =
            objeto.fontFamily || 'Poppins'
        pesoTexto.value = objeto.fontWeight || 'normal'
        estiloTexto.value = objeto.fontStyle || 'normal'
        alinhamentoTexto.value =
            objeto.textAlign || 'left'
    } else if (ehForma(objeto)) {
        menuAtivoAcima.value = 'formas'
    } else if (objeto?.type === 'image') {
        menuAtivoAcima.value = 'images'
    }

    atualizarListaCamadas()
}

function clicarTextoNoFooter() {
    if (
        menuAtivoAcima.value === 'texto' &&
        ehTextoSelecionado.value
    ) {
        return
    }

    menuAtivoAcima.value = 'texto'

    if (!ehTexto(fabricCanvas?.getActiveObject())) {
        adicionarTexto()
    }
}

function clicarImagesNoFooter() {
    menuAtivoAcima.value =
        menuAtivoAcima.value === 'images'
            ? 'nenhum'
            : 'images'
}

function clicarFormasNoFooter() {
    menuAtivoAcima.value =
        menuAtivoAcima.value === 'formas'
            ? 'nenhum'
            : 'formas'
}

function clicarCamadasNoFooter() {
    menuAtivoAcima.value =
        menuAtivoAcima.value === 'camadas'
            ? 'nenhum'
            : 'camadas'

    atualizarListaCamadas()
}

function configurarUidCamada(objeto) {
    if (!objeto.clientId) {
        objeto.clientId = crypto.randomUUID()
    }

    if (!objeto.__uid) {
        objeto.__uid = objeto.clientId
    }

    return objeto
}

function rotuloDoObjeto(objeto) {
    if (ehTexto(objeto)) {
        const texto = objeto.text?.trim()

        return texto
            ? texto.slice(0, 24)
            : objeto.elementType === 'title'
                ? 'Título'
                : 'Texto'
    }

    if (objeto?.type === 'image') {
        return objeto.nomeCamada || 'Imagem'
    }

    if (objeto?.type === 'rect') {
        return objeto.nomeCamada || 'Retângulo'
    }

    if (objeto?.type === 'circle') {
        return objeto.nomeCamada || 'Círculo'
    }

    if (objeto?.type === 'triangle') {
        return objeto.nomeCamada || 'Triângulo'
    }

    if (objeto?.type === 'polygon') {
        return objeto.nomeCamada || 'Forma'
    }

    return objeto?.nomeCamada || 'Elemento'
}

function gerarMiniatura(objeto) {
    try {
        return objeto.toDataURL({
            format: 'png',
            multiplier: 0.6
        })
    } catch {
        return null
    }
}

function atualizarListaCamadas() {
    if (!fabricCanvas) return

    camadas.value = obterObjetosUnicos()
        .reverse()
        .map(objeto => {
            configurarUidCamada(objeto)

            return {
                objeto,
                thumbnail: gerarMiniatura(objeto)
            }
        })
}

function agendarSalvamento() {
    if (!designId.value || carregandoDesign) return

    salvamentoPendente = true

    clearTimeout(timerSalvamento)

    timerSalvamento = setTimeout(() => {
        executarAutosave()
    }, 800)
}

async function executarAutosave() {
    if (
        !designId.value ||
        !fabricCanvas ||
        carregandoDesign
    ) {
        return
    }

    if (salvando.value) {
        salvamentoPendente = true
        return
    }

    if (!salvamentoPendente) return

    salvamentoPendente = false

    try {
        await salvarDesign()
    } catch (erro) {
        console.error(
            '[EDITOR] Erro no salvamento automático:',
            erro
        )

        salvamentoPendente = true

        clearTimeout(timerSalvamento)

        timerSalvamento = setTimeout(() => {
            executarAutosave()
        }, 1500)

        return
    }

    if (salvamentoPendente) {
        clearTimeout(timerSalvamento)

        timerSalvamento = setTimeout(() => {
            executarAutosave()
        }, 300)
    }
}

function selecionarCamada(objeto) {
    if (!fabricCanvas || !objeto) return

    fabricCanvas.setActiveObject(objeto)
    objetoSelecionado.value = objeto

    fabricCanvas.requestRenderAll()
}

function atualizarOrdemDasCamadas() {
    if (!fabricCanvas) return

    fabricCanvas.getObjects().forEach((objeto, index) => {
        objeto.layerOrder = index
    })

    manterFundoNoFundo()
    atualizarListaCamadas()
    fabricCanvas.requestRenderAll()
    agendarSalvamento()
}

function moverCamadaParaCima(objeto) {
    if (!fabricCanvas || !objeto) return

    const objetoReal = toRaw(objeto)
    const objetos = fabricCanvas.getObjects()
    const indiceAtual = objetos.indexOf(objetoReal)

    if (
        indiceAtual === -1 ||
        objetoReal.__editorBackground ||
        indiceAtual >= objetos.length - 1
    ) {
        return
    }

    const alterou = fabricCanvas.moveObjectTo(
        objetoReal,
        indiceAtual + 1
    )

    if (alterou) atualizarOrdemDasCamadas()
}

function moverCamadaParaBaixo(objeto) {
    if (!fabricCanvas || !objeto) return

    const objetoReal = toRaw(objeto)
    const objetos = fabricCanvas.getObjects()
    const indiceAtual = objetos.indexOf(objetoReal)

    // O índice zero é sempre reservado ao fundo da página.
    if (indiceAtual <= 1 || objetoReal.__editorBackground) return

    const alterou = fabricCanvas.moveObjectTo(
        objetoReal,
        indiceAtual - 1
    )

    if (alterou) atualizarOrdemDasCamadas()
}

function adicionarTexto() {
    if (!fabricCanvas) return

    const texto = new fabric.IText('Seu texto', {
        left: larguraDocumento.value / 3,
        top: alturaDocumento.value / 2,
        originX: 'left',
        originY: 'top',
        fontFamily: fonteSelecionada.value,
        fontSize: Number(tamanhoFonte.value) || 30,
        fill: corTexto.value,
        fontWeight: pesoTexto.value,
        fontStyle: estiloTexto.value,
        textAlign: alinhamentoTexto.value,
        borderColor: '#FF5700',
        cornerColor: '#FF5700',
        cornerSize: 10,
        transparentCorners: false,
        selectable: true,
        evented: true
    })

    configurarObjeto(texto, 'Texto', 'texto')

    texto.elementType = 'text'

    fabricCanvas.add(texto)
    fabricCanvas.setActiveObject(texto)
    fabricCanvas.bringObjectToFront(texto)

    texto.enterEditing()
    texto.selectAll()

    fabricCanvas.requestRenderAll()
}

function atualizarAtributosTexto() {
    if (!fabricCanvas) return

    const objeto = fabricCanvas.getActiveObject()

    if (!ehTexto(objeto)) return

    objeto.set({
        fontSize: Number(tamanhoFonte.value) || 30,
        fill: corTexto.value,
        fontFamily: fonteSelecionada.value,
        fontWeight: pesoTexto.value,
        fontStyle: estiloTexto.value,
        textAlign: alinhamentoTexto.value
    })

    objeto.setCoords()

    fabricCanvas.requestRenderAll()

    atualizarListaCamadas()
    agendarSalvamento()
}

function mudarFonteTexto() {
    atualizarAtributosTexto()
}

function mudarCorTextoPredefinida(cor) {
    corTexto.value = cor
    atualizarAtributosTexto()
}

function adicionarCorTexto() {
    if (!coresTexto.value.includes(corTexto.value)) {
        coresTexto.value.push(corTexto.value)
    }
}

function configuracaoForma(cor = '#FF5700') {
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

function adicionarForma(tipo = 'rect') {
    if (!fabricCanvas) return

    const comuns = configuracaoForma('#FF5700')

    const centroX = larguraDocumento.value / 2
    const centroY = alturaDocumento.value / 2

    let forma
    let nome = 'Forma'

    if (tipo === 'circle') {
        forma = new fabric.Circle({
            ...comuns,
            left: centroX - 50,
            top: centroY - 50,
            radius: 50,
            originX: 'left',
            originY: 'top'
        })

        nome = 'Círculo'
    } else if (tipo === 'triangle') {
        forma = new fabric.Triangle({
            ...comuns,
            left: centroX - 55,
            top: centroY - 50,
            width: 110,
            height: 100,
            originX: 'left',
            originY: 'top'
        })

        nome = 'Triângulo'
    } else if (tipo === 'star') {
        forma = new fabric.Polygon(
            criarPontosEstrela(60, 60, 60, 28),
            {
                ...comuns,
                left: centroX - 60,
                top: centroY - 60,
                originX: 'left',
                originY: 'top'
            }
        )

        nome = 'Estrela'
    } else {
        forma = new fabric.Rect({
            ...comuns,
            left: centroX - 80,
            top: centroY - 50,
            width: 160,
            height: 100,
            originX: 'left',
            originY: 'top'
        })

        nome = 'Retângulo'
    }

    configurarObjeto(forma, nome, 'forma')

    forma.elementType = 'shape'
    forma.shapeType = tipo

    fabricCanvas.add(forma)
    fabricCanvas.setActiveObject(forma)
    fabricCanvas.bringObjectToFront(forma)

    fabricCanvas.requestRenderAll()
    atualizarListaCamadas()
    agendarSalvamento()
}

function alterarCorForma(cor) {
    const objeto = fabricCanvas?.getActiveObject()

    if (!ehForma(objeto)) return

    objeto.set({ fill: cor })
    objeto.setCoords()

    fabricCanvas.requestRenderAll()

    atualizarListaCamadas()
    agendarSalvamento()
}

async function adicionarImagemAoCanvas(evento) {
    const arquivo = evento?.target?.files?.[0]

    if (!arquivo || !fabricCanvas) return

    erroUpload.value = ''

    try {
        if (!arquivo.type.startsWith('image/')) {
            throw new Error(
                'Selecione uma imagem PNG, JPG ou WEBP.'
            )
        }

        const dataUrl = await new Promise(
            (resolve, reject) => {
                const reader = new FileReader()

                reader.onload = () => resolve(reader.result)

                reader.onerror = () => {
                    reject(
                        new Error('Não foi possível ler a imagem.')
                    )
                }

                reader.readAsDataURL(arquivo)
            }
        )

        const imagem = await criarImagemFabric(
            dataUrl,
            {
                nomeCamada: arquivo.name,
                tipoCamada: 'imagem'
            }
        )

        const larguraMaxima =
            larguraDocumento.value * 0.7

        const alturaMaxima =
            alturaDocumento.value * 0.7

        const escala = Math.min(
            larguraMaxima / imagem.width,
            alturaMaxima / imagem.height,
            1
        )

        const larguraRenderizada = imagem.width * escala
        const alturaRenderizada = imagem.height * escala

        imagem.set({
            scaleX: escala,
            scaleY: escala,
            originX: 'left',
            originY: 'top',
            left: (larguraDocumento.value - larguraRenderizada) / 2,
            top: (alturaDocumento.value - alturaRenderizada) / 2
        })

        imagem.setCoords()

        fabricCanvas.add(imagem)
        fabricCanvas.setActiveObject(imagem)
        fabricCanvas.bringObjectToFront(imagem)

        fabricCanvas.requestRenderAll()

        atualizarListaCamadas()
        agendarSalvamento()
    } catch (erro) {
        console.error(
            '[EDITOR] Erro ao adicionar imagem:',
            erro
        )

        erroUpload.value =
            erro.message ||
            'Não foi possível adicionar a imagem.'
    } finally {
        if (evento?.target) {
            evento.target.value = ''
        }
    }
}

function abrirSeletorDeArquivo() {
    inputArquivoRef.value?.click()
}

function abrirSeletorDeImagem() {
    inputImagemRef.value?.click()
}

function arquivoEhSuportado(arquivo) {
    const nome = arquivo?.name?.toLowerCase() || ''

    return EXTENSOES_ACEITAS.some(
        extensao => nome.endsWith(extensao)
    )
}

function selecionarArquivoParaCriar(evento) {
    const arquivo = evento.target.files?.[0]

    if (!arquivo) return

    if (!arquivoEhSuportado(arquivo)) {
        erroUpload.value =
            'Formato não suportado. Envie um PDF, PPTX, JPG ou PNG.'
        return
    }

    erroUpload.value = ''
    arquivoSelecionado.value = arquivo
}

function soltarArquivoParaCriar(evento) {
    const arquivo = evento.dataTransfer.files?.[0]

    if (!arquivo) return

    if (!arquivoEhSuportado(arquivo)) {
        erroUpload.value =
            'Formato não suportado. Envie um PDF, PPTX, JPG ou PNG.'
        return
    }

    erroUpload.value = ''
    arquivoSelecionado.value = arquivo
}

async function comecarDoZero() {
    try {
        const { data } = await designsApi.criarVazio()

        designId.value = data.id
        design.value = data
        templateTitulo.value = data.name || 'Design'
        mostrarUpload.value = false

        await popularCanvasComDesign(data)

        router.replace(`/criar/${data.id}`)
    } catch (erro) {
        console.error(erro)

        erroUpload.value =
            'Não foi possível criar o design. Tente novamente.'
    }
}

async function criarDesignAPartirDoUpload() {
    if (
        !arquivoSelecionado.value ||
        enviandoUpload.value
    ) {
        return
    }

    enviandoUpload.value = true
    erroUpload.value = ''

    try {
        const { data } = await designsApi.uploadArquivo(
            arquivoSelecionado.value
        )

        designId.value = data.id
        design.value = data

        await popularCanvasComDesign(data)

        mostrarUpload.value = false

        router.replace(`/criar/${data.id}`)
    } catch (erro) {
        console.error(erro)

        erroUpload.value =
            erro.response?.data?.error ||
            'Não foi possível processar o arquivo. Tente novamente.'
    } finally {
        enviandoUpload.value = false
    }
}

function objetoFabricParaElemento(objeto) {
    if (objeto.__editorBackground) return null

    configurarUidCamada(objeto)

    const escalaX = objeto.scaleX ?? 1
    const escalaY = objeto.scaleY ?? 1

    const base = {
        id: objeto.elementId ?? null,
        client_id: objeto.clientId,
        posicao_x: Math.round(
            (objeto.left ?? 0) -
            (ehTexto(objeto) ? (objeto.editorPositionOffsetX || 0) : 0)
        ),
        posicao_y: Math.round(objeto.top ?? 0),
        width: Math.round(
            ehTexto(objeto) && objeto.editorOriginalWidth
                ? objeto.editorOriginalWidth * (
                    escalaX / Math.max(objeto.editorInitialScaleX || 1, 0.0001)
                )
                : (objeto.width ?? 0) * escalaX
        ),
        heigth: Math.round(
            (objeto.height ?? 0) * escalaY
        )
    }

    if (ehTexto(objeto)) {
        return {
            ...base,
            type: objeto.elementType === 'title'
                ? 'title'
                : 'text',
            content: objeto.text || '',
            color: typeof objeto.fill === 'string'
                ? objeto.fill
                : '#ffffff',
            font_size: Math.round(
                Number(objeto.fontSize || 30)
            ),
            font_family: objeto.fontFamily || 'Poppins',
            font_weight: objeto.fontWeight || 'normal',
            font_style: objeto.fontStyle || 'normal',
            text_align: objeto.textAlign || 'left'
        }
    }

    if (objeto.type === 'image') {
        return {
            ...base,
            type: 'image',
            content: objeto.getSrc(),
            color: ''
        }
    }

    if (ehForma(objeto)) {
        return {
            ...base,
            type: 'shape',
            shape_type:
                objeto.shapeType ||
                (objeto.type === 'polygon'
                    ? 'star'
                    : objeto.type),
            stroke_width: Number(
                objeto.strokeWidth || 0
            ),
            stroke_color: objeto.stroke || '',
            color: typeof objeto.fill === 'string'
                ? objeto.fill
                : '#FF5700',
            content: ''
        }
    }

    return null
}

async function salvarDesign() {
    if (
        !fabricCanvas ||
        !designId.value ||
        salvando.value
    ) {
        return
    }

    salvando.value = true

    try {
        const elementos = obterObjetosUnicos()
            .map((objeto, index) => {
                const elemento = objetoFabricParaElemento(objeto)

                return elemento
                    ? {
                        ...elemento,
                        layer_order: index
                    }
                    : null
            })
            .filter(Boolean)

        const idPagina = paginaAtual.value?.id ?? null

        /*
         * designsApi.salvarElementos precisa receber o terceiro
         * argumento pageId e enviá-lo no payload como page_id.
         */
        const { data } = await designsApi.salvarElementos(
            designId.value,
            elementos,
            idPagina
        )

        if (Array.isArray(data.pages) && data.pages.length) {
            const indiceAnterior = paginaAtualIndex.value

            paginas.value = [...data.pages]
                .map(normalizarDimensoesPagina)
                .sort(
                    (a, b) =>
                        (a.page_order ?? 0) -
                        (b.page_order ?? 0)
                )

            paginaAtualIndex.value = Math.min(
                indiceAnterior,
                paginas.value.length - 1
            )
        }

        const paginaSalva = paginas.value.find(
            pagina =>
                String(pagina.id) === String(idPagina)
        )

        const elementosSalvos = idPagina
            ? paginaSalva?.elements || []
            : data.elements || []

        const porClientId = new Map(
            elementosSalvos
                .filter(elemento => elemento.client_id)
                .map(elemento => [
                    elemento.client_id,
                    elemento
                ])
        )

        fabricCanvas.getObjects().forEach(objeto => {
            const salvo = objeto.clientId
                ? porClientId.get(objeto.clientId)
                : null

            if (salvo) {
                objeto.elementId = salvo.id
            }
        })

        design.value = data
    } catch (erro) {
        console.error(
            '[EDITOR] Erro ao salvar design:',
            erro
        )

        throw erro
    } finally {
        salvando.value = false
    }
}

async function trocarPagina(indice) {
    if (
        indice < 0 ||
        indice >= paginas.value.length ||
        indice === paginaAtualIndex.value ||
        salvando.value ||
        carregandoDesign ||
        trocandoPagina ||
        !fabricCanvas
    ) {
        return
    }

    trocandoPagina = true

    try {
        if (timerSalvamento) {
            clearTimeout(timerSalvamento)
            timerSalvamento = null
        }

        salvamentoPendente = false

        if (designId.value && fabricCanvas) {
            await salvarDesign()
        }

        // O canvas pode ser desmontado enquanto salvarDesign aguarda a API.
        if (!fabricCanvas) return

        await popularCanvasComDesign(
            design.value,
            indice
        )
    } finally {
        trocandoPagina = false
    }
}

function irParaPaginaAnterior() {
    trocarPagina(paginaAtualIndex.value - 1)
}

function irParaProximaPagina() {
    trocarPagina(paginaAtualIndex.value + 1)
}

function deletarSelecionado() {
    if (!fabricCanvas) return

    const objeto = fabricCanvas.getActiveObject()

    if (!objeto) return

    fabricCanvas.remove(objeto)
    fabricCanvas.discardActiveObject()

    objetoSelecionado.value = null
    menuAtivoAcima.value = 'nenhum'

    atualizarListaCamadas()
    fabricCanvas.requestRenderAll()

    agendarSalvamento()
}

function lidarComTeclado(evento) {
    if (
        evento.key !== 'Delete' &&
        evento.key !== 'Backspace'
    ) {
        return
    }

    const ativo = fabricCanvas?.getActiveObject()

    if (ehTexto(ativo) && ativo.isEditing) return

    deletarSelecionado()
}

function voltarParaPaginaAnterior() {
    if (window.history.state?.back) {
        router.back()
    } else {
        router.push('/')
    }
}

function exportarDesign() {
    if (!fabricCanvas) return

    fabricCanvas.discardActiveObject()

    const larguraOriginal = fabricCanvas.getWidth()
    const alturaOriginal = fabricCanvas.getHeight()

    const transformacaoOriginal = [
        ...fabricCanvas.viewportTransform
    ]
    const fundoOriginal = fabricCanvas.backgroundColor

    try {
        fabricCanvas.backgroundColor = fundoDocumento.value || '#FFFFFF'

        fabricCanvas.setDimensions({
            width: larguraDocumento.value,
            height: alturaDocumento.value
        })

        fabricCanvas.setViewportTransform([
            1, 0, 0, 1, 0, 0
        ])

        // Durante a exportação, o recorte usa coordenadas nativas do slide.
        atualizarRecorteDaPagina()
        fabricCanvas.requestRenderAll()

        const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1
        })

        const link = document.createElement('a')

        link.download =
            `${templateTitulo.value || 'design'}-pagina-${paginaAtualIndex.value + 1}.png`

        link.href = dataURL

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } finally {
        fabricCanvas.backgroundColor = fundoOriginal

        fabricCanvas.setDimensions({
            width: larguraOriginal,
            height: alturaOriginal
        })

        fabricCanvas.setViewportTransform(
            transformacaoOriginal
        )

        atualizarRecorteDaPagina()
        ajustarVisualizacaoCanvas()
        fabricCanvas.requestRenderAll()
    }
}

onMounted(() => {
    inicializarCanvas()
})

onBeforeUnmount(() => {
    // Cancela qualquer carregamento que esteja aguardando imagens ou o próximo frame.
    canvasLoadGeneration += 1
    carregandoDesign = false
    trocandoPagina = false

    window.removeEventListener(
        'keydown',
        lidarComTeclado
    )

    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
    }

    if (timerSalvamento) {
        clearTimeout(timerSalvamento)
    }

    salvamentoPendente = false

    if (fabricCanvas) {
        fabricCanvas.dispose()
        fabricCanvas = null
    }
})
</script>

<template>
    <div class="editor-interface">
        <header class="editor-header">
            <button
                class="header-btn"
                title="Voltar"
                @click="voltarParaPaginaAnterior"
            >
                <ion-icon name="arrow-back"></ion-icon>
            </button>

            <button
                class="header-btn"
                title="Início"
                @click="router.push('/')"
            >
                <ion-icon name="home-outline"></ion-icon>
            </button>

            <div class="header-spacer"></div>

            <div
                v-if="!mostrarUpload"
                class="controle-paginas"
            >
                <button
                    class="header-btn"
                    title="Página anterior"
                    :disabled="paginaAtualIndex <= 0"
                    @click="irParaPaginaAnterior"
                >
                    <ion-icon name="chevron-back-outline"></ion-icon>
                </button>

                <span class="contador-paginas">
                    {{ paginaAtualIndex + 1 }} /
                    {{ quantidadePaginas }}
                </span>

                <button
                    class="header-btn"
                    title="Próxima página"
                    :disabled="
                        paginaAtualIndex >=
                        quantidadePaginas - 1
                    "
                    @click="irParaProximaPagina"
                >
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                </button>
            </div>

            <button
                class="header-btn"
                title="Salvar"
                :disabled="salvando"
                @click="salvarDesign"
            >
                <ion-icon name="save-outline"></ion-icon>
            </button>

            <button
                class="header-btn"
                title="Exportar página"
                @click="exportarDesign"
            >
                <ion-icon name="download-outline"></ion-icon>
            </button>
        </header>

        <main
            ref="canvasAreaRef"
            class="canvas-area"
        >
            <canvas ref="canvasRef"></canvas>


            <div
                v-if="mostrarUpload"
                class="overlay-upload"
            >
                <div
                    class="area-upload"
                    :class="{
                        'tem-arquivo': arquivoSelecionado
                    }"
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

                <p
                    v-if="erroUpload"
                    class="mensagem-erro"
                >
                    {{ erroUpload }}
                </p>

                <button
                    class="btn-criar"
                    :disabled="
                        !arquivoSelecionado ||
                        enviandoUpload
                    "
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

        <footer class="editor-footer">
            <div
                v-if="menuAtivoAcima === 'texto'"
                class="aba-superior-texto"
            >
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

                <input
                    v-model.number="tamanhoFonte"
                    type="number"
                    min="8"
                    max="200"
                    @input="atualizarAtributosTexto"
                />

                <input
                    v-model="corTexto"
                    type="color"
                    @input="atualizarAtributosTexto"
                />

                <button
                    class="controle-btn"
                    :class="{ ativo: pesoTexto === 'bold' }"
                    @click="
                        pesoTexto = pesoTexto === 'bold'
                            ? 'normal'
                            : 'bold';
                        atualizarAtributosTexto()
                    "
                >
                    <b>B</b>
                </button>

                <button
                    class="controle-btn"
                    :class="{ ativo: estiloTexto === 'italic' }"
                    @click="
                        estiloTexto = estiloTexto === 'italic'
                            ? 'normal'
                            : 'italic';
                        atualizarAtributosTexto()
                    "
                >
                    <i>I</i>
                </button>

                <button
                    v-for="cor in coresTexto"
                    :key="cor"
                    class="cor-btn"
                    :style="{ backgroundColor: cor }"
                    @click="mudarCorTextoPredefinida(cor)"
                ></button>

                <button
                    class="controle-add"
                    @click="adicionarCorTexto"
                >
                    +
                </button>
            </div>

            <div
                v-if="menuAtivoAcima === 'images'"
                class="aba-superior-img"
            >
                <button
                    class="opcao-imagem"
                    @click="abrirSeletorDeImagem"
                >
                    <ion-icon name="image-outline"></ion-icon>
                    <span>Adicionar imagem</span>
                </button>

                <input
                    ref="inputImagemRef"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="input-oculto"
                    @change="adicionarImagemAoCanvas"
                />
            </div>

            <div
                v-if="menuAtivoAcima === 'formas'"
                class="aba-superior-formas"
            >
                <button
                    v-for="forma in formasDisponiveis"
                    :key="forma.tipo"
                    class="forma-visual"
                    :title="forma.nome"
                    @click="adicionarForma(forma.tipo)"
                >
                    <svg
                        viewBox="0 0 64 64"
                        aria-hidden="true"
                    >
                        <circle
                            v-if="forma.tipo === 'circle'"
                            cx="32"
                            cy="32"
                            r="22"
                        />

                        <rect
                            v-else-if="forma.tipo === 'rect'"
                            x="9"
                            y="17"
                            width="46"
                            height="30"
                            rx="2"
                        />

                        <polygon
                            v-else-if="forma.tipo === 'triangle'"
                            points="32,8 56,54 8,54"
                        />

                        <polygon
                            v-else
                            points="32,6 38,25 58,25 42,37 48,57 32,45 16,57 22,37 6,25 26,25"
                        />
                    </svg>
                </button>

                <input
                    class="seletor-cor-forma"
                    type="color"
                    value="#FF5700"
                    @input="alterarCorForma($event.target.value)"
                />
            </div>

            <div
                v-if="menuAtivoAcima === 'camadas'"
                class="aba-superior-camadas"
            >
                <div
                    v-if="!camadas.length"
                    class="camadas-vazio"
                >
                    Nenhum elemento no canvas ainda.
                </div>

                <div
                    v-for="(camada, index) in camadas"
                    :key="
                        camada.objeto.clientId ||
                        camada.objeto.__uid ||
                        index
                    "
                    class="camada-item"
                    :class="{
                        ativa: camada.objeto === objetoSelecionado
                    }"
                    @click="selecionarCamada(camada.objeto)"
                >
                    <div class="camada-thumb">
                        <img
                            v-if="camada.thumbnail"
                            :src="camada.thumbnail"
                            :alt="rotuloDoObjeto(camada.objeto)"
                        />

                        <ion-icon
                            v-else
                            name="layers-outline"
                        ></ion-icon>
                    </div>

                    <span class="camada-nome">
                        {{ rotuloDoObjeto(camada.objeto) }}
                    </span>

                    <div class="camada-acoes">
                        <button
                            class="camada-btn"
                            :disabled="index === 0"
                            @click.stop="
                                moverCamadaParaCima(camada.objeto)
                            "
                        >
                            <ion-icon name="chevron-up-outline"></ion-icon>
                        </button>

                        <button
                            class="camada-btn"
                            :disabled="index === camadas.length - 1"
                            @click.stop="
                                moverCamadaParaBaixo(camada.objeto)
                            "
                        >
                            <ion-icon name="chevron-down-outline"></ion-icon>
                        </button>
                    </div>
                </div>
            </div>

            <div class="ferramentas-container-fixo">
                <button
                    class="tool-btn"
                    :class="{ ativo: menuAtivoAcima === 'texto' }"
                    @click="clicarTextoNoFooter"
                >
                    <ion-icon name="text-outline"></ion-icon>
                    <span>Texto</span>
                </button>

                <button
                    class="tool-btn"
                    :class="{ ativo: menuAtivoAcima === 'formas' }"
                    @click="clicarFormasNoFooter"
                >
                    <ion-icon name="shapes-outline"></ion-icon>
                    <span>Formas</span>
                </button>

                <button
                    class="tool-btn"
                    :class="{ ativo: menuAtivoAcima === 'images' }"
                    @click="clicarImagesNoFooter"
                >
                    <ion-icon name="images-outline"></ion-icon>
                    <span>Imagens</span>
                </button>

                <button
                    class="tool-btn"
                    :class="{ ativo: menuAtivoAcima === 'camadas' }"
                    @click="clicarCamadasNoFooter"
                >
                    <ion-icon name="layers-outline"></ion-icon>
                    <span>Camadas</span>
                </button>

                <button
                    class="tool-btn"
                    @click="deletarSelecionado"
                >
                    <ion-icon name="trash-outline"></ion-icon>
                    <span>Excluir</span>
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
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    z-index: 1000;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #262626;
    color: #fff;
}

.editor-header {
    flex: 0 0 50px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 16px;
    background-color: #ff5700;
    z-index: 50;
}

.header-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: #fff;
    cursor: pointer;
    flex-shrink: 0;
}

.header-btn:hover {
    background: rgba(255, 255, 255, 0.12);
}

.header-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.header-btn ion-icon {
    font-size: 25px;
}

.header-spacer {
    flex: 1;
    min-width: 0;
}

.controle-paginas {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: 12px;
}

.contador-paginas {
    min-width: 48px;
    text-align: center;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
}

.canvas-area {
    position: relative;
    flex: 1 1 0;
    align-self: stretch;
    min-width: 0;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    background-color: #262626;
    overflow: hidden;
}


.canvas-area :deep(.canvas-container) {
    position: absolute !important;
    margin: 0 !important;
    transform-origin: top left !important;
}

.canvas-area :deep(.canvas-container .lower-canvas),
.canvas-area :deep(.canvas-container .upper-canvas) {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    max-width: none !important;
    max-height: none !important;
}

.canvas-area canvas {
    display: block;
    max-width: none;
}

.overlay-upload {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 24px;
    background-color: #262626;
}

.area-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    max-width: 360px;
    padding: 40px 20px;
    border: 2px dashed #555;
    border-radius: 12px;
    color: #999;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background-color 0.2s;
}

.area-upload:hover,
.area-upload.tem-arquivo {
    border-color: #ff5700;
    color: #fff;
    background: rgba(255, 87, 0, 0.04);
}

.area-upload ion-icon {
    font-size: 40px;
    color: #ff5700;
}

.area-upload p {
    margin: 0;
}

.formatos-aceitos {
    font-size: 12px;
    color: #999;
}

.input-oculto {
    display: none;
}

.mensagem-erro {
    max-width: 500px;
    margin: 0;
    color: #e04444;
    font-size: 13px;
    text-align: center;
}

.btn-criar {
    width: 100%;
    max-width: 360px;
    padding: 14px;
    border: none;
    border-radius: 10px;
    background-color: #ff5700;
    color: #fff;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
}

.btn-criar:hover:not(:disabled) {
    background-color: #e64d00;
}

.btn-criar:disabled {
    opacity: 0.5;
    cursor: default;
}

.btn-comecar-vazio {
    padding: 4px;
    background: transparent;
    border: none;
    color: #999;
    font-size: 13px;
    text-decoration: underline;
    cursor: pointer;
}

.btn-comecar-vazio:hover {
    color: #fff;
}

.editor-footer {
    position: relative;
    flex: 0 0 56px;
    flex-shrink: 0;
    width: 100%;
    z-index: 40;
    background: #1e1e1e;
}

.aba-superior-texto,
.aba-superior-img,
.aba-superior-formas,
.aba-superior-camadas {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 56px;
    z-index: 30;
    background-color: #1e1e1e;
    border-bottom: 1px solid #2d2d2d;
    box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.35);
}

.aba-superior-texto {
    min-height: 76px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    overflow-x: auto;
}

.aba-superior-texto select,
.aba-superior-texto input[type="number"] {
    flex: 0 0 auto;
    height: 34px;
    padding: 6px 9px;
    border: 1px solid #555;
    border-radius: 6px;
    background: #111;
    color: #fff;
    outline: none;
}

.aba-superior-texto select {
    min-width: 150px;
}

.aba-superior-texto input[type="number"] {
    width: 70px;
}

.aba-superior-texto input[type="color"] {
    flex: 0 0 36px;
    width: 36px;
    height: 34px;
    padding: 2px;
    border: 1px solid #555;
    border-radius: 6px;
    background: #111;
    cursor: pointer;
}

.controle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 34px;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid #555;
    border-radius: 6px;
    background: #111;
    color: #fff;
    cursor: pointer;
}

.controle-btn:hover,
.controle-btn.ativo {
    border-color: #ff5700;
    background: rgba(255, 87, 0, 0.15);
    color: #ff5700;
}

.cor-btn {
    flex: 0 0 28px;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 1px #555;
    cursor: pointer;
}

.cor-btn:hover {
    transform: scale(1.08);
}

.controle-add {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 30px;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 1px dashed #777;
    border-radius: 50%;
    background: transparent;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
}

.aba-superior-img {
    min-height: 90px;
    max-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow-y: auto;
}

.opcao-imagem {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 190px;
    padding: 12px 16px;
    border: 1px solid #ff5700;
    border-radius: 10px;
    background: transparent;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
}

.opcao-imagem:hover {
    background: rgba(255, 87, 0, 0.1);
}

.opcao-imagem ion-icon {
    color: #ff5700;
    font-size: 20px;
}

.aba-superior-formas {
    min-height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 12px 16px;
    overflow-x: auto;
}

.forma-visual {
    flex: 0 0 58px;
    width: 58px;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 1px solid #555;
    border-radius: 9px;
    background: #272727;
    cursor: pointer;
    transition: border-color 0.15s, background-color 0.15s, transform 0.15s;
}

.forma-visual:hover {
    border-color: #ff5700;
    background: rgba(255, 87, 0, 0.1);
    transform: translateY(-1px);
}

.forma-visual svg {
    display: block;
    width: 36px;
    height: 36px;
    fill: #ff5700;
    stroke: #ff5700;
    stroke-width: 2;
}

.seletor-cor-forma {
    flex: 0 0 38px;
    width: 38px;
    height: 34px;
    padding: 0;
    border: 1px solid #555;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
}

.aba-superior-camadas {
    min-height: 120px;
    max-height: 350px;
    padding: 10px 16px;
    overflow-y: auto;
}

.camadas-vazio {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 70px;
    color: #777;
    font-size: 13px;
    text-align: center;
}

.camada-item {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    min-height: 44px;
    padding: 6px 8px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: #272727;
    color: #fff;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.15s, border-color 0.15s;
}

.camada-item + .camada-item {
    margin-top: 4px;
}

.camada-item:hover {
    background: #303030;
    border-color: #555;
}

.camada-item.ativa {
    background: rgba(255, 87, 0, 0.15);
    border-color: #ff5700;
}

.camada-thumb {
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid #444;
    border-radius: 6px;
    background: #1a1a1a;
}

.camada-thumb img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.camada-thumb ion-icon {
    color: #777;
    font-size: 17px;
}

.camada-nome {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: #fff;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.camada-acoes {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.camada-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 1px solid #ff5700;
    border-radius: 6px;
    background: transparent;
    color: #ff5700;
    cursor: pointer;
}

.camada-btn:hover:not(:disabled) {
    background: rgba(255, 87, 0, 0.15);
}

.camada-btn:disabled {
    opacity: 0.3;
    cursor: default;
}

.ferramentas-container-fixo {
    position: relative;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 56px;
    background-color: #1e1e1e;
    border-top: 1px solid #2d2d2d;
}

.tool-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 70px;
    height: 56px;
    padding: 0;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 11px;
}

.tool-btn ion-icon {
    font-size: 22px;
}

.tool-btn:hover,
.tool-btn.ativo {
    color: #ff5700;
}

@media (max-width: 600px) {
    .editor-header {
        padding: 0 8px;
    }

    .controle-paginas {
        gap: 0;
        margin-right: 4px;
    }

    .contador-paginas {
        min-width: 38px;
        font-size: 12px;
    }

    .tool-btn {
        width: 60px;
    }

    .aba-superior-texto {
        min-height: 105px;
        padding: 10px;
        overflow-x: auto;
    }

    .aba-superior-texto select {
        min-width: 125px;
    }

    .aba-superior-formas {
        min-height: 120px;
        gap: 10px;
        padding: 12px;
    }

    .forma-visual {
        flex-basis: 52px;
        width: 52px;
        height: 52px;
    }

    .aba-superior-camadas {
        max-height: 330px;
        padding: 10px;
    }
}
</style>