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
};

export default designsApi;