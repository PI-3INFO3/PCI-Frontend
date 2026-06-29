import { createApp } from 'vue'
import { createPinia } from 'pinia';
import './assets/css/style.css'
import router from './router'
import App from './App.vue'

import { defineCustomElements } from 'ionicons/loader'

const app = createApp(App);
app.use(createPinia());
app.use(router);
defineCustomElements(window)
app.mount('#app');