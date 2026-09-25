<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { useAmigos } from "@/composables/useAmigos";
import { useAuthStore } from "@/stores/auth";
import FooterComponents from "../components/FooterComponent.vue";

const router = useRouter();
const auth = useAuthStore();

const meuId = computed(() => auth.user?.id);

const {
  amigos,
  resultadosBusca,
  carregando,
  erro,
  carregarAmigos,
  buscarPessoas,
} = useAmigos();

const termo = ref("");

let debounceTimer = null;


/* ==========================================
   CARREGAR AMIGOS
========================================== */

onMounted(async () => {
  await carregarAmigos();
});


/* ==========================================
   BUSCAR USUÁRIOS
========================================== */

watch(termo, (novoValor) => {
  clearTimeout(debounceTimer);

  const busca = novoValor.trim();

  // Campo vazio
  if (!busca) {
    resultadosBusca.value = [];
    return;
  }

  debounceTimer = setTimeout(async () => {
    await buscarPessoas(busca);
  }, 400);
});


/* ==========================================
   LIMPAR DEBOUNCE
========================================== */

onBeforeUnmount(() => {
  clearTimeout(debounceTimer);
});


/* ==========================================
   ABRIR PERFIL DO USUÁRIO
========================================== */

function abrirPerfil(usuario) {
  if (!usuario?.id) {
    return;
  }

  router.push({
    name: "perfil-publico",
    params: {
      id: usuario.id,
    },
  });
}


/* ==========================================
   PEGAR OUTRO USUÁRIO DA AMIZADE
========================================== */

function outroUsuario(amizade) {
  if (!amizade) {
    return null;
  }

  return amizade.remetente?.id === meuId.value
    ? amizade.destinatario
    : amizade.remetente;
}


/* ==========================================
   ABRIR CONVERSA
========================================== */

function abrirConversa(amizade) {
  const outro = outroUsuario(amizade);

  if (!outro?.id) {
    return;
  }

  router.push({
    name: "chat",
    params: {
      outroUsuarioId: outro.id,
    },
  });
}


/* ==========================================
   NOME DO USUÁRIO
========================================== */

function nomeUsuario(usuario) {
  if (!usuario) {
    return "Usuário";
  }

  return usuario.name || usuario.email || "Usuário";
}


/* ==========================================
   INICIAL DO AVATAR
========================================== */

function inicialUsuario(usuario) {
  return nomeUsuario(usuario)
    .charAt(0)
    .toUpperCase();
}
</script>


<template>
  <div class="lista-container">

    <!-- =====================================
         CABEÇALHO
    ====================================== -->

    <div class="lista-topo">
      <h2>Pesquisa de amigos - Pessoal</h2>
    </div>


    <!-- =====================================
         CAMPO DE PESQUISA
    ====================================== -->

    <div class="busca-container">

      <input
        v-model="termo"
        type="text"
        class="busca-input"
        placeholder="Pesquisar pessoas"
      />

    </div>



    <div
      v-if="erro && termo.trim()"
      class="mensagem-erro"
    >
    
      {{ erro }}
    </div>



    <section
      v-if="termo.trim()"
      class="secao-busca"
    >

      <span class="titulo-secao">
        Resultado da pesquisa
      </span>



      <div
        v-if="carregando"
        class="estado-busca"
      >
        Procurando...
      </div>



      <div
        v-else-if="resultadosBusca.length"
        class="resultados-lista"
      >

        <div
          v-for="usuario in resultadosBusca"
          :key="usuario.id"
          class="busca-item"
          @click="abrirPerfil(usuario)"
        >


          <div class="busca-info">


            <img
              v-if="usuario.profile_photo?.url"
              :src="usuario.profile_photo.url"
              alt=""
              class="avatar"
            />



            <div
              v-else
              class="avatar avatar-vazio"
            >
              {{ inicialUsuario(usuario) }}
            </div>



            <div class="usuario-info">

              <span class="nome-usuario">
                {{ nomeUsuario(usuario) }}
              </span>

              <span
                v-if="usuario.email && usuario.name"
                class="email-usuario"
              >
                {{ usuario.email }}
              </span>

            </div>

          </div>


        
        </div>

      </div>



      <div
        v-else
        class="estado-busca"
      >
        Nenhuma pessoa encontrada.
      </div>

    </section>


    <section
      v-else
      class="secao-amigos"
    >

      <span class="titulo-secao">
        Amigos
      </span>


      <!-- NENHUM AMIGO -->

      <div
        v-if="!amigos.length"
        class="estado-amigos"
      >
        Nenhum amigo ainda.
      </div>


      <!-- AMIGOS -->

      <div
        v-else
        class="amigos-lista"
      >

        <div
          v-for="amizade in amigos"
          :key="amizade.id"
          class="item-amigo"
          @click="abrirConversa(amizade)"
        >

          <div class="busca-info">

            <!-- FOTO -->

            <img
              v-if="outroUsuario(amizade)?.profile_photo?.url"
              :src="outroUsuario(amizade).profile_photo.url"
              alt=""
              class="avatar"
            />


            <!-- AVATAR SEM FOTO -->

            <div
              v-else
              class="avatar avatar-vazio"
            >
              {{ inicialUsuario(outroUsuario(amizade)) }}
            </div>


            <!-- NOME -->

            <div class="usuario-info">

              <span class="nome-usuario">
                {{ nomeUsuario(outroUsuario(amizade)) }}
              </span>

            </div>

          </div>


        </div>

      </div>

    </section>


    <FooterComponents />

  </div>
</template>


<style scoped>


.lista-container {
  position: relative;

  min-height: 100vh;

  box-sizing: border-box;

  padding: 18px 16px 90px;

  background: var(--cor-fundo);

  color: var(--cor-texto);
}


/* ==========================================
   TOPO
========================================== */

.lista-topo {
  margin-bottom: 16px;
}

.lista-topo h2 {
  margin: 0;

  color: var(--cor-texto);

  font-size: 15px;
  font-weight: 500;
}


/* ==========================================
   BUSCA
========================================== */

.busca-container {
  width: 100%;

  margin-bottom: 16px;
}

.busca-input {
  width: 100%;
  height: 34px;

  box-sizing: border-box;

  padding: 0 10px;

  border: 1px solid #777;
  border-radius: 5px;

  outline: none;

  background: transparent;

  color: var(--cor-texto);

  font-size: 10px;
}

.busca-input::placeholder {
  color: #777;
}

.busca-input:focus {
  border-color: #ff7500;
}


/* ==========================================
   TÍTULO
========================================== */

.titulo-secao {
  display: block;

  margin-bottom: 10px;

  color: var(--cor-texto-secundario);

  font-size: 9px;
}


/* ==========================================
   RESULTADOS
========================================== */

.busca-item {
  display: flex;

  align-items: center;
  justify-content: space-between;

  min-height: 48px;

  box-sizing: border-box;

  padding: 7px 8px;

  margin-bottom: 6px;

  border-radius: 7px;

  background: var(--cor-fundo-secundaria);

  cursor: pointer;

  transition: 0.2s ease;
}



/* ==========================================
   INFORMAÇÕES
========================================== */

.busca-info {
  display: flex;

  align-items: center;

  gap: 9px;

  min-width: 0;
}

.usuario-info {
  display: flex;

  flex-direction: column;

  min-width: 0;

  gap: 2px;
}


/* ==========================================
   NOME
========================================== */

.nome-usuario {
  overflow: hidden;

  color: var(--cor-texto);

  font-size: 11px;

  white-space: nowrap;
  text-overflow: ellipsis;
}


/* ==========================================
   EMAIL
========================================== */

.email-usuario {
  overflow: hidden;

  color: var(--cor-texto-secundario);

  font-size: 8px;

  white-space: nowrap;
  text-overflow: ellipsis;
}


/* ==========================================
   AVATAR
========================================== */

.avatar {
  width: 34px;
  height: 34px;

  flex-shrink: 0;

  border-radius: 50%;

  object-fit: cover;
}


.avatar-vazio {
  display: flex;

  align-items: center;
  justify-content: center;

  background: var(--cor-fundo);

  border: 1px solid var(--cor-borda);

  color: #ff7500;

  font-size: 13px;
  font-weight: 600;
}



.busca-item:hover .seta,
.item-amigo:hover .seta {
  color: #ff7500;

  transform: translateX(3px);
}

.busca-item:active .seta,
.item-amigo:active .seta {
  color: #ff7500;

  transform: translateX(3px);
}


/* ==========================================
   ESTADO BUSCA
========================================== */

.estado-busca {
  padding: 24px 10px;

  text-align: center;

  color: var(--cor-texto-secundario);

  font-size: 10px;
}


/* ==========================================
   ERRO
========================================== */

.mensagem-erro {
  margin-bottom: 10px;

  padding: 8px;

  border-radius: 5px;

  background: rgba(255, 0, 0, 0.08);

  color: #ff5555;

  font-size: 10px;
}


/* ==========================================
   AMIGOS
========================================== */

.item-amigo {
  display: flex;

  align-items: center;
  justify-content: space-between;

  min-height: 45px;

  padding: 6px 4px;

  border-bottom: 1px solid var(--cor-borda);

  cursor: pointer;

  transition: background 0.2s ease;
}

.item-amigo:hover {
  background: var(--cor-fundo-secundaria);
}


/* ==========================================
   SEM AMIGOS
========================================== */

.estado-amigos {
  padding: 30px 10px;

  text-align: center;

  color: var(--cor-texto-secundario);

  font-size: 10px;
}




/* ==========================================
   RESPONSIVO
========================================== */

@media (max-width: 400px) {
  .lista-container {
    padding-left: 12px;
    padding-right: 12px;
  }

  .lista-topo h2 {
    font-size: 14px;
  }
}

</style>
