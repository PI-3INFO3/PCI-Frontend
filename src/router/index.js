import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import verificacao from '../views/Verificacao.vue';

const routes = [
  {
    path: '/user',
    name: 'user',
    component: () => import('../views/UserView.vue'),
  },
  {
    path: '/verificar',
    name: 'verificar',
    component: verificacao
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: () => import('../views/CadastroViews.vue'),
  },
  {
    path: '/tipo-de-usuario',
    name: 'tipodeusuario',
    component: () => import('../views/TipoDeUsuarioViews.vue'),
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeViews.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const rotasPublicas = ['login', 'cadastro', 'tipodeusuario', 'verificar']

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchUser();
  }

  if (!rotasPublicas.includes(to.name) && !authStore.isAuthenticated) {
    return { name: 'login' };
  }

  if (rotasPublicas.includes(to.name) && to.name !== 'tipodeusuario' && to.name !== 'verificar' && authStore.isAuthenticated) {
    return { name: 'home' };
  }
});

export default router;