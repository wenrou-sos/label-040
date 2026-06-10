<script setup lang="ts">
import { computed, h, ref } from 'vue';
import {
  NDataTable,
  NSelect,
  NInputNumber,
  NButton,
  NPopconfirm,
  NSpace,
  type DataTableColumns,
  type SelectOption
} from 'naive-ui';
import { RotateCcw, Filter } from 'lucide-vue-next';
import { useChargingStore } from '@/stores/charging';
import type { ChargingStation, StationStatus } from '@/types';
import StatusTag from '@/components/StatusTag.vue';

const store = useChargingStore();

const statusOptions: SelectOption[] = [
  { label: '全部状态', value: null },
  { label: '空闲', value: 'available' },
  { label: '占用', value: 'occupied' },
  { label: '离线', value: 'offline' }
];

const operatorOptions = computed<SelectOption[]>(() => [
  { label: '全部运营商', value: null },
  ...store.operators.map(op => ({ label: op, value: op }))
]);

const sortField = ref<'distance' | 'pricePerKwh' | 'usageRate' | null>(null);
const sortOrder = ref<'ascend' | 'descend' | false>(false);

function buildColumns(): DataTableColumns<ChargingStation> {
  return [
    {
      title: '站点名称',
      key: 'name',
      minWidth: 180
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (row) => h(StatusTag, { status: row.status })
    },
    {
      title: '运营商',
      key: 'operator',
      width: 120
    },
    {
      title: '距离',
      key: 'distance',
      width: 100,
      sorter: (a: ChargingStation, b: ChargingStation) => a.distance - b.distance,
      sortOrder: sortField.value === 'distance' ? sortOrder.value : false,
      render: (row) => `${row.distance} km`
    },
    {
      title: '电价',
      key: 'pricePerKwh',
      width: 110,
      sorter: (a: ChargingStation, b: ChargingStation) => a.pricePerKwh - b.pricePerKwh,
      sortOrder: sortField.value === 'pricePerKwh' ? sortOrder.value : false,
      render: (row) => `¥${row.pricePerKwh.toFixed(2)}/度`
    },
    {
      title: '空闲枪数',
      key: 'availableGuns',
      width: 110,
      render: (row) => `${row.availableGuns} / ${row.totalGuns}`
    },
    {
      title: '使用率',
      key: 'usageRate',
      width: 110,
      sorter: (a: ChargingStation, b: ChargingStation) => a.usageRate - b.usageRate,
      sortOrder: sortField.value === 'usageRate' ? sortOrder.value : false,
      render: (row) => `${row.usageRate}%`
    },
    {
      title: '地址',
      key: 'address',
      minWidth: 280,
      ellipsis: { tooltip: true }
    }
  ];
}

const columns = ref(buildColumns());

function handleSorterChange(options: any) {
  if (options && options.columnKey) {
    const field = options.columnKey as 'distance' | 'pricePerKwh' | 'usageRate';
    const order = options.order as 'ascend' | 'descend' | false;
    sortField.value = field;
    sortOrder.value = order;
    if (order !== false) {
      store.setSort(field, order === 'ascend' ? 'asc' : 'desc');
    } else {
      store.setSort(null, 'asc');
    }
    columns.value = buildColumns();
  }
}

function onStatusChange(value: StationStatus | null) {
  store.setFilters({ status: value });
}

function onOperatorChange(value: string | null) {
  store.setFilters({ operator: value });
}

function onDistanceChange(value: number | null) {
  store.setFilters({ maxDistance: value });
}

function resetFilters() {
  store.setFilters({ status: null, operator: null, maxDistance: null });
  store.setSort(null, 'asc');
  sortField.value = null;
  sortOrder.value = false;
  columns.value = buildColumns();
}
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">充电桩列表</h1>

    <div class="card">
      <div class="filter-bar">
        <div style="display: flex; align-items: center; gap: 8px;">
          <Filter :size="16" />
          <span style="font-size: 14px; font-weight: 500;">筛选条件:</span>
        </div>
        <NSelect
          :options="statusOptions"
          :value="store.filters.status"
          @update:value="onStatusChange"
          style="width: 140px;"
          size="small"
          clearable
        />
        <NSelect
          :options="operatorOptions"
          :value="store.filters.operator"
          @update:value="onOperatorChange"
          style="width: 160px;"
          size="small"
          clearable
        />
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 13px; color: var(--text-color-secondary); white-space: nowrap;">最大距离:</span>
          <NInputNumber
            :value="store.filters.maxDistance"
            @update:value="onDistanceChange"
            :min="0"
            :max="20"
            size="small"
            style="width: 100px;"
            placeholder="km"
            clearable
          />
        </div>
        <div style="flex: 1;"></div>
        <NPopconfirm>
          <template #trigger>
            <NButton size="small" quaternary>
              <template #icon>
                <RotateCcw :size="14" />
              </template>
              重置
            </NButton>
          </template>
          确定重置所有筛选和排序条件？
          <template #action>
            <NSpace>
              <NButton size="small" @click="resetFilters">确定</NButton>
            </NSpace>
          </template>
        </NPopconfirm>
      </div>

      <NDataTable
        :columns="columns"
        :data="store.filteredStations"
        :pagination="{ pageSize: 8 }"
        striped
        size="medium"
        :bordered="false"
        @update:sorter="handleSorterChange"
        style="margin-top: 8px;"
      />
    </div>
  </div>
</template>
