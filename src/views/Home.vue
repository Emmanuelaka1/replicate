<template>
  <div class="home">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Bienvenue sur Vue 3 + Element Plus</span>
        </div>
      </template>
      <div class="text item">
        <p>Projet configuré avec :</p>
        <ul>
          <li>Vue 3.5.8</li>
          <li>Element Plus 2.8.4</li>
          <li>Pinia 2.1.7</li>
          <li>Vue Router 4.2.5</li>
        </ul>
      </div>
      <el-space>
        <el-button type="primary" @click="handleClick">Tester Element Plus</el-button>
        <el-button type="success" @click="goToReporting">Accéder au Reporting</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleClick = () => {
  ElMessage.success('Element Plus fonctionne parfaitement!')
}

const goToReporting = () => {
  router.push('/reporting')
}
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.box-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
}

.text.item {
  margin-bottom: 20px;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  padding: 5px 0;
}
</style>
