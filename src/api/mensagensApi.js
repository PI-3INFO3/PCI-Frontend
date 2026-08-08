import apiClient from "./config";

const mensagensApi = {
    listarConversa(outroUsuarioId) {
        return apiClient.get('/menssagens/', { params: { com: outroUsuarioId } });
    },

    enviar(destinatarioId, content) {
        return apiClient.post('/menssagens/', { destinatario_id: destinatarioId, content });
   
    },

    delete(id){
        return apiClient.delete(`/menssagens/${id}/`)
    }
};

export default mensagensApi;