import apiClient from "./config";

const designsApi = {
  meusDesigns(usuarioId) {
    return apiClient.get('/desings/', { params: { usuario: usuarioId } });
  },
  meusProjetosImportantes(usuarioId) {
    return apiClient.get('/desings/', { params: { usuario: usuarioId, importante: true } });
  },
  marcarImportante(id, valor) {
    return apiClient.patch(`/desings/${id}/`, { importante: valor });
  },

  uploadArquivo(arquivo) {
    const formData = new FormData();
    formData.append('file', arquivo);
    return apiClient.post('/desings/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  obterDesign(id) {
    return apiClient.get(`/desings/${id}/`);
  },
  salvarElementos(id, elementos) {
    return apiClient.patch(`/desings/${id}/save-elements/`, { elements: elementos });
  },
  obterHistorico(id) {
    return apiClient.get(`/desings/${id}/history/`);
  },
  reordenarCamadas(id, elementIds) {
    return apiClient.patch(`/desings/${id}/reorder-elements/`, { element_ids: elementIds });
  },
};

export default designsApi;