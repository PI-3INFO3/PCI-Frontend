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

const {
  mensagens,
  enviando,
  enviarMensagem,
  deletarMensagem,
  editarMensagem,
  iniciarAtualizacaoAutomatica,
} = useChat(props.outroUsuarioId)

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

  const [respostaUsuario] = await Promise.all([
    usuariosApi.obterPorId(props.outroUsuarioId),
    iniciarAtualizacaoAutomatica(),
  ])

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
  <button
  class="btn-voltar"
  @click="router.back()"
  aria-label="Voltar"
  title="Voltar"
>
  <ion-icon name="arrow-back-outline"></ion-icon>
</button>


  <img
    v-if="outroUsuario.profile_photo"
    :src="outroUsuario.profile_photo.url"
    alt=""
    class="chat-topo-avatar"
  />

  <div
    v-else
    class="chat-topo-avatar chat-topo-avatar-vazio"
  >
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
      <button v-if="mensagemEditando" class="btn-cancelar-edicao" @click="cancelarEdicao" title="Cancelar edição">
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

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  padding: 12px;
  box-sizing: border-box;
  scrollbar-width: none;
}

.chat-topo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--cor-borda);
  margin-bottom: 12px;
}
.chat-topo-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.chat-topo-avatar-vazio {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cor-fundo-secundaria);
  border: 1px solid var(--cor-borda);
  color: var(--cor-texto-secundario);
  font-size: 15px;
  font-weight: 600;
}
.chat-topo-nome {
  font-size: 16px;
  font-weight: 600;
  color: var(--cor-texto);
}

.chat-mensagens {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.balao-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 75%;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
.wrapper-minha { align-self: flex-end; flex-direction: row-reverse; }
.wrapper-outro { align-self: flex-start; }

.balao {
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  overflow-wrap: break-word;
  word-break: break-word;
}.btn-voltar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  background: transparent;
  border: none;
  color: var(--cor-texto);

  font-size: 24px;
  cursor: pointer;

  border-radius: 50%;
  transition: background .15s ease;
}

.btn-voltar:hover {
  background: var(--cor-fundo-secundaria);
}

.btn-voltar:active {
  background: var(--cor-borda);
}

.balao-minha {
  background: rgba(255, 117, 0, 0.15);
  border: 1px solid #FF7500;
  color: var(--cor-texto);
}
.balao-outro {
  background: var(--cor-fundo-secundaria);
  border: 1px solid var(--cor-borda);
  color: var(--cor-texto);
}

/* Três pontinhos: escondido por padrão, só aparece com mouse (hover) */
.btn-menu {
  background: none;
  border: none;
  color: var(--cor-texto-secundario);
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity .15s ease;
}
@media (hover: hover) and (pointer: fine) {
  .balao-wrapper:hover .btn-menu {
    opacity: 1;
  }
}

/* Menu suspenso */
.menu-msg {
  position: absolute;
  top: 100%;
  margin-top: 4px;
  z-index: 20;
  background: var(--cor-fundo-secundaria);
  border: 1px solid var(--cor-borda);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  min-width: 130px;
}
.menu-minha { right: 0; }
.menu-outro { left: 0; }

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  color: var(--cor-texto);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
}
.menu-item:active { background: var(--cor-borda); }
.menu-apagar { color: #e74c3c; }

.chat-input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}
.btn-cancelar-edicao {
  background: none;
  border: none;
  color: var(--cor-texto-secundario);
  font-size: 22px;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
}
.chat-input {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid var(--cor-borda);
  background: var(--cor-fundo-secundaria);
  color: var(--cor-texto);
}
.chat-enviar {
  background: #FF7500;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: #fff;
  font-size: 18px;
}
</style>