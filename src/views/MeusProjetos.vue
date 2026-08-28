<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import designsApi from "@/api/designsApi";
import FooterComponents from "../components/FooterComponent.vue";
import HeaderComponet from "../components/HeaderComponent.vue";

const auth = useAuthStore();
const projetos = ref([]);
const carregando = ref(true);

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchUser();
  }
  const { data } = await designsApi.meusProjetosImportantes(auth.user.id);
  projetos.value = data.results ?? data;
  carregando.value = false;
});

async function desmarcarImportante(projeto) {
  projeto.importante = false;
  try {
    await designsApi.marcarImportante(projeto.id, false);
    projetos.value = projetos.value.filter((p) => p.id !== projeto.id);
  } catch (e) {
    projeto.importante = true;
  }
}
</script>

<template>
  <div class="meus-projetos-container">
    <h2>Meus Projetos</h2>

    <div v-if="carregando" class="projetos-lista">
      <div class="projeto-skeleton" v-for="n in 4" :key="n"></div>
    </div>

    <div v-else-if="!projetos.length" class="sem-projetos"></div>

    <div v-else class="projetos-lista">
      <div class="projeto-card" v-for="projeto in projetos" :key="projeto.id">
        <button
          class="btn-estrela ativa"
          @click="desmarcarImportante(projeto)"
          title="Remover dos importantes"
        >
          <ion-icon name="star"></ion-icon>
        </button>
        <span class="projeto-nome">{{ projeto.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meus-projetos-container {
  min-height: 100vh;
  padding: 16px;
  padding-bottom: 100px;
}
h2 {
  margin-left: 10px;
  margin-bottom: 16px;
  color: var(--cor-texto);
}
.sem-projetos {
  color: var(--cor-texto-secundario);
  font-size: 14px;
  line-height: 1.5;
}
.projetos-lista {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.projeto-card {
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
  cursor: pointer;
}
.btn-estrela.ativa {
  color: #ff7500;
}
.projeto-skeleton {
  height: 100px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    var(--cor-fundo-secundaria) 25%,
    var(--cor-borda) 50%,
    var(--cor-fundo-secundaria) 75%
  );
  background-size: 200% 100%;
  animation: pulso 1.4s ease-in-out infinite;
}
@keyframes pulso {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
