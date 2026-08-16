<script setup>
import { ref, computed, onMounted } from 'vue'
import { useChat } from '@/composables/useChat'
import { useAuthStore } from '@/stores/auth'
import usuariosApi from '@/api/usuariosApi'
import ChatSkeleton from '@/components/skeleton/ChatSkeleton.vue'

const props = defineProps({
  outroUsuarioId: { type: [String, Number], required: true },
})

const auth = useAuthStore()
const meuId = computed(() => auth.user?.id)

const { mensagens, enviarMensagem, deletarMensagem, iniciarAtualizacaoAutomatica } = useChat(props.outroUsuarioId)
const textoMensagem = ref('')
const carregando = ref(true)
const outroUsuario = ref(null)

onMounted(async () => {
if(!auth.user){
await auth.fetchUser()
}

  const [respostaUsuario] = await Promise.all([
    usuariosApi.obterPorId(props.outroUsuarioId),
    iniciarAtualizacaoAutomatica(),
  ])
  outroUsuario.value = respostaUsuario.data
  carregando.value = false
})

async function enviar() {
  const texto = textoMensagem.value
  textoMensagem.value = ''
  await enviarMensagem(texto)
}

async function apagar(mensagem) {
  if (confirm('Apagar esta mensagem?')) {
    await deletarMensagem(mensagem.id)
  }
}
</script>

<template>
  <div class="chat-container">
    <div v-if="outroUsuario" class="chat-topo">
      <img
        v-if="outroUsuario.profile_photo"
        :src="outroUsuario.profile_photo.url"
        alt=""
        class="chat-topo-avatar"
      />
      <div v-else class="chat-topo-avatar chat-topo-avatar-vazio">
        {{ (outroUsuario.name || outroUsuario.email || '?').charAt(0).toUpperCase() }}
      </div>
      <span class="chat-topo-nome">{{ outroUsuario.name || outroUsuario.email }}</span>
    </div>

    <ChatSkeleton v-if="carregando" />

    <div v-else class="chat-mensagens">
      <div
        v-for="msg in mensagens"
        :key="msg.id"
        class="balao-wrapper"
        :class="msg.remetente === meuId ? 'wrapper-minha' : 'wrapper-outro'"
      >
        <div class="balao" :class="msg.remetente === meuId ? 'balao-minha' : 'balao-outro'">
          {{ msg.content }}
        </div>
        <button v-if="msg.remetente === meuId" class="btn-apagar" @click="apagar(msg)" title="Apagar mensagem">
          <ion-icon name="trash-outline"></ion-icon>
        </button>
      </div>
    </div>

    <div class="chat-input-area">
      <input v-model="textoMensagem" @keyup.enter="enviar" type="text" placeholder="Mensagem" class="chat-input" />
      <button @click="enviar" class="chat-enviar">
        <ion-icon name="send"></ion-icon>
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
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 75%;
}
.wrapper-minha { align-self: flex-end; flex-direction: row-reverse; }
.wrapper-outro { align-self: flex-start; }

.balao {
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;

  overflow-wrap:break-word ;
  word-break:break-word ;
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

.btn-apagar {
  background: none;
  border: none;
  color: var(--cor-texto-secundario);
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  opacity: 0.6;
}
.btn-apagar:active { opacity: 1; }

.chat-input-area {
  display: flex;
  gap: 8px;
  margin-top: 12px;
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