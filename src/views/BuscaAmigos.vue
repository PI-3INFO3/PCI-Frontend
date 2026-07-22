<script setup>
import { ref } from 'vue'
import { useAmigos } from '@/composables/useAmigos'

const termo = ref('')
const { resultadosBusca, buscarPessoas, enviarPedido } = useAmigos()
const enviados = ref(new Set())

function buscar() {
  buscarPessoas(termo.value)
}

async function adicionar(usuario) {
  await enviarPedido(usuario.id)
  enviados.value.add(usuario.id)
}
</script>

<template>
  <div class="busca-container">
    <input
      v-model="termo"
      @keyup.enter="buscar"
      type="text"
      placeholder="Buscar por nome ou email"
      class="busca-input"
    />

    <ul class="busca-lista">
      <li v-for="usuario in resultadosBusca" :key="usuario.id" class="busca-item">
        <span>{{ usuario.name || usuario.email }}</span>
        <button
          v-if="!enviados.has(usuario.id)"
          @click="adicionar(usuario)"
          class="btn-adicionar"
        >
          Adicionar
        </button>
        <span v-else class="pedido-enviado">Pedido enviado</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.busca-container { padding: 16px; }
.busca-input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--cor-borda);
  background: var(--cor-fundo-secundaria);
  color: var(--cor-texto);
}
.busca-lista { list-style: none; margin-top: 16px; }
.busca-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--cor-borda);
}
.btn-adicionar {
  background: #FF7500;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
}
.pedido-enviado { color: var(--cor-texto-secundario); font-size: 13px; }
</style>