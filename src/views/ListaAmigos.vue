<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAmigos } from '@/composables/useAmigos'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const meuId = computed(() => auth.user?.id)

const { amigos, pendentes, carregarAmigos, carregarPendentes, aceitarPedido, recusarPedido } = useAmigos()

onMounted(() => {
  carregarAmigos()
  carregarPendentes()
})

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
      <button class="btn-buscar" @click="router.push({ name: 'buscar-amigos' })">
        <ion-icon name="person-add-outline"></ion-icon>
      </button>
    </div>

    <section v-if="pendentes.length" class="secao-pendentes">
      <h3>Pedidos pendentes</h3>
      <div v-for="pedido in pendentes" :key="pedido.id" class="item-pendente">
        <span>{{ pedido.remetente.name || pedido.remetente.email }}</span>
        <div class="acoes-pendente">
          <button class="btn-aceitar" @click="aceitarPedido(pedido.id)">Aceitar</button>
          <button class="btn-recusar" @click="recusarPedido(pedido.id)">Recusar</button>
        </div>
      </div>
    </section>

    <section class="secao-amigos">
      <h3 v-if="!amigos.length">Nenhum amigo ainda</h3>
      <div
        v-for="amizade in amigos"
        :key="amizade.id"
        class="item-amigo"
        @click="abrirConversa(amizade)"
      >
        {{ outroUsuario(amizade).name || outroUsuario(amizade).email }}
      </div>
    </section>
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
.btn-buscar {
  background: #FF7500;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  color: #fff;
  font-size: 18px;
}
h3 { color: var(--cor-texto-secundario); font-size: 13px; margin: 12px 0 6px; text-transform: uppercase; }
.item-pendente, .item-amigo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--cor-borda);
  cursor: pointer;
  color: var(--cor-texto);
}
.acoes-pendente { display: flex; gap: 6px; }
.btn-aceitar, .btn-recusar {
  border: none;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 13px;
  cursor: pointer;
}
.btn-aceitar { background: #FF7500; color: #fff; }
.btn-recusar { background: transparent; border: 1px solid var(--cor-borda); color: var(--cor-texto-secundario); }
</style>