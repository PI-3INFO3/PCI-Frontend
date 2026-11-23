import apiClient from './config';

export function meusDesigns(usuarioId) {
  return apiClient.get("/designs/", {
    params: {
      usuario: usuarioId
    }
  });
  }

export function meusProjetosImportantes(usuarioId) {
  return apiClient.get("/designs/", {
    params: {
      usuario: usuarioId,
      importante: true
    }
  });
  }

export function marcarImportante(id, valor) {
  return apiClient.patch(`/designs/${id}/`, {
    importante: valor
  });
  }

export function criarVazio() {
  return apiClient.post("/designs/", {
    name: "Novo Design"
  });
  }

export function obterDesign(id, resumo = false) {
  return apiClient.get(`/designs/${id}/`, {
    params: resumo ? {
      summary: '1'
    } : undefined
  });
  }

export function obterPagina(id, pageId) {
  return apiClient.get(`/designs/${id}/page/`, {
    params: {
      page_id: pageId
    }
  });
  }

export function renomearDesign(id, nome) {
  return apiClient.patch(`/designs/${id}/`, {
    name: nome
  });
  }

export function alterarNome(id, nome) {
  return apiClient.patch(`/designs/${id}/`, {
    name: nome
  });
  }

export function salvarElementos(id, elementos, pageId = null) {
  const payload = {
    elements: elementos
  };
  if (pageId !== null && pageId !== undefined) {
    payload.page_id = pageId;
  }
  return apiClient.patch(`/designs/${id}/save-elements/`, payload);
  }

export function excluirDesign(id) {
  return apiClient.delete(`/designs/${id}/`);
  }

export function obterHistorico(id) {
  return apiClient.get(`/designs/${id}/history/`);
  }

export function reordenarCamadas(id, elementIds) {
  return apiClient.patch(`/designs/${id}/reorder-elements/`, {
    element_ids: elementIds
  });
  }