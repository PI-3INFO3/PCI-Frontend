import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/';

// Para pegar/salvar token, respeitando onde ele foi guardado
function getToken(key) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function setTokens(access, refresh, remember) {
  // Garante que não fica duplicado nos dois storages
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('access_token', access);
  storage.setItem('refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/token')
    ) {
      original._retry = true;
      const refreshToken = getToken('refresh_token');
      if (refreshToken) {
        try {
          // Descobre em qual storage o refresh estava, pra manter consistência
          const remember = !!localStorage.getItem('refresh_token');

          const { data } = await axios.post(`${BASE_URL}token/refresh/`, {
            refresh: refreshToken, // atenção: o simplejwt espera "refresh", não "refresh_token"
          });

          setTokens(data.access, refreshToken, remember);
          original.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(original);
        } catch {
          // refresh falhou — segue para o logout
        }
      }
      clearTokens();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export { setTokens, clearTokens, getToken };
export default apiClient;