import './assets/css/style.css';
import { registerSW } from 'virtual:pwa-register';

// Versões anteriores da PWA armazenavam respostas autenticadas num cache
// genérico, possivelmente após trocar de conta. Exclua esse cache legado.
if ('caches' in window) {
  window.caches.delete('api-cache').catch(() => {});
}
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
  }
});
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './assets/css/style.css';
import router from './router';
import App from './App.vue';
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');