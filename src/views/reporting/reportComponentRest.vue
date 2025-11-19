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
              <el-button type="primary" :icon="Download" @click="exportData" :loading="exportLoading">
                Exporter
              </el-button>
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :show-file-list="false"
                accept=".json"
                :on-change="handleImport"
              >
                <el-button type="success" :icon="Upload" :loading="importLoading">
                  Importer
                </el-button>
              </el-upload>
            </el-space>
          </div>
        </template>
        <el-table
          v-if="boiteReports.length > 0"
          v-loading="loading"
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
    
    <!-- Dialog de suppression -->
    <el-dialog v-model="confirmPopUp" title="Suppression de la réplication" width="30%" center>
      <span id="centerContent">Voulez-vous supprimer cette réplication ?</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmPopUp = false">Annuler</el-button>
          <el-button type="primary" @click="onDeleteSubmit(rplToDel[0])" :loading="deleteLoading">
            Confirmer
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- Dialog de duplication -->
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
          <el-button type="primary" @click="onDuplicateConfirm" :loading="duplicateLoading">
            Confirmer
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Dialog de modification -->
    <el-dialog v-model="updatePopUp" title="Modifier la réplication" width="40%" center>
      <el-form :model="updateForm" label-position="top">
        <el-form-item label="Support conceptuel">
          <el-input v-model="updateForm.supportConceptuel" />
        </el-form-item>
        <el-form-item label="Type de client">
          <el-select v-model="updateForm.clientType" style="width: 100%">
            <el-option label="SOURCE" value="SOURCE" />
            <el-option label="CIBLE" value="CIBLE" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updatePopUp = false">Annuler</el-button>
          <el-button type="primary" @click="onUpdateSubmit" :loading="updateLoading">
            Confirmer
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Dialog de changement de statut -->
    <el-dialog v-model="statusChangePopUp" title="Changement de statut" width="40%" center>
      <el-form :model="statusChangeForm" label-position="top">
        <el-form-item label="Nouveau statut">
          <el-select v-model="statusChangeForm.status" style="width: 100%">
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="INACTIVE" value="INACTIVE" />
            <el-option label="ERROR" value="ERROR" />
            <el-option label="PENDING" value="PENDING" />
            <el-option label="MAINTENANCE" value="MAINTENANCE" />
          </el-select>
        </el-form-item>
        <el-form-item label="Commentaire">
          <el-input 
            v-model="statusChangeForm.comment" 
            type="textarea"
            :rows="3"
            placeholder="Raison du changement de statut"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusChangePopUp = false">Annuler</el-button>
          <el-button type="primary" @click="onStatusChangeSubmit" :loading="statusChangeLoading">
            Confirmer
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { Download, Upload } from '@element-plus/icons-vue'
import type { ReportAbstract, ReportModel } from './ReportModelRest'
import { ReplicationStatusReportModel, ReportBoite, ReportApp, ReportDb, ReportSchema } from './ReportModelRest'
import type { ReplicationAndStatusDto, ReportCriteriaDto } from '@/api/contract/data-contracts'
import StatusesComponent from '@/components/StatusesComponent.vue'
import SearchBar from '@/components/SearchBar.vue'
import reportButton from '@/components/reportButton.vue'
import spaceButton from '@/components/spaceButton.vue'
import { useCodeBoiteStore } from '@/stores/useCodeBoiteStore'
import { useKeyStore } from '@/stores/userKeyStore'
import api from '@/api/replicationRestApi'

const boiteReports = ref([] as ReportModel[])
const infoSearch = ref({} as ReportCriteriaDto)
const border = ref(true)
const loading = ref(false)
const exportLoading = ref(false)
const importLoading = ref(false)
const deleteLoading = ref(false)
const duplicateLoading = ref(false)
const updateLoading = ref(false)
const statusChangeLoading = ref(false)

const confirmPopUp = ref(false)
const duplicatePopUp = ref(false)
const updatePopUp = ref(false)
const statusChangePopUp = ref(false)

const duplicateLabel = ref('')
const selectedReplication = ref({} as ReportModel)
const rplToDuplicate = ref({} as ReportModel)
const rplToDel = ref([] as ReplicationAndStatusDto[])
const idMap = ref(new Map())
const codeBoiteStore = useCodeBoiteStore()
const keyStore = useKeyStore()
const uploadRef = ref()

// Formulaires
const updateForm = ref({
  id: 0,
  supportConceptuel: '',
  clientType: 'SOURCE'
})

const statusChangeForm = ref({
  replicationId: 0,
  status: 'ACTIVE',
  comment: ''
})

function handleExpandChange(row: ReportAbstract) {
    console.log('Expanded row:', row)
  if (!idMap.value.get(row.key)) {
    idMap.value.set(row.key, row.key)
  } else if (idMap.value.get(row.key)) {
    idMap.value.delete(row.key)
  }
}

async function findReportSce() {
  boiteReports.value = []
  loading.value = true

  try {
    const reports = await api.reportApi.findReports(infoSearch.value)
    
    for (const report of reports) {
      boiteReports.value.push(new ReportBoite(report, infoSearch.value, keyStore.key++))
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error)
    ElNotification({
      title: 'Erreur',
      message: error instanceof Error ? error.message : 'Impossible de récupérer les rapports',
      type: 'error',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

async function getReports() {
  await findReportSce()
}

async function searchBarReportSearch() {
  await findReportSce()
}

function load(row: ReportModel, _treeNode: unknown, resolve: (data: ReportModel[]) => void): void {
  console.log('Loading children for row:', row)
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

async function replicationSearch(r: number) {
  try {
    const res = await api.replicationApi.getReplicationAndStatusById(r)
    rplToDel.value = res
  } catch (error) {
    console.error('Erreur lors de la récupération de la réplication:', error)
    ElNotification({
      title: 'Erreur',
      message: error instanceof Error ? error.message : 'Impossible de récupérer la réplication',
      type: 'error',
      position: 'top-right'
    })
  }
}

async function onDeleteSubmit(r: ReplicationAndStatusDto) {
  if (r.replication?.id) {
    deleteLoading.value = true
    try {
      await api.replicationApi.deleteReplication(r.replication.id)
      confirmPopUp.value = false
      await getReports()
      successMsg('Réplication supprimée !')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      ElNotification({
        title: 'Erreur',
        message: error instanceof Error ? error.message : 'Impossible de supprimer la réplication',
        type: 'error',
        position: 'top-right'
      })
    } finally {
      deleteLoading.value = false
    }
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
  if (row instanceof ReplicationStatusReportModel && row.report?.replication) {
    updateForm.value = {
      id: row.report.replication.id || 0,
      supportConceptuel: row.report.replication.supportConceptuel || '',
      clientType: row.report.replication.clientType || 'SOURCE'
    }
    updatePopUp.value = true
  }
}

async function onUpdateSubmit() {
  updateLoading.value = true
  try {
    await api.replicationApi.updateReplication(updateForm.value.id, {
      supportConceptuel: updateForm.value.supportConceptuel,
      clientType: updateForm.value.clientType
    })
    updatePopUp.value = false
    await getReports()
    successMsg('Réplication modifiée avec succès !')
  } catch (error) {
    console.error('Erreur lors de la modification:', error)
    ElNotification({
      title: 'Erreur',
      message: error instanceof Error ? error.message : 'Impossible de modifier la réplication',
      type: 'error',
      position: 'top-right'
    })
  } finally {
    updateLoading.value = false
  }
}

function toDuplicateReplication(row: ReportModel) {
  console.log('🎯 toDuplicateReplication appelé')
  console.log('📋 Row:', row)
  console.log('📋 Row ID:', row.id)
  console.log('📋 Row type:', row.constructor.name)
  console.log('📋 Is ReplicationStatusReportModel?', row instanceof ReplicationStatusReportModel)
  console.log('📋 Is ReportApp?', row instanceof ReportApp)
  
  rplToDuplicate.value = row
  duplicateLabel.value = `${row.label} (copie)`
  duplicatePopUp.value = true
}

async function onDuplicateConfirm() {
  duplicatePopUp.value = false
  duplicateLoading.value = true
  
  try {
    // Vérifier si c'est une réplication avec un ID numérique valide
    const isReplication = rplToDuplicate.value instanceof ReplicationStatusReportModel
    const numericId = parseInt(rplToDuplicate.value.id)
    const hasValidId = !isNaN(numericId) && isReplication
    
    console.log('🔍 Duplication - Type:', rplToDuplicate.value.constructor.name)
    console.log('🔍 Duplication - ID:', rplToDuplicate.value.id)
    console.log('🔍 Duplication - ID numérique:', numericId)
    console.log('🔍 Duplication - ID valide:', hasValidId)
    
    if (hasValidId) {
      // Duplication d'une réplication individuelle via l'API REST
      console.log('📡 Appel API - POST /api/replications/' + numericId + '/duplicate')
      console.log('📤 Payload:', { newLabel: duplicateLabel.value })
      
      const result = await api.replicationApi.duplicateReplication(
        numericId,
        duplicateLabel.value || `${rplToDuplicate.value.label} (copie)`
      )
      
      console.log('✅ Réponse API:', result)
      
      // Recharger les données depuis le serveur
      await getReports()
      
      const message = (result as any).totalDuplicated 
        ? `${(result as any).totalDuplicated} élément(s) dupliqué(s) avec succès`
        : 'Réplication dupliquée avec succès'
      
      ElNotification({
        title: 'Succès',
        message: message,
        type: 'success',
        position: 'top-right'
      })
    } else if (rplToDuplicate.value instanceof ReportApp || rplToDuplicate.value instanceof ReportBoite) {
      // Duplication d'une application ou boîte : charger toutes les réplications enfants depuis le serveur
      console.log('📡 Duplication niveau App/Boite - Chargement des enfants depuis le serveur')
      
      // Construire les critères pour charger toutes les réplications enfants
      const criteria: ReportCriteriaDto = { ...rplToDuplicate.value.criteria }
      
      if (rplToDuplicate.value instanceof ReportApp) {
        criteria.codeBoite = rplToDuplicate.value.report?.replication?.boite
        criteria.app = rplToDuplicate.value.report?.replication?.app
      } else if (rplToDuplicate.value instanceof ReportBoite) {
        criteria.codeBoite = rplToDuplicate.value.report?.replication?.boite
      }
      
      console.log('📤 Critères de recherche:', criteria)
      
      // Charger toutes les réplications qui correspondent aux critères
      const allReplications = await api.reportApi.findReports(criteria)
      console.log('✅ Réplications trouvées:', allReplications.length)
      
      // Construire l'objet de duplication en masse
      const replicationsToDuplicate = allReplications
        .filter(rep => rep.replication?.id)
        .map(rep => {
            console
          const originalLabel = rep.replication!.supportConceptuel || 'Réplication'
          const newLabel = `${originalLabel} (copie)`
          return {
            id: rep.replication!.id!,
            newLabel: newLabel
          }
        })
      
      if (replicationsToDuplicate.length === 0) {
        ElNotification({
          title: 'Info',
          message: 'Aucune réplication à dupliquer',
          type: 'info',
          position: 'top-right'
        })
        return
      }
      
      console.log('📦 Envoi de la duplication en masse:', replicationsToDuplicate)
      
      // Envoyer toutes les duplications en une seule requête
      const result = await api.replicationApi.duplicateReplicationsBatch(replicationsToDuplicate)
      
      console.log('✅ Résultat de la duplication en masse:', result)
      
      // Recharger les données depuis le serveur
      await getReports()
      
      ElNotification({
        title: 'Succès',
        message: `${result.duplicated} réplication(s) dupliquée(s) avec succès`,
        type: 'success',
        position: 'top-right'
      })
    } else {
      console.log('⚠️ Duplication côté client (autres niveaux)')
      // Fallback: duplication côté client pour les autres niveaux
      duplicateClientSide()
    }
  } catch (error) {
    console.error('❌ Erreur lors de la duplication:', error)
    ElNotification({
      title: 'Erreur',
      message: error instanceof Error ? error.message : 'Impossible de dupliquer l\'élément',
      type: 'error',
      position: 'top-right'
    })
  } finally {
    duplicateLoading.value = false
  }
}

// Fallback: duplication côté client pour les éléments non sauvegardés
function duplicateClientSide() {
  try {
    const duplicateReport = (original: ReportModel): ReportModel => {
      let duplicated: ReportModel
      const reportCopy = JSON.parse(JSON.stringify(original.report))

      if (original instanceof ReplicationStatusReportModel) {
        duplicated = new ReplicationStatusReportModel(reportCopy, infoSearch.value, keyStore.key++)
      } else if (original instanceof ReportSchema) {
        duplicated = new ReportSchema(reportCopy, infoSearch.value, keyStore.key++)
      } else if (original instanceof ReportDb) {
        duplicated = new ReportDb(reportCopy, infoSearch.value, keyStore.key++)
      } else if (original instanceof ReportApp) {
        duplicated = new ReportApp(reportCopy, infoSearch.value, keyStore.key++)
      } else if (original instanceof ReportBoite) {
        duplicated = new ReportBoite(reportCopy, infoSearch.value, keyStore.key++)
      } else {
        duplicated = new ReportBoite(reportCopy, infoSearch.value, keyStore.key++)
      }

      duplicated.label = duplicateLabel.value || `${original.label} (copie)`
      duplicated.statuses = original.statuses ? [...original.statuses] : []
      duplicated.count = original.count

      if (original.children && original.children.length > 0) {
        duplicated.children = original.children.map((child: ReportModel) => duplicateReport(child))
        duplicated.hasChildren = true
        duplicated.open = true
      } else {
        duplicated.children = []
      }

      return duplicated
    }

    const duplicatedReport = duplicateReport(rplToDuplicate.value)
    
    const findAndInsert = (items: ReportModel[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].key === rplToDuplicate.value.key) {
          items.splice(i + 1, 0, duplicatedReport)
          return true
        }
        if (items[i].children && items[i].children.length > 0) {
          if (findAndInsert(items[i].children)) {
            return true
          }
        }
      }
      return false
    }
    
    if (!findAndInsert(boiteReports.value)) {
      boiteReports.value.push(duplicatedReport)
    }

    boiteReports.value = [...boiteReports.value]

    ElNotification({
      title: 'Succès',
      message: 'Élément dupliqué avec tous ses enfants (local)',
      type: 'success',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Erreur lors de la duplication côté client:', error)
    ElNotification({
      title: 'Erreur',
      message: 'Impossible de dupliquer l\'élément',
      type: 'error',
      position: 'top-right'
    })
  }
}

function showNewDemandPopup(row: ReportModel) {
  if (row instanceof ReplicationStatusReportModel && row.report?.replication?.id) {
    statusChangeForm.value = {
      replicationId: row.report.replication.id,
      status: 'ACTIVE',
      comment: ''
    }
    statusChangePopUp.value = true
  }
}

async function onStatusChangeSubmit() {
  statusChangeLoading.value = true
  try {
    await api.replicationApi.createStatusChangeRequest(
      statusChangeForm.value.replicationId,
      statusChangeForm.value.status,
      statusChangeForm.value.comment
    )
    statusChangePopUp.value = false
    await getReports()
    successMsg('Demande de changement de statut créée avec succès !')
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    ElNotification({
      title: 'Erreur',
      message: error instanceof Error ? error.message : 'Impossible de créer la demande',
      type: 'error',
      position: 'top-right'
    })
  } finally {
    statusChangeLoading.value = false
  }
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

// Export des données via le serveur
async function exportData() {
  exportLoading.value = true
  try {
    const blob = await api.replicationApi.exportData(infoSearch.value)
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
      message: 'Les données ont été exportées avec succès',
      type: 'success',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    ElNotification({
      title: 'Erreur',
      message: error instanceof Error ? error.message : 'Impossible d\'exporter les données',
      type: 'error',
      position: 'top-right'
    })
  } finally {
    exportLoading.value = false
  }
}

// Import des données via le serveur
async function handleImport(file: any) {
  importLoading.value = true
  try {
    const result = await api.replicationApi.importData(file.raw)
    
    // Recharger les données depuis le serveur
    await getReports()
    
    ElNotification({
      title: 'Succès',
      message: result.message || 'Import réussi',
      type: 'success',
      position: 'top-right',
      duration: 3000
    })
  } catch (error) {
    console.error('Erreur lors de l\'import:', error)
    ElNotification({
      title: 'Erreur',
      message: error instanceof Error ? error.message : 'Impossible d\'importer le fichier',
      type: 'error',
      position: 'top-right'
    })
  } finally {
    importLoading.value = false
  }
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

/* Styles pour le bouton de duplication */
.btn-purple {
  background-color: #9333ea;
  border-color: #9333ea;
  color: white;
}

.btn-purple:hover {
  background-color: #7e22ce;
  border-color: #7e22ce;
}

.btn-purple:active {
  background-color: #6b21a8;
  border-color: #6b21a8;
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
