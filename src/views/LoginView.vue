<script setup>
</script>

<template>
    <img src="/public/logo-192x192.png" alt="logo">
    <form action="/login" method="post">
        <legend>Login</legend>

        <input type="text" id="username" name="username"  placeholder="Usuário" required >
        <input type="password" id="password" name="password" placeholder="Senha" required>

        <label>
        <input type="checkbox" name="lembre">
        Lembre de mim
        </label>
        
        <button type="submit">Entrar</button>
    </form>
    <p>Não tem conta?  <a href="/register"> Clique aqui</a></p>

</template>
<style scoped>
img {
    display: block;
    margin: 0 auto;
}
form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 35px;
}
legend {
    font-size: 40px;
    font-weight: bold;
    color: #FF5700;
    margin: 40px 0 0 0;
}
input {
    padding: 10px 50px 10px 50px;
    border-radius: 40px;
    border-color: #FF5700;
    border: 2px solid #FF5700;
    font-size: 15px;
    transition: transform .3s ease;
}
input:focus{ 
transform: scale(1.1);
box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
}
button {
    padding: 5.5px 90px 5.5px 90px;
    border-radius: 43px;
    background-color: #FF5700;
    border: none;
    color: white;
    font-size: 20px;
    transition: transform .3s ease;
}
button:active {
    background-color: #FF4500;
    transform: scale(1.05);
}
p {
   display: flex;
   justify-content: center;
    margin-top: 40px;
    font-size: 25px;
}
a {
    color: #FF5700;
    text-decoration: none;
}
</style>