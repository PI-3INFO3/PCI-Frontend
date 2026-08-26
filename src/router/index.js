import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLoadingStore } from '../stores/loading.js';
import HomeViews from '../views/HomeViews.vue';
import UserView from '../views/UserView.vue';
import CadastroViews from '../views/CadastroViews.vue'
import TipoDeUsuarioViews from '../views/TipoDeUsuarioViews.vue'
import Criar from '../views/Criar.vue';
import Chat from '../views/Chat.vue'
import ListaAmigos from '../views/ListaAmigos.vue'
import Notificacoes from '../views/Notificacoes.vue'
import Favoritos from '../views/Favoritos.vue';
import Designs from '../views/Designs.vue';
import LoginView from '../views/LoginView.vue'
import ProjetoAndamento from '../views/ProjetoAndamento.vue'; '../views/ProjetoAndamento.vue/index.js';
import MeusProjetos from '../views/MeusProjetos.vue';
const routes = [
  {
    path: '/user',
    name: 'user',
    component: UserView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: CadastroViews
  },
  
  {
    path: '/criar',
    name: 'criar',
    component: Criar
  },
  {
    path: '/tipo-de-usuario',
    name: 'tipodeusuario',
    component: TipoDeUsuarioViews
  },
  {
    path: '/amigos',
    name: 'amigos',
    component: ListaAmigos
  },
  {
    path: '/chat/:outroUsuarioId',
    name: 'chat',
    component: Chat,
    props: true,
  },
  {
    path: '/notificacoes',
    name: 'notificacoes',
    component: Notificacoes
  },

  {
    path: '/projetoandamento',
    name: 'Projeto',
    component: ProjetoAndamento  },
 {
    path: '/meus-projetos',
    name: 'meusprojetos',
    component: MeusProjetos
  },
  {
  path:'/favoritos',
  name: 'favoritos',
  component: Favoritos
  },
  {
  path:'/designs',
  name: 'designs',
  component: Designs
  },
  
  
  {
    path: '/',
    name: 'home',
    component: HomeViews
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const rotasPublicas = ['login', 'cadastro', 'tipodeusuario']

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (!rotasPublicas.includes(to.name) && !authStore.isAuthenticated) {
        return { name: 'login' };
    }
})
export default router;