<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAmigos } from '@/composables/useAmigos'
import { useAuthStore } from '@/stores/auth'
import FooterComponents from '../components/FooterComponents.vue'

const router = useRouter()
const auth = useAuthStore()
const meuId = computed(() => auth.user?.id)

const { amigos, resultadosBusca, carregarAmigos, buscarPessoas, enviarPedido } = useAmigos()
const termo = ref('')
const enviados = ref(new Set())

let debounceTimer = null

onMounted(() => {
  carregarAmigos()
})

watch(termo, (novoValor) => {
  clearTimeout(debounceTimer)

  if (!novoValor.trim()) {
    resultadosBusca.value = []
    return
  }

  debounceTimer = setTimeout(() => {
    buscarPessoas(novoValor)
  }, 400)
})

async function adicionar(usuario) {
  await enviarPedido(usuario.id)
  enviados.value.add(usuario.id)
}

function outroUsuario(amizade) {
  return amizade.remetente.id === meuId.value ? amizade.destinatario : amizade.remetente
}

function abrirConversa(amizade) {
  const outro = outroUsuario(amizade)
  router.push({ name: 'chat', params: { outroUsuarioId: outro.id } })
}
</script>

<template>
  <div class="lista-container">
    <div class="lista-topo">
      <h2>Conversas</h2>
    </div>

    <input
      v-model="termo"
      type="text"
      placeholder="Buscar por nome ou email"
      class="busca-input"
    />

    <!-- Resultados da busca (só aparece enquanto tem termo digitado) -->
    <section v-if="termo.trim()" class="secao-busca">
      <h3 v-if="!resultadosBusca.length">Nenhum resultado</h3>
      <div v-for="usuario in resultadosBusca" :key="usuario.id" class="busca-item">
        <div class="busca-info">
          <img
            v-if="usuario.profile_photo"
            :src="usuario.profile_photo.url"
            alt=""
            class="avatar"
          />
          <div v-else class="avatar avatar-vazio">
            {{ (usuario.name || usuario.email || '?').charAt(0).toUpperCase() }}
          </div>
          <span>{{ usuario.name || usuario.email }}</span>
        </div>

        <button
          v-if="!enviados.has(usuario.id)"
          @click="adicionar(usuario)"
          class="btn-adicionar"
        >
          Adicionar
        </button>
        <span v-else class="pedido-enviado">Pedido enviado</span>
      </div>
    </section>

    <!-- Lista de amigos (só aparece quando não tem busca ativa) -->
    <section v-else class="secao-amigos">
      <h3 v-if="!amigos.length">Nenhum amigo ainda</h3>
      <div
        v-for="amizade in amigos"
        :key="amizade.id"
        class="item-amigo"
        @click="abrirConversa(amizade)"
      >
        <div class="busca-info">
          <img
            v-if="outroUsuario(amizade).profile_photo"
            :src="outroUsuario(amizade).profile_photo.url"
            alt=""
            class="avatar"
          />
          <div v-else class="avatar avatar-vazio">
            {{ (outroUsuario(amizade).name || outroUsuario(amizade).email || '?').charAt(0).toUpperCase() }}
          </div>
          <span>{{ outroUsuario(amizade).name || outroUsuario(amizade).email }}</span>
        </div>
      </div>
    </section>
    <footer-components />
  </div>

</template>

<style scoped>
.lista-container { padding: 16px; }
.lista-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.busca-input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--cor-borda);
  background: var(--cor-fundo-secundaria);
  color: var(--cor-texto);
  margin-bottom: 16px;
}
h3 { color: var(--cor-texto-secundario); font-size: 13px; margin: 12px 0 6px; text-transform: uppercase; }

.busca-item, .item-amigo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--cor-borda);
  color: var(--cor-texto);
}
.item-amigo { cursor: pointer; }

.busca-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.avatar-vazio {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cor-fundo-secundaria);
  border: 1px solid var(--cor-borda);
  color: var(--cor-texto-secundario);
  font-size: 14px;
  font-weight: 600;
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