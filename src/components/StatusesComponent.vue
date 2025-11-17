<template>
  <div class="status-container">
    <el-tag
      v-for="status in statuses"
      :key="status"
      :type="getStatusType(status)"
      effect="dark"
      size="large"
      class="status-tag"
    >
      {{ status }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
interface Props {
  statuses?: string[]
}

defineProps<Props>()

const getStatusType = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'INACTIVE':
      return 'danger'
    case 'ERREUR':
      return 'danger'
    case 'EN_ATTENTE':
      return 'warning'
    default:
      return 'info'
  }
}
</script>

<style scoped>
.status-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-tag {
  font-weight: bold;
}
</style>
