<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useChat } from '@/composables/useChat'
import { useAuthStore } from '@/stores/auth'
import usuariosApi from '@/api/usuariosApi'
import ChatSkeleton from '@/components/skeleton/ChatSkeleton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  outroUsuarioId: {
    type: [String, Number],
    required: true,
  },
})

const auth = useAuthStore()
const meuId = computed(() => auth.user?.id)

const chat = useChat(props.outroUsuarioId);
const mensagens = chat.mensagens;
const enviando = chat.enviando;
const enviarMensagem = chat.enviarMensagem;
const deletarMensagem = chat.deletarMensagem;
const editarMensagem = chat.editarMensagem;
const iniciarAtualizacaoAutomatica = chat.iniciarAtualizacaoAutomatica;

const textoMensagem = ref('')
const carregando = ref(true)
const outroUsuario = ref(null)

const menuAbertoId = ref(null)
const mensagemEditando = ref(null)

let pressTimer = null
const TEMPO_PRESSIONAR = 500

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchUser()
  }

  const requisicaoUsuario = usuariosApi.obterPorId(props.outroUsuarioId)
  const atualizacaoAutomatica = iniciarAtualizacaoAutomatica()
  const respostaUsuario = await requisicaoUsuario
  await atualizacaoAutomatica

  outroUsuario.value = respostaUsuario.data
  carregando.value = false

  document.addEventListener('click', fecharMenuFora)
})

onUnmounted(() => {
  document.removeEventListener('click', fecharMenuFora)
  clearTimeout(pressTimer)
})

function fecharMenuFora(evento) {
  if (!evento.target.closest('.balao-wrapper')) {
    menuAbertoId.value = null
  }
}

function abrirFecharMenu(msg) {
  menuAbertoId.value =
    menuAbertoId.value === msg.id ? null : msg.id
}

function iniciarPressao(msg) {
  if (msg.remetente !== meuId.value) return

  pressTimer = setTimeout(() => {
    menuAbertoId.value = msg.id
  }, TEMPO_PRESSIONAR)
}

function cancelarPressao() {
  clearTimeout(pressTimer)
}

function iniciarEdicao(msg) {
  mensagemEditando.value = msg
  textoMensagem.value = msg.content
  menuAbertoId.value = null
}

function cancelarEdicao() {
  mensagemEditando.value = null
  textoMensagem.value = ''
}

async function apagar(mensagem) {
  menuAbertoId.value = null

  if (confirm('Apagar esta mensagem?')) {
    await deletarMensagem(mensagem.id)
  }
}

async function enviar() {
  const texto = textoMensagem.value.trim()

  if (!texto) return

  if (mensagemEditando.value) {
    await editarMensagem(
      mensagemEditando.value.id,
      texto
    )

    cancelarEdicao()
    return
  }

  textoMensagem.value = ''
  await enviarMensagem(texto)
}
</script>

<template>
<div class="chat-container">
    <div v-if="outroUsuario" class="chat-topo">
  <button class="btn-voltar" @click="router.back()" aria-label="Voltar" title="Voltar">
  <ion-icon name="arrow-back-outline"></ion-icon>
</button>
  <img
    v-if="outroUsuario.profile_photo"
    :src="outroUsuario.profile_photo.url"
    alt=""
    class="chat-topo-avatar"
  />
  <div v-else class="chat-topo-avatar chat-topo-avatar-vazio">
    {{ (outroUsuario.name || outroUsuario.email || '?').charAt(0).toUpperCase() }}
  </div>
  <span class="chat-topo-nome">
    {{ outroUsuario.name || outroUsuario.email }}
  </span>
</div>
    <ChatSkeleton v-if="carregando" />
    <div v-else class="chat-mensagens">
      <div
        v-for="msg in mensagens"
        :key="msg.id"
        class="balao-wrapper"
        :class="msg.remetente === meuId ? 'wrapper-minha' : 'wrapper-outro'"
        @pointerdown="iniciarPressao(msg)"
        @pointerup="cancelarPressao"
        @pointerleave="cancelarPressao"
        @pointercancel="cancelarPressao"
      >
        <div class="balao" :class="msg.remetente === meuId ? 'balao-minha' : 'balao-outro'">
          {{ msg.content }}
        </div>
        <button
          v-if="msg.remetente === meuId"
          class="btn-menu"
          @click.stop="abrirFecharMenu(msg)"
          title="Mais opções"
        >
          <ion-icon name="ellipsis-vertical"></ion-icon>
        </button>
        <div
          v-if="menuAbertoId === msg.id"
          class="menu-msg"
          :class="msg.remetente === meuId ? 'menu-minha' : 'menu-outro'"
          @click.stop
        >
          <button class="menu-item" @click="iniciarEdicao(msg)">
            <ion-icon name="create-outline"></ion-icon> Editar
          </button>
          <button class="menu-item menu-apagar" @click="apagar(msg)">
            <ion-icon name="trash-outline"></ion-icon> Apagar
          </button>
        </div>
      </div>
    </div>
    <div class="chat-input-area">
      <button
        v-if="mensagemEditando"
        class="btn-cancelar-edicao"
        @click="cancelarEdicao"
        title="Cancelar edição"
      >
        <ion-icon name="close-outline"></ion-icon>
      </button>
      <input
        v-model="textoMensagem"
        @keyup.enter="enviar"
        type="text"
        :placeholder="mensagemEditando ? 'Editar mensagem' : 'Mensagem'"
        class="chat-input"
      />
      <button @click="enviar" class="chat-enviar">
        <ion-icon :name="mensagemEditando ? 'checkmark-outline' : 'send'"></ion-icon>
      </button>
    </div>
  </div>
</template>

<style scoped src="@/assets/css/Chat.css"></style>