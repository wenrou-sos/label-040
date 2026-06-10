import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  ChargingStation,
  ChargingOrder,
  HourlyStats,
  HeatmapDataPoint,
  StationRank,
  UserStats,
  Filters,
  SortConfig,
  StationStatus
} from '@/types';
import {
  mockStations,
  mockOrders,
  mockHourlyStats,
  mockHeatmapData,
  mockStationRanks,
  mockUserStats,
  operatorList
} from '@/mock/data';

export const useChargingStore = defineStore('charging', () => {
  const chargingStations = ref<ChargingStation[]>(mockStations);
  const selectedStation = ref<ChargingStation | null>(null);
  const chargingOrders = ref<ChargingOrder[]>(mockOrders);
  const hourlyStats = ref<HourlyStats[]>(mockHourlyStats);
  const heatmapData = ref<HeatmapDataPoint[]>(mockHeatmapData);
  const stationRanks = ref<StationRank[]>(mockStationRanks);
  const userStats = ref<UserStats>(mockUserStats);
  const operators = ref<string[]>(operatorList);

  const filters = ref<Filters>({
    status: null,
    operator: null,
    maxDistance: null
  });

  const sortConfig = ref<SortConfig>({
    field: null,
    order: 'asc'
  });

  const filteredStations = computed(() => {
    let result = [...chargingStations.value];

    if (filters.value.status) {
      result = result.filter(s => s.status === filters.value.status);
    }
    if (filters.value.operator) {
      result = result.filter(s => s.operator === filters.value.operator);
    }
    if (filters.value.maxDistance !== null) {
      result = result.filter(s => s.distance <= filters.value.maxDistance!);
    }

    if (sortConfig.value.field) {
      const field = sortConfig.value.field;
      const order = sortConfig.value.order;
      result.sort((a, b) => {
        const diff = a[field] - b[field];
        return order === 'asc' ? diff : -diff;
      });
    }

    return result;
  });

  const statsSummary = computed(() => {
    const total = chargingStations.value.length;
    const available = chargingStations.value.filter(s => s.status === 'available').length;
    const occupied = chargingStations.value.filter(s => s.status === 'occupied').length;
    const offline = chargingStations.value.filter(s => s.status === 'offline').length;
    return { total, available, occupied, offline };
  });

  function setFilters(newFilters: Partial<Filters>) {
    filters.value = { ...filters.value, ...newFilters };
  }

  function setSort(field: SortConfig['field'], order: SortConfig['order'] = 'asc') {
    sortConfig.value = { field, order };
  }

  function selectStation(station: ChargingStation | null) {
    selectedStation.value = station;
  }

  function updateStationStatus(id: string, status: StationStatus) {
    const station = chargingStations.value.find(s => s.id === id);
    if (station) {
      station.status = status;
    }
  }

  return {
    chargingStations,
    selectedStation,
    chargingOrders,
    hourlyStats,
    heatmapData,
    stationRanks,
    userStats,
    operators,
    filters,
    sortConfig,
    filteredStations,
    statsSummary,
    setFilters,
    setSort,
    selectStation,
    updateStationStatus
  };
});
