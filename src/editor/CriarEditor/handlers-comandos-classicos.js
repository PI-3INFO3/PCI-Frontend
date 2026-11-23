function ativarObjetos(editor, objetos) {
  const canvas = editor.fabricCanvas;
  if (!canvas) return;

  canvas.discardActiveObject();

  if (objetos.length > 1) {
    canvas.setActiveObject(
      new editor.fabric.ActiveSelection(objetos, { canvas })
    );
  } else if (objetos.length === 1) {
    canvas.setActiveObject(objetos[0]);
  }

  canvas.requestRenderAll();
}

function comSelecaoNormalizada(editor, executar) {
  const canvas = editor.fabricCanvas;
  if (!canvas) return null;

  const selecionados = canvas
    .getActiveObjects()
    .filter(objeto => !objeto.__editorBackground);

  const multipla = selecionados.length > 1;

  if (multipla) {
    canvas.discardActiveObject();
  }

  try {
    return executar(selecionados);
  } finally {
    if (multipla && editor.fabricCanvas === canvas) {
      ativarObjetos(editor, selecionados);
    }
  }
}

export function registrarComandosClassicos(editor) {
  editor.objetosSelecionados = function objetosSelecionados() {
    return editor.fabricCanvas
      ?.getActiveObjects()
      .filter(objeto => !objeto.__editorBackground) ?? [];
  };

  editor.capturarEstadoAtual = function capturarEstadoAtual() {
    return comSelecaoNormalizada(editor, () => {
      const elementos = editor.obterObjetosUnicos()
        .map((objeto, indice) => {
          const elemento = editor.objetoFabricParaElemento(objeto);

          return elemento
            ? { ...elemento, layer_order: indice }
            : null;
        })
        .filter(Boolean);

      return JSON.stringify(elementos);
    });
  };

  editor.copiarSelecionado = function copiarSelecionado() {
    comSelecaoNormalizada(editor, selecionados => {
      editor.clipboardElementos = selecionados
        .map(editor.objetoFabricParaElemento)
        .filter(Boolean);
    });
  };

  editor.colarSelecionado = async function colarSelecionado() {
    const canvas = editor.fabricCanvas;

    if (
      !canvas ||
      !editor.clipboardElementos.length ||
      editor.restaurandoHistorico
    ) {
      return;
    }

    const elementos = editor.clipboardElementos.map(elemento => ({
      ...elemento,
      id: null,
      client_id: crypto.randomUUID(),
      posicao_x: Number(elemento.posicao_x || 0) + 25,
      posicao_y: Number(elemento.posicao_y || 0) + 25
    }));

    const criados = await Promise.all(
      elementos.map(editor.criarObjetoDeElemento)
    );

    if (editor.fabricCanvas !== canvas) return;

    const objetos = criados.filter(Boolean);
    if (!objetos.length) return;

    const estadoAnterior = editor.restaurandoHistorico;
    editor.restaurandoHistorico = true;

    try {
      canvas.discardActiveObject();
      objetos.forEach(objeto => canvas.add(objeto));
    } finally {
      editor.restaurandoHistorico = estadoAnterior;
    }

    editor.clipboardElementos = elementos;

    ativarObjetos(editor, objetos);
    editor.atualizarListaCamadas();
    editor.registrarHistorico();
    editor.agendarSalvamento();
  };

  editor.duplicarSelecionado = async function duplicarSelecionado() {
    editor.copiarSelecionado();
    await editor.colarSelecionado();
  };

  editor.deletarSelecionado = function deletarSelecionado() {
    const canvas = editor.fabricCanvas;
    const objetos = editor.objetosSelecionados();

    if (!canvas || !objetos.length) return;

    const estadoAnterior = editor.restaurandoHistorico;
    editor.restaurandoHistorico = true;

    try {
      canvas.discardActiveObject();
      objetos.forEach(objeto => canvas.remove(objeto));
    } finally {
      editor.restaurandoHistorico = estadoAnterior;
    }

    editor.objetoSelecionado.value = null;
    editor.atualizarListaCamadas();
    editor.registrarHistorico();
    editor.agendarSalvamento();

    canvas.requestRenderAll();
  };

  editor.recortarSelecionado = function recortarSelecionado() {
    if (!editor.objetosSelecionados().length) return;

    editor.copiarSelecionado();
    editor.deletarSelecionado();
  };

  editor.selecionarTudo = function selecionarTudo() {
    if (!editor.fabricCanvas) return;

    const objetos = editor.obterObjetosUnicos()
      .filter(objeto => objeto.selectable !== false);

    if (objetos.length) {
      ativarObjetos(editor, objetos);
    }
  };

  const salvarOriginal = editor.salvarDesign;

  editor.salvarDesign = function salvarDesignComSelecaoMultipla() {
    const canvas = editor.fabricCanvas;
    const selecionados = canvas?.getActiveObjects() ?? [];

    if (selecionados.length < 2) {
      return salvarOriginal();
    }

    // Normaliza as posições antes da serialização.
    canvas.discardActiveObject();

    try {
      return salvarOriginal();
    } finally {
      if (editor.fabricCanvas === canvas) {
        ativarObjetos(editor, selecionados);
      }
    }
  };

  editor.lidarComTeclado = function lidarComTeclado(evento) {
    const canvas = editor.fabricCanvas;

    if (!canvas || editor.mostrarUpload.value) return;

    const alvo = evento.target;

    const controle = alvo?.closest?.(
      'input, textarea, select, [contenteditable="true"], [role="textbox"]'
    );

    const ativo = canvas.getActiveObject();

    if (
      controle ||
      (editor.ehTexto(ativo) && ativo.isEditing)
    ) {
      return;
    }

    const tecla = evento.key.toLowerCase();
    const comando = evento.ctrlKey || evento.metaKey;

    if (comando && !evento.altKey) {
      const acoes = {
        a: editor.selecionarTudo,
        c: editor.copiarSelecionado,
        x: editor.recortarSelecionado,
        v: editor.colarSelecionado,
        d: editor.duplicarSelecionado,
        z: evento.shiftKey ? editor.refazer : editor.desfazer,
        y: editor.refazer,
        s: editor.salvarDesign,
        b: () => editor.alternarEstiloTexto('bold'),
        i: () => editor.alternarEstiloTexto('italic'),
        u: () => editor.alternarEstiloTexto('underline')
      };

      const acao = acoes[tecla];

      if (!acao) return;

      evento.preventDefault();

      if (
        evento.repeat &&
        ['v', 'd', 'x'].includes(tecla)
      ) {
        return;
      }

      Promise.resolve()
        .then(acao)
        .catch(erro => {
          console.error('[EDITOR] Falha no atalho:', erro);
        });

      return;
    }

    if (tecla === 'escape') {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      return;
    }

    if (tecla === 'delete' || tecla === 'backspace') {
      if (!editor.objetosSelecionados().length) return;

      evento.preventDefault();
      editor.deletarSelecionado();
      return;
    }

    if (
      !tecla.startsWith('arrow') ||
      !ativo ||
      evento.altKey
    ) {
      return;
    }

    evento.preventDefault();

    const passo = evento.shiftKey ? 10 : 1;

    const dx = tecla === 'arrowleft'
      ? -passo
      : tecla === 'arrowright' ? passo : 0;

    const dy = tecla === 'arrowup'
      ? -passo
      : tecla === 'arrowdown' ? passo : 0;

    if (!dx && !dy) return;

    ativo.set({
      left: (ativo.left || 0) + dx,
      top: (ativo.top || 0) + dy
    });

    ativo.setCoords();

    editor.registrarHistorico();
    editor.atualizarListaCamadas();
    editor.agendarSalvamento();

    canvas.requestRenderAll();
  };
}