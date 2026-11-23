export function registrarFuncoesCriarEditorExportarDesign(editorContext) {
  editorContext.exportarDesign = function exportarDesign() {
    if (!editorContext.fabricCanvas) return;
    editorContext.fabricCanvas.discardActiveObject();
    const larguraOriginal = editorContext.fabricCanvas.getWidth();
    const alturaOriginal = editorContext.fabricCanvas.getHeight();
    const transformacaoOriginal = [...editorContext.fabricCanvas.viewportTransform];
    const fundoOriginal = editorContext.fabricCanvas.backgroundColor;
    try {
      editorContext.fabricCanvas.backgroundColor = editorContext.fundoDocumento.value || '#FFFFFF';
      editorContext.fabricCanvas.setDimensions({
        width: editorContext.larguraDocumento.value,
        height: editorContext.alturaDocumento.value
      });
      editorContext.fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      // Durante a exportação, o recorte usa coordenadas nativas do slide.
      editorContext.atualizarRecorteDaPagina();
      editorContext.fabricCanvas.requestRenderAll();
      const dataURL = editorContext.fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      });
      const link = document.createElement('a');
      const titulo = editorContext.templateTitulo.value || 'design';
      const numeroPagina = editorContext.paginaAtualIndex.value + 1;
      link.download = `${titulo}-pagina-${numeroPagina}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      editorContext.fabricCanvas.backgroundColor = fundoOriginal;
      editorContext.fabricCanvas.setDimensions({
        width: larguraOriginal,
        height: alturaOriginal
      });
      editorContext.fabricCanvas.setViewportTransform(transformacaoOriginal);
      editorContext.atualizarRecorteDaPagina();
      editorContext.ajustarVisualizacaoCanvas();
      editorContext.fabricCanvas.requestRenderAll();
    }
  };
}