<script setup>
import { ref, computed } from 'vue'

const categorias = [
  { nome: 'Todos', valor: 'Todos' },
  { nome: 'Cartaz', valor: 'Cartaz' },
  { nome: 'Convite', valor: 'Convite' },
  { nome: 'Papeis', valor: 'Papeis' },
  { nome: 'Comunicação', valor: 'Comunicação' }
]
const filtroSelecionado = ref('Todos')

const imagemSelecionada = ref(null)

const todosModelos = [
  { id: 1, titulo: 'Cabeçalho 10', categoria: 'Comunicação', img: '/cabeçalho-10 -by MaxAI.jpeg' },
  { id: 2, titulo: 'Cartaz Dia do Bombeiro', categoria: 'Cartaz', img: '/Cartaz dia do Bombeiro.jpg' },
  { id: 3, titulo: 'Cartaz Opção 2', categoria: 'Cartaz', img: '/Cartaz opção 2.jpg' },
  { id: 4, titulo: 'Cartaz Rudolph PPR-14', categoria: 'Cartaz', img: '/Cartaz_A4_Rudolph_PPR-14 -by MaxAI.jpeg' },
  { id: 5, titulo: 'Comunicação Dia Julino 15', categoria: 'Comunicação', img: '/Comunicação Dia Julino-15 -by MaxAI.jpeg' },
  { id: 6, titulo: 'Conceito Comunicação GPTW 2', categoria: 'Comunicação', img: '/Conceito_Comunicacao_GPTW-SC-2018_BN-Papeis-2 -by MaxAI.jpeg' },
  { id: 7, titulo: 'Conceito Comunicação GPTW 3', categoria: 'Comunicação', img: '/Conceito_Comunicacao_GPTW-SC-2018_BN-Papeis-3 -by MaxAI.jpeg' },
  { id: 8, titulo: 'Convite Tempo de Casa 2018 v10', categoria: 'Convite', img: '/Convite Tempo de Casa 2018_v10_gráfica-1 -by MaxAI.jpeg' },
  { id: 9, titulo: 'Copa', categoria: ['Cartaz', 'Papeis'], img: '/Papeis-Cartaz-Copa.jpeg' },
  { id: 10, titulo: 'Copa', categoria: ['Cartaz', 'Papeis'], img: '/Papeis-Cartaz-Copa-1.jpeg' },
  { id: 11, titulo: 'Dia do Brigadista', categoria: ['Cartaz', 'Papeis'], img: '/Papeis-Dia-do-Brigadista-Cartaz.jpeg' },
  { id: 12, titulo: 'Dia do Cliente', categoria: 'Papeis', img: '/Papeis-Dia-do-Cliente-.png' },
  { id: 13, titulo: 'Display A6 Rudolph PPR-3', categoria: 'Cartaz', img: '/Display_A6_Rudolph_PPR-3 -by MaxAI.jpeg' },
  { id: 14, titulo: 'Flyer Voluntários 1', categoria: 'Comunicação', img: '/BN_flyer voluntários-1 -by MaxAI.jpeg' },
  { id: 15, titulo: 'Flyer Workshop Pesquisa Clima', categoria: 'Comunicação', img: '/Flyer_Workshop_Pesquisa-Clima_GPTW_2018-5 -by MaxAI.jpeg' },
  { id: 16, titulo: 'GPTW Cartaz', categoria: ['Papeis', 'Cartaz'], img: '/BN-Papeis-GPTW_cartaz.jpeg' },
  { id: 17, titulo: 'Kit Festa VIP Especial 6', categoria: 'Comunicação', img: '/KIT FESTA - VIP Especial (Conteúdo)-6 -by MaxAI.jpeg' },
  { id: 18, titulo: 'Layout Convite Tempo de Casa', categoria: 'Convite', img: '/Layout convite Tempo de Casa_16-9 -by MaxAI.jpeg' },
  { id: 19, titulo: 'Mural GPTW vf Curvas', categoria: 'Comunicação', img: '/BN_Mural_GPTW_vf_curvas_page-0001.jpg' },
  { id: 20, titulo: 'Papel Aniversário', categoria: 'Papeis', img: '/papel-aniversario.jpeg' },
  { id: 21, titulo: 'Post Facebook', categoria: 'Comunicação', img: '/post facebook.jpg' },
  { id: 22, titulo: 'Premiação Interna GPTW 04-11', categoria: 'Cartaz', img: '/Cartaz_A4_Premiacao-Interna_GPTW-2018_BN-04-11 -by MaxAI.jpeg' },
  { id: 23, titulo: 'Premiação Interna GPTW 04-12', categoria: 'Cartaz', img: '/Cartaz_A4_Premiacao-Interna_GPTW-2018_BN-04-12 -by MaxAI.jpeg' },
  { id: 24, titulo: 'Premiação Interna GPTW 04-13', categoria: 'Cartaz', img: '/Cartaz_A4_Premiacao-Interna_GPTW-2018_BN-04-13 -by MaxAI.jpeg' },
  { id: 25, titulo: 'SOUL', categoria: 'Comunicação', img: '/Conceito_Comunicacao_GPTW-SC-2018_BN-Papeis-1 -by MaxAI.jpeg' }
]

const modelosFiltrados = computed(() => {
  if (filtroSelecionado.value === 'Todos') {
    return todosModelos
  }
  return todosModelos.filter(modelo => {
    return Array.isArray(modelo.categoria) 
      ? modelo.categoria.includes(filtroSelecionado.value)
      : modelo.categoria === filtroSelecionado.value
  })
})
</script>

<template>
  <div class="container">
    <div class="categorias-wrapper">
      <div class="categorias">
        <button
          v-for="categoria in categorias"
          :key="categoria.valor"
          :class="{ active: filtroSelecionado === categoria.valor }"
          @click="filtroSelecionado = categoria.valor"
        >
          {{ categoria.nome }}
        </button>
      </div>
    </div>

    <transition-group name="fade-grid" tag="div" class="grid">
      <div
        v-for="modelo in modelosFiltrados"
        :key="modelo.id"
        class="card"
        @click="imagemSelecionada = modelo"
      >
        <div class="card-image">
          <div class="blur-bg" :style="{ backgroundImage: `url(${modelo.img})` }"></div>
          <img
            :src="modelo.img"
            :alt="modelo.titulo"
            loading="lazy"
          >
        </div>
        <div class="card-content">
          <p class="card-titulo">{{ modelo.titulo }}</p>
        </div>
      </div>
    </transition-group>

    <transition name="fade">
      <div v-if="imagemSelecionada" class="modal-overlay" @click="imagemSelecionada = null">
        <button class="modal-close">✕</button>
        <div class="modal-body" @click.stop>
          <img :src="imagemSelecionada.img" :alt="imagemSelecionada.titulo">
          <p class="modal-title">{{ imagemSelecionada.titulo }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #f8fafc;
}

.categorias-wrapper { position: relative; margin-bottom: 35px; }
.categorias { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
.categorias::-webkit-scrollbar { display: none; }

button {
  padding: 10px 24px;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 14px;
  background: #ffffff;
  color: #4a5568;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.1s ease, background-color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
button:active {
  transform: scale(0.95);
  background: #f1f5f9;
}
button.active {
  background: #FF5700;
  color: #ffffff;
  border-color: #FF5700;
  box-shadow: 0 4px 12px rgba(255, 87, 0, 0.25);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}
.card:active {
  transform: scale(0.97);
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

.card-image {
  position: relative;
  width: 100%;
  padding-top: 133%;
  background: #f1f5f9;
  overflow: hidden;
  border-bottom: 1px solid #edf2f7;
}

.blur-bg {
  position: absolute;
  top: -10px; left: -10px; right: -10px; bottom: -10px;
  background-size: cover;
  background-position: center;
  filter: blur(12px) opacity(0.15);
  z-index: 1;
}

.card-image img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: contain;
  padding: 8px;
  z-index: 2;
}

.card-content {
  padding: 14px;
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}
.card-titulo {
  margin: 0; font-size: 13px; font-weight: 600; color: #1e293b; line-height: 1.4; text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.95);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-close {
  position: absolute;
  top: 20px; right: 20px;
  background: transparent;
  border: none; color: white;
  font-size: 24px; cursor: pointer;
  padding: 10px;
}
.modal-body {
  max-width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal-body img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}
.modal-title {
  color: white;
  margin-top: 15px;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
}
@media (max-width: 600px) {
  .container { padding: 16px 12px; }
  .categorias-wrapper::after {
    content: ''; position: absolute; top: 0; right: 0; bottom: 8px; width: 40px;
    background: linear-gradient(to right, transparent, #f8fafc); pointer-events: none;
  }
  .categorias { padding-right: 40px; gap: 8px; }
  button { padding: 12px 18px; font-size: 14px; }

  .grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .card { border-radius: 12px; }
  .card-image { padding-top: 125%; } 
  .card-content { padding: 10px; }
  .card-titulo {
    font-size: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; 
  }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-grid-enter-active, .fade-grid-leave-active { transition: all 0.3s ease; }
.fade-grid-enter-from, .fade-grid-leave-to { opacity: 0; transform: scale(0.95); }
.fade-grid-move { transition: transform 0.3s ease; }
</style>