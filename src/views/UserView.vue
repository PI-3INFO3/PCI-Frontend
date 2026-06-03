<template>
    <div class="conta">

    <h1>Conta</h1>

   <button class="user">
    <img src="" alt="">

    <div class="info">
        <span class="nome">Anderson Ramos Silva Anjo</span>
        <span class="email">Andersonrsanjo@gmail.com</span>
    </div>
    <ion-icon class="arrow" name="caret-forward-outline"></ion-icon>

</button>

    <button class="adicionar">Adicionar nova conta</button>

    </div>

    <div class="opcoes">
        <ul>
            <li>
                <ion-icon class="icon" name="settings-outline"></ion-icon>    configações
            </li>
            <li>
                <ion-icon class="icon" name="sunny-outline"></ion-icon>    Tema <span class="tema">claro </span>
            </li>
            <li>
                <ion-icon class="icon" name="log-out-outline"></ion-icon>    Sair da conta 
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
    width: 100%;
    display: flex;
    align-items: center;
    background-color: transparent;
    border: 2px solid black;
    border-radius: 7px;
    padding : 11px;
    margin-top: -25px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);

}
button.user img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}
.arrow{
    margin-left: auto;
    font-size: 20px;
}
.info{
    display: flex;
    
    flex-direction: column;
    gap: 4px;
    padding-left: 8px;
    
}
.nome {
    font-size: 13px;
    font-weight: bold;
    white-space:nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.email {
    font-size: 12px;
    margin-right: 25px;
    font-weight: normal;
}
.adicionar {
    background-color: tra;
    border: 2px solid black;
    border-radius: 7px;
    padding: 8px 15px;
    margin: 0 35px 0 35px;

    box-shadow: 5px 4px 10px rgba(0, 0, 0, .18);

}
.opcoes{
    margin: 43px 0 0 0;
}
ul {
    display: flex;
    flex-direction: column;
    gap: 48px;
    padding: 0;
    list-style-type: none;
}
li {
    justify-content: space-between;
    font-size: 17px;
    display: flex;
    align-items: center;
    
}
h1{
    font-size: 30px;
}
.icon {
    font-size: 25px;
    margin-right:30px;
    min-width: 20px;
}

</style>