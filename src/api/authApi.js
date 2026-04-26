import apiClient from "./config";

const authApi = {
    register(data) {
        return apiClient.post('/registro/', data);
    },

    login(email, password) {
        return apiClient.post('/auth/token/', {
            email,
            password,
        })
    },

    me() {
        return apiClient.get('/users/me/');
    },
};

export default authApi;