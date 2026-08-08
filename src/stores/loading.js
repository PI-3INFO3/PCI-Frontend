import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const carregando = ref(true) 
  let timer = null

  function iniciar() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      carregando.value = true
    }, 150)
  }

  function finalizar() {
    clearTimeout(timer)
    carregando.value = false
  }

  return { carregando, iniciar, finalizar }
}) 

