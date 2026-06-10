import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/map'
  } as any,
  {
    path: '/map',
    name: 'map',
    component: () => import('@/pages/ChargingMap.vue')
  },
  {
    path: '/list',
    name: 'list',
    component: () => import('@/pages/ChargingList.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/Dashboard.vue')
  },
  {
    path: '/records',
    name: 'records',
    component: () => import('@/pages/PersonalRecords.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
