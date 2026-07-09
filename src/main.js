import './assets/css/style.css'

import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 1000);
    }
  },
});
const temaSalvo = localStorage.getItem('tema')
if(temaSalvo === 'Escuro'){
  document.body.classList.add('dark')
}


import { createApp } from 'vue'
import { createPinia } from 'pinia';
import './assets/css/style.css'
import router from './router'
import App from './App.vue'

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
