<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAmigos } from '@/composables/useAmigos'

const route = useRoute()

const {
  buscarUsuario,
  enviarPedido
} = useAmigos()

const usuario = ref(null)

const carregando = ref(true)
const adicionando = ref(false)
const pedidoEnviado = ref(false)
const erro = ref(null)


// --------------------------------
// CARREGAR PERFIL
// --------------------------------PerfilPublico

onMounted(async () => {
  try {
    const id = route.params.id

    usuario.value = await buscarUsuario(id)

  } catch (e) {
    erro.value = 'Não foi possível carregar o perfil.'
  } finally {
    carregando.value = false
  }
})


// --------------------------------
// ADICIONAR USUÁRIO
// --------------------------------

async function adicionar() {
  if (!usuario.value) {
    return
  }

  adicionando.value = true

  try {
    await enviarPedido(usuario.value.id)

    pedidoEnviado.value = true

  } catch (e) {
    console.error('Erro ao adicionar usuário:', e)
  } finally {
    adicionando.value = false
  }
}


// --------------------------------
// NOME
// --------------------------------

function nomeUsuario() {
  return (
    usuario.value?.name ||
    usuario.value?.email ||
    'Usuário'
  )
}


// --------------------------------
// INICIAL
// --------------------------------

function inicialUsuario() {
  return nomeUsuario()
    .charAt(0)
    .toUpperCase()
}
</script>


<template>

  <div class="perfil-container">

    <!-- CARREGANDO -->

    <div
      v-if="carregando"
      class="estado"
    >
      Carregando perfil...
    </div>


    <!-- ERRO -->

    <div
      v-else-if="erro"
      class="estado erro"
    >
      {{ erro }}
    </div>


    <!-- PERFIL -->

    <div
      v-else-if="usuario"
      class="perfil"
    >

      <!-- =========================
           INFORMAÇÕES DO USUÁRIO
      ========================== -->

      <section class="perfil-header">

        <img
          v-if="usuario.profile_photo?.url"
          :src="usuario.profile_photo.url"
          alt=""
          class="perfil-avatar"
        />

        <div
          v-else
          class="perfil-avatar avatar-vazio"
        >
          {{ inicialUsuario() }}
        </div>


        <h2>
          {{ nomeUsuario() }}
        </h2>


        <span class="email">
          {{ usuario.email }}
        </span>


        <!-- BOTÃO ADICIONAR -->

        <button
          v-if="!pedidoEnviado"
          class="btn-adicionar"
          :disabled="adicionando"
          @click="adicionar"
        >
          {{ adicionando ? 'Enviando...' : 'Adicionar' }}
        </button>


        <!-- PEDIDO ENVIADO -->

        <span
          v-else
          class="pedido-enviado"
        >
          Pedido enviado
        </span>

      </section>


      <!-- =========================
           PROJETOS
      ========================== -->

      <section class="projetos">

        <h3>
          Projetos feitos pelo usuário
        </h3>


        <div
          v-if="!usuario.projetos?.length"
          class="sem-projetos"
        >
          Nenhum projeto encontrado.
        </div>


        <div
          v-for="projeto in usuario.projetos"
          :key="projeto.id"
          class="projeto"
        >

          <div class="projeto-imagem">
            <!-- imagem do projeto -->
          </div>


          <div class="projeto-info">

            <strong>
              {{ projeto.nome }}
            </strong>

            <small>
              {{ projeto.data }}
            </small>

            <p>
              {{ projeto.descricao }}
            </p>

          </div>

        </div>

      </section>

    </div>


    <!-- USUÁRIO NÃO ENCONTRADO -->

    <div
      v-else
      class="estado"
    >
      Usuário não encontrado.
    </div>

  </div>

</template>


<style scoped>

.perfil-container {
  min-height: 100%;

  padding: 20px 16px 80px;

  box-sizing: border-box;

  background: var(--cor-fundo);
  color: var(--cor-texto);
}


/* =========================
   HEADER
========================= */

.perfil-header {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 20px 0;
}


.perfil-avatar {
  width: 70px;
  height: 70px;

  margin-bottom: 12px;

  border-radius: 50%;

  object-fit: cover;
}


.avatar-vazio {
  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--cor-fundo-secundaria);

  border: 1px solid var(--cor-borda);

  color: #ff7500;

  font-size: 24px;
  font-weight: 600;
}


.perfil-header h2 {
  margin: 0;

  font-size: 17px;
  font-weight: 600;
}


.email {
  margin-top: 4px;

  color: var(--cor-texto-secundario);

  font-size: 10px;
}


/* =========================
   ADICIONAR
========================= */

.btn-adicionar {
  margin-top: 16px;

  padding: 7px 18px;

  border: none;
  border-radius: 6px;

  background: #ff7500;
  color: #fff;

  font-size: 11px;

  cursor: pointer;
}


.btn-adicionar:hover {
  background: #ff861f;
}


.btn-adicionar:disabled {
  opacity: 0.6;
  cursor: wait;
}


.pedido-enviado {
  margin-top: 16px;

  color: var(--cor-texto-secundario);

  font-size: 11px;
}


/* =========================
   PROJETOS
========================= */

.projetos {
  margin-top: 20px;
}


.projetos h3 {
  margin: 0 0 14px;

  color: var(--cor-texto-secundario);

  font-size: 11px;
  font-weight: 500;

  text-transform: uppercase;
}


.projeto {
  display: flex;

  gap: 12px;

  margin-bottom: 14px;
}


.projeto-imagem {
  width: 62px;
  height: 42px;

  flex-shrink: 0;

  border: 1px solid #ff7500;
  border-radius: 8px;
}


.projeto-info {
  display: flex;
  flex-direction: column;

  gap: 3px;
}


.projeto-info strong {
  font-size: 11px;
}


.projeto-info small {
  color: var(--cor-texto-secundario);

  font-size: 8px;
}


.projeto-info p {
  margin: 0;

  color: var(--cor-texto-secundario);

  font-size: 10px;
}


/* =========================
   ESTADOS
========================= */

.estado {
  padding: 40px 10px;

  text-align: center;

  color: var(--cor-texto-secundario);

  font-size: 11px;
}


.erro {
  color: #ff5555;
}


.sem-projetos {
  padding: 25px 10px;

  text-align: center;

  color: var(--cor-texto-secundario);

  font-size: 11px;
}

</style>
