<script setup>
import { ref, onMounted } from 'vue'
import HeaderComponent from '../components/HeaderComponet.vue'
import FooterComponents from '../components/FooterComponents.vue'
import modelosApi from '@/api/modelosApi'

const modelos = ref([])
const carregando = ref(true)

onMounted(async () => {
  const { data } = await modelosApi.listar()
  modelos.value = data.results ?? data
  carregando.value = false
})
</script>

<template>
  <div>
    <HeaderComponent />
    <main class="main-content">
      <h2>Modelos</h2>

      <div v-if="carregando" class="modelos-lista">
        <div class="modelo-skeleton" v-for="n in 4" :key="n"></div>
      </div>

      <div v-else-if="!modelos.length" class="sem-modelos">
        Nenhum modelo disponível ainda.
      </div>

      <div v-else class="modelos-lista">
        <div class="modelo-card" v-for="modelo in modelos" :key="modelo.id">
          <span class="modelo-nome">{{ modelo.name }}</span>
          <span v-if="modelo.description" class="modelo-descricao">{{ modelo.description }}</span>
        </div>
      </div>
    </main>
    <FooterComponents />
  </div>
</template>

<style scoped>
.main-content { padding: 16px; padding-bottom: 100px; }
h2 { margin-bottom: 16px; color: var(--cor-texto); }
.sem-modelos { color: var(--cor-texto-secundario); font-size: 14px; }
.modelos-lista {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.modelo-card {
  background: var(--cor-card);
  border: 1px solid var(--cor-borda);
  border-radius: 12px;
  padding: 16px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
}
.modelo-nome { color: var(--cor-texto); font-weight: 600; font-size: 14px; }
.modelo-descricao {
  color: var(--cor-texto-secundario);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.modelo-skeleton {
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