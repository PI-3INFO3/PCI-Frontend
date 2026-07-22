import apiClient from "./config";

const amizadesApi = {
    buscarPessoas(termo) {
        return apiClient.get('/usuarios/buscar/', { params: { q: termo } });
    },

    enviarPedido(destinatarioId) {
        return apiClient.post('/amizades/', { destinatario_id: destinatarioId });
    },

    listarAmigos() {
        return apiClient.get('/amizades/amigos/');
    },

    listarPendentes() {
        return apiClient.get('/amizades/pendentes/');
    },

    aceitar(id) {
        return apiClient.patch(`/amizades/${id}/aceitar/`);
    },

    recusar(id) {
        return apiClient.patch(`/amizades/${id}/recusar/`);
    },
};

export default amizadesApi;