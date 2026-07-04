<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const senha = ref('')
const confirmarSenha = ref('')

const tema = ref('Claro')

const expandido = ref(false)
const visualizadorAberto = ref(false) 
const inputFoto = ref(null)

function inicio() {
    router.push("/")
}

onMounted(async () => {
    await auth.fetchUser()

    const temaSalvo = localStorage.getItem('tema')
    if (temaSalvo) {
        tema.value = temaSalvo
        document.body.classList.toggle('dark', temaSalvo === 'Escuro')
    }
})
const nome = computed({
    get: () => auth.user?.name || '',
    set: (value) => {
        auth.user.name = value
    }
})

const email = computed(() => auth.user?.email || '')

const tipoUsuario = computed(() =>
    auth.user?.user_type || 'personal'
)

const fotoPerfil = computed(() =>
    auth.user?.profile_photo?.url || ''
)
function acionarInputFoto() {
    inputFoto.value?.click()
}

async function trocarFoto(event) {
    const file = event.target.files[0]
    if (!file) return

    try {
        const response = await auth.uploadPhoto(file)
        const attachment_key = response.data.attachment_key

        await auth.updateUser({
            profile_photo_attachment_key: attachment_key
        })

        await auth.fetchUser()
    } catch (err) {
        console.error(err)
        alert('Erro ao atualizar foto')
    }
}

function alternarExpansao() {
    expandido.value = !expandido.value
    gerenciadorScroll()
}

function abrirVisualizadorFoto() {
    if (!fotoPerfil.value) return
    visualizadorAberto.value = true
    gerenciadorScroll()
}

function fecharVisualizadorFoto() {
    visualizadorAberto.value = false
    gerenciadorScroll()
}

function gerenciadorScroll() {
    document.body.style.overflow =
        expandido.value || visualizadorAberto.value ? 'hidden' : ''
}

async function salvarAlteracoes() {
    if (senha.value || confirmarSenha.value) {
        if (senha.value !== confirmarSenha.value) {
            alert('As senhas não coincidem!')
            return
        }
    }

    try {
        await auth.updateUser({
            name: auth.user.name,
            user_type: auth.user.user_type,
            password: senha.value || undefined
        })

        senha.value = ''
        confirmarSenha.value = ''
        expandido.value = false

        await auth.fetchUser()

    } catch (err) {
        alert('Erro ao atualizar usuário')
        console.error(err)
    }
}

// function abrirConfiguracoes() {
//     router.push('/configuracoes').catch(() => { })
// }

function trocarTema() {
    if (tema.value === 'Claro') {
        tema.value = 'Escuro'
        document.body.classList.add('dark')
    } else {
        tema.value = 'Claro'
        document.body.classList.remove('dark')
    }
    localStorage.setItem('tema', tema.value)
}

function sairConta() {
    if (confirm('Deseja realmente sair da conta?')) {
        auth.logout()
        router.push('/login')
    }
}
</script>

<template>
    <div class="pagina">

        <div class="conta">
            <h1>Conta</h1>

            <div class="user-card">
                <div class="foto-container" @click.stop="abrirVisualizadorFoto">
                    <img v-if="fotoPerfil" :src="fotoPerfil" alt="Foto de Perfil"
                    
                    >
                    <ion-icon v-else class="foto-icon" name="person-circle-outline"></ion-icon>

                    <button type="button" class="btn-mais" @click.stop="acionarInputFoto">+</button>
                    <input ref="inputFoto" type="file" accept="image/*" @change="trocarFoto" hidden>
                </div>

                <div class="info">
                    <span class="nome">{{ nome }}</span>
                    <span class="email">{{ email }}</span>
                </div>

                <div class="arrow-trigger" @click.stop="alternarExpansao">
                    <ion-icon class="arrow"
                        :name="expandido ? 'caret-down-outline' : 'caret-forward-outline'"></ion-icon>
                </div>
            </div>

            <button class="adicionar" type="button">
                Adicionar nova conta
            </button>
        </div>

        <div class="opcoes">
            <ul>
                <li @click="abrirConfiguracoes">
                    <div class="lado-esquerdo">
                        <ion-icon class="icon" name="settings-outline"></ion-icon>
                        Configurações
                    </div>
                    <ion-icon class='tema-conf' name="chevron-forward-outline"></ion-icon>
                </li>
                <li @click="trocarTema">
                    <div class="lado-esquerdo">
                        <ion-icon class="icon" name="sunny-outline"></ion-icon>
                        Tema
                    </div>
                    <span class="tema-conf">{{ tema }}</span>
                </li>
                <li class="sair" @click="sairConta">
                    <div class="lado-esquerdo">
                        <ion-icon class="icon" name="log-out-outline"></ion-icon>
                        Sair da conta
                    </div>
                </li>
                
                <li class="voltar" @click="inicio">
                    <div class="lado-esquerdo">
                        <ion-icon class="icon" name="caret-back-outline"></ion-icon>
                        Voltar para o inicio
                    </div>
                </li>
            </ul>
        </div>

        <Transition name="deslizar">
            <div v-if="expandido" class="painel-expandido">

                <div class="topo-painel">
                    <h2>Conta</h2>
                    <ion-icon class="arrow-down" name="caret-down-outline" @click="alternarExpansao"></ion-icon>
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

                    <div class="campo-input">
                        <ion-icon name="lock-closed-outline"></ion-icon>
                        <input type="password" v-model="senha" placeholder="Alterar senha?">
                    </div>

                    <div class="campo-input">
                        <ion-icon name="eye-off-outline"></ion-icon>
                        <input type="password" v-model="confirmarSenha" placeholder="Confirmar senha?">
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
        </Transition>

        <Transition name="fade">
            <div v-if="visualizadorAberto" class="modal-overlay" @click="fecharVisualizadorFoto">
                <button class="modal-close" @click.stop="fecharVisualizadorFoto">✕</button>

                <div class="modal-body" @click.stop>
                    <div class="card-image-modal">
                        <div class="blur-bg" :style="{ backgroundImage: `url(${fotoPerfil})` }"></div>
                        <img :src="fotoPerfil" :alt="nome">
                    </div>
                    <p class="modal-title">{{ nome }}</p>
                </div>
            </div>
        </Transition>

    </div>
</template>
<style scoped>
* {
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
}

.pagina {
    min-height: 100vh;
    background-color: var(--cor-fundo);
    color: var(--cor-texto);
}

.conta {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.conta h1 {
    margin-left: 24px;
    font-size: 32px;
    font-weight: 700;
}

.user-card {
    width: 98%;
    margin-left: 3px;
    display: flex;
    align-items: center;
    background: var(--cor-card);
    border: 2px solid var(--cor-borda);
    border-radius: 12px;
    padding: 11px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, .12);
    cursor: pointer;
}

.foto-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.foto-container img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ff6b00;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    transform: translateZ(0);
}

.foto-icon {
    font-size: 50px;
    color: var(--cor-texto-secundario);
}

.btn-mais {
    position: absolute;
    right: -4px;
    bottom: -4px;
    width: 18px;
    height: 18px;
    background: #ff6b00;
    color: white;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
}

.arrow-trigger {
    margin-left: auto;
    padding: 10px;
}

.arrow {
    font-size: 20px;
}

.info {
    display: flex;
    flex-direction: column;
    margin-left: 12px;
    overflow: hidden;
}

.nome {
    font-size: 17px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.email {
    font-size: 15px;
    color: var(--cor-texto-secundario);
}

.adicionar {
    padding: 8px 15px;
    background-color: transparent;
    color: var(--cor-texto);
    border: 2px solid var(--cor-borda);
    border-radius: 10px;
    margin: 0 35px;
    cursor: pointer;
    box-shadow: 5px 4px 10px rgba(0, 0, 0, .18);
    font-weight: 600;
    transition: .2s;
}
.adicionar:active{
    transform: translateY(2px);
}

.opcoes {
    margin-top: 50px;
}

ul {
    display: flex;
    flex-direction: column;
    gap: 35px;
    padding: 0;
    list-style-type: none;
}

li {
    justify-content: space-between;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    color: var(--cor-texto);
}

.icon {
    font-size: 25px;
    margin-right: 20px;
}

.lado-esquerdo {
    
    display: flex;
    align-items: center;
    
    margin-left: 24px;
}

.tema-conf {
    font-size: 14px;
    margin-right: 24px;
    color: var(--cor-texto-secundario);
}

.sair {
    color: red;
}

.painel-expandido {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--cor-fundo);
    z-index: 9998;
    padding: 5px 20px;
    display: flex;
    flex-direction: column;
}

.topo-painel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.topo-painel h2 {
    font-size: 28px;
    font-weight: 700;
    color: var(--cor-texto);
}

.arrow-down {
    font-size: 24px;
    cursor: pointer;
    color: var(--cor-texto);
}

.conteudo-painel {
    background-color: var(--cor-fundo-secundaria);
    border: 1px solid var(--cor-borda);
    border-radius: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 25px 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    scrollbar-width: none;
}

.conteudo-painel::-webkit-scrollbar {
    display: none;
}

.foto-container.grande img,
.foto-container.grande .foto-icon {
    width: 75px;
    height: 75px;
    font-size: 75px;
}

.legenda-foto {
    font-size: 15px;
    font-weight: 600;
    margin-top: 8px;
    margin-bottom: 20px;
    color: var(--cor-texto);
}

.campo-input {
    width: 100%;
    max-width: 280px;
    background: var(--cor-card);
    border-radius: 25px;
    padding: 10px 17px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    transition: .2s;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.1);
}
.campo-input ion-icon {
    font-size: 20px;
    color: var(--cor-texto);
}

.campo-input input {
    border: none;
    background: transparent;
    width: 100%;
    font-size: 12px;
    font-weight: 600;
    color: var(--cor-texto);
    outline: none;
}

.card-tipo-usuario {
    background: var(--cor-card);
    border-radius: 16px;
    width: 100%;
    max-width: 280px;
    padding: 12px;
    text-align: center;
    margin-top: 10px;
    margin-bottom: 25px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.card-tipo-usuario h3 {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 10px;
    color: var(--cor-texto);
}

.btn-tipo {
    background-color: #f12a17;
    color: white;
    border: none;
    border-radius: 20px;
    width: 100%;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
}

.btn-confirmar {
    background-color: #ff5100;
    color: white;
    border: none;
    border-radius: 25px;
    width: 100%;
    max-width: 250px;
    padding: 12px;
    font-size: 16px;
    font-weight: 700;
    box-shadow: 0 4px 10px rgba(255, 81, 0, 0.3);
    cursor: pointer;
    margin-top: auto;
}

.modal-close {
    position: absolute;
    top: 50px;
    right: 20px;
    background: transparent;
    z-index: 999;
    border: none;
    color: #fff;
    font-size: 24px;
    font-weight: 900;
    cursor: pointer;
    padding: 10px;
}

.modal-body {
    position: fixed;top: 0; left: 0; width: 100%; height: 100%;background: rgba(15, 20, 42, 0.95);
}

.blur-bg {
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background-size: cover;
    background-position: center;
    filter: blur(10px) opacity(.15);
    z-index: -1;
}

.card-image-modal img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 8px;
    z-index: 2;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
}

.modal-title {
    margin: 0;
    margin-top: 20px;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    text-align: center;
    font-family: system-ui, -apple-system, sans-serif;
}

.deslizar-enter-active,
.deslizar-leave-active {
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.deslizar-enter-from,
.deslizar-leave-to {
    transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>