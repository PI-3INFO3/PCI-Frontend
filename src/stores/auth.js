import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import authApi from '../api/authApi';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const accessToken = ref(localStorage.getItem('access_token'));
    const refreshToken = ref(localStorage.getItem('refresh_token'));

    const isAuthenticated = computed(() => !!user.value);

    async function login(email, password) {
        loading.value = true;
        error.value = null;

        try {
            const { data } = await authApi.login(email, password);

            accessToken.value = data.access_token;
            refreshToken.value = data.refresh_token;

            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);



        } catch (err) {
            error.value = 'Erro ao fazer login.';
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    function logout() {
        accessToken.value = null;
        refreshToken.value = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    async function fetchUser() {
        if (!token.value) return;
        loading.value = true;
        error.value = null;
        try {
            const response = await authApi.me(token.value);
            user.value = response.data;
        } catch (err) {
            error.value = 'Erro ao carregar usuário.';
            console.error(err);
            logout()
        } finally {
            loading.value = false;
        }
    }

    async function register(formata) {
        loading.value = true;
        error.value = null;

        try{
            await authApi.register(data);

            await login(data.email, data.password);
        }catch (err) {
            error.value = 'Erro ao criar usuário.';
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    return {
        user,
        accessToken,
        refreshToken,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        fetchUser,
        register,
    };
});