import { Path } from 'fabric';
import mediaApi from '@/api/mediaApi';

function carregarImagem(fonte) {
    return new Promise(resolve => {
        const imagem = new Image();

        imagem.onload = () => resolve(imagem);
        imagem.onerror = () => resolve(null);
        imagem.src = fonte;
    });
}

export function registrarRenderizadorMiniaturas(editor) {
    const carregarElementosOriginal = editor.obterElementos;
    const imagensCache = new Map();

    editor.obterElementos = function obterElementos(design) {
        const pagina = editor.obterPagina(design);

        const elementosPagina = Array.isArray(pagina?.elements)
            ? pagina.elements
            : [];

        const elementosRaiz = Array.isArray(design.elements)
            ? design.elements
            : [];

        if (elementosPagina.length) return elementosPagina;
        if (elementosRaiz.length) return elementosRaiz;

        return carregarElementosOriginal(design);
    };

    async function imagemDoElemento(elemento) {
        const url = editor.obterUrlImagem(elemento);
        const fonte = editor.resolverUrlImagem(url);

        if (!fonte) return null;

        if (!imagensCache.has(fonte)) {
            const promessa = (async () => {
                const imagemPrivada =
                    /\/api\/editor-images\/\d+\/content\/?(?:[?#].*)?$/.test(fonte);

                if (!imagemPrivada) {
                    return carregarImagem(fonte);
                }

                const resposta = await mediaApi.obterImagemPrivada(fonte);
                const objetoUrl = URL.createObjectURL(resposta.data);

                try {
                    return await carregarImagem(objetoUrl);
                } finally {
                    URL.revokeObjectURL(objetoUrl);
                }
            })().catch(() => null);

            imagensCache.set(fonte, promessa);
        }

        return imagensCache.get(fonte);
    }

    function desenharSimbolo(ctx, elemento, largura, altura) {
        const caminho = elemento.symbol_data?.path_data;

        if (!caminho) return;

        const geometria = new Path(caminho);

        const larguraOriginal = Math.max(geometria.width || 0, 1);
        const alturaOriginal = Math.max(geometria.height || 0, 1);

        const minimoX =
            geometria.pathOffset.x - (geometria.width || 0) / 2;

        const minimoY =
            geometria.pathOffset.y - (geometria.height || 0) / 2;

        ctx.save();

        ctx.scale(
            largura / larguraOriginal,
            altura / alturaOriginal
        );

        ctx.translate(-minimoX, -minimoY);

        ctx.fillStyle = elemento.color || '#FF5700';

        const forma = new Path2D(caminho);

        ctx.fill(forma);

        if (
            elemento.stroke_color &&
            Number(elemento.stroke_width) > 0
        ) {
            ctx.strokeStyle = elemento.stroke_color;
            ctx.lineWidth = Number(elemento.stroke_width);
            ctx.stroke(forma);
        }

        ctx.restore();
    }

    function desenharTexto(ctx, elemento, largura) {
        const titulo = elemento.type === 'title';
        const tamanho = Number(
            elemento.font_size || (titulo ? 32 : 18)
        );

        const familia = elemento.font_family || 'Arial';
        const peso = elemento.font_weight || 'normal';
        const estilo = elemento.font_style || 'normal';
        const alinhamento = elemento.text_align || 'left';

        ctx.fillStyle = elemento.color || '#333333';

        ctx.font = `${estilo} ${peso} ${tamanho}px "${familia}"`;
        ctx.textBaseline = 'top';
        ctx.textAlign = alinhamento;

        const deslocamento = alinhamento === 'center'
            ? largura / 2
            : alinhamento === 'right' ? largura : 0;

        String(elemento.content || '')
            .split('\n')
            .forEach((linha, indice) => {
                ctx.fillText(
                    linha,
                    deslocamento,
                    indice * tamanho * 1.2,
                    largura
                );
            });
    }

    editor.desenharMiniatura = async function desenharMiniatura() {
        const versao = ++editor.versaoDesenho;

        await editor.nextTick();

        const canvas = editor.canvasElement.value;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const larguraCanvas = Math.max(canvas.clientWidth, 1);
        const alturaCanvas = Math.max(canvas.clientHeight, 1);

        const dimensoes = editor.obterDimensoes(editor.props.design);

        const elementos = [...editor.obterElementos(editor.props.design)]
            .sort((a, b) => {
                return (a.layer_order ?? 0) - (b.layer_order ?? 0);
            });

        const imagens = await Promise.all(
            elementos.map(elemento => {
                return elemento.type === 'image'
                    ? imagemDoElemento(elemento)
                    : null;
            })
        );

        if (versao !== editor.versaoDesenho) return;

        const dpi = window.devicePixelRatio || 1;

        canvas.width = Math.round(larguraCanvas * dpi);
        canvas.height = Math.round(alturaCanvas * dpi);

        ctx.setTransform(dpi, 0, 0, dpi, 0, 0);

        ctx.fillStyle = dimensoes.fundo;
        ctx.fillRect(0, 0, larguraCanvas, alturaCanvas);

        const escala = Math.min(
            larguraCanvas / dimensoes.largura,
            alturaCanvas / dimensoes.altura
        );

        ctx.save();

        ctx.translate(
            (larguraCanvas - dimensoes.largura * escala) / 2,
            (alturaCanvas - dimensoes.altura * escala) / 2
        );

        ctx.scale(escala, escala);

        elementos.forEach((elemento, indice) => {
            const posicao = editor.obterPosicao(elemento);
            const largura = editor.obterLargura(elemento);
            const altura = editor.obterAltura(elemento);

            const angulo =
                (Number(elemento.rotation) || 0) * Math.PI / 180;

            ctx.save();

            // Utiliza a mesma origem de rotação do Fabric.js.
            ctx.translate(posicao.x, posicao.y);
            ctx.rotate(angulo);

            try {
                if (elemento.type === 'shape') {
                    editor.desenharForma(ctx, {
                        ...elemento,
                        posicao_x: 0,
                        posicao_y: 0
                    });
                } else if (
                    elemento.type === 'image' &&
                    imagens[indice]
                ) {
                    ctx.drawImage(
                        imagens[indice],
                        0,
                        0,
                        largura,
                        altura
                    );
                } else if (elemento.type === 'symbol') {
                    desenharSimbolo(
                        ctx,
                        elemento,
                        largura,
                        altura
                    );
                } else if (
                    elemento.type === 'text' ||
                    elemento.type === 'title'
                ) {
                    desenharTexto(ctx, elemento, largura);
                }
            } catch (erro) {
                console.error(
                    '[MINIATURA] Não foi possível desenhar um elemento:',
                    erro
                );
            } finally {
                ctx.restore();
            }
        });

        ctx.restore();
    };
}