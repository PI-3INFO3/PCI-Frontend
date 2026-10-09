import apiClient from "./config";

const designsApi = {
  meusDesigns(usuarioId) {
    return apiClient.get("/designs/", {
      params: {
        usuario: usuarioId,
      },
    });
  },

  meusProjetosImportantes(usuarioId) {
    return apiClient.get("/designs/", {
      params: {
        usuario: usuarioId,
        importante: true,
      },
    });
  },

  marcarImportante(id, valor) {
    return apiClient.patch(`/designs/${id}/`, {
      importante: valor,
    });
  },

  criarVazio() {
    return apiClient.post("/designs/", {
      name: "Novo Design",
    });
  },

  uploadArquivo(arquivo) {
    const formData = new FormData();

    formData.append("file", arquivo);

    return apiClient.post("/designs/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  obterDesign(id) {
    return apiClient.get(`/designs/${id}/`);
  },

  renomearDesign(id, nome) {
    return apiClient.patch(`/designs/${id}/`, {
      name: nome,
    });
  },

  alterarNome(id, nome) {
    return apiClient.patch(`/designs/${id}/`, {
      name: nome,
    });
  },

  salvarElementos(id, elementos, pageId = null) {
    const payload = {
      elements: elementos,
    };

    if (pageId !== null && pageId !== undefined) {
      payload.page_id = pageId;
    }

    return apiClient.patch(
      `/designs/${id}/save-elements/`,
      payload
    );
  },

  excluirDesign(id) {
    return apiClient.delete(`/designs/${id}/`);
  },

  obterHistorico(id) {
    return apiClient.get(`/designs/${id}/history/`);
  },

  reordenarCamadas(id, elementIds) {
    return apiClient.patch(
      `/designs/${id}/reorder-elements/`,
      {
        element_ids: elementIds,
      }
    );
  },
};

export default designsApi;