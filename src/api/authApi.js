import apiClient from "./config";

const authApi = {
    
    register(data) {
        return apiClient.post('/registro/', data);
    },

    login(email, password) {
        return apiClient.post('/token/', {
            email,
            password,
        })
    },

    me() {
        return apiClient.get('/usuarios/me/');
    },
};

export default authApi;