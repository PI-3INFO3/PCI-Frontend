import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/user',
    name: 'user',
    component: () => import('../views/UserView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/Cadastro',
    name: 'Cadastro',
    component: () => import('../views/CadastroViews.vue'),
    props: true
  },
  {
    path: '/Tipodeusuario',
    name: 'Tipo de usuario',
    component: () => import('../views/TipoDeUsuarioViews.vue'),
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeViews.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
