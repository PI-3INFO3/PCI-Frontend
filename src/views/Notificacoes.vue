<script setup>
import { ref, onMounted } from 'vue'
import { useAmigos } from '@/composables/useAmigos'
import NotificacoesSkeleton from '@/components/skeleton/NotificacoesSkeleton.vue'
import FooterComponents from '../components/FooterComponents.vue'

const { pendentes, carregarPendentes, aceitarPedido, recusarPedido } = useAmigos()
const carregando = ref(true)

onMounted(async () => {
  await carregarPendentes()
  carregando.value = false
})
</script>

<template>

  <div class="notficacoes">
  <NotificacoesSkeleton v-if="carregando" />

  <div v-else class="notificacoes-container">
    <h2>Notificações</h2>
    <div v-if="!pendentes.length" class="sem-pendentes">
      Nenhum pedido de amizade pendente.
    </div>
    <div v-for="pedido in pendentes" :key="pedido.id" class="item-pendente">
      <div class="pendente-info">
        <img v-if="pedido.remetente.profile_photo" :src="pedido.remetente.profile_photo.url" alt="" class="pendente-avatar" />
        <div v-else class="pendente-avatar pendente-avatar-vazio">
          {{ (pedido.remetente.name || pedido.remetente.email || '?').charAt(0).toUpperCase() }}
        </div>
        <span>{{ pedido.remetente.name || pedido.remetente.email }} quer ser seu amigo</span>
      </div>
      <div class="acoes-pendente">
        <button class="btn-aceitar" @click="aceitarPedido(pedido.id)">Aceitar</button>
        <button class="btn-recusar" @click="recusarPedido(pedido.id)">Recusar</button>
      </div>
    </div>
  </div>

  <FooterComponents />
</div>
</template>

<style scoped>
.notificacoes{min-height: 100vh;}
.notificacoes-container { padding: 16px;  margin-top: 20px; }
h2 { margin-bottom: 16px; color: var(--cor-texto); }
.sem-pendentes { color: var(--cor-texto-secundario); font-size: 14px; }
.item-pendente {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--cor-borda);
  gap: 12px;
}
.pendente-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--cor-texto);
  font-size: 14px;
}
.pendente-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.pendente-avatar-vazio {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cor-fundo-secundaria);
  border: 1px solid var(--cor-borda);
  color: var(--cor-texto-secundario);
  font-size: 14px;
  font-weight: 600;
}
.acoes-pendente { display: flex; gap: 6px; flex-shrink: 0; }
.btn-aceitar, .btn-recusar {
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.btn-aceitar { background: #FF7500; color: #fff; }
.btn-recusar { background: transparent; border: 1px solid var(--cor-borda); color: var(--cor-texto-secundario); }
</style>