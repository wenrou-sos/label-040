<script setup lang="ts">
import { computed, h } from 'vue';
import type { EChartsOption } from 'echarts';
import type { DataTableColumns } from 'naive-ui';
import { NDataTable, NTag } from 'naive-ui';
import BaseChart from '@/components/BaseChart.vue';
import { useChargingStore } from '@/stores/charging';
import type { ChargingOrder } from '@/types';

const store = useChargingStore();

const columns: DataTableColumns<ChargingOrder> = [
  {
    title: '开始时间',
    key: 'startTime',
    width: 160
  },
  {
    title: '站点',
    key: 'stationName',
    minWidth: 180,
    ellipsis: { tooltip: true }
  },
  {
    title: '充电时长',
    key: 'duration',
    width: 100,
    render: (row) => `${row.duration} 分钟`
  },
  {
    title: '充电量',
    key: 'kwh',
    width: 110,
    render: (row) => `${row.kwh} kWh`
  },
  {
    title: '电费',
    key: 'electricityCost',
    width: 100,
    render: (row) => `¥${row.electricityCost.toFixed(2)}`
  },
  {
    title: '服务费',
    key: 'serviceCost',
    width: 100,
    render: (row) => `¥${row.serviceCost.toFixed(2)}`
  },
  {
    title: '总费用',
    key: 'totalCost',
    width: 110,
    render: (row) => h('span', { style: { color: 'var(--status-occupied)', fontWeight: 600 } }, `¥${row.totalCost.toFixed(2)}`)
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: row.status === 'charging' ? 'success' : 'default', size: 'small', round: true },
        () => (row.status === 'charging' ? '充电中' : '已完成')
      )
  }
];

const monthlyOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c} kWh'
  },
  grid: {
    left: 50,
    right: 20,
    top: 30,
    bottom: 30
  },
  xAxis: {
    type: 'category',
    data: store.userStats.monthlyKwh.map(m => m.month),
    axisLabel: { fontSize: 11 },
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
      type: 'bar',
      data: store.userStats.monthlyKwh.map(m => m.kwh),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#18a058' },
            { offset: 1, color: '#a5d6a7' }
          ]
        },
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: 28,
      label: {
        show: true,
        position: 'top',
        fontSize: 11,
        color: '#5c6268'
      }
    }
  ]
}));

const costOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: ¥{c} ({d}%)'
  },
  legend: {
    bottom: 0,
    itemWidth: 12,
    itemHeight: 12,
    textStyle: { fontSize: 12 }
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 12
      },
      labelLine: {
        show: true,
        length: 8,
        length2: 8
      },
      data: [
        { name: '电费', value: store.userStats.costBreakdown[0].value, itemStyle: { color: '#18a058' } },
        { name: '服务费', value: store.userStats.costBreakdown[1].value, itemStyle: { color: '#2080f0' } }
      ]
    }
  ]
}));
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">我的充电记录</h1>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value" style="color: var(--primary-color);">{{ store.userStats.totalKwh }}</div>
        <div class="stat-label">累计充电量 (kWh)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--status-occupied);">¥{{ store.userStats.totalCost.toFixed(2) }}</div>
        <div class="stat-label">累计充电费用</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--info-color);">{{ store.chargingOrders.length }}</div>
        <div class="stat-label">累计充电次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--warning-color);">
          ¥{{ (store.userStats.totalCost / store.userStats.totalKwh).toFixed(2) }}
        </div>
        <div class="stat-label">平均单价 (度)</div>
      </div>
    </div>

    <div class="charts-grid" style="margin-bottom: 24px;">
      <div class="card">
        <div class="card-title">月度充电量统计</div>
        <BaseChart :option="monthlyOption" height="300px" />
      </div>
      <div class="card">
        <div class="card-title">费用构成分析</div>
        <BaseChart :option="costOption" height="300px" />
      </div>
    </div>

    <div class="card">
      <div class="card-title">历史充电订单</div>
      <NDataTable
        :columns="columns"
        :data="store.chargingOrders"
        :pagination="{ pageSize: 8 }"
        striped
        size="medium"
        :bordered="false"
      />
    </div>
  </div>
</template>
