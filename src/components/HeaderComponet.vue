<template>
  <header class="header">
    <div class="logo">
      <img 
        src="/soul.png"      
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

    <div class="oval-buttons">
      <div class="oval"></div>
      <div class="oval"></div>
      <div class="oval"></div>
      <div class="oval"></div>
    </div>
  </header>
</template>

<style scoped>
.header {
  padding: 16px 16px 12px 16px;
  background: transparent
;
}

.logo {
  margin-bottom: 16px;
}

.logo-img {
  height: 34px;
  width: auto;
}


.search-container {
  margin-bottom: 16px;
}

.search-wrapper {
  position: relative;
  width: 90%;
  margin-left: 20px;
}

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


.oval-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  margin-left: 20px;
}
.oval:active{
  transform: scale(.88);
  opacity: .8;
}

.oval {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.45);
  width: 78px;
  height: 34px;
  margin-top: 30px;
  background-color: transparent;
  border: 2px solid #FF6B00;
  border-radius: 9999px;
}
</style>