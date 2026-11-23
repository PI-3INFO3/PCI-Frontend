export function registrarFuncoesCriarEditorAdicionarImagemBiblioteca(editorContext) {
  editorContext.adicionarImagemBiblioteca = async function adicionarImagemBiblioteca(imagem) {
    const objeto = await editorContext.criarImagemFabric(imagem.url, {
      nomeCamada: imagem.description || 'Imagem'
    });
    const escala = Math.min(300 / (objeto.width || 1), 300 / (objeto.height || 1), 1);
    objeto.set({
      scaleX: escala,
      scaleY: escala,
      originX: 'left',
      originY: 'top',
      left: (editorContext.larguraDocumento.value - objeto.width * escala) / 2,
      top: (editorContext.alturaDocumento.value - objeto.height * escala) / 2
    });
    editorContext.fabricCanvas.add(objeto);
    editorContext.fabricCanvas.setActiveObject(objeto);
    editorContext.fabricCanvas.requestRenderAll();
    editorContext.registrarHistorico();
    editorContext.agendarSalvamento();
  };
  editorContext.agendarSalvamento = function agendarSalvamento() {
    if (!editorContext.designId.value || editorContext.carregandoDesign) return;
    editorContext.registrarHistorico();
    editorContext.salvamentoPendente = true;
    clearTimeout(editorContext.timerSalvamento);
    editorContext.timerSalvamento = setTimeout(() => {
      editorContext.executarAutosave();
    }, 800);
  };
  editorContext.executarAutosave = async function executarAutosave() {
    if (!editorContext.designId.value || !editorContext.fabricCanvas || editorContext.carregandoDesign) {
      return;
    }
    if (editorContext.salvando.value) {
      editorContext.salvamentoPendente = true;
      return;
    }
    if (!editorContext.salvamentoPendente) return;
    editorContext.salvamentoPendente = false;
    try {
      await editorContext.salvarDesign();
    } catch (erro) {
      console.error('[EDITOR] Erro no salvamento automático:', erro);
      editorContext.salvamentoPendente = true;
      clearTimeout(editorContext.timerSalvamento);
      editorContext.timerSalvamento = setTimeout(() => {
        editorContext.executarAutosave();
      }, 1500);
      return;
    }
    if (editorContext.salvamentoPendente) {
      clearTimeout(editorContext.timerSalvamento);
      editorContext.timerSalvamento = setTimeout(() => {
        editorContext.executarAutosave();
      }, 300);
    }
  };
  editorContext.selecionarCamada = function selecionarCamada(objeto) {
    if (!editorContext.fabricCanvas || !objeto) return;
    editorContext.fabricCanvas.setActiveObject(objeto);
    editorContext.objetoSelecionado.value = objeto;
    editorContext.fabricCanvas.requestRenderAll();
  };
  editorContext.atualizarOrdemDasCamadas = function atualizarOrdemDasCamadas() {
    if (!editorContext.fabricCanvas) return;
    editorContext.fabricCanvas.getObjects().forEach((objeto, index) => {
      objeto.layerOrder = index;
    });
    editorContext.manterFundoNoFundo();
    editorContext.atualizarListaCamadas();
    editorContext.fabricCanvas.requestRenderAll();
    editorContext.agendarSalvamento();
  };
  editorContext.moverCamadaParaCima = function moverCamadaParaCima(objeto) {
    if (!editorContext.fabricCanvas || !objeto) return;
    const objetoReal = editorContext.toRaw(objeto);
    const objetos = editorContext.fabricCanvas.getObjects();
    const indiceAtual = objetos.indexOf(objetoReal);
    if (indiceAtual === -1 || objetoReal.__editorBackground || indiceAtual >= objetos.length - 1) {
      return;
    }
    const alterou = editorContext.fabricCanvas.moveObjectTo(objetoReal, indiceAtual + 1);
    if (alterou) editorContext.atualizarOrdemDasCamadas();
  };
  editorContext.moverCamadaParaBaixo = function moverCamadaParaBaixo(objeto) {
    if (!editorContext.fabricCanvas || !objeto) return;
    const objetoReal = editorContext.toRaw(objeto);
    const objetos = editorContext.fabricCanvas.getObjects();
    const indiceAtual = objetos.indexOf(objetoReal);

    // O índice zero é sempre reservado ao fundo da página.
    if (indiceAtual <= 1 || objetoReal.__editorBackground) return;
    const alterou = editorContext.fabricCanvas.moveObjectTo(objetoReal, indiceAtual - 1);
    if (alterou) editorContext.atualizarOrdemDasCamadas();
  };
  editorContext.adicionarTexto = function adicionarTexto() {
    if (!editorContext.fabricCanvas) return;
    const texto = new editorContext.fabric.IText('Seu texto', {
      left: editorContext.larguraDocumento.value / 3,
      top: editorContext.alturaDocumento.value / 2,
      originX: 'left',
      originY: 'top',
      fontFamily: editorContext.fonteSelecionada.value,
      fontSize: Number(editorContext.tamanhoFonte.value) || 30,
      fill: editorContext.corTexto.value,
      fontWeight: editorContext.pesoTexto.value,
      fontStyle: editorContext.estiloTexto.value,
      textAlign: editorContext.alinhamentoTexto.value,
      borderColor: '#FF5700',
      cornerColor: '#FF5700',
      cornerSize: 10,
      transparentCorners: false,
      selectable: true,
      evented: true
    });
    editorContext.configurarObjeto(texto, 'Texto', 'texto');
    texto.elementType = 'text';
    editorContext.fabricCanvas.add(texto);
    editorContext.fabricCanvas.setActiveObject(texto);
    editorContext.fabricCanvas.bringObjectToFront(texto);
    texto.enterEditing();
    texto.selectAll();
    editorContext.fabricCanvas.requestRenderAll();
  };
  editorContext.atualizarAtributosTexto = function atualizarAtributosTexto() {
    if (!editorContext.fabricCanvas) return;
    const objeto = editorContext.fabricCanvas.getActiveObject();
    if (!editorContext.ehTexto(objeto)) return;
    objeto.set({
      fontSize: Number(editorContext.tamanhoFonte.value) || 30,
      fill: editorContext.corTexto.value,
      fontFamily: editorContext.fonteSelecionada.value,
      fontWeight: editorContext.pesoTexto.value,
      fontStyle: editorContext.estiloTexto.value,
      textAlign: editorContext.alinhamentoTexto.value
    });
    objeto.setCoords();
    editorContext.fabricCanvas.requestRenderAll();
    editorContext.atualizarListaCamadas();
    editorContext.agendarSalvamento();
  };
  editorContext.mudarFonteTexto = function mudarFonteTexto() {
    editorContext.atualizarAtributosTexto();
  };
  editorContext.mudarCorTextoPredefinida = function mudarCorTextoPredefinida(cor) {
    editorContext.corTexto.value = cor;
    editorContext.atualizarAtributosTexto();
  };
  editorContext.adicionarCorTexto = function adicionarCorTexto() {
    if (!editorContext.coresTexto.value.includes(editorContext.corTexto.value)) {
      editorContext.coresTexto.value.push(editorContext.corTexto.value);
    }
  };
  editorContext.configuracaoForma = function configuracaoForma(cor = '#FF5700') {
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
    };
  };
}