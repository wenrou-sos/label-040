<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MapPin, List, BarChart3, User, Menu, Zap } from 'lucide-vue-next';
import { useResponsive } from '@/composables/useResponsive';
import { ref } from 'vue';

const route = useRoute();
const router = useRouter();
const { isMobile } = useResponsive();
const collapsed = ref(false);

const menuItems = [
  { path: '/map', label: '充电桩地图', icon: MapPin },
  { path: '/list', label: '充电桩列表', icon: List },
  { path: '/dashboard', label: '统计看板', icon: BarChart3 },
  { path: '/records', label: '我的记录', icon: User }
];

const activePath = computed(() => route.path);

function navigate(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="layout-wrapper">
    <aside class="sidebar" :class="{ collapsed: collapsed && !isMobile }">
      <div class="sidebar-logo">
        <Zap :size="24" color="#18a058" />
        <span v-show="!collapsed || isMobile">充电管家</span>
      </div>
      <nav class="sidebar-menu">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="sidebar-menu-item"
          :class="{ active: activePath === item.path }"
          @click="navigate(item.path)"
        >
          <component :is="item.icon" :size="20" />
          <span v-show="!collapsed">{{ item.label }}</span>
        </div>
      </nav>
    </aside>

    <div class="main-content">
      <header v-if="!isMobile" class="main-header">
        <div class="main-header-left">
          <button
            style="background: none; border: none; cursor: pointer; padding: 4px; display: flex;"
            @click="collapsed = !collapsed"
          >
            <Menu :size="20" />
          </button>
          <span style="font-size: 16px; font-weight: 600;">
            {{ menuItems.find(m => m.path === activePath)?.label }}
          </span>
        </div>
        <div style="font-size: 13px; color: var(--text-color-secondary);">
          {{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) }}
        </div>
      </header>
      <router-view />
    </div>

    <nav v-if="isMobile" class="mobile-tab-bar">
      <div
        v-for="item in menuItems"
        :key="item.path"
        class="mobile-tab-item"
        :class="{ active: activePath === item.path }"
        @click="navigate(item.path)"
      >
        <component :is="item.icon" />
        <span>{{ item.label }}</span>
      </div>
    </nav>
  </div>
</template>
