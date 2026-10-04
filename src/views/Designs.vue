<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import designsApi from "@/api/designsApi";
import FooterComponents from "../components/FooterComponent.vue";
import HeaderComponet from "../components/HeaderComponent.vue";

const auth = useAuthStore();
const router = useRouter();

const designs = ref([]);
const carregando = ref(true);
const erro = ref(null);

// exclusão
const designParaApagar = ref(null);
const apagando = ref(false);
const erroApagar = ref(null);

onMounted(async () => {
  try {
    if (!auth.user) {
      await auth.fetchUser();
    }
    const { data } = await designsApi.meusDesigns(auth.user.id);
    designs.value = data.results ?? data;
  } catch (e) {
    console.error("Erro ao carregar designs:", e);
    erro.value = "Não foi possível carregar seus designs.";
  } finally {
    carregando.value = false;
  }
});

function abrir(design) {
  router.push({
    path: "/criar", // troque pela rota real do editor
    query: {
      projeto: design.id,
      titulo: design.name,
    },
  });
}

function formatarData(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function alternarImportante(design) {
  const novoValor = !design.importante;
  design.importante = novoValor; // atualiza a tela na hora
  try {
    await designsApi.marcarImportante(design.id, novoValor);
  } catch (e) {
    design.importante = !novoValor; // desfaz se der erro
  }
}

// mostra ou esconde o projeto no perfil para outras pessoas
async function alternarPublico(design) {
  const novoValor = !design.publico;
  design.publico = novoValor; // atualiza a tela na hora
  try {
    await designsApi.atualizar(design.id, { publico: novoValor });
  } catch (e) {
    design.publico = !novoValor; // desfaz se der erro
  }
}

function pedirConfirmacao(design) {
  erroApagar.value = null;
  designParaApagar.value = design;
}

function cancelarExclusao() {
  if (apagando.value) return;
  designParaApagar.value = null;
}

async function confirmarExclusao() {
  if (!designParaApagar.value || apagando.value) return;

  apagando.value = true;
  erroApagar.value = null;

  try {
    await designsApi.apagar(designParaApagar.value.id);

    designs.value = designs.value.filter(
      (d) => d.id !== designParaApagar.value.id
    );
    designParaApagar.value = null;
  } catch (e) {
    console.error("Erro ao apagar design:", e);
    erroApagar.value = "Não foi possível apagar. Tente novamente.";
  } finally {
    apagando.value = false;
  }
}
</script>

<template>
  <div class="designs-container">
    <h2>Meus Designs</h2>

    <div v-if="carregando" class="designs-lista">
      <div class="design-skeleton" v-for="n in 4" :key="n"></div>
    </div>

    <div v-else-if="erro" class="sem-designs">
      {{ erro }}
    </div>

    <div v-else-if="!designs.length" class="sem-designs">
      Você ainda não criou nenhum design.
    </div>

    <div v-else class="designs-lista">
      <div
        class="design-card"
        v-for="design in designs"
        :key="design.id"
        @click="abrir(design)"
      >
        <img
          v-if="design.miniatura"
          :src="design.miniatura"
          :alt="design.name"
          class="design-img"
        />

        <div class="design-acoes">
          <button
            class="btn-acao btn-publico"
            :class="{ ativa: design.publico }"
            @click.stop="alternarPublico(design)"
            :title="design.publico ? 'Visível no seu perfil' : 'Oculto do seu perfil'"
          >
            <ion-icon
              :name="design.publico ? 'eye' : 'eye-off-outline'"
            ></ion-icon>
          </button>

          <button
            class="btn-acao btn-estrela"
            :class="{ ativa: design.importante }"
            @click.stop="alternarImportante(design)"
            title="Marcar como importante"
          >
            <ion-icon
              :name="design.importante ? 'star' : 'star-outline'"
            ></ion-icon>
          </button>

          <button
            class="btn-acao btn-apagar"
            @click.stop="pedirConfirmacao(design)"
            title="Apagar design"
          >
            <ion-icon name="trash-outline"></ion-icon>
          </button>
        </div>

        <div class="design-info">
          <span class="design-nome">{{ design.name }}</span>
          <span class="design-data">
            {{ formatarData(design.updated_at || design.created_at) }}
          </span>
        </div>
      </div>
    </div>

    <!-- CONFIRMAÇÃO DE EXCLUSÃO -->
    <div
      v-if="designParaApagar"
      class="confirmacao-overlay"
      @click.self="cancelarExclusao"
    >
      <div class="confirmacao-card">
        <strong class="confirmacao-titulo">Apagar design?</strong>

        <p class="confirmacao-texto">
          "{{ designParaApagar.name }}" será apagado de todas as suas listas
          (Favoritos, Meus Projetos e Em andamento). Essa ação não pode ser
          desfeita.
        </p>

        <p v-if="erroApagar" class="confirmacao-erro">
          {{ erroApagar }}
        </p>

        <div class="confirmacao-acoes">
          <button
            class="btn-cancelar"
            :disabled="apagando"
            @click="cancelarExclusao"
          >
            Cancelar
          </button>

          <button
            class="btn-confirmar"
            :disabled="apagando"
            @click="confirmarExclusao"
          >
            {{ apagando ? "Apagando..." : "Apagar" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.designs-container {
  padding: 16px;
  padding-bottom: 100px;
}
h2 {
  margin-bottom: 16px;
  margin-left: 0px;
  color: var(--cor-texto);
}
.sem-designs {
  color: var(--cor-texto-secundario);
  font-size: 14px;
}
.designs-lista {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.design-card {
  position: relative;
  overflow: hidden;
  background: var(--cor-card);
  border: 1px solid var(--cor-borda);
  border-radius: 12px;
  padding: 12px;
  height: 140px;
  display: flex;
  align-items: flex-end;
  color: var(--cor-texto);
  cursor: pointer;
}

.design-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.45;
}

.design-info {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  min-width: 0;
}

.design-nome {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.design-data {
  font-size: 11px;
  color: var(--cor-texto-secundario);
}

.design-acoes {
  position: absolute;
  z-index: 2;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 2px;
}

.btn-acao {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--cor-texto-secundario);
  cursor: pointer;
  padding: 4px;
  display: flex;
}

.btn-estrela.ativa,
.btn-publico.ativa {
  color: #ff7500;
}

.btn-apagar:hover {
  color: #ff4d4d;
}

.design-skeleton {
  height: 140px;
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

/* ---------- CONFIRMAÇÃO ---------- */

.confirmacao-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
}

.confirmacao-card {
  width: 100%;
  max-width: 320px;
  padding: 18px;
  border: 1px solid var(--cor-borda);
  border-radius: 16px;
  background: var(--cor-fundo-secundaria);
  color: var(--cor-texto);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.confirmacao-titulo {
  font-size: 14px;
}

.confirmacao-texto {
  margin: 12px 0 0;
  color: var(--cor-texto-secundario);
  font-size: 12px;
  line-height: 1.5;
}

.confirmacao-erro {
  margin: 10px 0 0;
  color: #ff5555;
  font-size: 11px;
}

.confirmacao-acoes {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.confirmacao-acoes button {
  flex: 1;
  height: 34px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.btn-cancelar {
  border: 1px solid var(--cor-borda);
  background: transparent;
  color: var(--cor-texto);
}

.btn-confirmar {
  border: none;
  background: #e5484d;
  color: white;
}

.btn-confirmar:hover {
  background: #d63c41;
}

.btn-confirmar:disabled,
.btn-cancelar:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>