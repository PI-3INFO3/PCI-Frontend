import apiClient from "./config";

const modelosApi = {
    listar() {
        return apiClient.get('/modelos/');
    },
};

export default modelosApi;