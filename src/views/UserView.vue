<template>
    <div class="conta">

    <h1>Conta</h1>

   <button class="user">
    <img src="" alt="">

    <div class="info">
        <span class="nome">Anderson Ramos Silva Anjo</span> <br>
        <span class="email">Andersonrsanjo@gmail.com</span>
    </div>
</button>

    <button class="adicionar">Adicionar nova conta</button>

    </div>

    <div class="opcoes">
        <ul>
            <li>
                <ion-icon name="settings-outline"></ion-icon>    configações
            </li>
            <li>
                <ion-icon name="sunny-outline"></ion-icon>    Tema <span class="tema">claro </span>
            </li>
            <li>
                <ion-icon name="log-out-outline"></ion-icon>    Sair da conta 
            </li>
        </ul>
    </div>
</template>

<style>
.conta {
    display: flex;
    flex-direction: column;
    gap: 25px;
}
button.user {
    display: flex;
    background-color: white;
    border: 2px solid black;
    border-radius: 7px;
    padding : 10px;
}
span {
    margin: 10vw;
}
.nome {
    font-size: 15px;
    font-weight: bold;
}
.email {
    font-size: 13px;
    font-weight: normal;
}
.adicionar {
    background-color: white;
    border: 2px solid black;
    border-radius: 7px;
    padding: 5px;
    margin: 0 85px 0 85px;
}
.opcoes {
    display: flex;
    flex-direction: column;
    margin: 43px 0 0 0;
}
ul {
    display: flex;
    flex-direction: column;
    gap: 48px;
    list-style-type: none;
}
li {
    font-size: 17px;
    display: flex;
    align-items: center;
}
.tema {
    margin-left: 80px;
}
ion-icon {
    font-size: 20px;
    margin-right:30px;
}

</style>