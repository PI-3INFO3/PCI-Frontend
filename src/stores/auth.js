import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import authApi from '../api/authApi'
import { setTokens, clearTokens, getToken } from '../api/config'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pendingEmail = ref(null)

  const accessToken = ref(getToken('access_token'))
  const refreshToken = ref(getToken('refresh_token'))

  const isAuthenticated = computed(() => !!accessToken.value)

  // Aplica o tema no mesmo elemento utilizado pelo CSS global.
  function aplicarTema(tema) {
    const temaNormalizado =
      tema === 'Claro' || tema === 'claro'
        ? 'claro'
        : 'escuro'

    document.documentElement.setAttribute(
      'data-theme',
      temaNormalizado
    )

    localStorage.setItem('tema', temaNormalizado)

    return temaNormalizado
  }

  // Atualiza o tema localmente e tenta salvar na conta.
  async function setTheme(tema) {
    const temaNormalizado = aplicarTema(tema)

    if (isAuthenticated.value) {
      try {
        await updateUser({
          theme: temaNormalizado === 'claro' ? 'Claro' : 'Escuro'
        })
      } catch (err) {
        console.error('Erro ao salvar tema na conta:', err)
        throw err
      }
    }

    return temaNormalizado
  }

  async function login(email, password, rememberMe = false) {
    loading.value = true
    error.value = null

    try {
      const { data } = await authApi.login(email, password)
      const { access, refresh } = data

      accessToken.value = access
      refreshToken.value = refresh

      setTokens(access, refresh, rememberMe)
    } catch (err) {
      error.value =
        err.response?.data?.detail ?? 'Erro ao fazer login.'

      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    pendingEmail.value = null

    clearTokens()
  }

  async function fetchUser() {
    if (!accessToken.value) return

    loading.value = true
    error.value = null

    try {
      const response = await authApi.me()
      user.value = response.data

      // A preferência local tem prioridade para evitar que uma
      // resposta antiga da API sobrescreva o tema escolhido.
      const temaSalvo = localStorage.getItem('tema')

      if (temaSalvo === 'claro' || temaSalvo === 'escuro') {
        aplicarTema(temaSalvo)
      } else if (user.value?.theme) {
        aplicarTema(user.value.theme)
      } else {
        aplicarTema('escuro')
      }
    } catch (err) {
      error.value = 'Erro ao carregar usuário.'
      console.error(err)

      if (err.response?.status === 401) {
        logout()
      }
    } finally {
      loading.value = false
    }
  }

  async function register(data) {
    loading.value = true
    error.value = null
    pendingEmail.value = data.email

    try {
      await authApi.register(data)
    } catch (err) {
      error.value =
        err.response?.data?.email?.[0] ?? 'Erro ao criar usuário.'

      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(payload) {
    const { data } = await authApi.updateMe(payload)
    user.value = data

    return data
  }

  async function uploadPhoto(file) {
    return authApi.uploadImage(file)
  }

  async function changePassword(currentPassword, newPassword) {
    loading.value = true
    error.value = null

    try {
      await authApi.changePassword(currentPassword, newPassword)
    } catch (err) {
      error.value =
        err.response?.data?.current_password?.[0] ??
        'Erro ao alterar a senha.'

      throw err
    } finally {
      loading.value = false
    }
  }

  async function verify2FA(codigo) {
    const email = pendingEmail.value

    if (!email) {
      throw new Error('E-mail não encontrado para verificação.')
    }

    const { data } = await authApi.verifyEmail(email, codigo)

    accessToken.value = data.access
    refreshToken.value = data.refresh

    setTokens(data.access, data.refresh, false)

    pendingEmail.value = null

    await fetchUser()

    return data
  }

  async function resend2FACode() {
    const email = pendingEmail.value ?? user.value?.email

    if (!email) {
      throw new Error('E-mail não encontrado para reenvio.')
    }

    return authApi.resendVerificationCode(email)
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
    verify2FA,
    resend2FACode
  }
})