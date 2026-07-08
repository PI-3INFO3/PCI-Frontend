import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/user',
    name: 'user',
    component: () => import('../views/UserView.vue'),
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
    path: '/tipodeusuario',
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

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.name !== 'login' && !authStore.isAuthenticated) {
    return { name: 'login' };
  }
});

export default router;