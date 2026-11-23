export function registrarFuncoesCriarEditorAplicarEstadoHistorico(editorContext) {
  editorContext.aplicarEstadoHistorico = async function aplicarEstadoHistorico(estado) {
    if (!editorContext.fabricCanvas || !estado || editorContext.restaurandoHistorico) return;
    editorContext.restaurandoHistorico = true;
    editorContext.carregandoDesign = true;
    const canvas = editorContext.fabricCanvas;
    try {
      canvas.discardActiveObject();
      canvas.clear();
      canvas.backgroundColor = editorContext.fundoDocumento.value;
      editorContext.adicionarFundoPagina();
      for (const elemento of JSON.parse(estado)) {
        const objeto = await editorContext.criarObjetoDeElemento(elemento);
        if (editorContext.fabricCanvas !== canvas) return;
        if (objeto) canvas.add(objeto);
      }
      editorContext.ajustarVisualizacaoCanvas();
      editorContext.atualizarListaCamadas();
      canvas.requestRenderAll();
    } finally {
      editorContext.carregandoDesign = false;
      editorContext.restaurandoHistorico = false;
    }
    editorContext.agendarSalvamento();
  };
  editorContext.desfazer = async function desfazer() {
    if (editorContext.historico.length <= 1) return;
    editorContext.refazerHistorico.push(editorContext.historico.pop());
    await editorContext.aplicarEstadoHistorico(editorContext.historico[editorContext.historico.length - 1]);
  };
  editorContext.refazer = async function refazer() {
    if (!editorContext.refazerHistorico.length) return;
    const estado = editorContext.refazerHistorico.pop();
    editorContext.historico.push(estado);
    await editorContext.aplicarEstadoHistorico(estado);
  };
  editorContext.objetosSelecionados = function objetosSelecionados() {
    const ativo = editorContext.fabricCanvas?.getActiveObject();
    if (!ativo) return [];
    return ativo.type === 'activeselection' ? ativo.getObjects() : [ativo];
  };
  editorContext.copiarSelecionado = function copiarSelecionado() {
    editorContext.clipboardElementos = editorContext.objetosSelecionados()
      .map(editorContext.objetoFabricParaElemento)
      .filter(Boolean);
  };
  editorContext.recortarSelecionado = function recortarSelecionado() {
    editorContext.copiarSelecionado();
    editorContext.deletarSelecionado();
  };
  editorContext.colarSelecionado = async function colarSelecionado() {
    if (!editorContext.fabricCanvas || !editorContext.clipboardElementos.length) return;
    editorContext.clipboardElementos = editorContext.clipboardElementos.map(elemento => ({
      ...elemento,
      id: null,
      client_id: crypto.randomUUID(),
      posicao_x: elemento.posicao_x + 25,
      posicao_y: elemento.posicao_y + 25
    }));
    const novos = await Promise.all(editorContext.clipboardElementos.map(editorContext.criarObjetoDeElemento));
    novos.filter(Boolean).forEach(objeto => editorContext.fabricCanvas.add(objeto));
    if (novos[0]) editorContext.fabricCanvas.setActiveObject(novos[0]);
    editorContext.fabricCanvas.requestRenderAll();
    editorContext.registrarHistorico();
    editorContext.agendarSalvamento();
  };
  editorContext.duplicarSelecionado = async function duplicarSelecionado() {
    editorContext.copiarSelecionado();
    await editorContext.colarSelecionado();
  };
  editorContext.selecionarTudo = function selecionarTudo() {
    if (!editorContext.fabricCanvas) return;
    const objetos = editorContext.obterObjetosUnicos();
    if (objetos.length) {
      editorContext.fabricCanvas.setActiveObject(new editorContext.fabric.ActiveSelection(objetos, {
        canvas: editorContext.fabricCanvas
      }));
      editorContext.fabricCanvas.requestRenderAll();
    }
  };
  editorContext.rotacionarSelecionado = function rotacionarSelecionado(graus) {
    const objetos = editorContext.objetosSelecionados();
    for (const objeto of objetos) {
      objeto.rotate((Number(objeto.angle) || 0) + graus);
      objeto.setCoords();
    }
    editorContext.anguloSelecionado.value = Math.round(objetos[0]?.angle || 0);
    editorContext.fabricCanvas?.requestRenderAll();
    editorContext.atualizarListaCamadas();
    editorContext.registrarHistorico();
    editorContext.agendarSalvamento();
  };
  editorContext.alterarAnguloSelecionado = function alterarAnguloSelecionado() {
    const objeto = editorContext.fabricCanvas?.getActiveObject();
    if (!objeto) return;
    const angulo = Number(editorContext.anguloSelecionado.value);
    if (!Number.isFinite(angulo)) return;
    objeto.rotate((angulo % 360 + 360) % 360);
    objeto.setCoords();
    editorContext.fabricCanvas.requestRenderAll();
    editorContext.registrarHistorico();
    editorContext.agendarSalvamento();
  };
  editorContext.ordenarSelecionado = function ordenarSelecionado(paraFrente) {
    const objeto = editorContext.fabricCanvas?.getActiveObject();
    if (!objeto || objeto.__editorBackground) return;
    if (paraFrente) {
      editorContext.fabricCanvas.bringObjectToFront(objeto);
    } else {
      editorContext.fabricCanvas.sendObjectToBack(objeto);
    }
    editorContext.manterFundoNoFundo();
    editorContext.atualizarOrdemDasCamadas();
    editorContext.registrarHistorico();
  };
  editorContext.carregarSimbolos = async function carregarSimbolos() {
    try {
      const data = (await editorContext.mediaApi.listarSimbolos()).data;
      editorContext.simbolosDisponiveis.value = Array.isArray(data) ? data : data.results || [];
    } catch (erro) {
      console.error('[SIMBOLOS] Falha ao carregar catálogo', erro);
    }
  };
  editorContext.importarSvgSimbolo = async function importarSvgSimbolo(evento) {
    const arquivo = evento?.target?.files?.[0];
    if (!arquivo) return;
    try {
      if (arquivo.size > 1024 * 1024) throw new Error('SVG muito grande (máximo 1 MB).');
      const codigo = await arquivo.text();
      if (/<!(DOCTYPE|ENTITY)/i.test(codigo)) throw new Error('SVG inválido.');
      const documento = new DOMParser().parseFromString(codigo, 'image/svg+xml');
      if (documento.querySelector('parsererror, script, foreignObject, image, use, text, animate')) {
        throw new Error('Este SVG contém recursos que não são caminhos simples.');
      }
      const partes = [...documento.querySelectorAll('path')].map(path => path.getAttribute('d') || '').filter(Boolean);
      for (const poligono of documento.querySelectorAll('polygon, polyline')) {
        const pontos = (poligono.getAttribute('points') || '').match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
        if (pontos.length >= 4 && pontos.length % 2 === 0) {
          let d = `M ${pontos[0]} ${pontos[1]}`;
          for (let i = 2; i < pontos.length; i += 2) d += ` L ${pontos[i]} ${pontos[i + 1]}`;
          if (poligono.tagName.toLowerCase() === 'polygon') d += ' Z';
          partes.push(d);
        }
      }
      const path_data = partes.join(' ').trim();
      if (!path_data || path_data.length > 4000 || !/^[MmLlHhVvCcSsQqTtAaZz0-9\s,.\-+eE]+$/.test(path_data)) {
        throw new Error('SVG não possui geometria vetorial simples compatível.');
      }
      const nome = arquivo.name.replace(/\.svg$/i, '').slice(0, 120) || 'Símbolo';
      const simbolo = (await editorContext.mediaApi.criarSimbolo(nome, path_data)).data;
      if (!editorContext.simbolosDisponiveis.value.some(item => item.id === simbolo.id)) {
        editorContext.simbolosDisponiveis.value.push(simbolo);
      }
      await editorContext.adicionarSimbolo(simbolo);
    } catch (erro) {
      console.error('[SIMBOLOS] Erro ao importar SVG', erro);
      editorContext.erroUpload.value = erro.response?.data?.path_data?.[0] || erro.message;
      window.alert(editorContext.erroUpload.value);
    } finally {
      if (evento?.target) evento.target.value = '';
    }
  };
  editorContext.adicionarSimbolo = async function adicionarSimbolo(simbolo) {
    if (!editorContext.fabricCanvas) return;
    const objeto = await editorContext.criarObjetoDeElemento({
      type: 'symbol',
      symbol: simbolo.id,
      symbol_data: simbolo,
      width: 155,
      heigth: 155,
      posicao_x: (editorContext.larguraDocumento.value - 155) / 2,
      posicao_y: (editorContext.alturaDocumento.value - 155) / 2,
      color: '#FF5700'
    });
    if (!objeto) return;
    editorContext.fabricCanvas.add(objeto);
    editorContext.fabricCanvas.setActiveObject(objeto);
    editorContext.fabricCanvas.requestRenderAll();
    editorContext.registrarHistorico();
    editorContext.agendarSalvamento();
  };
  editorContext.carregarImagensBiblioteca = async function carregarImagensBiblioteca() {
    if (editorContext.carregandoBiblioteca.value) return;
    editorContext.carregandoBiblioteca.value = true;
    try {
      if (!editorContext.proximaPaginaImagens.value) return;
      const data = (await editorContext.mediaApi.listarImagens(editorContext.proximaPaginaImagens.value)).data;
      const registros = Array.isArray(data) ? data : data.results || [];
      const possuiProximaPagina = !Array.isArray(data) && data.page < data.total_pages;
      editorContext.proximaPaginaImagens.value = possuiProximaPagina
        ? data.page + 1
        : null;
      const carregados = await Promise.all(registros.map(async imagem => ({
        ...imagem,
        miniatura: await editorContext.obterUrlImagemAutenticada(imagem.url)
      })));
      const existentes = new Set(editorContext.imagensBiblioteca.value.map(i => i.id));
      editorContext.imagensBiblioteca.value.push(...carregados.filter(i => !existentes.has(i.id)));
    } catch (erro) {
      console.error('[IMAGENS] Erro ao listar imagens do usuário', erro);
    } finally {
      editorContext.carregandoBiblioteca.value = false;
    }
  };
}