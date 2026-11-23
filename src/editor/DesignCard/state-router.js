export function inicializarEstadoDesignCardRouter(editorContext) {
  editorContext.router = editorContext.useRouter();
  editorContext.quantidadePaginas = editorContext.computed(() => {
    if (Array.isArray(editorContext.props.design.pages) && editorContext.props.design.pages.length > 0) {
      return editorContext.props.design.pages.length;
    }
    return 1;
  });
  editorContext.canvasElement = editorContext.ref(null);
  editorContext.editandoNome = editorContext.ref(false);
  editorContext.nomeEditado = editorContext.ref("");
  editorContext.carregandoAcao = editorContext.ref(false);
  editorContext.erro = editorContext.ref("");
  editorContext.mostrarConfirmacao = editorContext.ref(false);
  editorContext.resizeObserver = null;
  editorContext.versaoDesenho = 0;
  editorContext.nomeDesign = () => editorContext.props.design.name || "Design sem nome";
  editorContext.watch(() => editorContext.props.design, () => {
    editorContext.desenharMiniatura();
  }, {
    deep: true
  });
  editorContext.onMounted(async () => {
    await editorContext.desenharMiniatura();
    if (typeof ResizeObserver !== "undefined") {
      editorContext.resizeObserver = new ResizeObserver(() => {
        editorContext.desenharMiniatura();
      });
      if (editorContext.canvasElement.value?.parentElement) {
        editorContext.resizeObserver.observe(editorContext.canvasElement.value.parentElement);
      }
    }
  });
  editorContext.onBeforeUnmount(() => {
    editorContext.versaoDesenho++;
    editorContext.resizeObserver?.disconnect();
  });
}