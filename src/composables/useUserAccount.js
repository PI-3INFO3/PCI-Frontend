import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
export function useUserAccount() {
  const router = useRouter();
  const auth = useAuthStore();
  const senhaAtual = ref('');
  const senha = ref('');
  const confirmarSenha = ref('');
  const ativo = ref('');
  const mostrarSenhaAtual = ref(false);
  const mostrarSenha = ref(false);
  const mostrarConfirmarSenha = ref(false);
  const tema = ref('Claro');
  const expandido = ref(false);
  const visualizadorAberto = ref(false);
  const inputFoto = ref(null);
  function inicio() {
    router.push("/");
  }
  onMounted(async () => {
    await auth.fetchUser();
    tema.value = auth.user?.theme || 'Claro';
  });
  const nome = computed({
    get: () => auth.user?.name || '',
    set: value => {
      auth.user.name = value;
    }
  });
  const email = computed(() => auth.user?.email || '');
  const tipoUsuario = computed(() => auth.user?.user_type || 'personal');
  const fotoPerfil = computed(() => auth.user?.profile_photo?.url || '');
  function acionarInputFoto() {
    inputFoto.value?.click();
  }
  async function trocarFoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const response = await auth.uploadPhoto(file);
      const attachment_key = response.data.attachment_key;
      await auth.updateUser({
        profile_photo_attachment_key: attachment_key
      });
      await auth.fetchUser();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar foto');
    }
  }
  function alternarExpansao() {
    expandido.value = !expandido.value;
    gerenciadorScroll();
  }
  function abrirVisualizadorFoto() {
    if (!fotoPerfil.value) return;
    visualizadorAberto.value = true;
    gerenciadorScroll();
  }
  function fecharVisualizadorFoto() {
    visualizadorAberto.value = false;
    gerenciadorScroll();
  }
  function gerenciadorScroll() {
    document.body.style.overflow = expandido.value || visualizadorAberto.value ? 'hidden' : '';
  }
  async function salvarAlteracoes() {
    const querTrocarSenha = senha.value || confirmarSenha.value || senhaAtual.value;
    if (querTrocarSenha) {
      if (!senhaAtual.value) {
        alert('Informe a senha atual para trocar a senha.');
        return;
      }
      if (senha.value !== confirmarSenha.value) {
        alert('As senhas não coincidem!');
        return;
      }
    }
    try {
      await auth.updateUser({
        name: auth.user.name,
        user_type: auth.user.user_type
      });
      if (querTrocarSenha) {
        await auth.changePassword(senhaAtual.value, senha.value);
      }
      senhaAtual.value = '';
      senha.value = '';
      confirmarSenha.value = '';
      expandido.value = false;
      await auth.fetchUser();
    } catch (err) {
      const msg = (
        err.response?.data?.current_password?.[0] ??
        err.response?.data?.new_password?.[0] ??
        'Erro ao atualizar usuário'
      );
      alert(msg);
      console.error(err);
    }
  }
  async function trocarTema() {
    const novoTema = tema.value === 'Claro' ? 'Escuro' : 'Claro';
    tema.value = novoTema;
    await auth.setTheme(novoTema);
  }
  function sairConta() {
    if (confirm('Deseja realmente sair da conta?')) {
      auth.logout();
      router.push('/login');
    }
  }
  return {
    inicio,
    senhaAtual,
    senha,
    confirmarSenha,
    ativo,
    mostrarSenhaAtual,
    mostrarSenha,
    mostrarConfirmarSenha,
    tema,
    expandido,
    visualizadorAberto,
    inputFoto,
    nome,
    email,
    tipoUsuario,
    fotoPerfil,
    acionarInputFoto,
    trocarFoto,
    alternarExpansao,
    abrirVisualizadorFoto,
    fecharVisualizadorFoto,
    salvarAlteracoes,
    trocarTema,
    sairConta
  };
}