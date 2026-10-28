```vue
<script setup>
import { ref, onMounted } from "vue";
import { useAmigos } from "@/composables/useAmigos";
import NotificacoesSkeleton from "@/components/skeleton/NotificacoesSkeleton.vue";
import FooterComponents from "../components/FooterComponent.vue";

const { pendentes, carregarPendentes, aceitarPedido, recusarPedido } =
  useAmigos();

const carregando = ref(true);

onMounted(async () => {
  try {
    await carregarPendentes();
  } finally {
    carregando.value = false;
  }
});
</script>

<template>
  <main class="pagina-notificacoes">
    <NotificacoesSkeleton v-if="carregando" />

    <section v-else class="notificacoes-container">
      <!-- Cabeçalho -->
      <header class="notificacoes-header">
        <div class="header-texto">
          <span class="notificacoes-subtitulo">
            CENTRAL DE ATIVIDADES
          </span>

          <h1>Notificações</h1>

          <p>
            Acompanhe suas conexões e gerencie seus pedidos de amizade.
          </p>
        </div>

        <div class="header-icone" aria-hidden="true">
          <ion-icon name="notifications-outline"></ion-icon>
        </div>
      </header>

      <!-- Resumo -->
      <section class="resumo-notificacoes">
        <div class="resumo-card">
          <div class="resumo-icone">
            <ion-icon name="people-outline"></ion-icon>
          </div>

          <div class="resumo-info">
            <span>Pedidos recebidos</span>
            <strong>{{ pendentes.length }}</strong>
          </div>
        </div>

        <div class="resumo-card">
          <div class="resumo-icone">
            <ion-icon name="person-add-outline"></ion-icon>
          </div>

          <div class="resumo-info">
            <span>Solicitações</span>
            <strong>
              {{ pendentes.length === 1 ? "Pendente" : "Pendentes" }}
            </strong>
          </div>
        </div>
      </section>

      <!-- Lista de notificações -->
      <section class="secao-pendentes">
        <div class="secao-header">
          <div>
            <h2>Pedidos de amizade</h2>
            <p>As pessoas que desejam se conectar com você.</p>
          </div>

          <span
            v-if="pendentes.length"
            class="contador-pendentes"
          >
            {{ pendentes.length }}
          </span>
        </div>

        <!-- Estado vazio -->
        <div v-if="!pendentes.length" class="estado-vazio">
          <div class="vazio-icone">
            <ion-icon name="people-outline"></ion-icon>
          </div>

          <h3>Tudo em dia!</h3>

          <p>
            Você não tem pedidos de amizade pendentes no momento.
            Quando alguém enviar uma solicitação, ela aparecerá aqui.
          </p>
        </div>

        <!-- Pedidos -->
        <div v-else class="lista-pendentes">
          <article
            v-for="pedido in pendentes"
            :key="pedido.id"
            class="item-pendente"
          >
            <div class="pendente-info">
              <div class="avatar-container">
                <img
                  v-if="pedido.remetente.profile_photo"
                  :src="pedido.remetente.profile_photo.url"
                  :alt="`Foto de ${pedido.remetente.name || pedido.remetente.email}`"
                  class="pendente-avatar"
                />

                <div
                  v-else
                  class="pendente-avatar pendente-avatar-vazio"
                >
                  {{
                    (
                      pedido.remetente.name ||
                      pedido.remetente.email ||
                      "?"
                    )
                      .charAt(0)
                      .toUpperCase()
                  }}
                </div>
              </div>

              <div class="pendente-detalhes">
                <strong>
                  {{ pedido.remetente.name || pedido.remetente.email }}
                </strong>

                <span>
                  Enviou um pedido de amizade para você.
                </span>

                <span class="pendente-status">
                  <span class="status-ponto"></span>
                  Aguardando resposta
                </span>
              </div>
            </div>

            <div class="acoes-pendente">
              <button
                type="button"
                class="btn-aceitar"
                @click="aceitarPedido(pedido.id)"
              >
                <ion-icon name="checkmark-outline"></ion-icon>
                <span>Aceitar</span>
              </button>

              <button
                type="button"
                class="btn-recusar"
                @click="recusarPedido(pedido.id)"
              >
                <ion-icon name="close-outline"></ion-icon>
                <span>Recusar</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </section>
  </main>

  <FooterComponents />
</template>

<style scoped>
/* Estrutura principal */
.pagina-notificacoes {
  min-height: 100vh;
  padding: 28px 24px;
  background: var(--cor-fundo);
  color: var(--cor-texto);
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.notificacoes-container {
  width: 100%;
  max-width: 1050px;
  margin: 0 auto;
}

/* Cabeçalho */
.notificacoes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
  padding: 26px;
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: 18px;
}

.header-texto {
  min-width: 0;
}

.notificacoes-subtitulo {
  color: var(--cor-primaria);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.notificacoes-header h1 {
  margin: 8px 0;
  color: var(--cor-texto);
  font-size: clamp(26px, 4vw, 34px);
  font-weight: 750;
}

.notificacoes-header p {
  margin: 0;
  color: var(--cor-texto-secundario);
  font-size: 14px;
  line-height: 1.6;
}

.header-icone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  flex-shrink: 0;
  color: var(--cor-primaria);
  background: var(--cor-fundo-secundaria);
  border: 1px solid var(--cor-borda);
  border-radius: 18px;
  font-size: 30px;
}

/* Cartões de resumo */
.resumo-notificacoes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.resumo-card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 20px;
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: 14px;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.resumo-card:hover {
  border-color: var(--cor-primaria);
  transform: translateY(-2px);
}

.resumo-icone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  color: var(--cor-primaria);
  background: var(--cor-fundo-secundaria);
  border-radius: 13px;
  font-size: 24px;
}

.resumo-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.resumo-info span {
  color: var(--cor-texto-secundario);
  font-size: 12px;
}

.resumo-info strong {
  color: var(--cor-texto);
  font-size: 20px;
  font-weight: 750;
  overflow-wrap: anywhere;
}

/* Seção dos pedidos */
.secao-pendentes {
  padding: 24px;
  background: var(--cor-superficie);
  border: 1px solid var(--cor-borda);
  border-radius: 18px;
}

.secao-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.secao-header h2 {
  margin: 0 0 7px;
  color: var(--cor-texto);
  font-size: 19px;
  font-weight: 700;
}

.secao-header p {
  margin: 0;
  color: var(--cor-texto-secundario);
  font-size: 13px;
  line-height: 1.6;
}

.contador-pendentes {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  color: var(--cor-primaria);
  background: var(--cor-fundo-secundaria);
  border: 1px solid var(--cor-borda);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 750;
}

/* Lista */
.lista-pendentes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-pendente {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px;
  background: var(--cor-fundo);
  border: 1px solid var(--cor-borda);
  border-radius: 13px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.item-pendente:hover {
  border-color: var(--cor-primaria);
}

.pendente-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.avatar-container {
  flex-shrink: 0;
}

.pendente-avatar {
  display: block;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--cor-borda);
}

.pendente-avatar-vazio {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cor-texto);
  background: var(--cor-fundo-secundaria);
  font-size: 18px;
  font-weight: 750;
}

.pendente-detalhes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.pendente-detalhes strong {
  color: var(--cor-texto);
  font-size: 14px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.pendente-detalhes > span:not(.pendente-status) {
  color: var(--cor-texto-secundario);
  font-size: 12px;
  line-height: 1.5;
}

.pendente-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--cor-texto-secundario);
  font-size: 11px;
}

.status-ponto {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  background: var(--cor-primaria);
  border-radius: 50%;
}

/* Botões */
.acoes-pendente {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-aceitar,
.btn-recusar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  padding: 9px 13px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;
}

.btn-aceitar ion-icon,
.btn-recusar ion-icon {
  font-size: 17px;
}

.btn-aceitar {
  color: #fff;
  background: var(--cor-primaria);
  border: 1px solid var(--cor-primaria);
}

.btn-aceitar:hover {
  background: var(--cor-primaria-hover);
  border-color: var(--cor-primaria-hover);
}

.btn-recusar {
  color: var(--cor-texto-secundario);
  background: transparent;
  border: 1px solid var(--cor-borda);
}

.btn-recusar:hover {
  color: var(--cor-texto);
  background: var(--cor-superficie-hover);
  border-color: var(--cor-borda);
}

.btn-aceitar:focus-visible,
.btn-recusar:focus-visible {
  outline: 2px solid var(--cor-primaria);
  outline-offset: 3px;
}

/* Estado vazio */
.estado-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 270px;
  padding: 32px 20px;
  text-align: center;
  background: var(--cor-fundo);
  border: 1px dashed var(--cor-borda);
  border-radius: 14px;
}

.vazio-icone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: var(--cor-primaria);
  background: var(--cor-fundo-secundaria);
  border: 1px solid var(--cor-borda);
  border-radius: 20px;
  font-size: 30px;
}

.estado-vazio h3 {
  margin: 0 0 8px;
  color: var(--cor-texto);
  font-size: 17px;
  font-weight: 700;
}

.estado-vazio p {
  max-width: 390px;
  margin: 0;
  color: var(--cor-texto-secundario);
  font-size: 13px;
  line-height: 1.8;
}

/* Responsividade */
@media (max-width: 700px) {
  .pagina-notificacoes {
    padding: 18px 12px;
  }

  .notificacoes-header {
    padding: 20px;
    border-radius: 14px;
  }

  .resumo-notificacoes {
    gap: 10px;
  }

  .resumo-card {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    padding: 15px;
  }

  .secao-pendentes {
    padding: 16px;
    border-radius: 14px;
  }

  .item-pendente {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
    padding: 15px;
  }

  .acoes-pendente {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .btn-aceitar,
  .btn-recusar {
    width: 100%;
  }
}

@media (max-width: 380px) {
  .notificacoes-header {
    gap: 12px;
    padding: 16px;
  }

  .header-icone {
    width: 46px;
    height: 46px;
    font-size: 23px;
    border-radius: 13px;
  }

  .resumo-info strong {
    font-size: 17px;
  }

  .secao-header h2 {
    font-size: 16px;
  }

  .pendente-info {
    gap: 10px;
  }

  .pendente-avatar {
    width: 44px;
    height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pagina-notificacoes,
  .resumo-card,
  .item-pendente,
  .btn-aceitar,
  .btn-recusar {
    transition: none;
  }

  .resumo-card:hover {
    transform: none;
  }
}
</style>
```