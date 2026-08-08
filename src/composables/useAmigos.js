import { ref } from 'vue'
import amizadesApi from '@/api/amizadesApi'

export function useAmigos() {
  const resultadosBusca = ref([])
  const amigos = ref([])
  const pendentes = ref([])
  const carregando = ref(false)
  const erro = ref(null)

  async function buscarPessoas(termo) {
    carregando.value = true
    erro.value = null
    try {
      const { data } = await amizadesApi.buscarPessoas(termo)
      resultadosBusca.value = data
    } catch (e) {
      erro.value = 'Não foi possível buscar pessoas.'
    } finally {
      carregando.value = false
    }
  }

  async function enviarPedido(destinatarioId) {
    await amizadesApi.enviarPedido(destinatarioId)
  }

  async function carregarAmigos() {
    const { data } = await amizadesApi.listarAmigos()
    amigos.value = data
  }

  async function carregarPendentes() {
    const { data } = await amizadesApi.listarPendentes()
    pendentes.value = data
  }

  async function aceitarPedido(id) {
    await amizadesApi.aceitar(id)
    await carregarPendentes()
    await carregarAmigos()
  }

  async function recusarPedido(id) {
    await amizadesApi.recusar(id)
    await carregarPendentes()
  }

  return {
    resultadosBusca,
    amigos,
    pendentes,
    carregando,
    erro,
    buscarPessoas,
    enviarPedido,
    carregarAmigos,
    carregarPendentes,
    aceitarPedido,
    recusarPedido,
  }
}