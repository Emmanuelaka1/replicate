<template>
  <el-button
    :type="typeBtn"
    :icon="getIcon()"
    :class="customClass"
    size="small"
    :title="titleBtn"
    circle
  />
</template>

<script setup lang="ts">
import { Delete, Edit, Plus, Histogram, DocumentCopy } from '@element-plus/icons-vue'
import { computed } from 'vue'

interface Props {
  titleBtn: string
  typeBtn?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  iconBtn?: string
  customClass?: string
}

const props = defineProps<Props>()

const getIcon = () => {
  switch (props.iconBtn) {
    case 'Delete':
      return Delete
    case 'Edit':
      return Edit
    case 'Plus':
      return Plus
    case 'Histogram':
      return Histogram
    case 'DocumentCopy':
      return DocumentCopy
    default:
      return undefined
  }
}
</script>

<style scoped>
.el-button {
  margin-right: 2px;
}

.btn-purple {
  background-color: #9333ea !important;
  border-color: #9333ea !important;
  color: white !important;
}

.btn-purple:hover {
  background-color: #7e22ce !important;
  border-color: #7e22ce !important;
}

.btn-purple:active,
.btn-purple:focus {
  background-color: #6b21a8 !important;
  border-color: #6b21a8 !important;
}
</style>
