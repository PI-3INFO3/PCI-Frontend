<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import designsApi from "@/api/designsApi";
import DesignCard from "@/components/DesignCard.vue";

const auth = useAuthStore();
const router = useRouter();

const designs = ref([]);
const carregando = ref(true);
const erro = ref("");

async function carregarDesigns() {
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

    const { data } = await designsApi.meusDesigns(auth.user.id);

    designs.value = Array.isArray(data)
      ? data
      : data.results ?? [];
  } catch (error) {
    console.error("Erro ao carregar designs:", error);
    erro.value = "Não foi possível carregar seus designs.";
  } finally {
    carregando.value = false;
  }
}

function atualizarDesign(designAtualizado) {
  const indice = designs.value.findIndex(
    (design) => design.id === designAtualizado.id
  );

  if (indice !== -1) {
    designs.value[indice] = {
      ...designs.value[indice],
      ...designAtualizado,
    };
  }
}

function removerDesign(id) {
  designs.value = designs.value.filter(
    (design) => design.id !== id
  );
}

function abrirDesign(design) {
  router.push(`/criar/${design.id}`);
}

onMounted(carregarDesigns);
</script>

<template>
  <main class="designs-container">
    <h2>Meus Designs</h2>

    <p v-if="erro" class="mensagem-erro">
      {{ erro }}
    </p>

    <div v-if="carregando" class="designs-lista">
      <div
        v-for="n in 4"
        :key="n"
        class="design-skeleton"
      ></div>
    </div>

    <div
      v-else-if="!designs.length"
      class="sem-designs"
    >
      Você ainda não criou nenhum design.
    </div>

    <div v-else class="designs-lista">
      <DesignCard
        v-for="design in designs"
        :key="design.id"
        :design="design"
        :show-favorite="true"
        :show-rename="true"
        :show-delete="true"
        @updated="atualizarDesign"
        @removed="removerDesign"
        @open="abrirDesign"
      />
    </div>
  </main>
</template>

<style scoped>
.designs-container {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  min-width: 0;
  padding: 16px;
  padding-bottom: calc(125px + env(safe-area-inset-bottom, 0px));
  overflow-x: clip;
}

h2 {
  margin: 0 0 16px;
  color: var(--cor-texto);
  font-size: 22px;
}

.designs-lista {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, 220px), 1fr)
  );
  align-items: start;
  gap: 14px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sem-designs {
  color: var(--cor-texto-secundario);
  font-size: 14px;
  line-height: 1.5;
}

.mensagem-erro {
  color: #c62828;
  font-size: 14px;
  line-height: 1.5;
}

.design-skeleton {
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
  .designs-container {
    padding-right: 12px;
    padding-left: 12px;
  }

  .designs-lista {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .design-skeleton {
    animation: none;
  }
}
</style>