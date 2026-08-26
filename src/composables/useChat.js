import { ref, onUnmounted } from 'vue'
import mensagensApi from '@/api/mensagensApi'

export function useChat(outroUsuarioId) {
  const mensagens = ref([])
  const enviando = ref(false)
  let intervalo = null

  async function carregarMensagens() {
    const { data } = await mensagensApi.listarConversa(outroUsuarioId)
    mensagens.value = data.results ?? data
  }

  async function enviarMensagem(texto) {
    if (!texto.trim()) return

    enviando.value = true

    try {
      await mensagensApi.enviar(outroUsuarioId, texto)
      await carregarMensagens()
    } finally {
      enviando.value = false
    }
  }

  async function deletarMensagem(id) {
    await mensagensApi.delete(id)
    await carregarMensagens()
  }

  async function editarMensagem(id, texto) {
    if (!texto.trim()) return

    await mensagensApi.editar(id, texto)
    await carregarMensagens()
  }

  function iniciarAtualizacaoAutomatica() {
    carregarMensagens()
    intervalo = setInterval(carregarMensagens, 3000)
  }

  onUnmounted(() => {
    if (intervalo) {
      clearInterval(intervalo)
    }
  })

  return {
    mensagens,
    enviando,
    carregarMensagens,
    enviarMensagem,
    deletarMensagem,
    editarMensagem,
    iniciarAtualizacaoAutomatica
  }
}
