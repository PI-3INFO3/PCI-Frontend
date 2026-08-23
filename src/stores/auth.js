import { computed, ref } from "vue";
import { defineStore } from "pinia";
import authApi from "../api/authApi";
import { setTokens, clearTokens, getToken } from "../api/config";

export const useAuthStore = defineStore("auth", () => {
    const user = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const accessToken = ref(getToken("access_token"));
    const refreshToken = ref(getToken("refresh_token"));

    const isAuthenticated = computed(() => !!accessToken.value);

    function aplicarTema(tema) {
        document.body.classList.toggle('dark', tema === 'Escuro')
        localStorage.setItem('tema', tema)
    }

    async function setTheme(tema) {
        aplicarTema(tema)
        if (isAuthenticated.value) {
            try {
                await updateUser({ theme: tema })
            } catch (err) {
                console.error('Erro ao salvar tema', err)
            }
        }
    }

    async function login(email, password, rememberMe = false) {
        loading.value = true;
        error.value = null;

        try {
            const { data } = await authApi.login(email, password);
            const { access, refresh } = data;

            accessToken.value = access;
            refreshToken.value = refresh;

            setTokens(access, refresh, rememberMe);
        } catch (err) {
            error.value = "Erro ao fazer login.";
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    function logout() {
        user.value = null;
        accessToken.value = null;
        refreshToken.value = null;
        clearTokens();
    }

    async function fetchUser() {
        if (!accessToken.value) return;
        loading.value = true;
        error.value = null;
        try {
            const response = await authApi.me();
            user.value = response.data;
            if (user.value.theme) {
                aplicarTema(user.value.theme)
            }
        } catch (err) {
            error.value = 'Erro ao carregar usuário.';
            console.error(err);
            if (err.response?.status === 401) {
                logout();
            }
        } finally {
            loading.value = false;
        }
    }

    async function register(data) {
        loading.value = true;
        error.value = null;

        try {
            await authApi.register(data);
            await login(data.email, data.password);
        } catch (err) {
            error.value = "Erro ao criar usuário.";
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    async function updateUser(payload) {
        const { data } = await authApi.updateMe(payload);
        user.value = data;
    }

    async function uploadPhoto(file) {
        return authApi.uploadImage(file);
    }

    async function changePassword(currentPassword, newPassword) {
        loading.value = true;
        error.value = null;
        try {
            await authApi.changePassword(currentPassword, newPassword);
        } catch (err) {
            error.value = err.response?.data?.current_password?.[0]
                ?? 'Erro ao alterar a senha.';
            throw err;
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
        updateUser,
        uploadPhoto,
        changePassword,
        setTheme,
    };
});