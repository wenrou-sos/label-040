import type {
  ChargingStation,
  ChargingOrder,
  HourlyStats,
  HeatmapDataPoint,
  StationRank,
  UserStats
} from '@/types';

const operators = ['国家电网', '特来电', '星星充电', '小桔充电', '云快充'];

const addresses = [
  '北京市朝阳区建国路88号SOHO现代城停车场',
  '北京市海淀区中关村大街1号科技园B1层',
  '北京市西城区金融街7号英蓝国际停车场',
  '北京市东城区王府井大街138号新东安市场',
  '北京市丰台区南三环西路16号首地大峡谷',
  '北京市通州区新华西街58号万达广场',
  '北京市昌平区回龙观西大街111号',
  '北京市大兴区亦庄经济技术开发区荣华中路8号',
  '北京市石景山区石景山路22号万达广场',
  '北京市顺义区新顺南大街18号新世界百货',
  '北京市朝阳区三里屯太古里北区',
  '北京市海淀区五道口华清嘉园',
  '北京市西城区西单北大街120号',
  '北京市朝阳区望京SOHO',
  '北京市海淀区学院路15号'
];

function generateGuns(stationId: string, count: number, available: number) {
  const guns = [];
  for (let i = 0; i < count; i++) {
    const isAvailable = i < available;
    const isOffline = !isAvailable && Math.random() < 0.15;
    guns.push({
      id: `${stationId}-gun-${i + 1}`,
      name: `${i + 1}号枪`,
      status: isOffline ? 'offline' : isAvailable ? 'available' : 'charging',
      currentPower: isOffline ? 0 : isAvailable ? 0 : Math.round((30 + Math.random() * 90) * 10) / 10,
      maxPower: Math.random() < 0.5 ? 60 : 120
    });
  }
  return guns;
}

function generateStations(): ChargingStation[] {
  const stations: ChargingStation[] = [];
  for (let i = 0; i < 15; i++) {
    const totalGuns = 4 + Math.floor(Math.random() * 8);
    const availableGuns = Math.floor(Math.random() * (totalGuns + 1));
    const usageRate = Math.round((1 - availableGuns / totalGuns) * 100);
    let status: 'available' | 'occupied' | 'offline';
    if (availableGuns === 0) status = 'occupied';
    else if (availableGuns === totalGuns && Math.random() < 0.1) status = 'offline';
    else status = 'available';

    const longitude = 116.2 + Math.random() * 0.6;
    const latitude = 39.8 + Math.random() * 0.4;

    stations.push({
      id: `station-${i + 1}`,
      name: `${operators[i % operators.length]}${['朝阳', '海淀', '西城', '东城', '丰台', '通州', '昌平', '大兴'][i % 8]}充电站`,
      address: addresses[i],
      operator: operators[i % operators.length],
      longitude,
      latitude,
      distance: Math.round((0.5 + Math.random() * 9.5) * 10) / 10,
      pricePerKwh: Math.round((0.8 + Math.random() * 1.2) * 100) / 100,
      status,
      totalGuns,
      availableGuns: status === 'offline' ? 0 : availableGuns,
      usageRate: status === 'offline' ? 100 : usageRate,
      guns: status === 'offline'
        ? generateGuns(`station-${i + 1}`, totalGuns, 0).map(g => ({ ...g, status: 'offline' as const }))
        : generateGuns(`station-${i + 1}`, totalGuns, availableGuns)
    });
  }
  return stations;
}

function generateOrders(): ChargingOrder[] {
  const orders: ChargingOrder[] = [];
  const stationNames = addresses.slice(0, 10).map((a, i) => ({
    id: `station-${i + 1}`,
    name: `${operators[i % operators.length]}充电站`,
    address: a
  }));

  for (let i = 0; i < 20; i++) {
    const station = stationNames[i % stationNames.length];
    const kwh = Math.round((5 + Math.random() * 55) * 10) / 10;
    const electricityCost = Math.round(kwh * 1.2 * 100) / 100;
    const serviceCost = Math.round(kwh * 0.5 * 100) / 100;
    const totalCost = Math.round((electricityCost + serviceCost) * 100) / 100;
    const duration = Math.floor(20 + Math.random() * 100);

    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    const startTime = date.toISOString().slice(0, 16).replace('T', ' ');
    date.setMinutes(date.getMinutes() + duration);
    const endTime = date.toISOString().slice(0, 16).replace('T', ' ');

    orders.push({
      id: `order-${i + 1}`,
      stationId: station.id,
      stationName: station.name,
      stationAddress: station.address,
      startTime,
      endTime,
      duration,
      kwh,
      totalCost,
      electricityCost,
      serviceCost,
      status: i === 0 ? 'charging' : 'completed'
    });
  }
  return orders.sort((a, b) => b.startTime.localeCompare(a.startTime));
}

function generateHourlyStats(): HourlyStats[] {
  const stats: HourlyStats[] = [];
  for (let h = 0; h < 24; h++) {
    let base = 20;
    if (h >= 7 && h <= 9) base = 120;
    else if (h >= 11 && h <= 13) base = 90;
    else if (h >= 17 && h <= 20) base = 150;
    else if (h >= 22 || h <= 5) base = 10;
    stats.push({
      hour: h,
      kwh: Math.round(base + (Math.random() - 0.5) * 30)
    });
  }
  return stats;
}

function generateHeatmapData(): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      let base = 10;
      if (h >= 7 && h <= 9) base = 80;
      else if (h >= 11 && h <= 13) base = 60;
      else if (h >= 17 && h <= 20) base = 90;
      else if (h >= 22 || h <= 5) base = 5;
      if (d >= 5) base = Math.round(base * 0.7);
      data.push({
        day: d,
        hour: h,
        value: Math.min(100, Math.max(0, Math.round(base + (Math.random() - 0.5) * 20)))
      });
    }
  }
  return data;
}

function generateStationRanks(): StationRank[] {
  return [
    { stationId: 'station-1', stationName: '国家电网朝阳充电站', chargeCount: 328 },
    { stationId: 'station-4', stationName: '小桔充电东城充电站', chargeCount: 285 },
    { stationId: 'station-2', stationName: '特来电海淀充电站', chargeCount: 256 },
    { stationId: 'station-8', stationName: '小桔充电大兴充电站', chargeCount: 221 },
    { stationId: 'station-3', stationName: '星星充电西城充电站', chargeCount: 198 },
    { stationId: 'station-6', stationName: '星星充电通州充电站', chargeCount: 175 },
    { stationId: 'station-5', stationName: '云快充丰台充电站', chargeCount: 152 },
    { stationId: 'station-9', stationName: '云快充石景山充电站', chargeCount: 134 }
  ];
}

function generateUserStats(): UserStats {
  return {
    totalKwh: 1286.5,
    totalCost: 1685.8,
    monthlyKwh: [
      { month: '1月', kwh: 98.5 },
      { month: '2月', kwh: 85.2 },
      { month: '3月', kwh: 112.8 },
      { month: '4月', kwh: 124.5 },
      { month: '5月', kwh: 138.6 },
      { month: '6月', kwh: 156.2 }
    ],
    costBreakdown: [
      { name: '电费', value: 1180.06 },
      { name: '服务费', value: 505.74 }
    ]
  };
}

export const mockStations: ChargingStation[] = generateStations();
export const mockOrders: ChargingOrder[] = generateOrders();
export const mockHourlyStats: HourlyStats[] = generateHourlyStats();
export const mockHeatmapData: HeatmapDataPoint[] = generateHeatmapData();
export const mockStationRanks: StationRank[] = generateStationRanks();
export const mockUserStats: UserStats = generateUserStats();
export const operatorList = operators;
