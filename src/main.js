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
  onNeedRefresh() {
    window.location.reload();
  },
});

import { createApp } from 'vue'
import { createPinia } from 'pinia';
import './assets/css/style.css'
import router from './router'
import App from './App.vue'

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
