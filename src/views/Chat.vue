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
  try {
    if (!auth.user) {
      await auth.fetchUser()
    }

    const [respostaUsuario] = await Promise.all([
      usuariosApi.obterPorId(props.outroUsuarioId),
      iniciarAtualizacaoAutomatica(),
    ])

    outroUsuario.value = respostaUsuario.data

  } catch (e) {
    console.error('Erro ao carregar chat:', e)
  } finally {
    carregando.value = false
  }

  document.addEventListener('click', fecharMenuFora)
})


onUnmounted(() => {
  document.removeEventListener('click', fecharMenuFora)
  clearTimeout(pressTimer)
})


// --------------------------------
// ABRIR PERFIL DO USUÁRIO
// --------------------------------

function abrirPerfilUsuario() {
  if (!props.outroUsuarioId) {
    return
  }

  router.push(`/perfil/${props.outroUsuarioId}`)
}


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
  if (msg.remetente !== meuId.value) {
    return
  }

  pressTimer = setTimeout(() => {
    menuAbertoId.value = msg.id
  }, TEMPO_PRESSIONAR)
}


function cancelarPressao() {
  clearTimeout(pressTimer)
}


// --------------------------------
// EDITAR
// --------------------------------

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

  if (!texto) {
    return
  }

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

    <!-- =================================
         TOPO DO CHAT
    ================================== -->

    <div
      v-if="outroUsuario"
      class="chat-topo"
    >

      <!-- VOLTAR -->

      <button
        class="btn-voltar"
        @click="router.back()"
        aria-label="Voltar"
        title="Voltar"
      >
        <ion-icon name="arrow-back-outline"></ion-icon>
      </button>


      <button
        class="usuario-chat"
        @click="abrirPerfilUsuario"
        type="button"
        :aria-label="`Abrir perfil de ${outroUsuario.name || outroUsuario.email}`"
      >

        <!-- FOTO -->

        <img
          v-if="outroUsuario.profile_photo?.url"
          :src="outroUsuario.profile_photo.url"
          alt=""
          class="chat-topo-avatar"
        />

        <!-- FOTO PADRÃO -->

        <div
          v-else
          class="chat-topo-avatar chat-topo-avatar-vazio"
        >
          {{
            (
              outroUsuario.name ||
              outroUsuario.email ||
              '?'
            )
              .charAt(0)
              .toUpperCase()
          }}
        </div>


        <!-- NOME -->

        <span class="chat-topo-nome">
          {{
            outroUsuario.name ||
            outroUsuario.email
          }}
        </span>

      </button>

    </div>


    <!-- =================================
         CARREGANDO
    ================================== -->

    <ChatSkeleton
      v-if="carregando"
    />


    <!-- =================================
         MENSAGENS
    ================================== -->

    <div
      v-else
      class="chat-mensagens"
    >

      <div
        v-for="msg in mensagens"
        :key="msg.id"
        class="balao-wrapper"
        :class="
          msg.remetente === meuId
            ? 'wrapper-minha'
            : 'wrapper-outro'
        "
        @pointerdown="iniciarPressao(msg)"
        @pointerup="cancelarPressao"
        @pointerleave="cancelarPressao"
        @pointercancel="cancelarPressao"
      >

        <!-- BALÃO -->

        <div
          class="balao"
          :class="
            msg.remetente === meuId
              ? 'balao-minha'
              : 'balao-outro'
          "
        >
          {{ msg.content }}
        </div>


        <!-- MENU DA MINHA MENSAGEM -->

        <button
          v-if="msg.remetente === meuId"
          class="btn-menu"
          @click.stop="abrirFecharMenu(msg)"
          title="Mais opções"
        >
          <ion-icon name="ellipsis-vertical"></ion-icon>
        </button>


        <!-- MENU -->

        <div
          v-if="menuAbertoId === msg.id"
          class="menu-msg"
          :class="
            msg.remetente === meuId
              ? 'menu-minha'
              : 'menu-outro'
          "
          @click.stop
        >

          <button
            class="menu-item"
            @click="iniciarEdicao(msg)"
          >
            <ion-icon name="create-outline"></ion-icon>

            Editar
          </button>


          <button
            class="menu-item menu-apagar"
            @click="apagar(msg)"
          >
            <ion-icon name="trash-outline"></ion-icon>

            Apagar
          </button>

        </div>

      </div>

    </div>


    <!-- =================================
         CAMPO DE MENSAGEM
    ================================== -->

    <div class="chat-input-area">

      <!-- CANCELAR EDIÇÃO -->

      <button
        v-if="mensagemEditando"
        class="btn-cancelar-edicao"
        @click="cancelarEdicao"
        title="Cancelar edição"
      >
        <ion-icon name="close-outline"></ion-icon>
      </button>


      <!-- INPUT -->

      <input
        v-model="textoMensagem"
        @keyup.enter="enviar"
        type="text"
        :placeholder="
          mensagemEditando
            ? 'Editar mensagem'
            : 'Mensagem'
        "
        class="chat-input"
      />


      <!-- ENVIAR -->

      <button
        @click="enviar"
        class="chat-enviar"
      >
        <ion-icon
          :name="
            mensagemEditando
              ? 'checkmark-outline'
              : 'send'
          "
        ></ion-icon>
      </button>

    </div>

  </div>

</template>


<style scoped>

/* =================================
   CONTAINER
================================= */

.chat-container {
  display: flex;
  flex-direction: column;

  height: 100vh;
  height: 100dvh;

  padding: 12px;

  box-sizing: border-box;

  scrollbar-width: none;
}


/* =================================
   TOPO
================================= */

.chat-topo {
  display: flex;

  align-items: center;

  gap: 8px;

  padding-bottom: 12px;

  border-bottom: 1px solid var(--cor-borda);

  margin-bottom: 12px;
}


/* =================================
   BOTÃO VOLTAR
================================= */

.btn-voltar {
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

  transition:
    background .15s ease;
}


.btn-voltar:hover {
  background: var(--cor-fundo-secundaria);
}


.btn-voltar:active {
  background: var(--cor-borda);
}


/* =================================
   USUÁRIO DO CHAT
================================= */

.usuario-chat {
  display: flex;

  align-items: center;

  gap: 10px;

  flex: 1;

  min-width: 0;

  padding: 4px 8px;

  background: transparent;

  border: none;

  border-radius: 10px;

  color: var(--cor-texto);

  cursor: pointer;

  text-align: left;

  transition:
    background .15s ease;
}


.usuario-chat:hover {
  background: var(--cor-fundo-secundaria);
}


.usuario-chat:active {
  background: var(--cor-borda);
}


/* =================================
   AVATAR
================================= */

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


/* =================================
   NOME
================================= */

.chat-topo-nome {
  min-width: 0;

  overflow: hidden;

  white-space: nowrap;

  text-overflow: ellipsis;

  font-size: 16px;

  font-weight: 600;

  color: var(--cor-texto);
}


/* =================================
   MENSAGENS
================================= */

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


.wrapper-minha {
  align-self: flex-end;

  flex-direction: row-reverse;
}


.wrapper-outro {
  align-self: flex-start;
}


.balao {
  padding: 8px 12px;

  border-radius: 12px;

  font-size: 14px;

  overflow-wrap: break-word;

  word-break: break-word;
}


/* =================================
   BALÕES
================================= */

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


/* =================================
   BOTÃO MENU
================================= */

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


/* =================================
   MENU
================================= */

.menu-msg {
  position: absolute;

  top: 100%;

  margin-top: 4px;

  z-index: 20;

  background: var(--cor-fundo-secundaria);

  border: 1px solid var(--cor-borda);

  border-radius: 10px;

  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.25);

  overflow: hidden;

  min-width: 130px;
}


.menu-minha {
  right: 0;
}


.menu-outro {
  left: 0;
}


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


.menu-item:active {
  background: var(--cor-borda);
}


.menu-apagar {
  color: #e74c3c;
}


/* =================================
   INPUT
================================= */

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

  cursor: pointer;
}

</style>
