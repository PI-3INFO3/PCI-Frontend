<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAmigos } from '@/composables/useAmigos'
import designsApi from '@/api/designsApi'
import FooterComponent from '../components/FooterComponent.vue'

const route = useRoute()
const router = useRouter()

const {
  buscarUsuario,
  enviarPedido
} = useAmigos()

const usuario = ref(null)
const projetos = ref([])

const carregando = ref(true)
const pedidoEnviado = ref(false)
const erro = ref(null)
const adicionando = ref(false)
const mostrarConfirmacao = ref(false)



onMounted(async () => {
  try {
    const id = route.params.id

    usuario.value = await buscarUsuario(id)

    // só os projetos que o usuário marcou como públicos
    try {
      const { data } = await designsApi.projetosPublicos(id)
      projetos.value = data.results ?? data
    } catch (e) {
      console.error('Erro ao carregar projetos do perfil:', e)
    }

  } catch (e) {
    erro.value = 'Não foi possível carregar o perfil.'
  } finally {
    carregando.value = false
  }
})


function formatarData(iso) {
  if (!iso) {
    return ''
  }

  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}


// abre o projeto no editor, só para visualizar
function abrirProjeto(projeto) {
  router.push({
    path: '/criar', // troque pela rota real do editor
    query: {
      projeto: projeto.id,
      titulo: projeto.name,
      somenteLeitura: '1'
    }
  })
}


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


      <section class="projetos">

        <h3>
          Projetos de {{ nomeUsuario() }}
        </h3>


        <div
          v-if="!projetos.length"
          class="sem-projetos"
        >
          Nenhum projeto público.
        </div>


        <div
          v-for="projeto in projetos"
          :key="projeto.id"
          class="projeto"
          @click="abrirProjeto(projeto)"
        >

          <div class="projeto-imagem">
            <img
              v-if="projeto.miniatura"
              :src="projeto.miniatura"
              :alt="projeto.name"
            />
          </div>


          <div class="projeto-info">

            <strong>
              {{ projeto.name }}
            </strong>

            <small>
              {{ formatarData(projeto.updated_at || projeto.created_at) }}
            </small>

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
  margin-top: 5px;
  color: var(--cor-texto-secundario);
  font-size: 15px;
}

.nome {
  margin-top: 10px;
  font-size: 18px;
}


.info {
    display: flex;
    flex-direction: column;
    margin-left: 12px;
    margin-top: -20px;
    overflow: hidden;
}
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
  font-size: 15px;
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
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.confirmacao-info span {
  color: var(--cor-texto-secundario);
 font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.confirmacao-texto {
  margin: 18px 0;
  text-align: center;
  color: var(--cor-texto-secundario);
  font-size: 15px;
  font-weight: 600;
}


.confirmacao-acoes {
  display: flex;
  gap: 8px;
}


.confirmacao-acoes button {
  flex: 1;
  height: 34px;
  border-radius: 8px;
font-weight: 600;
  font-size: 15px;
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
  cursor: pointer;
}


.projeto-imagem {
  width: 82px;
  height: 52px;

  flex-shrink: 0;
  overflow: hidden;

  border: 1px solid #ff7500;
  border-radius: 8px;
}


.projeto-imagem img {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;
}


.projeto-info {
  display: flex;
  flex-direction: column;

  gap: 3px;
}


.projeto-info strong {
  font-size: 18px;
}


.projeto-info small {
  color: var(--cor-texto-secundario);

  font-size: 14px;
}


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