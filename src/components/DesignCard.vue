<script setup>
import { useDesignCard } from '@/editor/DesignCard/useDesignCard.js'
const props = defineProps({
  design: {
    type: Object,
    required: true
  },
  showFavorite: {
    type: Boolean,
    default: true
  },
  showRename: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  showDescription: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: true
  }
});
const emit = defineEmits(["updated", "removed", "open"]);
const card = useDesignCard(props, emit);
const quantidadePaginas = card.quantidadePaginas;
const canvasElement = card.canvasElement;
const editandoNome = card.editandoNome;
const nomeEditado = card.nomeEditado;
const carregandoAcao = card.carregandoAcao;
const erro = card.erro;
const mostrarConfirmacao = card.mostrarConfirmacao;
const nomeDesign = card.nomeDesign;
const iniciarRenomeacao = card.iniciarRenomeacao;
const cancelarRenomeacao = card.cancelarRenomeacao;
const salvarNome = card.salvarNome;
const alternarFavorito = card.alternarFavorito;
const pedirConfirmacaoExclusao = card.pedirConfirmacaoExclusao;
const cancelarExclusao = card.cancelarExclusao;
const excluirDesign = card.excluirDesign;
const abrirDesign = card.abrirDesign;
</script>

<template>
<article class="design-card" :class="{ clicavel: clickable }" @click="abrirDesign">
        <div class="design-preview">
            <canvas
              ref="canvasElement"
              class="design-miniatura"
              :aria-label="`Miniatura de ${nomeDesign()}`"
            >
              </canvas>
        </div>
        <button
          v-if="showFavorite"
          class="btn-estrela"
          :class="{ ativa: design.importante }"
          :disabled="carregandoAcao"
          :title=" design.importante ? 'Remover dos favoritos' : 'Adicionar aos favoritos' "
          :aria-label=" design.importante ? 'Remover dos favoritos' : 'Adicionar aos favoritos' "
          @click.stop="alternarFavorito"
        >
            <ion-icon :name=" design.importante ? 'star' : 'star-outline' "></ion-icon>
        </button>
        <div class="design-info">
            <form v-if="editandoNome" class="renomear-form" @click.stop @submit.prevent="salvarNome">
                <span class="quantidade-paginas">
                    {{ quantidadePaginas }}
                    {{
                        quantidadePaginas === 1
                            ? "página"
                            : "páginas"
                    }}
                </span>
                <input
                  v-model="nomeEditado"
                  class="input-nome"
                  type="text"
                  maxlength="255"
                  aria-label="Nome do projeto"
                  autofocus
                  @keydown.esc="cancelarRenomeacao"
                />
                <button
                  type="submit"
                  class="acao-pequena salvar"
                  :disabled="carregandoAcao"
                  title="Salvar nome"
                >
                    <ion-icon name="checkmark-outline"></ion-icon>
                </button>
                <button type="button" class="acao-pequena" title="Cancelar" @click="cancelarRenomeacao">
                    <ion-icon name="close-outline"></ion-icon>
                </button>
            </form>
            <template v-else>
                <div class="design-textos">
                    <span class="design-nome">
                        {{ nomeDesign() }}
                    </span>
                    <span v-if=" showDescription && design.description " class="design-descricao">
                        {{ design.description }}
                    </span>
                </div>
                <div class="acoes-card" @click.stop>
                    <button
                      v-if="showRename"
                      class="acao-card"
                      title="Renomear projeto"
                      aria-label="Renomear projeto"
                      @click="iniciarRenomeacao"
                    >
                        <ion-icon name="create-outline"></ion-icon>
                    </button>
                    <button
                      v-if="showDelete"
                      class="acao-card excluir"
                      title="Excluir projeto"
                      aria-label="Excluir projeto"
                      @click="pedirConfirmacaoExclusao"
                    >
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </div>
            </template>
        </div>
        <p v-if="erro" class="erro-card" @click.stop>
            {{ erro }}
        </p>
        <div v-if="mostrarConfirmacao" class="modal-fundo" @click.stop @click.self="cancelarExclusao">
            <section
              class="modal-confirmacao"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-exclusao"
            >
                <h3 id="titulo-exclusao">
                    Excluir projeto?
                </h3>
                <p>
                    Tem certeza de que deseja excluir
                    <strong>{{ nomeDesign() }}</strong>?
                    Essa ação não poderá ser desfeita.
                </p>
                <div class="modal-acoes">
                    <button class="botao-secundario" :disabled="carregandoAcao" @click="cancelarExclusao">
                        Cancelar
                    </button>
                    <button class="botao-excluir" :disabled="carregandoAcao" @click="excluirDesign">
                        {{
                            carregandoAcao
                                ? "Excluindo..."
                                : "Excluir"
                        }}
                    </button>
                </div>
            </section>
        </div>
    </article>
</template>

<style scoped src="@/assets/css/DesignCard.css"></style>