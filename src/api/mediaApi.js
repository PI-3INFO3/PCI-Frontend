import apiClient from './config';

export function listarImagens(pagina = 1) {
  return apiClient.get('/editor-images/', {
    params: {
      page: pagina
    }
  });
  }

export function enviarImagem(file) {
  const form = new FormData();
  form.append('file', file, file.name);
  form.append('description', file.name);
  return apiClient.post('/editor-images/', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  }

export function obterImagemPrivada(url) {
  const id = /\/editor-images\/(\d+)\/content\/?/.exec(url)?.[1];
  if (!id) throw new Error('Imagem privada não identificada.');
  return apiClient.get(`/editor-images/${id}/content/`, {
    responseType: 'blob'
  });
  }

export function listarSimbolos() {
  return apiClient.get('/symbols/');
  }

export function criarSimbolo(name, path_data) {
  return apiClient.post('/symbols/', {
    name,
    path_data
  });
  }

const mediaApi = {
  listarImagens,
  enviarImagem,
  obterImagemPrivada,
  listarSimbolos,
  criarSimbolo,
};

export default mediaApi;