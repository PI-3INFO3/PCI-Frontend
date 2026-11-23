export function inicializarEstadoCriarEditorRouter(editorContext) {
  editorContext.router = editorContext.useRouter();
  editorContext.route = editorContext.useRoute();
  editorContext.canvasRef = editorContext.ref(null);
  editorContext.canvasAreaRef = editorContext.ref(null);
  editorContext.fabricCanvas = null;
  editorContext.resizeObserver = null;
  editorContext.timerSalvamento = null;
  editorContext.carregandoDesign = false;
  editorContext.salvamentoPendente = false;
  editorContext.canvasLoadGeneration = 0;
  editorContext.trocandoPagina = false;
  editorContext.restaurandoHistorico = false;
  editorContext.historico = [];
  editorContext.refazerHistorico = [];
  editorContext.LIMITE_HISTORICO = 40;
  editorContext.clipboardElementos = [];
  editorContext.imagensCarregadas = new Map();
  editorContext.miniaturasCache = new WeakMap();
  editorContext.designId = editorContext.ref(editorContext.route.params.id || null);
  editorContext.design = editorContext.ref(null);
  editorContext.templateTitulo = editorContext.ref('Design');
  editorContext.salvando = editorContext.ref(false);
  editorContext.mostrarUpload = editorContext.ref(!editorContext.designId.value);
  editorContext.paginas = editorContext.ref([]);
  editorContext.paginaAtualIndex = editorContext.ref(0);
  editorContext.larguraDocumento = editorContext.ref(1080);
  editorContext.alturaDocumento = editorContext.ref(1080);
  editorContext.fundoDocumento = editorContext.ref('#FFFFFF');
  editorContext.paginaAtual = editorContext.computed(() => (
    editorContext.paginas.value[editorContext.paginaAtualIndex.value] || null
  ));
  editorContext.quantidadePaginas = editorContext.computed(() => Math.max(editorContext.paginas.value.length, 1));
  editorContext.arquivoSelecionado = editorContext.ref(null);
  editorContext.enviandoUpload = editorContext.ref(false);
  editorContext.erroUpload = editorContext.ref('');
  editorContext.inputArquivoRef = editorContext.ref(null);
  editorContext.inputImagemRef = editorContext.ref(null);
  editorContext.inputSvgRef = editorContext.ref(null);
  editorContext.simbolosDisponiveis = editorContext.ref([]);
  editorContext.imagensBiblioteca = editorContext.ref([]);
  editorContext.carregandoBiblioteca = editorContext.ref(false);
  editorContext.proximaPaginaImagens = editorContext.ref(1);
  editorContext.anguloSelecionado = editorContext.ref(0);
  editorContext.possuiSelecao = editorContext.computed(() => !!editorContext.objetoSelecionado.value);
  editorContext.EXTENSOES_ACEITAS = ['.pdf', '.pptx', '.jpg', '.jpeg', '.png'];
  editorContext.menuAtivoAcima = editorContext.ref('nenhum');
  editorContext.tamanhoFonte = editorContext.ref(30);
  editorContext.corTexto = editorContext.ref('#ffffff');
  editorContext.fonteSelecionada = editorContext.ref('Poppins');
  editorContext.pesoTexto = editorContext.ref('bold');
  editorContext.estiloTexto = editorContext.ref('normal');
  editorContext.alinhamentoTexto = editorContext.ref('left');
  editorContext.fontesDisponiveis = [
    'Poppins', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
    'Courier New', 'Verdana', 'Trebuchet MS', 'Impact', 'sans-serif'
  ];
  editorContext.coresTexto = editorContext.ref(['#FFFFFF', '#FF5700', '#000000', '#FFD166', '#4CC9F0']);
  editorContext.camadas = editorContext.ref([]);
  editorContext.objetoSelecionado = editorContext.ref(null);
  editorContext.ehTextoSelecionado = editorContext.computed(() => (
    editorContext.ehTexto(editorContext.fabricCanvas?.getActiveObject())
  ));
  editorContext.ehFormaSelecionada = editorContext.computed(() => (
    editorContext.ehForma(editorContext.fabricCanvas?.getActiveObject())
  ));
  editorContext.formasDisponiveis = [{
    tipo: 'rect',
    nome: 'Retângulo',
    icone: 'square-outline'
  }, {
    tipo: 'circle',
    nome: 'Círculo',
    icone: 'ellipse-outline'
  }, {
    tipo: 'triangle',
    nome: 'Triângulo',
    icone: 'triangle-outline'
  }, {
    tipo: 'star',
    nome: 'Estrela',
    icone: 'star-outline'
  }];
  editorContext.onMounted(() => {
    editorContext.carregarSimbolos();
    editorContext.inicializarCanvas();
  });
  editorContext.onBeforeUnmount(() => {
    // Cancela qualquer carregamento que esteja aguardando imagens ou o próximo frame.
    editorContext.canvasLoadGeneration += 1;
    editorContext.carregandoDesign = false;
    editorContext.trocandoPagina = false;
    window.removeEventListener('keydown', editorContext.lidarComTeclado);
    if (editorContext.resizeObserver) {
      editorContext.resizeObserver.disconnect();
      editorContext.resizeObserver = null;
    }
    if (editorContext.timerSalvamento) {
      clearTimeout(editorContext.timerSalvamento);
    }
    editorContext.salvamentoPendente = false;
    for (const promessa of editorContext.imagensCarregadas.values()) {
      Promise.resolve(promessa).then(url => URL.revokeObjectURL(url)).catch(() => {});
    }
    editorContext.imagensCarregadas.clear();
    if (editorContext.fabricCanvas) {
      editorContext.fabricCanvas.dispose();
      editorContext.fabricCanvas = null;
    }
  });
}