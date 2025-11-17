import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useKeyStore = defineStore('key', () => {
  const key = ref(1)

  return { key }
})
