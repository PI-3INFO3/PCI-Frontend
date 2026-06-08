<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const nome = ref('')
const email = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const tipoUsuario = ref('Pessoal')

const tema = ref('Claro')
const fotoPerfil = ref(localStorage.getItem('fotoPerfil') || '')

const expandido = ref(false)
const inputFoto = ref(null)

onMounted(() => {
    const fotoSalva = localStorage.getItem('fotoPerfil')
    if (fotoSalva) fotoPerfil.value = fotoSalva

    const temaSalvo = localStorage.getItem('tema')
    if (temaSalvo) {
        tema.value = temaSalvo
        document.body.classList.toggle('dark', temaSalvo === 'Escuro')
    }
})

function acionarInputFoto() {
    inputFoto.value.click()
}

function trocarFoto(event) {
    const arquivo = event.target.files[0]
    if (!arquivo) return

    const reader = new FileReader()
    reader.onload = () => {
        fotoPerfil.value = reader.result
        localStorage.setItem('fotoPerfil', reader.result)
    }
    reader.readAsDataURL(arquivo)
}

function alternarExpansao() {
    expandido.value = !expandido.value

    if (expandido.value) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = ''
    }
}

// function abrirPerfil() {
//     router.push('/perfil').catch(() => {
//         console.log('Rota /perfil não configurada no seu router')
//     })
// }

// function abrirConfiguracoes() {
//     router.push('/configuracoes').catch(() => {
//         console.log('Rota /configuracoes não configurada')
//     })
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
    const confirmar = confirm('Deseja realmente sair da conta?')
    if (confirmar) {
        localStorage.clear()
        // router.push('/login')
    }
}
</script>

<template>
    <div class="pagina">

        <div class="conta">
            <h1>Conta</h1>
            <div class="user-card" @click="abrirPerfil">
                <div class="foto-container">
                    <img v-if="fotoPerfil" :src="fotoPerfil" alt="Foto de Perfil">
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
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                </li>

                <li @click="trocarTema">
                    <div class="lado-esquerdo">
                        <ion-icon class="icon" name="sunny-outline"></ion-icon>
                        Tema
                    </div>
                    <span class="tema">{{ tema }}</span>
                </li>

                <li class="sair" @click="sairConta">
                    <div class="lado-esquerdo">
                        <ion-icon class="icon" name="log-out-outline"></ion-icon>
                        Sair da conta
                    </div>
                </li>
            </ul>
        </div>

      
        <Transition name="deslizar">
            <div v-if="expandido" class="painel-expandido">

                <div class="topo-painel">
                    <h2>Conta</h2>
                    <ion-icon class="arrow-down" name="chevron-down-outline" @click="alternarExpansao"></ion-icon>
                </div>

                <div class="conteudo-painel">

                    <div class="foto-container grande">
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
                        <input type="email" v-model="email">
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

                    <button class="btn-confirmar" type="button" @click="alternarExpansao">
                        Confirmar?
                    </button>

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
    padding: 16px;
    min-height: 100vh;
    background-color: white;
}

.conta {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.conta h1 {
    font-size: 32px;
    font-weight: 700;
}

.user-card {
    width: 100%;
    display: flex;
    align-items: center;
    background: white;
    border: 2px solid #8a8888;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, .12);
    cursor: pointer;
}

.foto-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.foto-container img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ff6b00;
}

.foto-icon {
    font-size: 50px;
    color: #666;
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
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.email {
    font-size: 12px;
    color: #666;
}

.adicionar {
    padding: 8px 15px;
    background-color: transparent;
    border: 2px solid #8a8888;
    border-radius: 10px;
    margin: 0 35px;
    cursor: pointer;
    box-shadow: 5px 4px 10px rgba(0, 0, 0, .18);
    font-weight: 600;
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
}

.icon {
    font-size: 25px;
    margin-right: 20px;
}

.lado-esquerdo {
    display: flex;
    align-items: center;
}

.tema {
    font-size: 14px;
}

.sair {
    color: red;
}

/* Estilos da Parte 2 (Painel da Imagem) */
.painel-expandido {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #e6e6e6;
    z-index: 9999;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.topo-painel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;
}

.topo-painel h2 {
    font-size: 28px;
    font-weight: 700;
    color: #000;
}

.arrow-down {
    font-size: 24px;
    cursor: pointer;
    color: #000;
}

.conteudo-painel {
    background-color: #dedede;
    border: 1px solid #b5b5b5;
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

.foto-container.grande img,
.foto-container.grande .foto-icon {
    width: 75px;
    height: 75px;
    font-size: 75px;
}

.legenda-foto {
    font-size: 13px;
    font-weight: 600;
    margin-top: 8px;
    margin-bottom: 20px;
    color: #333;
}

.campo-input {
    width: 100%;
    max-width: 280px;
    background: white;
    border-radius: 25px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.1);
}

.campo-input ion-icon {
    font-size: 18px;
    color: #333;
}

.campo-input input {
    border: none;
    background: transparent;
    width: 100%;
    font-size: 12px;
    font-weight: 600;
    color: #333;
    outline: none;
}

.card-tipo-usuario {
    background: white;
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

.deslizar-enter-active,
.deslizar-leave-active {
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.deslizar-enter-from,
.deslizar-leave-to {
    transform: translateY(100%);
}
</style>