<script setup>
import {
    ref,
    watch,
    nextTick,
    onMounted,
    computed,
    onBeforeUnmount,
} from "vue";

import { useRouter } from "vue-router";
import designsApi from "@/api/designsApi";

const props = defineProps({
    design: {
        type: Object,
        required: true,
    },

    showFavorite: {
        type: Boolean,
        default: true,
    },

    showRename: {
        type: Boolean,
        default: true,
    },

    showDelete: {
        type: Boolean,
        default: true,
    },

    showDescription: {
        type: Boolean,
        default: false,
    },

    clickable: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits([
    "updated",
    "removed",
    "open",
]);

const router = useRouter();

const quantidadePaginas = computed(() => {
    if (
        Array.isArray(props.design.pages) &&
        props.design.pages.length > 0
    ) {
        return props.design.pages.length;
    }

    return 1;
});

const canvasElement = ref(null);
const editandoNome = ref(false);
const nomeEditado = ref("");
const carregandoAcao = ref(false);

const erro = ref("");
const mostrarConfirmacao = ref(false);

let resizeObserver = null;
let versaoDesenho = 0;

const nomeDesign = () =>
    props.design.name || "Design sem nome";

function obterElementos(design) {
    if (Array.isArray(design.elements)) {
        return design.elements;
    }

    if (
        Array.isArray(design.pages) &&
        design.pages.length
    ) {
        const paginas = [...design.pages].sort(
            (a, b) =>
                (a.page_order ?? 0) -
                (b.page_order ?? 0)
        );

        return Array.isArray(paginas[0].elements)
            ? paginas[0].elements
            : [];
    }

    return [];
}

function obterPagina(design) {
    if (
        !Array.isArray(design.pages) ||
        !design.pages.length
    ) {
        return null;
    }

    return [...design.pages].sort(
        (a, b) =>
            (a.page_order ?? 0) -
            (b.page_order ?? 0)
    )[0];
}

function obterDimensoes(design) {
    const pagina = obterPagina(design);

    return {
        largura: Math.max(
            Number(
                pagina?.width ??
                design.width ??
                1080
            ),
            1
        ),

        altura: Math.max(
            Number(
                pagina?.height ??
                design.height ??
                1080
            ),
            1
        ),

        fundo:
            pagina?.background_color ||
            design.background_color ||
            "#FFFFFF",
    };
}

function obterPosicao(elemento) {
    return {
        x: Number(
            elemento.posicao_x ??
            elemento.x ??
            0
        ),

        y: Number(
            elemento.posicao_y ??
            elemento.y ??
            0
        ),
    };
}

function obterAltura(elemento) {
    return Math.max(
        Number(
            elemento.heigth ??
            elemento.height ??
            100
        ),
        1
    );
}

function obterLargura(elemento) {
    return Math.max(
        Number(elemento.width ?? 100),
        1
    );
}

function desenharForma(ctx, elemento) {
    const { x, y } = obterPosicao(elemento);
    const largura = obterLargura(elemento);
    const altura = obterAltura(elemento);

    ctx.fillStyle =
        elemento.color || "#FF5700";

    if (elemento.stroke_color) {
        ctx.strokeStyle = elemento.stroke_color;

        ctx.lineWidth = Number(
            elemento.stroke_width || 1
        );
    }

    switch (elemento.shape_type || "rect") {
        case "circle": {
            ctx.beginPath();

            ctx.ellipse(
                x + largura / 2,
                y + altura / 2,
                largura / 2,
                altura / 2,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();

            if (elemento.stroke_color) {
                ctx.stroke();
            }

            break;
        }

        case "triangle": {
            ctx.beginPath();

            ctx.moveTo(
                x + largura / 2,
                y
            );

            ctx.lineTo(
                x + largura,
                y + altura
            );

            ctx.lineTo(
                x,
                y + altura
            );

            ctx.closePath();
            ctx.fill();

            if (elemento.stroke_color) {
                ctx.stroke();
            }

            break;
        }

        case "star": {
            const centroX = x + largura / 2;
            const centroY = y + altura / 2;

            const raioExterno =
                Math.min(largura, altura) / 2;

            const raioInterno =
                raioExterno * 0.45;

            ctx.beginPath();

            for (let i = 0; i < 10; i++) {
                const raio =
                    i % 2 === 0
                        ? raioExterno
                        : raioInterno;

                const angulo =
                    -Math.PI / 2 +
                    (i * Math.PI) / 5;

                const px =
                    centroX +
                    Math.cos(angulo) * raio;

                const py =
                    centroY +
                    Math.sin(angulo) * raio;

                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }

            ctx.closePath();
            ctx.fill();

            if (elemento.stroke_color) {
                ctx.stroke();
            }

            break;
        }

        default: {
            ctx.fillRect(
                x,
                y,
                largura,
                altura
            );

            if (elemento.stroke_color) {
                ctx.strokeRect(
                    x,
                    y,
                    largura,
                    altura
                );
            }
        }
    }
}

function obterUrlImagem(elemento) {
    return (
        elemento.content ||
        elemento.image_url ||
        elemento.url ||
        elemento.src ||
        elemento.data_url ||
        ""
    );
}

/*
 * O backend normalmente devolve URLs como /media/images/arquivo.png.
 * Transforma o caminho relativo em absoluto, usando a origem da API.
 */
function resolverUrlImagem(valor) {
    if (
        !valor ||
        typeof valor !== "string"
    ) {
        return "";
    }

    const url = valor.trim();

    if (!url) return "";

    if (
        /^(data:image\/|blob:|https?:\/\/)/i.test(url)
    ) {
        return url;
    }

    const baseApi =
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8000/api/";

    try {
        const base = new URL(
            baseApi,
            window.location.origin
        );

        if (url.startsWith("/")) {
            return new URL(
                url,
                base.origin
            ).href;
        }

        return new URL(
            url,
            base
        ).href;

    } catch (erro) {
        console.error(
            "[MINIATURA] URL de imagem inválida:",
            url,
            erro
        );

        return url;
    }
}

function carregarImagem(url) {
    return new Promise((resolve) => {
        const fonte = resolverUrlImagem(url);

        if (!fonte) {
            resolve(null);
            return;
        }

        const imagem = new Image();

        imagem.onload = () => resolve(imagem);
        imagem.onerror = () => resolve(null);

        imagem.src = fonte;
    });
}

async function desenharMiniatura() {
    const versaoAtual = ++versaoDesenho;

    await nextTick();

    const canvas = canvasElement.value;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const larguraCanvas = Math.max(
        canvas.clientWidth,
        1
    );

    const alturaCanvas = Math.max(
        canvas.clientHeight,
        1
    );

    const dpi = window.devicePixelRatio || 1;

    canvas.width = Math.round(
        larguraCanvas * dpi
    );

    canvas.height = Math.round(
        alturaCanvas * dpi
    );

    ctx.setTransform(
        dpi,
        0,
        0,
        dpi,
        0,
        0
    );

    ctx.clearRect(
        0,
        0,
        larguraCanvas,
        alturaCanvas
    );

    const dimensoes = obterDimensoes(
        props.design
    );

    /*
     * A página inteira é escalada para caber no espaço da miniatura.
     * A proporção original do slide é preservada.
     */
    const escala = Math.min(
        larguraCanvas / dimensoes.largura,
        alturaCanvas / dimensoes.altura
    );

    const larguraArte =
        dimensoes.largura * escala;

    const alturaArte =
        dimensoes.altura * escala;

    const deslocamentoX =
        (larguraCanvas - larguraArte) / 2;

    const deslocamentoY =
        (alturaCanvas - alturaArte) / 2;

    ctx.fillStyle = dimensoes.fundo;

    ctx.fillRect(
        0,
        0,
        larguraCanvas,
        alturaCanvas
    );

    ctx.save();

    ctx.translate(
        deslocamentoX,
        deslocamentoY
    );

    ctx.scale(
        escala,
        escala
    );

    const elementos = [
        ...obterElementos(props.design)
    ];

    elementos.sort(
        (a, b) =>
            (a.layer_order ?? 0) -
            (b.layer_order ?? 0)
    );

    for (const elemento of elementos) {
        if (versaoAtual !== versaoDesenho) {
            ctx.restore();
            return;
        }

        const tipo = elemento.type;

        const { x, y } = obterPosicao(
            elemento
        );

        const largura = obterLargura(
            elemento
        );

        const altura = obterAltura(
            elemento
        );

        ctx.save();

        if (tipo === "shape") {
            desenharForma(
                ctx,
                elemento
            );

        } else if (tipo === "image") {
            const url = obterUrlImagem(
                elemento
            );

            if (url) {
                const imagem = await carregarImagem(
                    url
                );

                if (
                    imagem &&
                    versaoAtual === versaoDesenho
                ) {
                    ctx.drawImage(
                        imagem,
                        x,
                        y,
                        largura,
                        altura
                    );
                }
            }

        } else if (
            tipo === "text" ||
            tipo === "title"
        ) {
            const tamanhoFonte = Number(
                elemento.font_size ||
                elemento.fontSize ||
                (
                    tipo === "title"
                        ? 32
                        : 18
                )
            );

            const familiaFonte =
                elemento.font_family || "Arial";

            const pesoFonte =
                elemento.font_weight || "normal";

            const estiloFonte =
                elemento.font_style || "normal";

            ctx.fillStyle =
                elemento.color || "#333333";

            ctx.font =
                `${estiloFonte} ${pesoFonte} ` +
                `${tamanhoFonte}px "${familiaFonte}"`;

            ctx.textBaseline = "top";

            ctx.textAlign =
                elemento.text_align || "left";

            const texto = String(
                elemento.content || ""
            );

            const linhas = texto.split("\n");

            let xTexto = x;

            if (ctx.textAlign === "center") {
                xTexto = x + largura / 2;

            } else if (ctx.textAlign === "right") {
                xTexto = x + largura;
            }

            linhas.forEach((linha, indice) => {
                ctx.fillText(
                    linha,
                    xTexto,
                    y + indice * tamanhoFonte * 1.2,
                    largura
                );
            });
        }

        ctx.restore();
    }

    ctx.restore();
}

function iniciarRenomeacao() {
    nomeEditado.value = nomeDesign();
    erro.value = "";
    editandoNome.value = true;
}

function cancelarRenomeacao() {
    editandoNome.value = false;
    nomeEditado.value = "";
    erro.value = "";
}

async function salvarNome() {
    const nome = nomeEditado.value.trim();

    if (!nome) {
        erro.value =
            "Digite um nome para o projeto.";
        return;
    }

    if (carregandoAcao.value) return;

    if (nome === nomeDesign()) {
        cancelarRenomeacao();
        return;
    }

    carregandoAcao.value = true;
    erro.value = "";

    try {
        const { data } =
            await designsApi.renomearDesign(
                props.design.id,
                nome
            );

        emit("updated", {
            ...props.design,
            ...data,
            name: data?.name || nome,
        });

        cancelarRenomeacao();

    } catch (error) {
        console.error(
            "Erro ao renomear design:",
            error
        );

        erro.value =
            error.response?.data?.name?.[0] ||
            error.response?.data?.detail ||
            "Não foi possível renomear o projeto.";

    } finally {
        carregandoAcao.value = false;
    }
}

async function alternarFavorito() {
    if (carregandoAcao.value) return;

    const valorAnterior = Boolean(
        props.design.importante
    );

    const novoValor = !valorAnterior;

    carregandoAcao.value = true;
    erro.value = "";

    try {
        await designsApi.marcarImportante(
            props.design.id,
            novoValor
        );

        emit("updated", {
            ...props.design,
            importante: novoValor,
        });

    } catch (error) {
        console.error(
            "Erro ao atualizar favorito:",
            error
        );

        erro.value =
            "Não foi possível atualizar o favorito.";

    } finally {
        carregandoAcao.value = false;
    }
}

function pedirConfirmacaoExclusao() {
    mostrarConfirmacao.value = true;
    erro.value = "";
}

function cancelarExclusao() {
    mostrarConfirmacao.value = false;
    erro.value = "";
}

async function excluirDesign() {
    if (carregandoAcao.value) return;

    carregandoAcao.value = true;
    erro.value = "";

    try {
        await designsApi.excluirDesign(
            props.design.id
        );

        mostrarConfirmacao.value = false;

        emit(
            "removed",
            props.design.id
        );

    } catch (error) {
        console.error(
            "Erro ao excluir design:",
            error
        );

        erro.value =
            error.response?.data?.detail ||
            "Não foi possível excluir o projeto.";

    } finally {
        carregandoAcao.value = false;
    }
}

function abrirDesign() {
    if (!props.clickable) return;

    emit("open", props.design);

    router.push(
        `/criar/${props.design.id}`
    );
}

watch(
    () => props.design,
    () => {
        desenharMiniatura();
    },
    { deep: true }
);

onMounted(async () => {
    await desenharMiniatura();

    if (
        typeof ResizeObserver !== "undefined"
    ) {
        resizeObserver = new ResizeObserver(() => {
            desenharMiniatura();
        });

        if (canvasElement.value?.parentElement) {
            resizeObserver.observe(
                canvasElement.value.parentElement
            );
        }
    }
});

onBeforeUnmount(() => {
    versaoDesenho++;
    resizeObserver?.disconnect();
});
</script>

<template>
    <article
        class="design-card"
        :class="{ clicavel: clickable }"
        @click="abrirDesign"
    >
        <div class="design-preview">
            <canvas
                ref="canvasElement"
                class="design-miniatura"
                :aria-label="`Miniatura de ${nomeDesign()}`"
            ></canvas>
        </div>

        <button
            v-if="showFavorite"
            class="btn-estrela"
            :class="{ ativa: design.importante }"
            :disabled="carregandoAcao"
            :title="
                design.importante
                    ? 'Remover dos favoritos'
                    : 'Adicionar aos favoritos'
            "
            :aria-label="
                design.importante
                    ? 'Remover dos favoritos'
                    : 'Adicionar aos favoritos'
            "
            @click.stop="alternarFavorito"
        >
            <ion-icon
                :name="
                    design.importante
                        ? 'star'
                        : 'star-outline'
                "
            ></ion-icon>
        </button>

        <div class="design-info">
            <form
                v-if="editandoNome"
                class="renomear-form"
                @click.stop
                @submit.prevent="salvarNome"
            >
                <span class="quantidade-paginas">
                    {{ quantidadePaginas }}
                    {{
                        quantidadePaginas === 1
                            ? "página"
                            : "páginas"
                    }}
                </span>

                <input
                    v-model="nomeEditado"
                    class="input-nome"
                    type="text"
                    maxlength="255"
                    aria-label="Nome do projeto"
                    autofocus
                    @keydown.esc="cancelarRenomeacao"
                />

                <button
                    type="submit"
                    class="acao-pequena salvar"
                    :disabled="carregandoAcao"
                    title="Salvar nome"
                >
                    <ion-icon name="checkmark-outline"></ion-icon>
                </button>

                <button
                    type="button"
                    class="acao-pequena"
                    title="Cancelar"
                    @click="cancelarRenomeacao"
                >
                    <ion-icon name="close-outline"></ion-icon>
                </button>
            </form>

            <template v-else>
                <div class="design-textos">
                    <span class="design-nome">
                        {{ nomeDesign() }}
                    </span>

                    <span
                        v-if="
                            showDescription &&
                            design.description
                        "
                        class="design-descricao"
                    >
                        {{ design.description }}
                    </span>
                </div>

                <div
                    class="acoes-card"
                    @click.stop
                >
                    <button
                        v-if="showRename"
                        class="acao-card"
                        title="Renomear projeto"
                        aria-label="Renomear projeto"
                        @click="iniciarRenomeacao"
                    >
                        <ion-icon name="create-outline"></ion-icon>
                    </button>

                    <button
                        v-if="showDelete"
                        class="acao-card excluir"
                        title="Excluir projeto"
                        aria-label="Excluir projeto"
                        @click="pedirConfirmacaoExclusao"
                    >
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </div>
            </template>
        </div>

        <p
            v-if="erro"
            class="erro-card"
            @click.stop
        >
            {{ erro }}
        </p>

        <div
            v-if="mostrarConfirmacao"
            class="modal-fundo"
            @click.stop
            @click.self="cancelarExclusao"
        >
            <section
                class="modal-confirmacao"
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-exclusao"
            >
                <h3 id="titulo-exclusao">
                    Excluir projeto?
                </h3>

                <p>
                    Tem certeza de que deseja excluir
                    <strong>{{ nomeDesign() }}</strong>?
                    Essa ação não poderá ser desfeita.
                </p>

                <div class="modal-acoes">
                    <button
                        class="botao-secundario"
                        :disabled="carregandoAcao"
                        @click="cancelarExclusao"
                    >
                        Cancelar
                    </button>

                    <button
                        class="botao-excluir"
                        :disabled="carregandoAcao"
                        @click="excluirDesign"
                    >
                        {{
                            carregandoAcao
                                ? "Excluindo..."
                                : "Excluir"
                        }}
                    </button>
                </div>
            </section>
        </div>
    </article>
</template>

<style scoped>
.design-card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    border: 1px solid var(--cor-borda);
    border-radius: 12px;
    background: var(--cor-card);
    color: var(--cor-texto);
}

.design-card.clicavel {
    cursor: pointer;
}

.design-preview {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: #ffffff;
}

.design-miniatura {
    display: block;
    width: 100%;
    height: 100%;
}

.btn-estrela {
    position: absolute;
    z-index: 2;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    color: #555555;
    font-size: 21px;
    cursor: pointer;
}

.btn-estrela.ativa {
    color: #ff7500;
}

.btn-estrela:disabled {
    opacity: 0.6;
    cursor: wait;
}

.design-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    min-height: 44px;
    padding: 9px 10px;
    box-sizing: border-box;
}

.design-textos {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
}

.design-nome {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.design-descricao {
    overflow: hidden;
    color: var(--cor-texto-secundario);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.acoes-card {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 5px;
}

.acao-card,
.acao-pequena {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cor-texto-secundario);
    cursor: pointer;
}

.acao-card {
    width: 24px;
    height: 28px;
    font-size: 17px;
}

.acao-card.excluir:hover {
    color: #d32f2f;
}

.renomear-form {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 100%;
}

.input-nome {
    flex: 1;
    min-width: 0;
    width: 100%;
    padding: 6px;
    border: 1px solid var(--cor-borda);
    border-radius: 5px;
    background: var(--cor-fundo);
    color: var(--cor-texto);
    font: inherit;
    font-size: 12px;
}

.acao-pequena {
    flex-shrink: 0;
    width: 25px;
    height: 25px;
    font-size: 17px;
}

.acao-pequena.salvar {
    color: #238636;
}

.erro-card {
    margin: 0;
    padding: 0 10px 10px;
    color: #c62828;
    font-size: 12px;
    line-height: 1.4;
}

.modal-fundo {
    position: fixed;
    z-index: 9999;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    background: rgb(0 0 0 / 45%);
    cursor: default;
}

.modal-confirmacao {
    width: 100%;
    max-width: 400px;
    padding: 24px;
    box-sizing: border-box;
    border: 1px solid var(--cor-borda);
    border-radius: 14px;
    background: var(--cor-card);
    color: var(--cor-texto);
    box-shadow: 0 12px 36px rgb(0 0 0 / 20%);
}

.modal-confirmacao h3 {
    margin: 0 0 12px;
    font-size: 19px;
}

.modal-confirmacao p {
    font-size: 14px;
    line-height: 1.5;
}

.modal-acoes {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
}

.quantidade-paginas {
    flex-shrink: 0;
    color: var(--cor-texto-secundario);
    font-size: 11px;
    white-space: nowrap;
}

.botao-secundario,
.botao-excluir {
    padding: 10px 16px;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    font: inherit;
    cursor: pointer;
}

.botao-secundario {
    background: var(--cor-fundo);
    color: var(--cor-texto);
}

.botao-excluir {
    border-color: #d32f2f;
    background: #d32f2f;
    color: #ffffff;
}

.botao-secundario:disabled,
.botao-excluir:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>