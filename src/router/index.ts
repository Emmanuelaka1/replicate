import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/reporting',
    name: 'Reporting',
    component: () => import('@/views/reporting/reportComponent.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
