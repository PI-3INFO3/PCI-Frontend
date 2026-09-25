<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAmigos } from '@/composables/useAmigos'
import FooterComponent from '../components/FooterComponent.vue'

const route = useRoute()

const {
  buscarUsuario,
  enviarPedido
} = useAmigos()

const usuario = ref(null)

const carregando = ref(true)
const pedidoEnviado = ref(false)
const erro = ref(null)
const adicionando = ref(false)
const mostrarConfirmacao = ref(false)



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


function abrirConfirmacao() {
  if (pedidoEnviado.value || adicionando.value) {
    return
  }

  mostrarConfirmacao.value = true
}


function cancelarConfirmacao() {
  if (adicionando.value) {
    return
  }

  mostrarConfirmacao.value = false
}


async function adicionar() {
  if (!usuario.value) {
    return
  }

  adicionando.value = true

  try {
    await enviarPedido(usuario.value.id)

    pedidoEnviado.value = true
    mostrarConfirmacao.value = false

  } catch (e) {
    console.error('Erro ao adicionar usuário:', e)
  } finally {
    adicionando.value = false
  }
}


function nomeUsuario() {
  return (
    usuario.value?.name ||
    usuario.value?.email ||
    'Usuário'
  )
}


function inicialUsuario() {
  return nomeUsuario()
    .charAt(0)
    .toUpperCase()
}
</script>


<template>

  <div class="perfil-container">


    <div
      v-if="carregando"
      class="estado"
    >
      Carregando perfil...
    </div>



    <div
      v-else-if="erro"
      class="estado erro"
    >
      {{ erro }}
    </div>



    <div
      v-else-if="usuario"
      class="perfil"
    >

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
                <div class="info">
                    <span class="nome">{{ nomeUsuario() }}</span>
                    <span class="email">{{ usuario.email }}</span>
                </div>

<button
  class="btn-adicionar"
  :disabled="adicionando || pedidoEnviado"
  @click="abrirConfirmacao"
>
  <ion-icon
    :name="
      pedidoEnviado
        ? 'checkmark-done-circle-outline'
        : 'chatbubbles-outline'
    "
  />
</button>

<div
  v-if="mostrarConfirmacao"
  class="confirmacao-overlay"
  @click.self="cancelarConfirmacao"
>
  <div class="confirmacao-card">

    <div class="confirmacao-usuario">

      <img
        v-if="usuario.profile_photo?.url"
        :src="usuario.profile_photo.url"
        class="confirmacao-avatar"
        alt=""
      />

      <div
        v-else
        class="confirmacao-avatar avatar-vazio"
      >
        {{ inicialUsuario() }}
      </div>

      <div class="confirmacao-info">
        <strong>{{ nomeUsuario() }}</strong>
        <span>{{ usuario.email }}</span>
      </div>

    </div>

    <p class="confirmacao-texto">
      Deseja adicionar esta pessoa?
    </p>

    <div class="confirmacao-acoes">

      <button
        class="btn-cancelar"
        :disabled="adicionando"
        @click="cancelarConfirmacao"
      >
        Cancelar
      </button>

      <button
        class="btn-confirmar"
        :disabled="adicionando"
        @click="adicionar"
      >
        <ion-icon
          v-if="adicionando"
          name="hourglass-outline"
        />

        <span v-else>
          Adicionar
        </span>
      </button>

    </div>

  </div>
</div>


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



    <div
      v-else
      class="estado"
    >
      Usuário não encontrado.
    </div>

  </div>

<FooterComponent />
</template>


<style scoped>

.perfil-container {
  min-height: 100%;

  padding: 20px 16px 80px;

  box-sizing: border-box;

  background: var(--cor-fundo);
  color: var(--cor-texto);
}



.perfil-header {
  display: flex;
  flex-direction: row;
  align-items: center;

  padding: 20px 0;
}


.perfil-avatar {
  width: 50px;
  height: 50px;

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
  font-size: 13px;
}

.nome {
  margin-top: 4px;
  font-size: 12px;
}


.info {
    display: flex;
    flex-direction: column;
    margin-left: 12px;
    margin-top: -20px;
    overflow: hidden;
}

/* =========================
   ADICIONAR
========================= */

.btn-adicionar {

  width: 20px;
  height: 20px;

  margin-bottom: 12px;

  border-radius: 50%;

  object-fit: cover;
 
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

  animation: aparecer 0.2s ease-out;
}


.confirmacao-usuario {
  display: flex;
  align-items: center;

  gap: 12px;
}


.confirmacao-avatar {
  width: 46px;
  height: 46px;

  flex-shrink: 0;

  border-radius: 50%;

  object-fit: cover;
}


.confirmacao-info {
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 3px;
}


.confirmacao-info strong {
  font-size: 13px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.confirmacao-info span {
  color: var(--cor-texto-secundario);

  font-size: 10px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.confirmacao-texto {
  margin: 18px 0;

  text-align: center;

  color: var(--cor-texto-secundario);

  font-size: 12px;
}


.confirmacao-acoes {
  display: flex;

  gap: 8px;
}


.confirmacao-acoes button {
  flex: 1;

  height: 34px;

  border-radius: 8px;

  font-size: 11px;

  cursor: pointer;
}


.btn-cancelar {
  border: 1px solid var(--cor-borda);

  background: transparent;

  color: var(--cor-texto);
}


.btn-confirmar {
  border: none;

  background: #ff7500;

  color: white;
}


.btn-confirmar:hover {
  background: #ff861f;
}


.btn-confirmar:disabled,
.btn-cancelar:disabled {
  opacity: 0.6;

  cursor: wait;
}


@keyframes aparecer {
  from {
    opacity: 0;
    transform: scale(0.94);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
.btn-adicionar {
  width: 34px;
  height: 34px;

  margin-left: auto;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: none;
  border-radius: 50%;

  background: transparent;

  color: var(--cor-texto);

  cursor: pointer;

  transition:
    color 0.2s,
    transform 0.2s;
}


.btn-adicionar ion-icon {
  font-size: 24px;
}


.btn-adicionar:hover {
  color: #ff7500;

  transform: scale(1.08);
}


.btn-adicionar:disabled {
  cursor: default;
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
