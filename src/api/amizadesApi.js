import apiClient from "./config";

export function buscarPessoas(termo) {
      return apiClient.get('/usuarios/buscar/', { params: { q: termo } });
  }

export function enviarPedido(destinatarioId) {
      return apiClient.post('/amizades/', { destinatario_id: destinatarioId });
  }

export function listarAmigos() {
      return apiClient.get('/amizades/amigos/');
  }

export function listarPendentes() {
      return apiClient.get('/amizades/pendentes/');
  }

export function aceitar(id) {
      return apiClient.patch(`/amizades/${id}/aceitar/`);
  }

export function recusar(id) {
      return apiClient.patch(`/amizades/${id}/recusar/`);
  }

const amizadesApi = {
  buscarPessoas,
  enviarPedido,
  listarAmigos,
  listarPendentes,
  aceitar,
  recusar,
};

export default amizadesApi;