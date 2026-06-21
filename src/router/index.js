import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeViews.vue')
  },
  {
    path: '/EditorDesing',
    name: 'editor',
    component: () => import('../views/EditorDesing.vue')
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;