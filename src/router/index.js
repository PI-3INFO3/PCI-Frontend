import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useLoadingStore } from "../stores/loading.js";
import HomeViews from "../views/HomeViews.vue";
import UserView from "../views/UserView.vue";
import CadastroViews from "../views/CadastroViews.vue";
import TipoDeUsuarioViews from "../views/TipoDeUsuarioViews.vue";
import Chat from "../views/Chat.vue";
import ListaAmigos from "../views/ListaAmigos.vue";
import Notificacoes from "../views/Notificacoes.vue";
import Favoritos from "../views/Favoritos.vue";
import Designs from "../views/Designs.vue";
import LoginView from "../views/LoginView.vue";
import MeusProjetos from "../views/MeusProjetos.vue";
const routes = [
  {
    path: "/",
    name: "home",
    component: HomeViews,
  },

  {
    path: "/user",
    name: "user",
    component: UserView,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/cadastro",
    name: "cadastro",
    component: CadastroViews,
  },
  {
    path: "/tipo-de-usuario",
    name: "tipodeusuario",
    component: TipoDeUsuarioViews,
  },
  {
    path: "/amigos",
    name: "amigos",
    component: ListaAmigos,
  },
  {
    path: "/chat/:outroUsuarioId",
    name: "chat",
    component: Chat,
    props: true,
  },
  {
    path: "/notificacoes",
    name: "notificacoes",
    component: Notificacoes,
  },
  {
    path: "/meus-projetos",
    name: "meusprojetos",
    component: MeusProjetos,
  },
  {
    path: "/favoritos",
    name: "favoritos",
    component: Favoritos,
  },
  {
    path: "/designs",
    name: "designs",
    component: Designs,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

const rotasPublicas = ["login", "cadastro", "tipodeusuario"];

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (!rotasPublicas.includes(to.name) && !authStore.isAuthenticated) {
    return { name: "login" };
  }
  authStore.rotaAtual = to.name;
});

router.afterEach((to, from) => {
  const toDepth = to.path.split("/").length;
  const fromDepth = from.path.split("/").length;
  to.meta.transition = toDepth < fromDepth ? "slide-right" : "slide-left";
});

export default router;
