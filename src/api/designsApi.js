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

    buscar(id) {
        return apiClient.get(`/desings/${id}/`);
    },
    criar(payload) {
        return apiClient.post('/desings/', payload);
    },
    atualizar(id, payload) {
        return apiClient.patch(`/desings/${id}/`, payload);
    },
    meusProjetos(usuarioId) {
        return apiClient.get('/desings/', { params: { usuario: usuarioId, meu_projeto: true } });
    },
    meusEmAndamento(usuarioId) {
        return apiClient.get('/desings/', { params: { usuario: usuarioId, em_andamento: true } });
    },

    apagar(id){
        return apiClient.delete(`/desings/${id}/`);
    },
        projetosPublicos(usuarioId) {
        return apiClient.get('/desings/', { params: { usuario: usuarioId, publico: true } });
    },
};

export default designsApi;