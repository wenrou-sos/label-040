<script setup lang="ts">
import type { ChargingStation } from '@/types';
import StatusTag from './StatusTag.vue';
import { MapPin, Zap, DollarSign } from 'lucide-vue-next';

defineProps<{
  station: ChargingStation;
}>();
</script>

<template>
  <div style="min-width: 260px; max-width: 320px;">
    <div style="font-size: 15px; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
      <span>{{ station.name }}</span>
      <StatusTag :status="station.status" />
    </div>
    <div style="font-size: 13px; color: var(--text-color-secondary); margin-bottom: 12px; display: flex; align-items: flex-start; gap: 6px;">
      <MapPin :size="14" style="margin-top: 2px; flex-shrink: 0;" />
      <span>{{ station.address }}</span>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
      <div style="background: #f5f7fa; padding: 8px 10px; border-radius: 6px;">
        <div style="font-size: 11px; color: var(--text-color-secondary); margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
          <DollarSign :size="12" />
          实时电价
        </div>
        <div style="font-size: 16px; font-weight: 700; color: var(--primary-color);">
          ¥{{ station.pricePerKwh.toFixed(2) }}
          <span style="font-size: 11px; font-weight: 400; color: var(--text-color-secondary);">/度</span>
        </div>
      </div>
      <div style="background: #f5f7fa; padding: 8px 10px; border-radius: 6px;">
        <div style="font-size: 11px; color: var(--text-color-secondary); margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
          <Zap :size="12" />
          空闲枪数
        </div>
        <div style="font-size: 16px; font-weight: 700; color: var(--text-color);">
          {{ station.availableGuns }}
          <span style="font-size: 11px; font-weight: 400; color: var(--text-color-secondary);">/{{ station.totalGuns }}</span>
        </div>
      </div>
    </div>
    <div v-if="station.guns.filter(g => g.status === 'charging').length > 0">
      <div style="font-size: 12px; color: var(--text-color-secondary); margin-bottom: 6px;">实时充电功率</div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        <div
          v-for="gun in station.guns.filter(g => g.status === 'charging')"
          :key="gun.id"
          style="background: rgba(24, 160, 88, 0.1); color: var(--primary-color); padding: 3px 8px; border-radius: 4px; font-size: 12px;"
        >
          {{ gun.name }}: {{ gun.currentPower }}kW
        </div>
      </div>
    </div>
    <div style="margin-top: 10px; font-size: 12px; color: var(--text-color-secondary);">
      运营商：{{ station.operator }} · 距离 {{ station.distance }}km
    </div>
  </div>
</template>
