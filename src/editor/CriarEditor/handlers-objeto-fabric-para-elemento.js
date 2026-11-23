export function registrarFuncoesCriarEditorObjetoFabricParaElemento(editorContext) {
  editorContext.objetoFabricParaElemento = function objetoFabricParaElemento(objeto) {
    if (objeto.__editorBackground) return null;
    editorContext.configurarUidCamada(objeto);
    const escalaX = objeto.scaleX ?? 1;
    const escalaY = objeto.scaleY ?? 1;
    const base = {
      id: objeto.elementId ?? null,
      client_id: objeto.clientId,
      rotation: ((Number(objeto.angle) || 0) % 360 + 360) % 360,
      posicao_x: Math.round(
        (objeto.left ?? 0) - (
          editorContext.ehTexto(objeto) ? objeto.editorPositionOffsetX || 0 : 0
        )
      ),
      posicao_y: Math.round(objeto.top ?? 0),
      width: Math.round(
        editorContext.ehTexto(objeto) && objeto.editorOriginalWidth
          ? objeto.editorOriginalWidth * (
            escalaX / Math.max(objeto.editorInitialScaleX || 1, 0.0001)
          )
          : (objeto.width ?? 0) * escalaX
      ),
      heigth: Math.round((objeto.height ?? 0) * escalaY)
    };
    if (editorContext.ehTexto(objeto)) {
      return {
        ...base,
        type: objeto.elementType === 'title' ? 'title' : 'text',
        content: objeto.text || '',
        color: typeof objeto.fill === 'string' ? objeto.fill : '#ffffff',
        font_size: Math.round(Number(objeto.fontSize || 30)),
        font_family: objeto.fontFamily || 'Poppins',
        font_weight: objeto.fontWeight || 'normal',
        font_style: objeto.fontStyle || 'normal',
        underline: Boolean(objeto.underline),
        text_align: objeto.textAlign || 'left'
      };
    }
    if (editorContext.ehSimbolo(objeto)) {
      return {
        ...base,
        type: 'symbol',
        symbol: objeto.symbolId,
        color: typeof objeto.fill === 'string' ? objeto.fill : '#FF5700',
        stroke_color: objeto.stroke || '',
        stroke_width: Number(objeto.strokeWidth || 0),
        content: ''
      };
    }
    if (objeto.type === 'image') {
      return {
        ...base,
        type: 'image',
        content: objeto.originalMediaUrl || objeto.getSrc(),
        color: ''
      };
    }
    if (editorContext.ehForma(objeto)) {
      return {
        ...base,
        type: 'shape',
        shape_type: objeto.shapeType || (objeto.type === 'polygon' ? 'star' : objeto.type),
        stroke_width: Number(objeto.strokeWidth || 0),
        stroke_color: objeto.stroke || '',
        color: typeof objeto.fill === 'string' ? objeto.fill : '#FF5700',
        content: ''
      };
    }
    return null;
  };
  editorContext.salvarDesign = async function salvarDesign() {
    if (!editorContext.fabricCanvas || !editorContext.designId.value || editorContext.salvando.value) {
      return;
    }
    editorContext.salvando.value = true;
    try {
      const elementos = editorContext.obterObjetosUnicos().map((objeto, index) => {
        const elemento = editorContext.objetoFabricParaElemento(objeto);
        return elemento ? {
          ...elemento,
          layer_order: index
        } : null;
      }).filter(Boolean);
      const idPagina = editorContext.paginaAtual.value?.id ?? null;

      /*
       * designsApi.salvarElementos precisa receber o terceiro
       * argumento pageId e enviá-lo no payload como page_id.
       */
      const respostaSalvamento = await editorContext.designsApi.salvarElementos(
        editorContext.designId.value,
        elementos,
        idPagina
      );
      const data = respostaSalvamento.data;
      let elementosSalvos = data.elements || [];
      if (data.page_id && elementosSalvos) {
        const index = editorContext.paginas.value.findIndex(p => String(p.id) === String(data.page_id));
        if (index >= 0) {
          editorContext.paginas.value[index] = {
            ...editorContext.paginas.value[index],
            elements: elementosSalvos
          };
        }
        if (editorContext.design.value) editorContext.design.value.pages = editorContext.paginas.value;
      } else if (Array.isArray(data.pages)) {
        editorContext.paginas.value = data.pages.map(editorContext.normalizarDimensoesPagina);
        const paginaAtual = editorContext.paginas.value[editorContext.paginaAtualIndex.value];
        elementosSalvos = paginaAtual?.elements || data.elements || [];
      }
      const porClientId = new Map(
        elementosSalvos
          .filter(elemento => elemento.client_id)
          .map(elemento => [elemento.client_id, elemento])
      );
      editorContext.fabricCanvas.getObjects().forEach(objeto => {
        const salvo = objeto.clientId ? porClientId.get(objeto.clientId) : null;
        if (salvo) {
          objeto.elementId = salvo.id;
        }
      });
      if (!data.page_id) editorContext.design.value = data;
    } catch (erro) {
      console.error('[EDITOR] Erro ao salvar design:', erro);
      throw erro;
    } finally {
      editorContext.salvando.value = false;
    }
  };
  editorContext.trocarPagina = async function trocarPagina(indice) {
    const indiceInvalido = indice < 0 || indice >= editorContext.paginas.value.length;
    const paginaAtual = indice === editorContext.paginaAtualIndex.value;
    const editorOcupado = (
      editorContext.salvando.value ||
      editorContext.carregandoDesign ||
      editorContext.trocandoPagina
    );
    if (indiceInvalido || paginaAtual || editorOcupado || !editorContext.fabricCanvas) {
      return;
    }
    editorContext.trocandoPagina = true;
    try {
      if (editorContext.timerSalvamento) {
        clearTimeout(editorContext.timerSalvamento);
        editorContext.timerSalvamento = null;
      }
      editorContext.salvamentoPendente = false;
      if (editorContext.designId.value && editorContext.fabricCanvas) {
        await editorContext.salvarDesign();
      }

      // O canvas pode ser desmontado enquanto salvarDesign aguarda a API.
      if (!editorContext.fabricCanvas) return;
      await editorContext.popularCanvasComDesign(editorContext.design.value, indice);
    } finally {
      editorContext.trocandoPagina = false;
    }
  };
  editorContext.irParaPaginaAnterior = function irParaPaginaAnterior() {
    editorContext.trocarPagina(editorContext.paginaAtualIndex.value - 1);
  };
  editorContext.irParaProximaPagina = function irParaProximaPagina() {
    editorContext.trocarPagina(editorContext.paginaAtualIndex.value + 1);
  };
  editorContext.deletarSelecionado = function deletarSelecionado() {
    if (!editorContext.fabricCanvas) return;
    const objeto = editorContext.fabricCanvas.getActiveObject();
    if (!objeto) return;
    const objetos = objeto.type === 'activeselection' ? objeto.getObjects() : [objeto];
    editorContext.fabricCanvas.discardActiveObject();
    objetos.forEach(alvo => editorContext.fabricCanvas.remove(alvo));
    editorContext.objetoSelecionado.value = null;
    editorContext.menuAtivoAcima.value = 'nenhum';
    editorContext.atualizarListaCamadas();
    editorContext.fabricCanvas.requestRenderAll();
    editorContext.agendarSalvamento();
  };
  editorContext.lidarComTeclado = function lidarComTeclado(evento) {
    const tag = evento.target?.tagName?.toLowerCase();
    const digitandoEmControle = ['input', 'textarea', 'select'].includes(tag) || evento.target?.isContentEditable;
    const ativo = editorContext.fabricCanvas?.getActiveObject();
    if (digitandoEmControle || editorContext.ehTexto(ativo) && ativo.isEditing) return;
    const comando = evento.ctrlKey || evento.metaKey;
    const tecla = evento.key.toLowerCase();
    if (comando) {
      const acoes = {
        z: evento.shiftKey ? editorContext.refazer : editorContext.desfazer,
        y: editorContext.refazer,
        c: editorContext.copiarSelecionado,
        x: editorContext.recortarSelecionado,
        v: editorContext.colarSelecionado,
        d: editorContext.duplicarSelecionado,
        a: editorContext.selecionarTudo,
        s: editorContext.salvarDesign,
        b: () => editorContext.alternarEstiloTexto('bold'),
        i: () => editorContext.alternarEstiloTexto('italic'),
        u: () => editorContext.alternarEstiloTexto('underline')
      };
      if (acoes[tecla]) {
        evento.preventDefault();
        acoes[tecla]();
      }
      return;
    }
    if (tecla === 'delete' || tecla === 'backspace') {
      evento.preventDefault();
      editorContext.deletarSelecionado();
    } else if (tecla === 'escape') {
      editorContext.fabricCanvas?.discardActiveObject();
      editorContext.fabricCanvas?.requestRenderAll();
    } else if (tecla.startsWith('arrow') && ativo && !ativo.__editorBackground) {
      evento.preventDefault();
      const passo = evento.shiftKey ? 10 : 1;
      const dx = tecla === 'arrowleft' ? -passo : tecla === 'arrowright' ? passo : 0;
      const dy = tecla === 'arrowup' ? -passo : tecla === 'arrowdown' ? passo : 0;
      ativo.set({
        left: (ativo.left || 0) + dx,
        top: (ativo.top || 0) + dy
      });
      ativo.setCoords();
      editorContext.fabricCanvas.requestRenderAll();
      editorContext.agendarSalvamento();
    }
  };
  editorContext.alternarEstiloTexto = function alternarEstiloTexto(estilo) {
    const objeto = editorContext.fabricCanvas?.getActiveObject();
    if (!editorContext.ehTexto(objeto)) return;
    if (estilo === 'underline') objeto.set('underline', !objeto.underline);
    if (estilo === 'bold') objeto.set('fontWeight', objeto.fontWeight === 'bold' ? 'normal' : 'bold');
    if (estilo === 'italic') objeto.set('fontStyle', objeto.fontStyle === 'italic' ? 'normal' : 'italic');
    objeto.setCoords();
    editorContext.fabricCanvas.requestRenderAll();
    editorContext.agendarSalvamento();
  };
  editorContext.voltarParaPaginaAnterior = function voltarParaPaginaAnterior() {
    if (window.history.state?.back) {
      editorContext.router.back();
    } else {
      editorContext.router.push('/');
    }
  };
}