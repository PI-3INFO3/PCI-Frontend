import { desenharTextoMiniatura } from './helpers-miniatura-powerpoint.js';

export function registrarFuncoesDesignCardDesenharMiniatura(editorContext) {
  editorContext.desenharMiniatura = async function desenharMiniatura() {
    const versaoAtual = ++editorContext.versaoDesenho;
    await editorContext.nextTick();
    const canvas = editorContext.canvasElement.value;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const larguraCanvas = Math.max(canvas.clientWidth, 1);
    const alturaCanvas = Math.max(canvas.clientHeight, 1);
    const dpi = window.devicePixelRatio || 1;
    canvas.width = Math.round(larguraCanvas * dpi);
    canvas.height = Math.round(alturaCanvas * dpi);
    ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
    ctx.clearRect(0, 0, larguraCanvas, alturaCanvas);
    const dimensoes = editorContext.obterDimensoes(editorContext.props.design);

    /*
     * A página inteira é escalada para caber no espaço da miniatura.
     * A proporção original do slide é preservada.
     */
    const escala = Math.min(larguraCanvas / dimensoes.largura, alturaCanvas / dimensoes.altura);
    const larguraArte = dimensoes.largura * escala;
    const alturaArte = dimensoes.altura * escala;
    const deslocamentoX = (larguraCanvas - larguraArte) / 2;
    const deslocamentoY = (alturaCanvas - alturaArte) / 2;
    ctx.fillStyle = dimensoes.fundo;
    ctx.fillRect(0, 0, larguraCanvas, alturaCanvas);
    ctx.save();
    ctx.translate(deslocamentoX, deslocamentoY);
    ctx.scale(escala, escala);
    const elementos = [...editorContext.obterElementos(editorContext.props.design)];
    elementos.sort((a, b) => (a.layer_order ?? 0) - (b.layer_order ?? 0));
    for (const elemento of elementos) {
      if (versaoAtual !== editorContext.versaoDesenho) {
        ctx.restore();
        return;
      }
      const tipo = elemento.type;
      const posicao = editorContext.obterPosicao(elemento);
      const x = posicao.x;
      const y = posicao.y;
      const largura = editorContext.obterLargura(elemento);
      const altura = editorContext.obterAltura(elemento);
      ctx.save();
      // O importador grava o canto da forma não rotacionada e o ângulo.
      // Assim como o Fabric, o Canvas precisa girar cada objeto nessa origem.
      const angulo = Number(elemento.rotation || 0);
      if (angulo) {
        ctx.translate(x, y);
        ctx.rotate(angulo * Math.PI / 180);
        ctx.translate(-x, -y);
      }
      if (tipo === 'shape') {
        editorContext.desenharForma(ctx, elemento);
      } else if (tipo === 'image') {
        const url = editorContext.obterUrlImagem(elemento);
        if (url) {
          const imagem = await editorContext.carregarImagem(url);
          if (imagem && versaoAtual === editorContext.versaoDesenho) {
            ctx.drawImage(imagem, x, y, largura, altura);
          }
        }
      } else if (tipo === 'text' || tipo === 'title') {
        desenharTextoMiniatura(ctx, elemento, { x, y, largura, altura });
      }
      ctx.restore();
    }
    ctx.restore();
  };
  editorContext.iniciarRenomeacao = function iniciarRenomeacao() {
    editorContext.nomeEditado.value = editorContext.nomeDesign();
    editorContext.erro.value = "";
    editorContext.editandoNome.value = true;
  };
  editorContext.cancelarRenomeacao = function cancelarRenomeacao() {
    editorContext.editandoNome.value = false;
    editorContext.nomeEditado.value = "";
    editorContext.erro.value = "";
  };
  editorContext.salvarNome = async function salvarNome() {
    const nome = editorContext.nomeEditado.value.trim();
    if (!nome) {
      editorContext.erro.value = "Digite um nome para o projeto.";
      return;
    }
    if (editorContext.carregandoAcao.value) return;
    if (nome === editorContext.nomeDesign()) {
      editorContext.cancelarRenomeacao();
      return;
    }
    editorContext.carregandoAcao.value = true;
    editorContext.erro.value = "";
    try {
      const data = (await editorContext.designsApi.renomearDesign(editorContext.props.design.id, nome)).data;
      editorContext.emit("updated", {
        ...editorContext.props.design,
        ...data,
        name: data?.name || nome
      });
      editorContext.cancelarRenomeacao();
    } catch (error) {
      console.error("Erro ao renomear design:", error);
      editorContext.erro.value = (
        error.response?.data?.name?.[0] ||
        error.response?.data?.detail ||
        'Não foi possível renomear o projeto.'
      );
    } finally {
      editorContext.carregandoAcao.value = false;
    }
  };
  editorContext.alternarFavorito = async function alternarFavorito() {
    if (editorContext.carregandoAcao.value) return;
    const valorAnterior = Boolean(editorContext.props.design.importante);
    const novoValor = !valorAnterior;
    editorContext.carregandoAcao.value = true;
    editorContext.erro.value = "";
    try {
      await editorContext.designsApi.marcarImportante(editorContext.props.design.id, novoValor);
      editorContext.emit("updated", {
        ...editorContext.props.design,
        importante: novoValor
      });
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
      editorContext.erro.value = "Não foi possível atualizar o favorito.";
    } finally {
      editorContext.carregandoAcao.value = false;
    }
  };
  editorContext.pedirConfirmacaoExclusao = function pedirConfirmacaoExclusao() {
    editorContext.mostrarConfirmacao.value = true;
    editorContext.erro.value = "";
  };
  editorContext.cancelarExclusao = function cancelarExclusao() {
    editorContext.mostrarConfirmacao.value = false;
    editorContext.erro.value = "";
  };
  editorContext.excluirDesign = async function excluirDesign() {
    if (editorContext.carregandoAcao.value) return;
    editorContext.carregandoAcao.value = true;
    editorContext.erro.value = "";
    try {
      await editorContext.designsApi.excluirDesign(editorContext.props.design.id);
      editorContext.mostrarConfirmacao.value = false;
      editorContext.emit("removed", editorContext.props.design.id);
    } catch (error) {
      console.error("Erro ao excluir design:", error);
      editorContext.erro.value = error.response?.data?.detail || "Não foi possível excluir o projeto.";
    } finally {
      editorContext.carregandoAcao.value = false;
    }
  };
  editorContext.abrirDesign = function abrirDesign() {
    if (!editorContext.props.clickable) return;
    editorContext.emit("open", editorContext.props.design);
    editorContext.router.push(`/criar/${editorContext.props.design.id}`);
  };
}