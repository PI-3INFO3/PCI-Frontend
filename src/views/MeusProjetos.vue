<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";
import designsApi from "@/api/designsApi";
// MEUS PROJETOS
const TITULO = "Meus Projetos";
const FLAG = "meu_projeto";
const buscar = (usuarioId) => designsApi.meusProjetos(usuarioId);


function formatarData(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

const auth = useAuthStore();
const router = useRouter();

const projetos = ref([]);
const carregando = ref(true);
const erro = ref(null);

onMounted(async () => {
    try {
        if (!auth.user) {
            await auth.fetchUser();
        }

        const { data } = await buscar(auth.user.id);

        projetos.value = data.results ?? data;

    } catch (e) {
        console.error("Erro ao carregar projetos:", e);
        erro.value = "Não foi possível carregar seus projetos.";
    } finally {
        carregando.value = false;
    }
});

function abrir(projeto) {
    router.push({
        path: "/criar", // troque pela rota real do editor
        query: {
            projeto: projeto.id,
            titulo: projeto.name
        }
    });
}

// tira o projeto só desta categoria, sem apagar o design
async function removerDaLista(projeto) {
    try {
        await designsApi.atualizar(projeto.id, { [FLAG]: false });

        projetos.value = projetos.value.filter(
            p => p.id !== projeto.id
        );

    } catch (e) {
        console.error("Erro ao remover da lista:", e);
    }
}
</script>

<template>

    <div class="projetos-container">

        <h2>{{ TITULO }}</h2>

        <div v-if="carregando" class="projetos-lista">
            <div v-for="n in 4" :key="n" class="projeto-skeleton"></div>
        </div>

        <div v-else-if="erro" class="estado">
            {{ erro }}
        </div>

        <div v-else-if="!projetos.length" class="estado">
            <ion-icon name="folder-open-outline"></ion-icon>
            <p>Nenhum projeto aqui ainda.</p>
        </div>

        <div v-else class="projetos-lista">

            <div
                v-for="projeto in projetos"
                :key="projeto.id"
                class="projeto-card"
                @click="abrir(projeto)"
            >

                <img
                    v-if="projeto.miniatura"
                    :src="projeto.miniatura"
                    :alt="projeto.name"
                    class="projeto-img"
                />

                <button
                    class="btn-remover"
                    @click.stop="removerDaLista(projeto)"
                    title="Remover desta lista"
                >
                    <ion-icon name="close-circle"></ion-icon>
                </button>
<div class="projeto-info">
    <span class="projeto-nome">{{ projeto.name }}</span>

    <span class="projeto-meta">
        {{ projeto.autor_nome }} · {{ formatarData(projeto.updated_at || projeto.created_at) }}
    </span>
</div>

            </div>

        </div>

    </div>

</template>

<style scoped>

.projetos-container {
    min-height: 100vh;
    padding: 16px;
    padding-bottom: 100px;
}

h2 {
    margin-left: 10px;
    margin-bottom: 16px;
    color: var(--cor-texto);
}

.projetos-lista {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.projeto-card {
    position: relative;
    overflow: hidden;

    background: var(--cor-card);
    border: 1px solid var(--cor-borda);
    border-radius: 12px;

    padding: 16px;
    height: 120px;

    display: flex;
    align-items: flex-end;

    color: var(--cor-texto);
    font-weight: 600;
    cursor: pointer;
}

.projeto-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.45;
}
.projeto-card {
    height: 140px; /* era 120px */
}

.projeto-info {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    min-width: 0;
}

.projeto-nome {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.projeto-meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
    font-weight: 400;
    color: var(--cor-texto-secundario);
}
.btn-remover {
    position: absolute;
    z-index: 2;

    top: 8px;
    right: 8px;

    background: none;
    border: none;

    color: #ff7500;

    font-size: 20px;
    cursor: pointer;
}

.estado {
    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 10px;

    padding: 40px 20px;

    text-align: center;

    color: var(--cor-texto-secundario);
}

.estado ion-icon {
    font-size: 40px;
    color: #ff7500;
}

.projeto-skeleton {
    height: 120px;
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
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

</style>