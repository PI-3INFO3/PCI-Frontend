export function registrarFuncoesCriarEditorInicializarCanvas(editorContext) {
  editorContext.inicializarCanvas = async function inicializarCanvas() {
    await editorContext.nextTick();
    if (!editorContext.canvasRef.value || !editorContext.canvasAreaRef.value) return;

    // Aguarda o layout do Vue e do navegador antes de medir o palco.
    await new Promise(resolve => requestAnimationFrame(resolve));
    const caixa = editorContext.canvasAreaRef.value.getBoundingClientRect();
    const largura = Math.floor(caixa.width);
    const altura = Math.floor(caixa.height);
    if (largura <= 0 || altura <= 0) {
      console.error('[EDITOR] A área do canvas ainda não tem dimensões válidas.');
      return;
    }
    editorContext.fabricCanvas = new editorContext.fabric.Canvas(editorContext.canvasRef.value, {
      width: largura,
      height: altura,
      backgroundColor: '#FFFFFF',
      preserveObjectStacking: true,
      selection: true,
      renderOnAddRemove: false
    });
    editorContext.fabricCanvas.on('selection:created', editorContext.lidarComSelecao);
    editorContext.fabricCanvas.on('selection:updated', editorContext.lidarComSelecao);
    editorContext.fabricCanvas.on('selection:cleared', () => {
      editorContext.objetoSelecionado.value = null;
      if (!['camadas', 'images', 'formas'].includes(editorContext.menuAtivoAcima.value)) {
        editorContext.menuAtivoAcima.value = 'nenhum';
      }
    });
    const atualizarEAvisar = () => {
      editorContext.atualizarListaCamadas();
      editorContext.registrarHistorico();
      if (!editorContext.carregandoDesign) {
        editorContext.agendarSalvamento();
      }
    };
    editorContext.fabricCanvas.on('object:added', atualizarEAvisar);
    editorContext.fabricCanvas.on('object:removed', atualizarEAvisar);
    editorContext.fabricCanvas.on('object:modified', evento => {
      editorContext.anguloSelecionado.value = Math.round(evento.target?.angle || 0);
      atualizarEAvisar();
    });
    editorContext.fabricCanvas.on('text:editing:exited', atualizarEAvisar);
    window.addEventListener('keydown', editorContext.lidarComTeclado);
    editorContext.resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        editorContext.ajustarVisualizacaoCanvas();
      });
    });
    editorContext.resizeObserver.observe(editorContext.canvasAreaRef.value);
    if (editorContext.designId.value) {
      try {
        const data = (await editorContext.designsApi.obterDesign(editorContext.designId.value, true)).data;
        await editorContext.popularCanvasComDesign(data);
        editorContext.mostrarUpload.value = false;
      } catch (erro) {
        console.error('[EDITOR] Erro ao carregar design:', erro);
        editorContext.erroUpload.value = 'Não foi possível carregar este design.';
      }
    } else {
      editorContext.ajustarVisualizacaoCanvas();
    }
  };
  editorContext.lidarComSelecao = function lidarComSelecao(evento) {
    const objeto = evento?.selected?.[0] || editorContext.fabricCanvas?.getActiveObject();
    editorContext.objetoSelecionado.value = objeto || null;
    editorContext.anguloSelecionado.value = Math.round(Number(objeto?.angle || 0));
    if (editorContext.ehTexto(objeto)) {
      editorContext.menuAtivoAcima.value = 'texto';
      editorContext.tamanhoFonte.value = Number(objeto.fontSize || 30);
      editorContext.corTexto.value = objeto.fill || '#ffffff';
      editorContext.fonteSelecionada.value = objeto.fontFamily || 'Poppins';
      editorContext.pesoTexto.value = objeto.fontWeight || 'normal';
      editorContext.estiloTexto.value = objeto.fontStyle || 'normal';
      editorContext.alinhamentoTexto.value = objeto.textAlign || 'left';
    } else if (editorContext.ehForma(objeto)) {
      editorContext.menuAtivoAcima.value = 'formas';
    } else if (objeto?.type === 'image') {
      editorContext.menuAtivoAcima.value = 'images';
    }
    editorContext.atualizarListaCamadas();
  };
  editorContext.clicarTextoNoFooter = function clicarTextoNoFooter() {
    if (editorContext.menuAtivoAcima.value === 'texto' && editorContext.ehTextoSelecionado.value) {
      return;
    }
    editorContext.menuAtivoAcima.value = 'texto';
    if (!editorContext.ehTexto(editorContext.fabricCanvas?.getActiveObject())) {
      editorContext.adicionarTexto();
    }
  };
  editorContext.clicarImagesNoFooter = function clicarImagesNoFooter() {
    if (editorContext.menuAtivoAcima.value !== 'images' && !editorContext.imagensBiblioteca.value.length) {
      editorContext.carregarImagensBiblioteca();
    }
    editorContext.menuAtivoAcima.value = editorContext.menuAtivoAcima.value === 'images' ? 'nenhum' : 'images';
  };
  editorContext.clicarFormasNoFooter = function clicarFormasNoFooter() {
    if (!editorContext.simbolosDisponiveis.value.length) editorContext.carregarSimbolos();
    editorContext.menuAtivoAcima.value = editorContext.menuAtivoAcima.value === 'formas' ? 'nenhum' : 'formas';
  };
  editorContext.clicarCamadasNoFooter = function clicarCamadasNoFooter() {
    editorContext.menuAtivoAcima.value = editorContext.menuAtivoAcima.value === 'camadas' ? 'nenhum' : 'camadas';
    editorContext.atualizarListaCamadas();
  };
  editorContext.configurarUidCamada = function configurarUidCamada(objeto) {
    if (!objeto.clientId) {
      objeto.clientId = crypto.randomUUID();
    }
    if (!objeto.__uid) {
      objeto.__uid = objeto.clientId;
    }
    return objeto;
  };
  editorContext.rotuloDoObjeto = function rotuloDoObjeto(objeto) {
    if (editorContext.ehTexto(objeto)) {
      const texto = objeto.text?.trim();
      return texto ? texto.slice(0, 24) : objeto.elementType === 'title' ? 'Título' : 'Texto';
    }
    if (objeto?.type === 'image') {
      return objeto.nomeCamada || 'Imagem';
    }
    if (editorContext.ehSimbolo(objeto)) return objeto.nomeCamada || 'Símbolo';
    if (objeto?.type === 'rect') {
      return objeto.nomeCamada || 'Retângulo';
    }
    if (objeto?.type === 'circle') {
      return objeto.nomeCamada || 'Círculo';
    }
    if (objeto?.type === 'triangle') {
      return objeto.nomeCamada || 'Triângulo';
    }
    if (objeto?.type === 'polygon') {
      return objeto.nomeCamada || 'Forma';
    }
    return objeto?.nomeCamada || 'Elemento';
  };
  editorContext.gerarMiniatura = function gerarMiniatura(objeto) {
    if (objeto.type === 'image') return objeto.getSrc();
    const assinatura = JSON.stringify([
      objeto.text, objeto.fill, objeto.width, objeto.height,
      objeto.scaleX, objeto.scaleY, objeto.angle, objeto.stroke
    ]);
    const cached = editorContext.miniaturasCache.get(objeto);
    if (cached?.assinatura === assinatura) return cached.valor;
    try {
      const valor = objeto.toDataURL({
        format: 'png',
        multiplier: 0.25
      });
      editorContext.miniaturasCache.set(objeto, {
        assinatura,
        valor
      });
      return valor;
    } catch {
      return null;
    }
  };
  editorContext.atualizarListaCamadas = function atualizarListaCamadas() {
    if (!editorContext.fabricCanvas) return;
    editorContext.camadas.value = editorContext.obterObjetosUnicos().reverse().map(objeto => {
      editorContext.configurarUidCamada(objeto);
      return {
        objeto,
        thumbnail: editorContext.gerarMiniatura(objeto)
      };
    });
  };
  editorContext.capturarEstadoAtual = function capturarEstadoAtual() {
    if (!editorContext.fabricCanvas) return null;
    return JSON.stringify(editorContext.obterObjetosUnicos().map((objeto, index) => {
      const elemento = editorContext.objetoFabricParaElemento(objeto);
      return elemento ? {
        ...elemento,
        layer_order: index
      } : null;
    }).filter(Boolean));
  };
  editorContext.reiniciarHistorico = function reiniciarHistorico() {
    editorContext.historico.length = 0;
    editorContext.refazerHistorico.length = 0;
    const estado = editorContext.capturarEstadoAtual();
    if (estado !== null) editorContext.historico.push(estado);
  };
  editorContext.registrarHistorico = function registrarHistorico() {
    if (!editorContext.fabricCanvas || editorContext.carregandoDesign || editorContext.restaurandoHistorico) return;
    const estado = editorContext.capturarEstadoAtual();
    if (estado === null || estado === editorContext.historico[editorContext.historico.length - 1]) return;
    editorContext.historico.push(estado);
    if (editorContext.historico.length > editorContext.LIMITE_HISTORICO) editorContext.historico.shift();
    editorContext.refazerHistorico.length = 0;
  };
}