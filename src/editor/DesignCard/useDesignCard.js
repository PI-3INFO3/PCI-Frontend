import {
  ref,
  watch,
  nextTick,
  onMounted,
  computed,
  onBeforeUnmount
} from 'vue';

import { useRouter } from 'vue-router';
import designsApi from '@/api/designsApi';

import {
  registrarFuncoesDesignCardObterElementos
} from './handlers-obter-elementos.js';

import {
  registrarFuncoesDesignCardDesenharMiniatura
} from './handlers-desenhar-miniatura.js';

import {
  registrarRenderizadorMiniaturas
} from './handlers-renderizar-miniatura.js';

import {
  inicializarEstadoDesignCardRouter
} from './state-router.js';

export function useDesignCard(props, emit) {
  const editorContext = {
    ref,
    watch,
    nextTick,
    onMounted,
    computed,
    onBeforeUnmount,
    useRouter,
    designsApi,
    props,
    emit
  };

  registrarFuncoesDesignCardObterElementos(editorContext);

  registrarFuncoesDesignCardDesenharMiniatura(editorContext);

  // Corrige a renderização das miniaturas.
  registrarRenderizadorMiniaturas(editorContext);

  inicializarEstadoDesignCardRouter(editorContext);

  return editorContext;
}