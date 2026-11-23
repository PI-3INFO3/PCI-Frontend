export function registrarFuncoesDesignCardObterElementos(editorContext) {
  editorContext.obterElementos = function obterElementos(design) {
    if (Array.isArray(design.elements)) {
      return design.elements;
    }
    if (Array.isArray(design.pages) && design.pages.length) {
      const paginas = [...design.pages].sort((a, b) => (a.page_order ?? 0) - (b.page_order ?? 0));
      return Array.isArray(paginas[0].elements) ? paginas[0].elements : [];
    }
    return [];
  };
  editorContext.obterPagina = function obterPagina(design) {
    if (!Array.isArray(design.pages) || !design.pages.length) {
      return null;
    }
    return [...design.pages].sort((a, b) => (a.page_order ?? 0) - (b.page_order ?? 0))[0];
  };
  editorContext.obterDimensoes = function obterDimensoes(design) {
    const pagina = editorContext.obterPagina(design);
    return {
      largura: Math.max(Number(pagina?.width ?? design.width ?? 1080), 1),
      altura: Math.max(Number(pagina?.height ?? design.height ?? 1080), 1),
      fundo: pagina?.background_color || design.background_color || "#FFFFFF"
    };
  };
  editorContext.obterPosicao = function obterPosicao(elemento) {
    return {
      x: Number(elemento.posicao_x ?? elemento.x ?? 0),
      y: Number(elemento.posicao_y ?? elemento.y ?? 0)
    };
  };
  editorContext.obterAltura = function obterAltura(elemento) {
    return Math.max(Number(elemento.heigth ?? elemento.height ?? 100), 1);
  };
  editorContext.obterLargura = function obterLargura(elemento) {
    return Math.max(Number(elemento.width ?? 100), 1);
  };
  editorContext.desenharForma = function desenharForma(ctx, elemento) {
    const posicao = editorContext.obterPosicao(elemento);
    const x = posicao.x;
    const y = posicao.y;
    const largura = editorContext.obterLargura(elemento);
    const altura = editorContext.obterAltura(elemento);
    ctx.fillStyle = elemento.color || "#FF5700";
    if (elemento.stroke_color) {
      ctx.strokeStyle = elemento.stroke_color;
      ctx.lineWidth = Number(elemento.stroke_width || 1);
    }
    switch (elemento.shape_type || "rect") {
      case "circle":
        {
          ctx.beginPath();
          ctx.ellipse(x + largura / 2, y + altura / 2, largura / 2, altura / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          if (elemento.stroke_color) {
            ctx.stroke();
          }
          break;
        }
      case "triangle":
        {
          ctx.beginPath();
          ctx.moveTo(x + largura / 2, y);
          ctx.lineTo(x + largura, y + altura);
          ctx.lineTo(x, y + altura);
          ctx.closePath();
          ctx.fill();
          if (elemento.stroke_color) {
            ctx.stroke();
          }
          break;
        }
      case "star":
        {
          const centroX = x + largura / 2;
          const centroY = y + altura / 2;
          const raioExterno = Math.min(largura, altura) / 2;
          const raioInterno = raioExterno * 0.45;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const raio = i % 2 === 0 ? raioExterno : raioInterno;
            const angulo = -Math.PI / 2 + i * Math.PI / 5;
            const px = centroX + Math.cos(angulo) * raio;
            const py = centroY + Math.sin(angulo) * raio;
            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.closePath();
          ctx.fill();
          if (elemento.stroke_color) {
            ctx.stroke();
          }
          break;
        }
      default:
        {
          ctx.fillRect(x, y, largura, altura);
          if (elemento.stroke_color) {
            ctx.strokeRect(x, y, largura, altura);
          }
        }
    }
  };
  editorContext.obterUrlImagem = function obterUrlImagem(elemento) {
    return elemento.content || elemento.image_url || elemento.url || elemento.src || elemento.data_url || "";
  };
  editorContext.resolverUrlImagem = function resolverUrlImagem(valor) {
    if (!valor || typeof valor !== "string") {
      return "";
    }
    const url = valor.trim();
    if (!url) return "";
    if (/^(data:image\/|blob:|https?:\/\/)/i.test(url)) {
      return url;
    }
    const baseApi = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/";
    try {
      const base = new URL(baseApi, window.location.origin);
      if (url.startsWith("/")) {
        return new URL(url, base.origin).href;
      }
      return new URL(url, base).href;
    } catch (erro) {
      console.error("[MINIATURA] URL de imagem inválida:", url, erro);
      return url;
    }
  };
  editorContext.carregarImagem = function carregarImagem(url) {
    return new Promise(resolve => {
      const fonte = editorContext.resolverUrlImagem(url);
      if (!fonte) {
        resolve(null);
        return;
      }
      const imagem = new Image();
      imagem.onload = () => resolve(imagem);
      imagem.onerror = () => resolve(null);
      imagem.src = fonte;
    });
  };
}