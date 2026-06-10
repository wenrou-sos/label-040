<script setup lang="ts">
import { computed } from 'vue';
import type { EChartsOption } from 'echarts';
import BaseChart from '@/components/BaseChart.vue';
import { useChargingStore } from '@/stores/charging';

const store = useChargingStore();

const todayKwh = computed(() =>
  store.hourlyStats.reduce((sum, h) => sum + h.kwh, 0)
);

const hourlyOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}时: {c} kWh'
  },
  grid: {
    left: 50,
    right: 20,
    top: 30,
    bottom: 40
  },
  xAxis: {
    type: 'category',
    data: store.hourlyStats.map(h => `${h.hour}:00`),
    axisLabel: {
      fontSize: 11,
      interval: 1
    },
    axisLine: { lineStyle: { color: '#e5e6eb' } }
  },
  yAxis: {
    type: 'value',
    name: 'kWh',
    nameTextStyle: { fontSize: 11, color: '#5c6268' },
    axisLabel: { fontSize: 11 },
    splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
  },
  series: [
    {
      type: 'line',
      smooth: true,
      data: store.hourlyStats.map(h => h.kwh),
      itemStyle: { color: '#18a058' },
      lineStyle: { width: 3, color: '#18a058' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 160, 88, 0.35)' },
            { offset: 1, color: 'rgba(24, 160, 88, 0.02)' }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 6
    }
  ]
}));

const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const heatmapOption = computed<EChartsOption>(() => ({
  tooltip: {
    position: 'top',
    formatter: (params: any) => {
      const [hour, day, value] = params.data;
      return `${dayNames[day]} ${hourLabels[hour]}<br/>使用率: ${value}%`;
    }
  },
  grid: {
    left: 60,
    right: 30,
    top: 20,
    bottom: 50
  },
  xAxis: {
    type: 'category',
    data: hourLabels,
    axisLabel: { fontSize: 10, interval: 1 },
    splitArea: { show: true }
  },
  yAxis: {
    type: 'category',
    data: dayNames,
    axisLabel: { fontSize: 11 },
    splitArea: { show: true }
  },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: 0,
    itemHeight: 10,
    itemWidth: 120,
    textStyle: { fontSize: 11 },
    inRange: {
      color: ['#e8f5e9', '#a5d6a7', '#66bb6a', '#18a058', '#2e7d32']
    }
  },
  series: [
    {
      type: 'heatmap',
      data: store.heatmapData.map(d => [d.hour, d.day, d.value]),
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 8,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    }
  ]
}));

const rankOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: '{b}: {c} 次'
  },
  grid: {
    left: 140,
    right: 30,
    top: 20,
    bottom: 30
  },
  xAxis: {
    type: 'value',
    axisLabel: { fontSize: 11 },
    splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
  },
  yAxis: {
    type: 'category',
    data: [...store.stationRanks].map(r => r.stationName).reverse(),
    axisLabel: { fontSize: 11 }
  },
  series: [
    {
      type: 'bar',
      data: [...store.stationRanks].map(r => r.chargeCount).reverse(),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#66bb6a' },
            { offset: 1, color: '#18a058' }
          ]
        },
        borderRadius: [0, 4, 4, 0]
      },
      barWidth: 18,
      label: {
        show: true,
        position: 'right',
        fontSize: 11,
        color: '#5c6268'
      }
    }
  ]
}));
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">统计分析看板</h1>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value" style="color: var(--primary-color);">{{ todayKwh }}</div>
        <div class="stat-label">今日总充电量 (kWh)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--info-color);">{{ store.statsSummary.total }}</div>
        <div class="stat-label">运营站点数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--warning-color);">
          {{ Math.round(store.chargingStations.reduce((s, st) => s + st.usageRate, 0) / store.chargingStations.length) }}%
        </div>
        <div class="stat-label">平均使用率</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--status-occupied);">{{ store.chargingOrders.length }}</div>
        <div class="stat-label">累计订单数</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card chart-full">
        <div class="card-title">今日充电量趋势</div>
        <BaseChart :option="hourlyOption" height="300px" />
      </div>

      <div class="card chart-full">
        <div class="card-title">各时段使用率热力图</div>
        <BaseChart :option="heatmapOption" height="360px" />
      </div>

      <div class="card chart-full">
        <div class="card-title">站点充电次数排行榜</div>
        <BaseChart :option="rankOption" height="380px" />
      </div>
    </div>
  </div>
</template>
