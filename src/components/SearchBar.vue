<template>
  <el-card class="search-bar">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="Code Boîte">
        <el-input v-model="searchForm.codeBoite" placeholder="Code Boîte" clearable />
      </el-form-item>
      <el-form-item label="Application">
        <el-input v-model="searchForm.app" placeholder="Application" clearable />
      </el-form-item>
      <el-form-item label="Base de données">
        <el-input v-model="searchForm.db" placeholder="Base de données" clearable />
      </el-form-item>
      <el-form-item label="Schéma">
        <el-input v-model="searchForm.schema" placeholder="Schéma" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :icon="Search">
          Rechercher
        </el-button>
        <el-button @click="handleRefresh" :icon="Refresh">
          Actualiser
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { ReportCriteriaDto } from '@/api/contract/data-contracts'

const emit = defineEmits<{
  submit: [criteria: ReportCriteriaDto]
  refresh: []
}>()

const searchForm = reactive<ReportCriteriaDto>({
  codeBoite: '',
  app: '',
  db: '',
  schema: '',
  support: '',
  typeSupport: ''
})

const handleSubmit = () => {
  emit('submit', { ...searchForm })
}

const handleRefresh = () => {
  searchForm.codeBoite = ''
  searchForm.app = ''
  searchForm.db = ''
  searchForm.schema = ''
  searchForm.support = ''
  searchForm.typeSupport = ''
  emit('refresh')
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
