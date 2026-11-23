/**
 * Divide um parágrafo em linhas reais, sem a compressão horizontal
 * provocada por CanvasRenderingContext2D.fillText(..., maxWidth).
 */
export function quebrarLinhasMiniatura(ctx, texto, largura) {
  const limite = Math.max(Number(largura) || 1, 1);
  const linhas = [];

  for (const paragrafo of String(texto).split(/\r?\n/)) {
    if (!paragrafo.trim()) {
      linhas.push('');
      continue;
    }
    let linha = '';
    for (const palavra of paragrafo.trim().split(/\s+/)) {
      const tentativa = linha ? `${linha} ${palavra}` : palavra;
      if (ctx.measureText(tentativa).width <= limite) {
        linha = tentativa;
        continue;
      }
      if (linha) {
        linhas.push(linha);
        linha = '';
      }
      if (ctx.measureText(palavra).width <= limite) {
        linha = palavra;
        continue;
      }
      // Palavras maiores que a caixa são divididas em caracteres.
      for (const caractere of palavra) {
        const trecho = linha + caractere;
        if (linha && ctx.measureText(trecho).width > limite) {
          linhas.push(linha);
          linha = caractere;
        } else {
          linha = trecho;
        }
      }
    }
    linhas.push(linha);
  }
  return linhas;
}

/**
 * Mantém o desenho de texto dentro da caixa sem esticar nem achatar glifos.
 * Títulos de uma única linha podem reduzir a fonte proporcionalmente.
 */
export function desenharTextoMiniatura(ctx, elemento, caixa) {
  const texto = String(elemento.content || '');
  if (!texto) return;
  const tamanho = Math.max(Number(elemento.font_size || elemento.fontSize || 18), 1);
  const familia = elemento.font_family || 'Arial';
  const peso = elemento.font_weight || 'normal';
  const estilo = elemento.font_style || 'normal';
  const alinhamento = elemento.text_align || 'left';
  const fonte = valor => `${estilo} ${peso} ${valor}px "${familia}"`;

  ctx.fillStyle = elemento.color || '#333333';
  ctx.textBaseline = 'top';
  ctx.textAlign = alinhamento;
  ctx.font = fonte(tamanho);

  // A fonte do PowerPoint pode não estar instalada. Em títulos de uma
  // linha, reduzimos a fonte uniformemente em vez de comprimir o texto.
  const tituloCurto = !texto.includes('\n') && (
    elemento.type === 'title' || tamanho >= 60
  );
  const larguraNatural = ctx.measureText(texto).width;
  const tamanhoAjustado = tituloCurto && larguraNatural > caixa.largura
    ? Math.max(1, tamanho * caixa.largura / larguraNatural)
    : tamanho;
  ctx.font = fonte(tamanhoAjustado);

  const linhas = quebrarLinhasMiniatura(ctx, texto, caixa.largura);
  const entrelinhas = tamanhoAjustado * 1.2;
  const maximo = Math.max(Math.floor(caixa.altura / entrelinhas), 1);
  const x = alinhamento === 'center' ? caixa.x + caixa.largura / 2
    : alinhamento === 'right' ? caixa.x + caixa.largura : caixa.x;

  for (let indice = 0; indice < Math.min(linhas.length, maximo); indice += 1) {
    ctx.fillText(linhas[indice], x, caixa.y + indice * entrelinhas);
  }
}