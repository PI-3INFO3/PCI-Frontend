export function registrarFuncoesCriarEditorAdicionarForma(editorContext) {
  editorContext.adicionarForma = function adicionarForma(tipo = 'rect') {
    if (!editorContext.fabricCanvas) return;
    const comuns = editorContext.configuracaoForma('#FF5700');
    const centroX = editorContext.larguraDocumento.value / 2;
    const centroY = editorContext.alturaDocumento.value / 2;
    let forma;
    let nome = 'Forma';
    if (tipo === 'circle') {
      forma = new editorContext.fabric.Circle({
        ...comuns,
        left: centroX - 50,
        top: centroY - 50,
        radius: 50,
        originX: 'left',
        originY: 'top'
      });
      nome = 'Círculo';
    } else if (tipo === 'triangle') {
      forma = new editorContext.fabric.Triangle({
        ...comuns,
        left: centroX - 55,
        top: centroY - 50,
        width: 110,
        height: 100,
        originX: 'left',
        originY: 'top'
      });
      nome = 'Triângulo';
    } else if (tipo === 'star') {
      forma = new editorContext.fabric.Polygon(editorContext.criarPontosEstrela(60, 60, 60, 28), {
        ...comuns,
        left: centroX - 60,
        top: centroY - 60,
        originX: 'left',
        originY: 'top'
      });
      nome = 'Estrela';
    } else {
      forma = new editorContext.fabric.Rect({
        ...comuns,
        left: centroX - 80,
        top: centroY - 50,
        width: 160,
        height: 100,
        originX: 'left',
        originY: 'top'
      });
      nome = 'Retângulo';
    }
    editorContext.configurarObjeto(forma, nome, 'forma');
    forma.elementType = 'shape';
    forma.shapeType = tipo;
    editorContext.fabricCanvas.add(forma);
    editorContext.fabricCanvas.setActiveObject(forma);
    editorContext.fabricCanvas.bringObjectToFront(forma);
    editorContext.fabricCanvas.requestRenderAll();
    editorContext.atualizarListaCamadas();
    editorContext.agendarSalvamento();
  };
  editorContext.alterarCorForma = function alterarCorForma(cor) {
    const objeto = editorContext.fabricCanvas?.getActiveObject();
    if (!editorContext.ehForma(objeto)) return;
    objeto.set({
      fill: cor
    });
    objeto.setCoords();
    editorContext.fabricCanvas.requestRenderAll();
    editorContext.atualizarListaCamadas();
    editorContext.agendarSalvamento();
  };
  editorContext.adicionarImagemAoCanvas = async function adicionarImagemAoCanvas(evento) {
    const arquivo = evento?.target?.files?.[0];
    if (!arquivo || !editorContext.fabricCanvas) return;
    editorContext.erroUpload.value = '';
    try {
      if (!arquivo.type.startsWith('image/')) {
        throw new Error('Selecione uma imagem PNG, JPG ou WEBP.');
      }

      // Armazena no backend (por usuário), nunca em base64 no elemento.
      const asset = (await editorContext.mediaApi.enviarImagem(arquivo)).data;
      if (!editorContext.imagensBiblioteca.value.some(item => item.id === asset.id)) {
        editorContext.imagensBiblioteca.value.unshift({
          ...asset,
          description: arquivo.name,
          miniatura: await editorContext.obterUrlImagemAutenticada(asset.url)
        });
      }
      const imagem = await editorContext.criarImagemFabric(asset.url, {
        nomeCamada: arquivo.name,
        tipoCamada: 'imagem'
      });
      const larguraMaxima = editorContext.larguraDocumento.value * 0.7;
      const alturaMaxima = editorContext.alturaDocumento.value * 0.7;
      const escala = Math.min(larguraMaxima / imagem.width, alturaMaxima / imagem.height, 1);
      const larguraRenderizada = imagem.width * escala;
      const alturaRenderizada = imagem.height * escala;
      imagem.set({
        scaleX: escala,
        scaleY: escala,
        originX: 'left',
        originY: 'top',
        left: (editorContext.larguraDocumento.value - larguraRenderizada) / 2,
        top: (editorContext.alturaDocumento.value - alturaRenderizada) / 2
      });
      imagem.setCoords();
      editorContext.fabricCanvas.add(imagem);
      editorContext.fabricCanvas.setActiveObject(imagem);
      editorContext.fabricCanvas.bringObjectToFront(imagem);
      editorContext.fabricCanvas.requestRenderAll();
      editorContext.atualizarListaCamadas();
      editorContext.agendarSalvamento();
    } catch (erro) {
      console.error('[EDITOR] Erro ao adicionar imagem:', erro);
      editorContext.erroUpload.value = erro.message || 'Não foi possível adicionar a imagem.';
    } finally {
      if (evento?.target) {
        evento.target.value = '';
      }
    }
  };
  editorContext.abrirSeletorDeArquivo = function abrirSeletorDeArquivo() {
    editorContext.inputArquivoRef.value?.click();
  };
  editorContext.abrirSeletorDeImagem = function abrirSeletorDeImagem() {
    editorContext.inputImagemRef.value?.click();
  };
  editorContext.arquivoEhSuportado = function arquivoEhSuportado(arquivo) {
    const nome = arquivo?.name?.toLowerCase() || '';
    return editorContext.EXTENSOES_ACEITAS.some(extensao => nome.endsWith(extensao));
  };
  editorContext.selecionarArquivoParaCriar = function selecionarArquivoParaCriar(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    if (!editorContext.arquivoEhSuportado(arquivo)) {
      editorContext.erroUpload.value = 'Formato não suportado. Envie um PDF, PPTX, JPG ou PNG.';
      return;
    }
    editorContext.erroUpload.value = '';
    editorContext.arquivoSelecionado.value = arquivo;
  };
  editorContext.soltarArquivoParaCriar = function soltarArquivoParaCriar(evento) {
    const arquivo = evento.dataTransfer.files?.[0];
    if (!arquivo) return;
    if (!editorContext.arquivoEhSuportado(arquivo)) {
      editorContext.erroUpload.value = 'Formato não suportado. Envie um PDF, PPTX, JPG ou PNG.';
      return;
    }
    editorContext.erroUpload.value = '';
    editorContext.arquivoSelecionado.value = arquivo;
  };
  editorContext.comecarDoZero = async function comecarDoZero() {
    try {
      const data = (await editorContext.designsApi.criarVazio()).data;
      editorContext.designId.value = data.id;
      editorContext.design.value = data;
      editorContext.templateTitulo.value = data.name || 'Design';
      editorContext.mostrarUpload.value = false;
      await editorContext.popularCanvasComDesign(data);
      editorContext.router.replace(`/criar/${data.id}`);
    } catch (erro) {
      console.error(erro);
      editorContext.erroUpload.value = 'Não foi possível criar o design. Tente novamente.';
    }
  };
  editorContext.criarDesignAPartirDoUpload = async function criarDesignAPartirDoUpload() {
    if (!editorContext.arquivoSelecionado.value || editorContext.enviandoUpload.value) {
      return;
    }
    editorContext.enviandoUpload.value = true;
    editorContext.erroUpload.value = '';
    try {
      const data = (await editorContext.designsApi.uploadArquivo(editorContext.arquivoSelecionado.value)).data;
      editorContext.designId.value = data.id;
      editorContext.design.value = data;
      await editorContext.popularCanvasComDesign(data);
      editorContext.mostrarUpload.value = false;
      editorContext.router.replace(`/criar/${data.id}`);
    } catch (erro) {
      console.error(erro);
      editorContext.erroUpload.value = (
        erro.response?.data?.error ||
        'Não foi possível processar o arquivo. Tente novamente.'
      );
    } finally {
      editorContext.enviandoUpload.value = false;
    }
  };
}