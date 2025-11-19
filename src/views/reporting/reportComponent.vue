<template>
  <div class="reporting-page">
    <el-col :span="24">
      <div>
        <SearchBar class="searchBar margin" @submit="onSubmit" @refresh="onReset" />
      </div>
    </el-col>
    <el-col :span="24">
      <el-card class="centerText">
        <template #header>
          <div class="card-header-content">
            <el-text tag="b" size="large" style="font-size: 2em">
              Suivi Des Réplications
            </el-text>
            <el-space>
              <el-button type="primary" :icon="Download" @click="exportData">
                Exporter
              </el-button>
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :show-file-list="false"
                accept=".json"
                :on-change="handleImport"
              >
                <el-button type="success" :icon="Upload">
                  Importer
                </el-button>
              </el-upload>
            </el-space>
          </div>
        </template>
        <el-table
          v-if="boiteReports.length > 0"
          :data="boiteReports"
          row-key="key"
          lazy
          :load="load"
          :border="border"
          highlight-current-row
          @expand-change="handleExpandChange"
        >
          <el-table-column label="Libellés" sortable>
            <template #default="scope">
              <reportButton
                v-if="hasDeleteReplicationAndStatus(scope.row)"
                title-btn="Supprimer la réplication"
                type-btn="danger"
                icon-btn="Delete"
                @click="deleteConfirm(scope.row)"
              />
              <spaceButton v-else />
              <reportButton
                v-if="hasManageReplication(scope.row)"
                title-btn="Modifier la réplication"
                type-btn="warning"
                icon-btn="Edit"
                @click="toUpdateReplication(scope.row)"
              />
              <spaceButton v-else />
              <reportButton
                v-if="hasManageReplication(scope.row)"
                title-btn="Créer une demande de changement de statut"
                type-btn="success"
                icon-btn="Edit"
                @click="showNewDemandPopup(scope.row)"
              />
              <spaceButton v-else />
              <reportButton
                v-if="hasAddReplicationHabilitation(scope.row) && isNotSinkReplication(scope.row)"
                title-btn="Ajouter une réplication"
                type-btn="primary"
                icon-btn="Plus"
                @click="toAddNewRplPage(scope.row)"
              />
              <spaceButton v-else />
              <reportButton
                v-if="scope.row instanceof ReplicationStatusReportModel || scope.row instanceof ReportApp"
                title-btn="Dupliquer"
                type-btn="primary"
                icon-btn="DocumentCopy"
                custom-class="btn-purple"
                @click="toDuplicateReplication(scope.row)"
              />
              <spaceButton v-else />
              <reportButton
                v-if="hasHistoriqueStatusRightOfView(scope.row)"
                title-btn="Historique du statut"
                type-btn="info"
                icon-btn="Histogram"
                @click="toPageHistoriqueStatut(scope.row)"
              />
              <spaceButton v-else />
              <span v-if="scope.row.clientType === 'CIBLE'">
                <span :class="scope.row.iconeReplType" class="label tree div reportingIconSpace" :title="scope.row.iconeReplTitle"></span>
                <span :class="scope.row.iconeurl" class="label tree div" :title="scope.row.titleIcone"></span>
              </span>
              <span v-else>
                <span :class="scope.row.iconeurl" class="label tree div" :title="scope.row.titleIcone"></span>
                <span :class="scope.row.iconeReplType" class="label tree div reportingIconSpace" :title="scope.row.iconeReplTitle"></span>
              </span>
              <span class="label tree div">{{ scope.row.label }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Statuts" sortable>
            <template #default="scope">
              <StatusesComponent :statuses="scope.row.statuses"></StatusesComponent>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="Aucune donnée" />
      </el-card>
    </el-col>
    <el-dialog v-model="confirmPopUp" title="Suppression de la réplication" width="30%" center>
      <span id="centerContent">Voulez-vous supprimer cette réplication ?</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmPopUp = false">Annuler</el-button>
          <el-button type="primary" @click="onDeleteSubmit(rplToDel[0])">Confirmer</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="duplicatePopUp" title="Duplication" width="30%" center>
      <span id="centerContent">Voulez-vous dupliquer cet élément et tous ses enfants ?</span>
      <el-form label-position="top" style="margin-top: 20px">
        <el-form-item label="Libellé de la copie">
          <el-input 
            v-model="duplicateLabel" 
            placeholder="Entrez le libellé pour la copie"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="duplicatePopUp = false">Annuler</el-button>
          <el-button type="primary" @click="onDuplicateConfirm">Confirmer</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElNotification, ElMessageBox } from 'element-plus'
import { Download, Upload } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import type { ReportAbstract, ReportModel } from './ReportModel'
import { ReplicationStatusReportModel, ReportBoite, ReportApp, ReportDb, ReportSchema } from './ReportModel'
import type { ReplicationAndStatusDto, ReportCriteriaDto } from '@/api/contract/data-contracts'
import StatusesComponent from '@/components/StatusesComponent.vue'
import SearchBar from '@/components/SearchBar.vue'
import reportButton from '@/components/reportButton.vue'
import spaceButton from '@/components/spaceButton.vue'
import { useCodeBoiteStore } from '@/stores/useCodeBoiteStore'
import { useKeyStore } from '@/stores/userKeyStore'
import api from '@/api/reportTestApi'

const boiteReports = ref([] as ReportModel[])
const infoSearch = ref({} as ReportCriteriaDto)
const border = ref(true)
const confirmPopUp = ref(false)
const duplicatePopUp = ref(false)
const duplicateLabel = ref('')
const selectedReplication = ref({} as ReportModel)
const rplToDuplicate = ref({} as ReportModel)
const rplToDel = ref([] as ReplicationAndStatusDto[])
const idMap = ref(new Map())
const codeBoiteStore = useCodeBoiteStore()
const keyStore = useKeyStore()
const uploadRef = ref()

function handleExpandChange(row: ReportAbstract) {
  if (!idMap.value.get(row.key)) {
    idMap.value.set(row.key, row.key)
  } else if (idMap.value.get(row.key)) {
    idMap.value.delete(row.key)
  }
}

async function findReportSce() {
  boiteReports.value = []

  await api.reportApi
    .findReports(infoSearch.value)
    .then((d: Response) => d.json())
    .then((reports: any[]) => {
      for (const report of reports) {
        boiteReports.value.push(new ReportBoite(report, infoSearch.value, keyStore.key++))
      }
    })
    .catch((error: any) => {
      console.error('Erreur lors de la récupération des rapports:', error)
      ElNotification({
        title: 'Erreur',
        message: 'Impossible de récupérer les rapports',
        type: 'error',
        position: 'top-right'
      })
    })
}

async function getReports() {
  await findReportSce()
}

async function searchBarReportSearch() {
  await findReportSce()
}

function load(row: ReportModel, _treeNode: unknown, resolve: (data: ReportModel[]) => void): void {
  row.load(resolve)
}

function onSubmit(searchCriteria: ReportCriteriaDto) {
  infoSearch.value = searchCriteria
  searchBarReportSearch()
}

async function onReset() {
  infoSearch.value = {}
  getReports()
}

function toPageHistoriqueStatut(row: ReportModel) {
  if (row instanceof ReplicationStatusReportModel) {
    console.log('Navigation vers historique statut:', row?.id)
    ElNotification({
      title: 'Info',
      message: `Historique du statut pour la réplication ${row?.id}`,
      type: 'info',
      position: 'top-right'
    })
  }
}

function deleteConfirm(row: ReportModel) {
  confirmPopUp.value = true
  selectedReplication.value = row
  replicationSearch(+selectedReplication.value.id)
}

function replicationSearch(r: number) {
  api.replicationApi
    .getReplicationAndStatusById(r)
    .then((d: Response) => d.json())
    .then((res: any[]) => {
      rplToDel.value = res
    })
    .catch((error: any) => {
      console.error('Erreur lors de la récupération de la réplication:', error)
    })
}

async function onDeleteSubmit(r: ReplicationAndStatusDto) {
  if (r.replication?.id) {
    await api.replicationApi
      .deleteReplication(r.replication.id)
      .then((d: Response) => d.json())
      .then(() => {
        confirmPopUp.value = false
        getReports()
        successMsg('Réplication supprimée !')
      })
      .catch((error: any) => {
        console.error('Erreur lors de la suppression:', error)
        ElNotification({
          title: 'Erreur',
          message: 'Impossible de supprimer la réplication',
          type: 'error',
          position: 'top-right'
        })
      })
  }
}

function successMsg(messg: string | undefined) {
  ElNotification({
    title: 'Succès',
    message: messg,
    type: 'success',
    position: 'top-right'
  })
}

function toAddNewRplPage(row: ReportModel): void {
  console.log('Ajout d\'une nouvelle réplication pour:', row.report?.replication)
  ElNotification({
    title: 'Info',
    message: 'Fonction d\'ajout de réplication',
    type: 'info',
    position: 'top-right'
  })
}

function toUpdateReplication(row: ReportModel) {
  console.log('Modification de la réplication:', row.id)
  ElNotification({
    title: 'Info',
    message: `Modification de la réplication ${row.id}`,
    type: 'info',
    position: 'top-right'
  })
}

function toDuplicateReplication(row: ReportModel) {
  rplToDuplicate.value = row
  duplicateLabel.value = `${row.label} (copie)`
  duplicatePopUp.value = true
}

function onDuplicateConfirm() {
  duplicatePopUp.value = false
  
  try {
    // Fonction récursive pour dupliquer un rapport avec tous ses enfants
    const duplicateReport = (original: ReportModel): ReportModel => {
      let duplicated: ReportModel

      // Créer une copie profonde de l'objet report pour éviter les références partagées
      const reportCopy = JSON.parse(JSON.stringify(original.report))

      // Créer une copie selon le type de rapport
      if (original instanceof ReplicationStatusReportModel) {
        duplicated = new ReplicationStatusReportModel(
          reportCopy,
          infoSearch.value,
          keyStore.key++
        )
      } else if (original instanceof ReportSchema) {
        duplicated = new ReportSchema(
          reportCopy,
          infoSearch.value,
          keyStore.key++
        )
      } else if (original instanceof ReportDb) {
        duplicated = new ReportDb(
          reportCopy,
          infoSearch.value,
          keyStore.key++
        )
      } else if (original instanceof ReportApp) {
        duplicated = new ReportApp(
          reportCopy,
          infoSearch.value,
          keyStore.key++
        )
      } else if (original instanceof ReportBoite) {
        duplicated = new ReportBoite(
          reportCopy,
          infoSearch.value,
          keyStore.key++
        )
      } else {
        // Fallback pour tout autre type
        duplicated = new ReportBoite(
          reportCopy,
          infoSearch.value,
          keyStore.key++
        )
      }

      // Ajouter suffixe (copie) au label
      duplicated.label = `${original.label} (copie)`

      // Copier les autres propriétés importantes sans références partagées
      duplicated.statuses = original.statuses ? [...original.statuses] : []
      duplicated.count = original.count

      // Si l'original a des enfants, les dupliquer récursivement
      if (original.children && original.children.length > 0) {
        duplicated.children = original.children.map((child: ReportModel) => duplicateReport(child))
        duplicated.hasChildren = true
        duplicated.open = true
      } else {
        duplicated.children = []
      }

      return duplicated
    }

    // Dupliquer l'élément et l'ajouter à la liste
    const duplicatedReport = duplicateReport(rplToDuplicate.value)
    
    // Appliquer le libellé personnalisé si fourni
    if (duplicateLabel.value && duplicateLabel.value.trim() !== '') {
      duplicatedReport.label = duplicateLabel.value.trim()
    }
    
    // Fonction récursive pour trouver le parent et insérer la copie au bon endroit
    const findAndInsert = (items: ReportModel[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].key === rplToDuplicate.value.key) {
          // Trouvé l'élément original, insérer la copie juste après
          items.splice(i + 1, 0, duplicatedReport)
          return true
        }
        
        // Chercher dans les enfants
        if (items[i].children && items[i].children.length > 0) {
          if (findAndInsert(items[i].children)) {
            return true
          }
        }
      }
      return false
    }
    
    // Chercher et insérer dans toute la hiérarchie
    if (!findAndInsert(boiteReports.value)) {
      // Si pas trouvé, l'ajouter à la fin (cas improbable)
      boiteReports.value.push(duplicatedReport)
    }

    // Forcer le rafraîchissement de la table en créant une nouvelle référence
    boiteReports.value = [...boiteReports.value]

    ElNotification({
      title: 'Succès',
      message: 'Élément dupliqué avec tous ses enfants',
      type: 'success',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Erreur lors de la duplication:', error)
    ElNotification({
      title: 'Erreur',
      message: 'Impossible de dupliquer l\'élément',
      type: 'error',
      position: 'top-right'
    })
  }
}

function showNewDemandPopup(row: ReportModel) {
  console.log('Création d\'une demande pour:', row.id)
  ElNotification({
    title: 'Info',
    message: 'Création d\'une demande de changement de statut',
    type: 'info',
    position: 'top-right'
  })
}

function hasAddReplicationHabilitation(row: ReportModel): boolean {
  let res = false
  let codeBoite = ['']
  if (row.id) {
    codeBoite = row.id.split('/')
  }
  const authorizedCb = codeBoiteStore.parametrage.boitesAutorisees
  const habilitation = codeBoiteStore.parametrage.habilitation ?? 100
  if (habilitation === 900) {
    res = true
  } else if (habilitation >= 200 && authorizedCb != undefined) {
    authorizedCb.forEach((element: any) => {
      if (element.code === codeBoite[0]) {
        res = true
      }
    })
    if (!row.hasChildren && row instanceof ReplicationStatusReportModel && row.clientType === 'SOURCE') {
      authorizedCb.forEach((element: any) => {
        if (element.code === row.codeBoite) {
          res = true
        }
      })
    }
  }
  return res
}

function hasHistoriqueStatusRightOfView(row: ReportModel): boolean {
  let res = false
  const habilitation = codeBoiteStore.parametrage.habilitation || 100
  if (row instanceof ReplicationStatusReportModel && habilitation >= 100) {
    res = true
  }
  return res
}

function hasManageReplication(row: ReportModel): boolean {
  let res = false
  if (row instanceof ReplicationStatusReportModel) {
    const habilitation = codeBoiteStore.parametrage.habilitation || 100
    if (habilitation === 900) {
      res = true
    } else if (habilitation >= 200) {
      const authorizedCb = codeBoiteStore.parametrage.boitesAutorisees
      if (authorizedCb != undefined && row.codeBoite != undefined) {
        authorizedCb.forEach((element: any) => {
          if (element.code === row.codeBoite) res = true
        })
      }
    }
  }
  return res
}

function hasDeleteReplicationAndStatus(row: ReportModel): boolean {
  let res = false
  if (row instanceof ReplicationStatusReportModel && row.statuses?.includes('INACTIVE')) {
    const habilitation = codeBoiteStore.parametrage.habilitation || 100
    if (habilitation === 900) {
      res = true
    } else if (habilitation >= 200) {
      const authorizedCb = codeBoiteStore.parametrage.boitesAutorisees
      if (authorizedCb != undefined && row.codeBoite != undefined) {
        authorizedCb.forEach((element: any) => {
          if (element.code === row.codeBoite) res = true
        })
      }
    }
  }
  return res
}

function isNotSinkReplication(row: ReportModel) {
  if (row.report?.replication?.clientType == 'CIBLE') {
    return false
  }
  return true
}

// Fonction d'export des données
function exportData() {
  try {
    // Fonction récursive pour exporter un rapport avec tous ses enfants
    const serializeReport = (report: ReportModel): any => {
      const serialized: any = {
        id: report.id,
        label: report.label,
        statuses: report.statuses,
        count: report.count,
        replication: report.report?.replication,
        clientTypes: report.report?.clientTypes,
        hasChildren: report.hasChildren
      }

      // Si le rapport a des enfants, les sérialiser récursivement
      if (report.children && report.children.length > 0) {
        serialized.children = report.children.map((child: ReportModel) => serializeReport(child))
      }

      return serialized
    }

    // Préparer les données à exporter avec hiérarchie complète
    const exportData = {
      timestamp: new Date().toISOString(),
      criteria: infoSearch.value,
      reports: boiteReports.value.map((report: ReportModel) => serializeReport(report))
    }

    // Créer le blob et télécharger
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `replications-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElNotification({
      title: 'Succès',
      message: 'Les données ont été exportées avec succès (avec hiérarchie)',
      type: 'success',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    ElNotification({
      title: 'Erreur',
      message: 'Impossible d\'exporter les données',
      type: 'error',
      position: 'top-right'
    })
  }
}

// Fonction d'import des données
function handleImport(file: any) {
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const importedData = JSON.parse(content)

      if (!importedData.reports || !Array.isArray(importedData.reports)) {
        throw new Error('Format de fichier invalide')
      }

      // Restaurer les critères de recherche si disponibles
      if (importedData.criteria) {
        infoSearch.value = importedData.criteria
      }

      // Fonction récursive pour reconstruire les rapports avec leurs enfants
      const reconstructReport = (reportData: any, level: string = 'CODEBOITE'): ReportModel | null => {
        if (!reportData.replication) {
          return null
        }

        // Créer un NodeReportDto complet
        const nodeReport = {
          replication: reportData.replication,
          statuses: reportData.statuses || [],
          clientTypes: reportData.clientTypes,
          clientType: reportData.replication?.clientType,
          count: reportData.count
        }

        // Créer le rapport avec la bonne classe selon le niveau
        let report: ReportModel

        if (reportData.hasChildren === false || level === 'REPLICATION') {
          // C'est une réplication (feuille de l'arbre)
          report = new ReplicationStatusReportModel(nodeReport, infoSearch.value, keyStore.key++)
        } else {
          // Créer le bon type de rapport selon le niveau
          switch (level) {
            case 'CODEBOITE':
              report = new ReportBoite(nodeReport, infoSearch.value, keyStore.key++)
              break
            case 'APP':
              report = new ReportApp(nodeReport, infoSearch.value, keyStore.key++)
              break
            case 'DB':
              report = new ReportDb(nodeReport, infoSearch.value, keyStore.key++)
              break
            case 'SCHEMA':
              report = new ReportSchema(nodeReport, infoSearch.value, keyStore.key++)
              break
            default:
              report = new ReportBoite(nodeReport, infoSearch.value, keyStore.key++)
          }
        }

        // Si le rapport a des enfants, les reconstruire récursivement avec le niveau suivant
        if (reportData.children && Array.isArray(reportData.children) && reportData.children.length > 0) {
          report.children = []
          
          // Déterminer le niveau des enfants
          const nextLevel = 
            level === 'CODEBOITE' ? 'APP' :
            level === 'APP' ? 'DB' :
            level === 'DB' ? 'SCHEMA' :
            level === 'SCHEMA' ? 'REPLICATION' : 'REPLICATION'

          reportData.children.forEach((childData: any) => {
            const childReport = reconstructReport(childData, nextLevel)
            if (childReport) {
              report.children.push(childReport)
            }
          })
          report.hasChildren = true
          report.open = true
        }

        return report
      }

      // Reconstruire les rapports
      boiteReports.value = []
      importedData.reports.forEach((reportData: any) => {
        const report = reconstructReport(reportData)
        if (report) {
          boiteReports.value.push(report)
        }
      })

      ElNotification({
        title: 'Succès',
        message: `${importedData.reports.length} réplication(s) importée(s) avec leurs hiérarchies`,
        type: 'success',
        position: 'top-right',
        duration: 3000
      })
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      ElNotification({
        title: 'Erreur',
        message: 'Impossible d\'importer le fichier. Vérifiez le format.',
        type: 'error',
        position: 'top-right'
      })
    }
  }

  reader.onerror = () => {
    ElNotification({
      title: 'Erreur',
      message: 'Erreur de lecture du fichier',
      type: 'error',
      position: 'top-right'
    })
  }

  reader.readAsText(file.raw)
}

onMounted(() => {
  getReports()
})
</script>
<style scoped>
.reporting-page {
  padding: 20px;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.icones {
  width: 1.5em !important;
  height: 1.5em !important;
  margin-right: 8px !important;
  float: left !important;
  margin-top: 12px !important;
}

.searchBar_margin {
    margin-top: -1.5%;
}

.el-row {
    margin-bottom: 20px;
}

.el-row last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}

#centerContent {
  display: block;
  text-align: center;
  margin: 20px 0;
}

.centerText {
  text-align: center;
}

.reportingIconSpace {
  margin-right: 8px;
}

.label.tree.div {
  display: inline-block;
  margin-right: 5px;
}

/* Icônes pour les différents types de ressources */
.icon-code-boite {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
}

.icon-code-boite::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  top: 4px;
  left: 4px;
  border-radius: 2px;
}

.icon-application {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
}

.icon-application::before {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  top: 6px;
  left: 6px;
  border-radius: 1px;
}

.icon-basededonnees {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: #5dade2;
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
}

.icon-basededonnees::before {
  content: 'DB';
  position: absolute;
  font-size: 8px;
  font-weight: bold;
  color: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.icon-shema {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: #85c1e9;
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
}

.icon-shema::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 2px;
  background: white;
  top: 9px;
  left: 4px;
}

.icon-replication {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 50%;
  margin-right: 8px;
  position: relative;
}

.icon-replication::before {
  content: '⟳';
  position: absolute;
  font-size: 14px;
  color: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.icon-repl-source {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: #27ae60;
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
}

.icon-repl-source::before {
  content: '→';
  position: absolute;
  font-size: 14px;
  font-weight: bold;
  color: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.icon-repl-cible {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: #e67e22;
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
}

.icon-repl-cible::before {
  content: '←';
  position: absolute;
  font-size: 14px;
  font-weight: bold;
  color: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>