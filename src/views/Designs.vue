<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import designsApi from '@/api/designsApi'
import FooterComponents from '../components/FooterComponents.vue'
import HeaderComponet from '../components/HeaderComponet.vue'

const auth = useAuthStore()
const designs = ref([])
const carregando = ref(true)

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchUser()
  }
  const { data } = await designsApi.meusDesigns(auth.user.id)
  designs.value = data.results ?? data
  carregando.value = false
})

async function alternarImportante(design) {
  const novoValor = !design.importante
  design.importante = novoValor // atualiza a tela na hora
  try {
    await designsApi.marcarImportante(design.id, novoValor)
  } catch (e) {
    design.importante = !novoValor // desfaz se der erro
  }
}
</script>

<template>
  <div class="designs-container">
    
    <HeaderComponet />
    <h2>Meus Designs</h2>

    <div v-if="carregando" class="designs-lista">
      <div class="design-skeleton" v-for="n in 4" :key="n"></div>
    </div>

    <div v-else-if="!designs.length" class="sem-designs">
      Você ainda não criou nenhum design.
    </div>

    <div v-else class="designs-lista">
      <div class="design-card" v-for="design in designs" :key="design.id">
        <button
          class="btn-estrela"
          :class="{ ativa: design.importante }"
          @click="alternarImportante(design)"
          title="Marcar como importante"
        >
          <ion-icon :name="design.importante ? 'star' : 'star-outline'"></ion-icon>
        </button>
        <span class="design-nome">{{ design.name }}</span>
      </div>
    </div>
    <FooterComponents />
  </div>
</template>

<style scoped>
.designs-container { padding: 16px; padding-bottom: 100px; }
h2 { margin-bottom: 16px; color: var(--cor-texto); }
.sem-designs { color: var(--cor-texto-secundario); font-size: 14px; }
.designs-lista {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
h2{
  margin-left: 10px;
}
.design-card {
  position: relative;
  background: var(--cor-card);
  border: 1px solid var(--cor-borda);
  border-radius: 12px;
  padding: 16px;
  height: 100px;
  display: flex;
  align-items: flex-end;
  color: var(--cor-texto);
  font-weight: 600;
}
.btn-estrela {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  color: var(--cor-texto-secundario);
  cursor: pointer;
}
.btn-estrela.ativa { color: #FF7500; }
.design-skeleton {
  height: 100px;
  border-radius: 12px;
  background: linear-gradient(90deg, var(--cor-fundo-secundaria) 25%, var(--cor-borda) 50%, var(--cor-fundo-secundaria) 75%);
  background-size: 200% 100%;
  animation: pulso 1.4s ease-in-out infinite;
}
@keyframes pulso {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>