import axios from 'axios';

const API_LOCAL = 'http://127.0.0.1:8000/api/';
const API_PRODUCAO = 'https://pci.class.fabricadesoftware.ifc.edu.br/api/';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ?? (import.meta.env.DEV ? API_LOCAL : API_PRODUCAO);

// Resolve URLs de mídia que vêm do backend em ambiente local ou produção.
export function resolverUrlMidia(url) {
  if (!url) return '';

  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  try {
    const origem = new URL(BASE_URL, window.location.origin).origin;
    return new URL(url, origem).href;
  } catch {
    return '';
  }
}

function getToken(key) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function setTokens(access, refresh, remember) {
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
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(config => {
  const token = getToken('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;

    if (
      error.response?.status === 401
      && original
      && !original._retry
      && !original.url?.includes('/token')
    ) {
      original._retry = true;

      const refreshToken = getToken('refresh_token');

      if (refreshToken) {
        try {
          // Mantém os tokens no mesmo armazenamento.
          const remember = !!localStorage.getItem('refresh_token');

          const resposta = await axios.post(
            `${BASE_URL.replace(/\/$/, '')}/token/refresh/`,
            { refresh: refreshToken }
          );

          const data = resposta.data;

          setTokens(data.access, refreshToken, remember);

          original.headers.Authorization = `Bearer ${data.access}`;

          return apiClient(original);
        } catch {
          // Se a renovação falhar, continua para o logout.
        }
      }

      clearTokens();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export { setTokens, clearTokens, getToken };
export default apiClient;