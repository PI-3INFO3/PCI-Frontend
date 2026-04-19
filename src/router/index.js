import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/Cadastro',
    name: 'Cadastro',
    component: () => import('../views/CadastroViews.vue'),
  },
  {
    path: '/',
    name: 'Tipo de usuario',
    component: () => import('../views/TipoDeUsuarioViews.vue'),
  },
];


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;