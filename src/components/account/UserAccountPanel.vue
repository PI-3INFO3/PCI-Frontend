<script setup>
import { useAccountContext } from '@/composables/useAccountContext.js'

const conta = useAccountContext()
const expandido = conta.expandido
const fotoPerfil = conta.fotoPerfil
const nome = conta.nome
const email = conta.email
const ativo = conta.ativo
const mostrarSenhaAtual = conta.mostrarSenhaAtual
const mostrarSenha = conta.mostrarSenha
const mostrarConfirmarSenha = conta.mostrarConfirmarSenha
const senhaAtual = conta.senhaAtual
const senha = conta.senha
const confirmarSenha = conta.confirmarSenha
const tipoUsuario = conta.tipoUsuario
const alternarExpansao = conta.alternarExpansao
const abrirVisualizadorFoto = conta.abrirVisualizadorFoto
const acionarInputFoto = conta.acionarInputFoto
const salvarAlteracoes = conta.salvarAlteracoes
</script>

<template>
  <Transition name="deslizar">
    <div v-if="expandido" class="painel-expandido">
      <div class="topo-painel">
        <h2>Conta</h2>
        <ion-icon
          class="arrow-down"
          name="caret-down-outline"
          @click="alternarExpansao"
          >
         </ion-icon>
      </div>
      <div class="conteudo-painel">
        <div class="foto-container grande" @click.stop="abrirVisualizadorFoto">
          <img v-if="fotoPerfil" :src="fotoPerfil" alt="Foto de Perfil">
          <ion-icon v-else class="foto-icon" name="person-circle-outline"></ion-icon>
          <button type="button" class="btn-mais" @click.stop="acionarInputFoto">+</button>
        </div>
        <span class="legenda-foto">Alterar foto de perfil?</span>
        <div class="campo-input">
          <ion-icon name="person-outline"></ion-icon>
          <input type="text" v-model="nome">
        </div>
        <div class="campo-input">
          <ion-icon name="mail-outline"></ion-icon>
          <input type="email" :value="email" disabled>
        </div>
        <div
          class="campo-input"
          :class="{ active: ativo === 'SenhaAtual' }"
          @click="ativo = 'SenhaAtual'"
          >
          <ion-icon
            name="key-outline"
            class="icon-senha"
            :style="{ opacity: mostrarSenhaAtual ? 1 : 0.5 }"
            @click.stop="mostrarSenhaAtual = !mostrarSenhaAtual"
            >
           </ion-icon>
          <input
            v-model="senhaAtual"
            :type="mostrarSenhaAtual ? 'text' : 'password'"
            placeholder="Senha atual"
            autocomplete="current-password"
            >
        </div>
        <div class="campo-input" :class="{ active: ativo === 'Senha' }" @click="ativo = 'Senha'">
          <ion-icon
            :name="mostrarSenha ? 'lock-open-outline' : 'lock-closed-outline'"
            class="icon-senha"
            @click.stop="mostrarSenha = !mostrarSenha"
            >
           </ion-icon>
          <input
            v-model="senha"
            :type="mostrarSenha ? 'text' : 'password'"
            placeholder="Nova senha"
            autocomplete="new-password"
            >
        </div>
        <div
          class="campo-input"
          :class="{ active: ativo === 'Confirmar' }"
          @click="ativo = 'Confirmar'"
          >
          <ion-icon
            :name="mostrarConfirmarSenha ? 'eye-outline' : 'eye-off-outline'"
            class="icon-olho"
            @click.stop="mostrarConfirmarSenha = !mostrarConfirmarSenha"
            >
           </ion-icon>
          <input
            v-model="confirmarSenha"
            :type="mostrarConfirmarSenha ? 'text' : 'password'"
            placeholder="Confirmar nova senha"
            autocomplete="new-password"
            >
        </div>
        <div class="card-tipo-usuario">
          <h3>Tipo de usuário</h3>
          <button class="btn-tipo" type="button">
            <ion-icon name="person-outline"></ion-icon>
            {{ tipoUsuario }}
          </button>
        </div>
        <button class="btn-confirmar" type="button" @click="salvarAlteracoes">
          Confirmar?
        </button>
      </div>
    </div>
  </Transition></template>

<style scoped src="@/assets/css/UserView-layout.css"></style>
<style scoped src="@/assets/css/UserView-controls.css"></style>