const LIMITE_TEXTO_LONGO = 80;

export function registrarFuncoesCriarEditorCriarObjetoDeElemento(editorContext) {
  editorContext.criarObjetoDeElemento = async function criarObjetoDeElemento(elemento) {
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
      evented: true,
      angle: Number(elemento.rotation || 0)
    };
    if (elemento.type === 'symbol') {
      const simbolo = editorContext.simbolosDisponiveis.value.find(
        item => item.id === elemento.symbol
      );
      const caminho = elemento.symbol_data?.path_data || simbolo?.path_data;
      if (!caminho) return null;
      const objeto = new editorContext.fabric.Path(caminho, {
        ...props,
        fill: elemento.color || '#FF5700',
        stroke: elemento.stroke_color || '',
        strokeWidth: Number(elemento.stroke_width || 0)
      });
      const largura = Math.max(Number(elemento.width) || 100, 1);
      const altura = Math.max(Number(elemento.heigth || elemento.height) || 100, 1);
      objeto.set({
        scaleX: largura / Math.max(objeto.width || 1, 1),
        scaleY: altura / Math.max(objeto.height || 1, 1)
      });
      editorContext.configurarObjeto(objeto, elemento.symbol_data?.name || 'Símbolo', 'simbolo');
      objeto.elementType = 'symbol';
      objeto.symbolId = elemento.symbol;
      objeto.symbolPath = caminho;
      objeto.elementId = elemento.id;
      objeto.clientId = elemento.client_id || crypto.randomUUID();
      objeto.setCoords();
      return objeto;
    }
    if (elemento.type === 'image') {
      const fonteImagem = elemento.content || elemento.image_url || elemento.url || elemento.data_url;
      if (!fonteImagem) {
        console.error('[EDITOR] Elemento de imagem sem URL/content:', elemento);
        return null;
      }
      const objeto = await editorContext.criarImagemFabric(fonteImagem, {
        ...props,
        nomeCamada: 'Imagem',
        tipoCamada: 'imagem'
      });
      const largura = Number(elemento.width || objeto.width || 1);
      const altura = Number(elemento.heigth || elemento.height || objeto.height || 1);
      objeto.set({
        scaleX: largura / (objeto.width || 1),
        scaleY: altura / (objeto.height || 1)
      });
      objeto.elementId = elemento.id;
      objeto.clientId = elemento.client_id || crypto.randomUUID();
      objeto.setCoords();
      return objeto;
    }
    if (elemento.type === 'shape') {
      const tipo = elemento.shape_type || 'rect';
      const largura = Math.max(Number(elemento.width || 100), 1);
      const altura = Math.max(Number(elemento.heigth || elemento.height || 100), 1);
      const configuracao = {
        ...props,
        fill: elemento.color || '#FF5700',
        stroke: elemento.stroke_color || '',
        strokeWidth: Number(elemento.stroke_width || 0)
      };
      let objeto;
      if (tipo === 'circle') {
        objeto = new editorContext.fabric.Circle({
          ...configuracao,
          radius: 50
        });
      } else if (tipo === 'triangle') {
        objeto = new editorContext.fabric.Triangle({
          ...configuracao,
          width: largura,
          height: altura
        });
      } else if (tipo === 'star') {
        objeto = new editorContext.fabric.Polygon(editorContext.criarPontosEstrela(60, 60, 60, 28), {
          ...configuracao,
          originX: 'left',
          originY: 'top'
        });
      } else {
        objeto = new editorContext.fabric.Rect({
          ...configuracao,
          width: largura,
          height: altura
        });
      }
      if (tipo === 'circle' || tipo === 'star') {
        objeto.set({
          scaleX: largura / Math.max(objeto.width || 1, 1),
          scaleY: altura / Math.max(objeto.height || 1, 1)
        });
      }
      const nome = {
        circle: 'Círculo',
        triangle: 'Triângulo',
        star: 'Estrela',
        rect: 'Retângulo'
      }[tipo] || 'Forma';
      editorContext.configurarObjeto(objeto, nome, 'forma');
      objeto.elementId = elemento.id;
      objeto.clientId = elemento.client_id || crypto.randomUUID();
      objeto.elementType = 'shape';
      objeto.shapeType = tipo;
      objeto.setCoords();
      return objeto;
    }
    const conteudoTexto = String(elemento.content || '');
    const alinhamento = elemento.text_align || 'left';
    const tamanhoFonteOriginal = Number(elemento.font_size || elemento.fontSize || 18);
    const posicaoY = Math.max(Number(elemento.posicao_y ?? elemento.y ?? 0), 0);
    const alturaPagina = Math.max(Number(editorContext.alturaDocumento.value) || 1080, 1);

    // Identifica títulos mesmo quando o PPTX não usa um placeholder de título.
    const ehTitulo = elemento.type === 'title' || (
      tamanhoFonteOriginal >= 44 &&
      conteudoTexto.trim().length <= 100 &&
      posicaoY < alturaPagina * 0.55
    );
    const larguraCaixaOriginal = Math.max(Number(elemento.width) || 1, 1);
    const larguraPagina = Math.max(Number(editorContext.larguraDocumento.value) || 1080, 1);
    const leftOriginal = Number(elemento.posicao_x ?? elemento.x ?? 0);
    const larguraDisponivelNaPagina = Math.max(larguraPagina - Math.max(leftOriginal, 0), 1);
    const larguraCaixa = Math.min(larguraCaixaOriginal, larguraDisponivelNaPagina);

    // PowerPoints importados usam caixas com quebra automática de texto.
    // IText em linha única + scaleX comprime os parágrafos horizontalmente.
    const importado = (
      /^Slide\s+\d+$/i.test(editorContext.paginaAtual.value?.name || '') ||
      conteudoTexto.length >= LIMITE_TEXTO_LONGO ||
      conteudoTexto.includes('\n')
    );
    let objeto;
    if (importado) {
      objeto = new editorContext.fabric.Textbox(conteudoTexto, {
        ...props,
        width: larguraCaixa,
        fontFamily: elemento.font_family || 'Arial',
        fontSize: tamanhoFonteOriginal,
        fontWeight: elemento.font_weight || 'normal',
        fontStyle: elemento.font_style || 'normal',
        underline: Boolean(elemento.underline),
        fill: elemento.color || '#333333',
        textAlign: alinhamento,
        splitByGrapheme: false,
        lineHeight: 1.15
      });
    } else {
      // Mantém o comportamento anterior dos designs criados no editor.
      objeto = new editorContext.fabric.IText(conteudoTexto, {
        ...props,
        fontFamily: elemento.font_family || 'Arial',
        fontSize: tamanhoFonteOriginal,
        fontWeight: elemento.font_weight || 'normal',
        fontStyle: elemento.font_style || 'normal',
        underline: Boolean(elemento.underline),
        fill: elemento.color || '#ffffff',
        textAlign: 'left',
        splitByGrapheme: false
      });
      const larguraNatural = Math.max(Number(objeto.width) || 1, 1);
      const escalaInicialX = Math.min(1, larguraCaixa / larguraNatural);
      const larguraRenderizada = larguraNatural * escalaInicialX;
      let deslocamentoX = 0;
      if (alinhamento === 'center') {
        deslocamentoX = (larguraCaixa - larguraRenderizada) / 2;
      } else if (alinhamento === 'right') {
        deslocamentoX = larguraCaixa - larguraRenderizada;
      }
      objeto.set({ left: props.left + deslocamentoX, scaleX: escalaInicialX });
      objeto.editorPositionOffsetX = deslocamentoX;
      objeto.editorOriginalWidth = larguraCaixaOriginal;
      objeto.editorInitialScaleX = escalaInicialX;
    }
    editorContext.configurarObjeto(objeto, ehTitulo ? 'Título' : 'Texto', 'texto');
    objeto.elementId = elemento.id;
    objeto.clientId = elemento.client_id || crypto.randomUUID();
    objeto.elementType = elemento.type;
    objeto.setCoords();
    return objeto;
  };
  editorContext.ajustarVisualizacaoCanvas = function ajustarVisualizacaoCanvas() {
    if (!editorContext.fabricCanvas || !editorContext.canvasAreaRef.value) return;
    const area = editorContext.canvasAreaRef.value.getBoundingClientRect();
    const larguraArea = Math.floor(area.width);
    const alturaArea = Math.floor(area.height);
    if (larguraArea <= 0 || alturaArea <= 0) return;
    const largura = Math.max(Number(editorContext.larguraDocumento.value) || 1080, 1);
    const altura = Math.max(Number(editorContext.alturaDocumento.value) || 1080, 1);
    const margem = Math.min(24, Math.floor(Math.min(larguraArea, alturaArea) * 0.05));

    // Calcula uma única escala para caber a página inteira no palco.
    const larguraDisponivel = Math.max(larguraArea - margem * 2, 1);
    const alturaDisponivel = Math.max(alturaArea - margem * 2, 1);
    const escala = Math.min(larguraDisponivel / largura, alturaDisponivel / altura);
    const larguraVisivel = largura * escala;
    const alturaVisivel = altura * escala;
    const deslocamentoX = (larguraArea - larguraVisivel) / 2;
    const deslocamentoY = (alturaArea - alturaVisivel) / 2;

    // Use o viewport nativo do Fabric para escalar a página. Transformar o
    // wrapper via CSS escala a arte visual, mas pode deixar os controles,
    // hit-testing e limites do canvas em coordenadas diferentes (objetos
    // parecem deslocados/cortados em relação à miniatura).
    editorContext.fabricCanvas.setDimensions({
      width: Math.max(Math.round(larguraVisivel), 1),
      height: Math.max(Math.round(alturaVisivel), 1)
    });
    editorContext.fabricCanvas.setViewportTransform([escala, 0, 0, escala, 0, 0]);
    editorContext.fabricCanvas.clipPath = null;
    editorContext.fabricCanvas.backgroundColor = editorContext.fundoDocumento.value || '#FFFFFF';
    const wrapper = editorContext.fabricCanvas.wrapperEl;
    if (wrapper) {
      wrapper.style.setProperty('position', 'absolute', 'important');
      wrapper.style.setProperty('left', `${deslocamentoX}px`, 'important');
      wrapper.style.setProperty('top', `${deslocamentoY}px`, 'important');
      wrapper.style.setProperty('width', `${Math.round(larguraVisivel)}px`, 'important');
      wrapper.style.setProperty('height', `${Math.round(alturaVisivel)}px`, 'important');
      wrapper.style.setProperty('margin', '0', 'important');
      wrapper.style.setProperty('transform-origin', 'top left', 'important');
      wrapper.style.setProperty('transform', 'none', 'important');
      wrapper.style.setProperty('z-index', '1', 'important');
    }

    // Recalcula as coordenadas de interação após alterar as dimensões/viewport.
    editorContext.fabricCanvas.calcOffset();
    editorContext.fabricCanvas.requestRenderAll();
  };
  editorContext.adicionarFundoPagina = function adicionarFundoPagina() {
    if (!editorContext.fabricCanvas) return;

    // A página é o próprio fundo do canvas nativo; não vira uma camada.
    editorContext.fabricCanvas.backgroundColor = editorContext.fundoDocumento.value || '#FFFFFF';
    editorContext.fabricCanvas.clipPath = null;
    editorContext.fabricCanvas.requestRenderAll();
  };
}