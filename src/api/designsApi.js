import apiClient from "./config";

const designsApi = {
  meusDesigns(usuarioId) {
    return apiClient.get('/designs/', { params: { usuario: usuarioId } });
  },
  meusProjetosImportantes(usuarioId) {
    return apiClient.get('/designs/', { params: { usuario: usuarioId, importante: true } });
  },
  marcarImportante(id, valor) {
    return apiClient.patch(`/designs/${id}/`, { importante: valor });
  },

  criarVazio() {
    return apiClient.post('/designs/', { name: 'Novo Design' });
  },
  uploadArquivo(arquivo) {
    const formData = new FormData();
    formData.append('file', arquivo);
    return apiClient.post('/designs/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  obterDesign(id) {
    return apiClient.get(`/designs/${id}/`);
  },
  salvarElementos(id, elementos) {
    return apiClient.patch(`/designs/${id}/save-elements/`, { elements: elementos });
  },
  obterHistorico(id) {
    return apiClient.get(`/designs/${id}/history/`);
  },
  reordenarCamadas(id, elementIds) {
    return apiClient.patch(`/designs/${id}/reorder-elements/`, { element_ids: elementIds });
  },
};

export default designsApi;