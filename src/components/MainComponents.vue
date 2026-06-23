
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const carregando = ref(true)
setTimeout(() => {
  carregando.value = false
}, 1200)

const categorias = [
  { nome: 'Todos', valor: 'Todos' },
  { nome: 'Cartaz', valor: 'Cartaz' },
  { nome: 'Convite', valor: 'Convite' },
  { nome: 'Papeis', valor: 'Papeis' },
  { nome: 'Comunicação', valor: 'Comunicação' }
]
const filtroSelecionado = ref('Todos')

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
  { id: 14, filename: 'Flyer Voluntários 1', categoria: 'Comunicação', img: '/BN_flyer voluntários-1 -by MaxAI.jpeg' },
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

const filtrarPorCategoria = (termo) => {
  return todosModelos.filter(modelo => {
    return Array.isArray(modelo.categoria) ? modelo.categoria.includes(termo) : modelo.categoria === termo
  })
}

const secoesCategorias = computed(() => {
  const categoriasParaListar = ['Cartaz', 'Convite', 'Papeis', 'Comunicação']

  if (filtroSelecionado.value !== 'Todos') {
    return [{
      titulo: filtroSelecionado.value,
      modelos: filtrarPorCategoria(filtroSelecionado.value)
    }]
  }

  return categoriasParaListar.map(cat => {
    return { titulo: cat, modelos: filtrarPorCategoria(cat) }
  }).filter(secao => secao.modelos.length > 0)
})

const rolarFileira = (idDoElemento, direcao) => {
  const elemento = document.getElementById(idDoElemento)
  if (elemento) {
    const distancia = 500
    elemento.scrollBy({ left: direcao === 'direita' ? distancia : -distancia, behavior: 'smooth' })
  }
}

const abrirEditor = (modelo) => {
  router.push({
    path: '/EditorDesing',
    query: {
      img: modelo.img,
      titulo: modelo.titulo,
      formato: modelo.img.split('.').pop().toLowerCase()
    }
  })
}
</script>

<template>
  <div class="container">
    <div class="categorias-wrapper">
      <div class="categorias">
        <button v-for="categoria in categorias" :key="categoria.valor"
          :class="{ active: filtroSelecionado === categoria.valor }" @click="filtroSelecionado = categoria.valor">
          {{ categoria.nome }}
        </button>
      </div>
    </div>

    <div class="secoes-container">
      <section v-for="(secao, index) in secoesCategorias" :key="secao.titulo" class="secao-row">
        <h2 class="secao-titulo">{{ secao.titulo }}</h2>

        <div class="fileira-wrapper">
          <button v-if="filtroSelecionado === 'Todos'" class="seta-nav esquerda"
            @click="rolarFileira('fileira-' + index, 'esquerda')">❮</button>

          <div :id="'fileira-' + index" :class="filtroSelecionado === 'Todos' ? 'fileira-horizontal' : 'grid-vertical'">

            <template v-if="carregando">
              <div v-for="n in 3" :key="n" class="card skeleton">
                <div class="skeleton-image"></div>
                <div class="skeleton-text"></div>
              </div>
            </template>

            <template v-else>
              <div v-for="modelo in secao.modelos" :key="modelo.id" class="card" @click="abrirEditor(modelo)">
                <div class="card-image">
                  <div class="blur-bg" :style="{ backgroundImage: `url(${modelo.img})` }"></div>
                  <img :src="modelo.img" :alt="modelo.titulo" loading="lazy">
                </div>
                <div class="card-content">
                  <p class="card-titulo">{{ modelo.titulo }}</p>
                </div>
              </div>
            </template>

          </div>

          <button v-if="filtroSelecionado === 'Todos'" class="seta-nav direita"
            @click="rolarFileira('fileira-' + index, 'direita')">❯</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: system-ui, sans-serif;
  background-color: #f8fafc;
}

.categorias-wrapper {
  position: relative;
  margin-bottom: 35px;
}

.categorias {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.categorias::-webkit-scrollbar {
  display: none;
}

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
  transition: transform 0.1s, background-color 0.2s;
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

.secoes-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.secao-row {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.secao-titulo {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  padding-left: 2px;
  text-transform: capitalize;
}

.fileira-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.fileira-horizontal {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 4px 20px 4px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

.fileira-horizontal::-webkit-scrollbar {
  display: none;
}

.card {
  flex: 0 0 calc((100% - 40px) / 2);
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.15s, box-shadow 0.15s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card:active {
  transform: scale(0.97);
}

.grid-vertical {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 24px;
  width: 100%;
  padding: 4px;
}

.grid-vertical .card {
  flex: 1 1 auto;
}

@media (max-width: 640px) {
  .fileira-horizontal {
    gap: 12px;
  }
  .card {
    flex: 0 0 calc((100% - 16px) / 1.2);
  }
  .grid-vertical {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    gap: 16px;
  }
}

.seta-nav {
  position: absolute;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  color: #334155;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.2s;
}

.seta-nav:hover {
  transform: scale(1.1);
  background-color: #f8fafc;
}

.seta-nav.esquerda {
  left: -15px;
}

.seta-nav.direita {
  right: -15px;
}

@media (max-width: 768px) {
  .seta-nav {
    display: none;
  }
}

.card-image {
  position: relative;
  width: 100%;
  padding-top: 150%;
  background: #f1f5f9;
  overflow: hidden;
  border-bottom: 1px solid #edf2f7;
}

.blur-bg {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background-size: cover;
  filter: blur(20px);
  opacity: 0.3;
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {

padding: 14px 12px;
text-align: left;
background: #ffffff;
}
.card-titulo {
font-size: 14px;
font-weight: 600;
color: #334155;
margin: 0;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
}
.card.skeleton {
cursor: default;
pointer-events: none;
}
.skeleton-image {
width: 100%;
height: 220px;
background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
background-size: 200% 100%;
animation: pulse-loading 1.5s infinite linear;
}
.skeleton-text {
width: 70%;
height: 14px;
margin: 15px 12px;
background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
background-size: 200% 100%;
animation: pulse-loading 1.5s infinite linear;
border-radius: 4px;
}
@keyframes pulse-loading {
0% {
background-position: 200% 0;
}
100% {
background-position: -200% 0;
}
}

</style>