import { inject } from 'vue'

export function useEditorContext() {
  const editor = inject('pci-editor')
  if (!editor) {
    throw new Error('Componente do editor usado fora de Criar.vue')
  }
  return editor
}