import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Boite {
  code: string
  libelle: string
}

interface Parametrage {
  habilitation?: number
  boitesAutorisees?: Boite[]
  allBoites?: Boite[]
}

export const useCodeBoiteStore = defineStore('codeBoite', () => {
  const parametrage = ref<Parametrage>({
    habilitation: 900,
    boitesAutorisees: [
      { code: 'DDDD', libelle: 'Cartes Virtuelles' },
      { code: 'CCCC', libelle: 'Oppositions' },
      { code: 'BBBB', libelle: 'Base B' },
      { code: 'AAAA', libelle: 'Base A' }
    ],
    allBoites: [
      { code: 'DDDD', libelle: 'Cartes Virtuelles' },
      { code: 'CCCC', libelle: 'Oppositions' },
      { code: 'BBBB', libelle: 'Base B' },
      { code: 'AAAA', libelle: 'Base A' }
    ]
  })

  return { parametrage }
})
