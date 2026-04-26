import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import authApi from '../api/authApi';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const token = ref(localStorage.getItem('token') || null);

    const isAuthenticated = computed(() => !!user.value);

    async function login(email, password) {
        loading.value = true;
        error.value = null;
        try {
            const response = await authApi.login({ email, password });
            user.value = response.data.user;
            token.value = response.data.token;
            localStorage.setItem('token', token.value);
        } catch (err) {
            error.value = 'Erro ao fazer login.';
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    async function logout() {
        user.value = null;
        token.value = null
        localStorage.removeItem('token');
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

    async function register(email, name, password, user_type) {
        loading.value = true;
        error.value = null;
        try{
            const response = await authApi.register({ email, name, password, user_type });
            user.value = response.data.user;
            token.value = response.data.token;
            localStorage.setItem('token', token.value);
        }catch (err) {
            error.value = 'Erro ao criar usuário.';
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        fetchUser,
        register,
    };
});