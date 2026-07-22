<script setup>
import { ref, computed } from 'vue'
import { useChat } from '@/composables/useChat'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  outroUsuarioId: { type: [String, Number], required: true },
})

const auth = useAuthStore()
const meuId = computed(() => auth.user?.id)

const { mensagens, enviarMensagem, iniciarAtualizacaoAutomatica } = useChat(props.outroUsuarioId)
const textoMensagem = ref('')

iniciarAtualizacaoAutomatica()

async function enviar() {
  const texto = textoMensagem.value
  textoMensagem.value = ''
  await enviarMensagem(texto)
}
</script>

<template>
  <div class="chat-container">
    <div class="chat-mensagens">
      <div
        v-for="msg in mensagens"
        :key="msg.id"
        class="balao"
        :class="msg.remetente === meuId ? 'balao-minha' : 'balao-outro'"
      >
        {{ msg.content }}
      </div>
    </div>

    <div class="chat-input-area">
      <input
        v-model="textoMensagem"
        @keyup.enter="enviar"
        type="text"
        placeholder="Mensagem"
        class="chat-input"
      />
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
.balao {
  max-width: 75%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
}
.balao-minha {
  align-self: flex-end;
  background: rgba(255, 117, 0, 0.15);
  border: 1px solid #FF7500;
  color: var(--cor-texto);
}
.balao-outro {
  align-self: flex-start;
  background: var(--cor-fundo-secundaria);
  border: 1px solid var(--cor-borda);
  color: var(--cor-texto);
}
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