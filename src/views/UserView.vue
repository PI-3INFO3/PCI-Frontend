<template>
    <div class="conta">

    <h1>Conta</h1>

   <button class="user">
    <img src="" alt="Foto do usuário">

    <div class="info">
        <span class="nome">Nome do Usuário</span> <br>
        <span class="email">E-mail</span>
    </div>
</button>

    <button>Adicionar nova conta</button>

    </div>

    <div class="opcoes">
        <ul>
            <li>
               configações
            </li>
            <li>
                Tema
            </li>
            <li>
                Sair da conta
            </li>
        </ul>
    </div>
</template>

<style>
.conta {
    display: flex;
    flex-direction: column;
    align-items: center;
}
div.conta {
    display: flex;
    gap: 10px 0 0 0 ;   
}
button.user {
    display: flex;
    background-color: white;
    border: 2px solid black;
    border-radius: 7px;
}
ul {
    display: flex;
    flex-direction: column;
    list-style-type: none;
}
li.nome {
    font-size: 20.3px;
    font-weight: bold;
}
li.email {
    font-size: 15px;
    font-weight: normal;
}

</style>