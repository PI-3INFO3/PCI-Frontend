export function registrarFuncoesCriarEditorManterFundoNoFundo(editorContext) {
  editorContext.manterFundoNoFundo = function manterFundoNoFundo() {
    if (!editorContext.fabricCanvas) return;
    const fundo = editorContext.fabricCanvas.getObjects().find(objeto => objeto.__editorBackground);
    if (fundo) {
      editorContext.fabricCanvas.sendObjectToBack(fundo);
    }
  };

  editorContext.atualizarRecorteDaPagina = function atualizarRecorteDaPagina() {
    if (!editorContext.fabricCanvas) return;
  
    // Sem clipPath: as bordas nativas do canvas coincidem com as da página.
    // Isso evita o recorte se deslocar ou ser aplicado duas vezes no zoom.
    editorContext.fabricCanvas.clipPath = null;
  };

  editorContext.normalizarDimensoesPagina = function normalizarDimensoesPagina(pagina) {
    const largura = Math.max(Number(pagina.width) || 1080, 1);
    const altura = Math.max(Number(pagina.height) || 1080, 1);
    const elementos = Array.isArray(pagina.elements) ? pagina.elements : [];

    // Os slides importados pelo extrator PPTX atual já têm dimensões reais.
    // Não recalcule o tamanho do slide com base nos objetos encontrados.
    const nomePagina = String(pagina.name || '').trim();
    if (/^slide\s+\d+$/i.test(nomePagina)) {
      return { ...pagina, width: largura, height: altura };
    }

    // Evita redimensionar um documento antigo que contém uma imagem de
    // fundo ocupando a página; elementos externos não definem seu tamanho.
    const possuiImagemDeFundo = elementos.some(elemento => {
      if (elemento.type !== 'image') return false;
      const x = Number(elemento.posicao_x ?? elemento.x ?? 0);
      const y = Number(elemento.posicao_y ?? elemento.y ?? 0);
      const w = Number(elemento.width ?? 0);
      const h = Number(elemento.heigth ?? elemento.height ?? 0);
      return Math.abs(x) <= largura * 0.03 &&
        Math.abs(y) <= altura * 0.03 &&
        w >= largura * 0.93 && w <= largura * 1.07 &&
        h >= altura * 0.93 && h <= altura * 1.07;
    });
    if (possuiImagemDeFundo) {
      return { ...pagina, width: largura, height: altura };
    }

    // Compatibilidade apenas para os designs antigos sem tamanho confiável.
    // Designs importados antigos guardaram 960x540, mas seus elementos
    // continuam nas coordenadas nativas 1920x1080. Não dependemos do nome
    // da página, porque a API pode chamá-la de "Página 1" ou outro nome.
    const limiteX = elementos.reduce((maximo, elemento) => {
      const x = Number(elemento.posicao_x ?? elemento.x ?? 0);
      const w = Math.max(Number(elemento.width ?? 0), 0);
      return Math.max(maximo, x + w);
    }, largura);
    const limiteY = elementos.reduce((maximo, elemento) => {
      const y = Number(elemento.posicao_y ?? elemento.y ?? 0);
      const h = Math.max(Number(elemento.heigth ?? elemento.height ?? 0), 0);
      return Math.max(maximo, y + h);
    }, altura);
    const fatorX = limiteX / largura;
    const fatorY = limiteY / altura;
    const proporcao = largura / altura;
    const fatoresCompatíveis = Math.abs(fatorX - fatorY) < 0.55;
    const fatorEstimado = Math.round((fatorX + fatorY) / 2);
    const dimensoesIncompatíveis = (
      proporcao > 1.5 && proporcao < 2.05 &&
      fatorX > 1.45 && fatorY > 1.45 &&
      fatoresCompatíveis &&
      fatorEstimado >= 2 && fatorEstimado <= 3 &&
      Math.abs(fatorX - fatorEstimado) < 0.55 &&
      Math.abs(fatorY - fatorEstimado) < 0.55
    );
    if (dimensoesIncompatíveis) {
      console.warn(
        '[EDITOR] Dimensões da página normalizadas pelas coordenadas dos elementos:',
        pagina.name || 'Página sem nome',
        `${largura}x${altura} -> ${largura * fatorEstimado}x${altura * fatorEstimado}`
      );
      return {
        ...pagina,
        width: largura * fatorEstimado,
        height: altura * fatorEstimado
      };
    }
    return {
      ...pagina,
      width: largura,
      height: altura
    };
  };

  editorContext.obterObjetosUnicos = function obterObjetosUnicos({
    incluirFundo = false
  } = {}) {
    if (!editorContext.fabricCanvas) return [];
    const resultado = [];
    const vistosPorObjeto = new Set();
    const vistosPorId = new Set();
    const vistosPorClientId = new Set();
    for (const objeto of editorContext.fabricCanvas.getObjects()) {
      const objetoReal = editorContext.toRaw(objeto);
      if (vistosPorObjeto.has(objetoReal)) continue;
      if (!incluirFundo && objetoReal.__editorBackground) continue;
      const id = objetoReal.elementId != null ? String(objetoReal.elementId) : '';
      const clientId = objetoReal.clientId ? String(objetoReal.clientId) : '';
      if (id && vistosPorId.has(id)) continue;
      if (clientId && vistosPorClientId.has(clientId)) continue;
      vistosPorObjeto.add(objetoReal);
      if (id) vistosPorId.add(id);
      if (clientId) vistosPorClientId.add(clientId);
      resultado.push(objetoReal);
    }
    return resultado;
  };

  editorContext.obterElementosDaPagina = function obterElementosDaPagina(pagina) {
    return Array.isArray(pagina?.elements) ? pagina.elements : [];
  };

  editorContext.popularCanvasComDesign = async function popularCanvasComDesign(data, indicePagina = 0) {
    const canvasDaCarga = editorContext.fabricCanvas;
    if (!canvasDaCarga) return;
  
    // Cada carregamento recebe uma geração. Se a tela for desmontada
    // ou outro carregamento começar, o anterior será cancelado com segurança.
    const geracaoDaCarga = ++editorContext.canvasLoadGeneration;
    const cargaAindaAtiva = () => (
      editorContext.fabricCanvas === canvasDaCarga &&
      editorContext.canvasLoadGeneration === geracaoDaCarga
    );
    editorContext.carregandoDesign = true;
    try {
      editorContext.design.value = data;
      editorContext.templateTitulo.value = data.name || 'Design';
      let listaPaginas = Array.isArray(data.pages)
        ? [...data.pages].sort((a, b) => (a.page_order ?? 0) - (b.page_order ?? 0))
        : [];
  
      /*
       * Compatibilidade com respostas antigas que retornam
       * apenas "elements", sem a lista "pages".
       */
      if (!listaPaginas.length) {
        listaPaginas = [{
          id: null,
          name: 'Página 1',
          page_order: 0,
          width: data.width || 1080,
          height: data.height || 1080,
          background_color: '#FFFFFF',
          elements: Array.isArray(data.elements) ? data.elements : []
        }];
      }
      listaPaginas = listaPaginas.map(editorContext.normalizarDimensoesPagina);
      editorContext.paginas.value = listaPaginas;
      editorContext.paginaAtualIndex.value = Math.min(
        Math.max(indicePagina, 0),
        editorContext.paginas.value.length - 1
      );
  
      // Busca somente os elementos do slide selecionado; outros slides só
      // serão transferidos quando o usuário navegar até eles.
      let pagina = editorContext.paginaAtual.value;
      if (pagina?.id && !Array.isArray(pagina.elements)) {
        const {
          data: paginaCompleta
        } = await editorContext.designsApi.obterPagina(editorContext.designId.value, pagina.id);
        if (!cargaAindaAtiva()) return;
        editorContext.paginas.value[editorContext.paginaAtualIndex.value] = (
          editorContext.normalizarDimensoesPagina(paginaCompleta)
        );
        pagina = editorContext.paginas.value[editorContext.paginaAtualIndex.value];
      }
      editorContext.larguraDocumento.value = Number(pagina?.width) || 1080;
      editorContext.alturaDocumento.value = Number(pagina?.height) || 1080;
      editorContext.fundoDocumento.value = pagina?.background_color || '#FFFFFF';
      if (!cargaAindaAtiva()) return;
      canvasDaCarga.discardActiveObject();
      canvasDaCarga.clear();
      canvasDaCarga.backgroundColor = editorContext.fundoDocumento.value || '#FFFFFF';
      editorContext.atualizarRecorteDaPagina();
      editorContext.adicionarFundoPagina();
      editorContext.ajustarVisualizacaoCanvas();
      const idsVistos = new Set();
      const clientIdsVistos = new Set();
      const elementos = [...editorContext.obterElementosDaPagina(pagina)].filter(elemento => {
        const id = elemento.id != null ? String(elemento.id) : '';
        const clientId = elemento.client_id ? String(elemento.client_id) : '';
        if (id && idsVistos.has(id)) {
          console.warn('[CAMADAS] Registro repetido ignorado pelo id:', id);
          return false;
        }
        if (clientId && clientIdsVistos.has(clientId)) {
          console.warn('[CAMADAS] Registro repetido ignorado pelo client_id:', clientId);
          return false;
        }
        if (id) idsVistos.add(id);
        if (clientId) clientIdsVistos.add(clientId);
        return true;
      }).sort((a, b) => (a.layer_order ?? 0) - (b.layer_order ?? 0));
  
      // Processamento paralelo, com limite de concorrência e ordenação
      // preservada. Renderiza uma única vez depois do lote.
      canvasDaCarga.renderOnAddRemove = false;
      try {
        const LOTE = 8;
        for (let inicio = 0; inicio < elementos.length; inicio += LOTE) {
          if (!cargaAindaAtiva()) return;
          const itens = elementos.slice(inicio, inicio + LOTE);
          const objetos = await Promise.all(itens.map(async elemento => {
            try {
              return await editorContext.criarObjetoDeElemento(elemento);
            } catch (erro) {
              console.error(`[EDITOR] Falha ao carregar elemento ${elemento.id}`, erro);
              return null;
            }
          }));
          if (!cargaAindaAtiva()) return;
          for (const objeto of objetos) {
            if (objeto) canvasDaCarga.add(objeto);
          }
        }
      } finally {
        canvasDaCarga.renderOnAddRemove = true;
      }
      await editorContext.nextTick();
      await new Promise(resolve => requestAnimationFrame(resolve));
  
      // O componente pode ter sido desmontado durante o próximo frame.
      if (!cargaAindaAtiva()) return;
      editorContext.ajustarVisualizacaoCanvas();
      if (!cargaAindaAtiva()) return;
      canvasDaCarga.requestRenderAll();
      editorContext.atualizarListaCamadas();
      editorContext.reiniciarHistorico();
    } finally {
      // Uma carga antiga não pode liberar o estado de uma carga mais nova.
      if (editorContext.canvasLoadGeneration === geracaoDaCarga) {
        editorContext.carregandoDesign = false;
      }
    }
  };
}