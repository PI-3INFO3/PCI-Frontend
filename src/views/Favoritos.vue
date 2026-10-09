<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import designsApi from "@/api/designsApi";
import DesignCard from "@/components/DesignCard.vue";

const auth = useAuthStore();

const favoritos = ref([]);
const carregando = ref(true);
const erro = ref("");

async function carregarFavoritos() {
  carregando.value = true;
  erro.value = "";

  try {
    if (!auth.user) {
      await auth.fetchUser();
    }

    if (!auth.user?.id) {
      erro.value = "Não foi possível identificar o usuário.";
      return;
    }

    const { data } =
      await designsApi.meusProjetosImportantes(auth.user.id);

    const lista = Array.isArray(data)
      ? data
      : data.results ?? [];

    favoritos.value = lista.filter(
      (design) => Boolean(design.importante)
    );
  } catch (error) {
    console.error("Erro ao carregar favoritos:", error);
    erro.value = "Não foi possível carregar seus favoritos.";
  } finally {
    carregando.value = false;
  }
}

function atualizarDesign(designAtualizado) {
  if (!designAtualizado.importante) {
    removerDesign(designAtualizado.id);
    return;
  }

  const indice = favoritos.value.findIndex(
    (design) => design.id === designAtualizado.id
  );

  if (indice !== -1) {
    favoritos.value[indice] = {
      ...favoritos.value[indice],
      ...designAtualizado,
    };
  }
}

function removerDesign(id) {
  favoritos.value = favoritos.value.filter(
    (design) => design.id !== id
  );
}

onMounted(carregarFavoritos);
</script>

<template>
  <main class="favoritos-container">
    <h2>Favoritos</h2>

    <p v-if="erro" class="mensagem-erro">
      {{ erro }}
    </p>

    <div v-if="carregando" class="favoritos-lista">
      <div
        v-for="n in 4"
        :key="n"
        class="favorito-skeleton"
      ></div>
    </div>

    <div
      v-else-if="!favoritos.length"
      class="sem-favoritos"
    >
      Você ainda não tem projetos favoritos.
    </div>

    <div v-else class="favoritos-lista">
      <DesignCard
        v-for="design in favoritos"
        :key="design.id"
        :design="design"
        :show-favorite="true"
        :show-rename="true"
        :show-delete="true"
        @updated="atualizarDesign"
        @removed="removerDesign"
      />
    </div>
  </main>
</template>

<style scoped>
.favoritos-container {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 16px;
  padding-bottom: calc(125px + env(safe-area-inset-bottom, 0px));
  overflow-x: clip;
}

h2 {
  margin: 0 0 16px;
  color: var(--cor-texto);
  font-size: 22px;
}

.favoritos-lista {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, 220px), 1fr)
  );
  gap: 14px;
  width: 100%;
  box-sizing: border-box;
}

.sem-favoritos {
  color: var(--cor-texto-secundario);
  font-size: 14px;
  line-height: 1.5;
}

.mensagem-erro {
  color: #c62828;
  font-size: 14px;
}

.favorito-skeleton {
  width: 100%;
  aspect-ratio: 4 / 3;
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

@media (max-width: 480px) {
  .favoritos-container {
    padding-right: 12px;
    padding-left: 12px;
  }

  .favoritos-lista {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .favorito-skeleton {
    animation: none;
  }
}
</style>