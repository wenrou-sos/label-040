<script setup lang="ts">
import type { StationStatus } from '@/types';

defineProps<{
  status: StationStatus;
}>();

const statusText: Record<StationStatus, string> = {
  available: '空闲',
  occupied: '占用',
  offline: '离线'
};
</script>

<template>
  <span class="status-tag" :class="status">
    {{ statusText[status] }}
  </span>
</template>
