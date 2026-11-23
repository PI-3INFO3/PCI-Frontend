import { inject } from 'vue'

export function useAccountContext() {
  const conta = inject('pci-user-account')
  if (!conta) {
    throw new Error('Componente da conta usado fora de UserView.vue')
  }
  return conta
}