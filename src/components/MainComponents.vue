<script setup>
import { ref, computed } from 'vue'

const categorias = ['Todos', 'Flyer', 'Mural', 'GPTW']
const selecionado = ref('Todos')

const itens = [
  { titulo: 'Pesquisa GPTW 1', categoria: 'GPTW', img: '/BN_PesquisaGPTW18_page-0001.jpg' },
  { titulo: 'Pesquisa GPTW 2', categoria: 'GPTW', img: '/BN_PesquisaGPTW18_page-0002.jpg' },
  { titulo: 'Pesquisa GPTW 3', categoria: 'GPTW', img: '/BN_PesquisaGPTW18_page-0003.jpg' },
  { titulo: 'Voluntários', categoria: 'Flyer', img: '/Cartaz dia do Bombeiro.jpg' },
  { titulo: 'Mural GPTW', categoria: 'Mural', img: '/Cartaz opção 2.jpg' },
  { titulo: 'Dia do Cliente', categoria: 'Flyer', img: '/BN-Papeis---Dia-do-Cliente-Facebook_v1.png' }
]

// Filtro que alimenta todas as seções
const filtrados = computed(() => {
  if (selecionado.value === 'Todos') return itens
  return itens.filter(i => i.categoria === selecionado.value)
})

// Pega o primeiro item da lista para o destaque gigante
const destaque = computed(() => filtrados.value[0] || itens[0])
</script>

<template>
  <div class="figma-container">
    
    <!-- 1. FILTROS (TOPO) -->
    <div class="filtro-wrapper">
      <div 
        v-for="cat in categorias" :key="cat"
        class="filtro-pill"
        :class="{ ativo: selecionado === cat }"
        @click="selecionado = cat"
      >
        {{ cat }}
      </div>
    </div>

    <!-- 2. FILEIRA SUPERIOR (Cards Médios) -->
    <div class="secao-carrossel">
      <div class="track">
        <div class="card-figma medio" v-for="(item, i) in filtrados" :key="'top-'+i">
          <img :src="item.img" :alt="item.titulo" />
        </div>
      </div>
    </div>

    <!-- 3. FILEIRA DO MEIO (Assimétrica: Largo + Estreito) -->
    <div class="secao-carrossel">
      <div class="track">
        <div class="card-figma largo">
          <img :src="destaque.img" />
        </div>
        <div class="card-figma estreito">
          <img :src="filtrados[1]?.img || destaque.img" />
        </div>
      </div>
    </div>

    <!-- 4. FILEIRA INFERIOR (Cards Médios Invertidos) -->
    <div class="secao-carrossel">
      <div class="track">
        <div class="card-figma medio" v-for="(item, i) in [...filtrados].reverse()" :key="'bot-'+i">
          <img :src="item.img" :alt="item.titulo" />
        </div>
      </div>
    </div>

    <!-- 5. DESTAQUE GIGANTE (Base da Imagem) -->
    <div class="destaque-final">
      <div class="card-figma gigante">
        <img :src="destaque.img" />
        <div class="overlay-texto">Destaque da Semana</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.figma-container {
  background-color: #E9E9E9;
  min-height: 100vh;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.filtro-wrapper {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}
.filtro-pill {
  min-width: 90px;
  height: 35px;
  background: white;
  border: 2.5px solid #FF5700;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #000;
  font-weight: 800;
  cursor: pointer;
  transition: 0.3s;
}
.filtro-pill.ativo {
  background-color: #FF5700;
  color: white;
}

.secao-carrossel {
  overflow-x: auto;
  scrollbar-width: none;
}
.secao-carrossel::-webkit-scrollbar { display: none; }
.track { display: flex; gap: 15px; }

.card-figma {
  background: white;
  border: 2.5px solid #FF5700;
  border-radius: 28px; 
  overflow: hidden;
  flex-shrink: 0;
  transition: transform 0.2s;
  position: relative;
}
.card-figma img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.medio { width: 240px; height: 140px; }
.largo { width: 60%; height: 160px; }
.estreito { width: 35%; height: 160px; }

.gigante {
  width: 100%;
  height: 320px;
  margin-top: 10px;
}

.overlay-texto {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: #FF5700;
  color: white;
  padding: 5px 15px;
  border-radius: 10px;
  font-weight: bold;
}

.card-figma:active {
  transform: scale(0.9);
}
</style>
