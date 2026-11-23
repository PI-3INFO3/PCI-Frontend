export function registrarFuncoesCriarEditorEhTexto(editorContext) {
  editorContext.ehTexto = function ehTexto(objeto) {
    return !!objeto && ['i-text', 'text', 'textbox'].includes(objeto.type);
  };
  editorContext.ehSimbolo = function ehSimbolo(objeto) {
    return objeto?.elementType === 'symbol';
  };
  editorContext.ehForma = function ehForma(objeto) {
    const tiposDeForma = ['rect', 'circle', 'triangle', 'polygon'];
    return Boolean(objeto) && (
      tiposDeForma.includes(objeto.type) || editorContext.ehSimbolo(objeto)
    );
  };
  editorContext.configurarObjeto = function configurarObjeto(objeto, nome, tipo) {
    objeto.set({
      borderColor: '#FF5700',
      cornerColor: '#FF5700',
      cornerSize: 10,
      transparentCorners: false,
      selectable: true,
      evented: true,
      nomeCamada: nome,
      tipoCamada: tipo
    });
    if (!objeto.clientId) {
      objeto.clientId = crypto.randomUUID();
    }
    return objeto;
  };
  editorContext.resolverUrlImagem = function resolverUrlImagem(valor) {
    if (!valor || typeof valor !== 'string') return '';
    const url = valor.trim();
    if (!url) return '';
    if (/^(data:image\/|blob:|https?:\/\/)/i.test(url)) return url;
    const baseApi = editorContext.BASE_URL;
    try {
      const base = new URL(baseApi, window.location.origin);
      // Conteúdo relativo como /media/... deve ser relativo à raiz do servidor,
      // não ao caminho /api/.
      if (url.startsWith('/')) return new URL(url, base.origin).href;
      return new URL(url, base).href;
    } catch (erro) {
      console.error('[EDITOR] URL de imagem inválida:', url, erro);
      return '';
    }
  };
  editorContext.obterUrlImagemAutenticada = async function obterUrlImagemAutenticada(url) {
    const fonte = editorContext.resolverUrlImagem(url);
    if (!/\/api\/editor-images\/\d+\/content\/?(?:[?#].*)?$/.test(fonte)) {
      return fonte;
    }
    if (!editorContext.imagensCarregadas.has(fonte)) {
      const requisicao = editorContext.mediaApi.obterImagemPrivada(fonte).then(({
        data
      }) => URL.createObjectURL(data)).catch(erro => {
        editorContext.imagensCarregadas.delete(fonte);
        throw erro;
      });
      editorContext.imagensCarregadas.set(fonte, requisicao);
    }
    return editorContext.imagensCarregadas.get(fonte);
  };
  editorContext.carregarImagem = function carregarImagem(url) {
    return new Promise(async (resolve, reject) => {
      let fonte;
      try {
        fonte = await editorContext.obterUrlImagemAutenticada(url);
      } catch (erro) {
        reject(erro);
        return;
      }
      if (!fonte) {
        reject(new Error('A imagem não possui uma URL válida.'));
        return;
      }
      const imagem = new window.Image();
      // Não definir crossOrigin para mídia local do próprio backend: isso pode
      // bloquear imagens quando o servidor não envia cabeçalhos CORS.
      imagem.onload = () => resolve(imagem);
      imagem.onerror = () => reject(new Error(`Não foi possível carregar a imagem: ${fonte}`));
      imagem.src = fonte;
    });
  };
  editorContext.criarImagemFabric = async function criarImagemFabric(url, propriedades = {}) {
    const imagem = await editorContext.carregarImagem(url);
    const objeto = new editorContext.fabric.FabricImage(imagem, propriedades);
    editorContext.configurarObjeto(objeto, propriedades.nomeCamada || 'Imagem', 'imagem');
    objeto.elementType = 'image';
    objeto.originalMediaUrl = url;
    return objeto;
  };
  editorContext.criarPontosEstrela = function criarPontosEstrela(cx, cy, raioExterno, raioInterno, pontas = 5) {
    const pontos = [];
    for (let i = 0; i < pontas * 2; i++) {
      const angulo = -Math.PI / 2 + Math.PI * 2 * i / (pontas * 2);
      const raio = i % 2 === 0 ? raioExterno : raioInterno;
      pontos.push({
        x: cx + Math.cos(angulo) * raio,
        y: cy + Math.sin(angulo) * raio
      });
    }
    return pontos;
  };
}