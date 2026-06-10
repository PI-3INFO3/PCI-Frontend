<template>
  <header class="header">
    <div class="logo">
      <img 
        src="/logo-48x48.png"      
        alt="soul." 
        class="logo-img"
      >
    </div>

    <div class="search-container">
      <div class="search-wrapper">
        <ion-icon name="search-outline" class="search-icon"></ion-icon>
        <input 
          type="text" 
          class="search-bar"
          placeholder="Buscar..."
        >
      </div>
    </div>

  </header>
</template>

<style scoped>
.header {
  padding: 16px 16px 12px 16px;
}

.logo {
  margin-bottom: 16px;
}.search-container {
  margin-bottom: 16px;
  display: flex;            
  justify-content: center;   
  width: 100%;
  transition: transform 0.2s ease-in-out; }

.search-container:focus-within {
  transform: scale(1.05);  
}

.search-wrapper {
  position: relative;
  width: 90%;               }


.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;          
  color: #000;            
}

.search-bar {
  width: 100%;
  height: 42px;
  border: 2px solid #FF6B00;
  border-radius: 30px;
  padding-left: 50px;        
  padding-right: 16px;
  background-color: transparent;
  font-size: 15px;
  outline: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.45);
}

.search-bar:focus{
  animation: mudarSombra 1s ease-in-out;
}
@keyframes mudarSombra {
  0% {
    box-shadow: 0 4px 15px rgba(255, 107, 0, 0.8);
    border-color: #FF6B00;
  }
  50% {
    box-shadow: 0 4px 20px rgba(255, 107, 0, 1);
  }
  100% {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.10);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.45);

  }
}

</style>