import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  toRaw
} from 'vue';

import { useRoute, useRouter } from 'vue-router';
import designsApi from '@/api/designsApi';
import { BASE_URL } from '@/api/config';
import mediaApi from '@/api/mediaApi';
import * as fabric from 'fabric';

import { registrarFuncoesCriarEditorEhTexto } from './handlers-eh-texto.js';

import {
  registrarFuncoesCriarEditorCriarObjetoDeElemento
} from './handlers-criar-objeto-de-elemento.js';

import {
  registrarFuncoesCriarEditorManterFundoNoFundo
} from './handlers-manter-fundo-no-fundo.js';

import {
  registrarFuncoesCriarEditorInicializarCanvas
} from './handlers-inicializar-canvas.js';

import {
  registrarFuncoesCriarEditorAplicarEstadoHistorico
} from './handlers-aplicar-estado-historico.js';

import {
  registrarFuncoesCriarEditorAdicionarImagemBiblioteca
} from './handlers-adicionar-imagem-biblioteca.js';

import {
  registrarFuncoesCriarEditorAdicionarForma
} from './handlers-adicionar-forma.js';

import {
  registrarFuncoesCriarEditorObjetoFabricParaElemento
} from './handlers-objeto-fabric-para-elemento.js';

import {
  registrarFuncoesCriarEditorExportarDesign
} from './handlers-exportar-design.js';

import { registrarComandosClassicos } from './handlers-comandos-classicos.js';
import { inicializarEstadoCriarEditorRouter } from './state-router.js';

export function useCriarEditor() {
  const editorContext = {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    nextTick,
    toRaw,
    useRoute,
    useRouter,
    designsApi,
    BASE_URL,
    mediaApi,
    fabric
  };

  registrarFuncoesCriarEditorEhTexto(editorContext);
  registrarFuncoesCriarEditorCriarObjetoDeElemento(editorContext);
  registrarFuncoesCriarEditorManterFundoNoFundo(editorContext);
  registrarFuncoesCriarEditorInicializarCanvas(editorContext);
  registrarFuncoesCriarEditorAplicarEstadoHistorico(editorContext);
  registrarFuncoesCriarEditorAdicionarImagemBiblioteca(editorContext);
  registrarFuncoesCriarEditorAdicionarForma(editorContext);
  registrarFuncoesCriarEditorObjetoFabricParaElemento(editorContext);
  registrarFuncoesCriarEditorExportarDesign(editorContext);

  // Deve vir depois dos módulos que definem os comandos originais.
  registrarComandosClassicos(editorContext);

  inicializarEstadoCriarEditorRouter(editorContext);

  return editorContext;
}