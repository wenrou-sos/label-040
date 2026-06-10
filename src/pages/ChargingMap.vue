<script setup lang="ts">
import { computed } from 'vue';
import type { EChartsOption } from 'echarts';
import BaseChart from '@/components/BaseChart.vue';
import StationCard from '@/components/StationCard.vue';
import { useChargingStore } from '@/stores/charging';
import type { ChargingStation } from '@/types';
import { NPopover } from 'naive-ui';

const store = useChargingStore();

const statusColors: Record<string, string> = {
  available: '#18a058',
  occupied: '#d03050',
  offline: '#5c6268'
};

const mapOption = computed<EChartsOption>(() => {
  const stations = store.chargingStations;
  const seriesData = stations.map(s => ({
    name: s.name,
    value: [s.longitude, s.latitude, s.distance],
    station: s,
    itemStyle: {
      color: statusColors[s.status]
    }
  }));

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const s = params.data.station as ChargingStation;
        return `<div style="font-weight:600;margin-bottom:4px">${s.name}</div>
                <div>地址: ${s.address}</div>
                <div>电价: ¥${s.pricePerKwh.toFixed(2)}/度</div>
                <div>空闲: ${s.availableGuns}/${s.totalGuns}</div>`;
      }
    },
    grid: {
      left: 0,
      right: 0,
      top: 40,
      bottom: 0
    },
    xAxis: {
      type: 'value',
      min: 116.15,
      max: 116.85,
      show: false
    },
    yAxis: {
      type: 'value',
      min: 39.75,
      max: 40.25,
      show: false
    },
    series: [
      {
        type: 'scatter',
        symbolSize: 18,
        data: seriesData,
        emphasis: {
          scale: 1.5,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  };
});

function handleChartClick(params: any) {
  if (params && params.data && params.data.station) {
    store.selectStation(params.data.station);
  }
}
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">充电桩分布地图</h1>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value" style="color: var(--info-color);">{{ store.statsSummary.total }}</div>
        <div class="stat-label">充电桩总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--status-available);">{{ store.statsSummary.available }}</div>
        <div class="stat-label">空闲站点</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--status-occupied);">{{ store.statsSummary.occupied }}</div>
        <div class="stat-label">占用站点</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--status-offline);">{{ store.statsSummary.offline }}</div>
        <div class="stat-label">离线站点</div>
      </div>
    </div>

    <div class="card">
      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 16px; flex-wrap: wrap;">
        <div class="card-title" style="margin-bottom: 0;">实时状态分布</div>
        <div style="display: flex; gap: 16px; font-size: 13px;">
          <span class="status-tag available">空闲</span>
          <span class="status-tag occupied">占用</span>
          <span class="status-tag offline">离线</span>
        </div>
      </div>
      <div style="position: relative; background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #fff8e1 100%); border-radius: 8px; overflow: hidden;">
        <div style="position: absolute; inset: 0; opacity: 0.3; background-image: radial-gradient(circle at 20% 30%, rgba(24,160,88,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(32,128,240,0.1) 0%, transparent 50%); pointer-events: none;"></div>
        <BaseChart
          :option="mapOption"
          height="480px"
          @click="handleChartClick"
        />
      </div>
    </div>

    <div v-if="store.selectedStation" style="margin-top: 20px;">
      <div class="card">
        <div class="card-title">站点详情</div>
        <StationCard :station="store.selectedStation" />
      </div>
    </div>
  </div>
</template>
