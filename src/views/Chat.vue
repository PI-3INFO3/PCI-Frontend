<script setup>
import { ref, computed, onMounted } from 'vue'
import { useChat } from '@/composables/useChat'
import { useAuthStore } from '@/stores/auth'
import ChatSkeleton from '@/components/skeleton/ChatSkeleton.vue'

const props = defineProps({
  outroUsuarioId: { type: [String, Number], required: true },
})

const auth = useAuthStore()
const meuId = computed(() => auth.user?.id)

const { mensagens, enviarMensagem, deletarMensagem, iniciarAtualizacaoAutomatica } = useChat(props.outroUsuarioId)
const textoMensagem = ref('')
const carregando = ref(true)

onMounted(async () => {
  await iniciarAtualizacaoAutomatica()
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
        <ion-icon name="send-outline"></ion-icon>
      </button>
    </div>
  </div>
</template>


<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
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