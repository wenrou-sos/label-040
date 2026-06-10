export type StationStatus = 'available' | 'occupied' | 'offline';

export type GunStatus = 'available' | 'charging' | 'offline';

export interface ChargingGun {
  id: string;
  name: string;
  status: GunStatus;
  currentPower: number;
  maxPower: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  operator: string;
  longitude: number;
  latitude: number;
  distance: number;
  pricePerKwh: number;
  status: StationStatus;
  totalGuns: number;
  availableGuns: number;
  usageRate: number;
  guns: ChargingGun[];
}

export interface ChargingOrder {
  id: string;
  stationId: string;
  stationName: string;
  stationAddress: string;
  startTime: string;
  endTime: string;
  duration: number;
  kwh: number;
  totalCost: number;
  electricityCost: number;
  serviceCost: number;
  status: 'completed' | 'charging';
}

export interface HourlyStats {
  hour: number;
  kwh: number;
}

export interface HeatmapDataPoint {
  day: number;
  hour: number;
  value: number;
}

export interface StationRank {
  stationId: string;
  stationName: string;
  chargeCount: number;
}

export interface UserStats {
  totalKwh: number;
  totalCost: number;
  monthlyKwh: { month: string; kwh: number }[];
  costBreakdown: { name: string; value: number }[];
}

export interface Filters {
  status: StationStatus | null;
  operator: string | null;
  maxDistance: number | null;
}

export interface SortConfig {
  field: 'distance' | 'pricePerKwh' | 'usageRate' | null;
  order: 'asc' | 'desc';
}
