// 实时客流模拟数据引擎
// Real-time crowd simulation data engine

// 景点基础数据
const spots = [
  { id: 'yongdingmen',  name: '永定门',   lat: 39.875, lng: 116.394, baseFlow: 800,  range: 600,  color: '#34D399' },
  { id: 'tiantan',      name: '天坛',     lat: 39.882, lng: 116.406, baseFlow: 1500, range: 1000, color: '#FBBF24' },
  { id: 'gugong',       name: '故宫',     lat: 39.916, lng: 116.397, baseFlow: 3200, range: 2000, color: '#EF4444' },
  { id: 'jingshan',     name: '景山',     lat: 39.926, lng: 116.396, baseFlow: 900,  range: 700,  color: '#34D399' },
  { id: 'zhonggulou',   name: '钟鼓楼',   lat: 39.941, lng: 116.393, baseFlow: 400,  range: 300,  color: '#34D399' },
];

// 获取拥挤等级
export function getCrowdLevel(count) {
  if (count < 600)  return { level: '畅通', color: '#34D399', icon: '🟢' };
  if (count < 2000) return { level: '较拥挤', color: '#FBBF24', icon: '🟡' };
  return { level: '拥堵', color: '#EF4444', icon: '🔴' };
}

// 获取拥挤颜色
export function getCrowdColor(count) {
  if (count < 600)  return '#34D399';
  if (count < 2000) return '#FBBF24';
  return '#EF4444';
}

// 模拟实时客流数据
let currentData = null;

export function generateCrowdData() {
  const now = new Date();
  const hour = now.getHours();
  // 模拟日内波动：10-14点为高峰期
  const peakFactor = (hour >= 10 && hour <= 14) ? 1.5 : 1.0;

  const data = spots.map(spot => {
    const variance = (Math.random() - 0.5) * spot.range * 2;
    const count = Math.round((spot.baseFlow + variance) * peakFactor);
    const actualCount = Math.max(30, count);
    const crowdInfo = getCrowdLevel(actualCount);
    return {
      ...spot,
      currentFlow: actualCount,
      crowdLevel: crowdInfo.level,
      crowdColor: crowdInfo.color,
      crowdIcon: crowdInfo.icon,
      trend: Math.random() > 0.5 ? '↑' : '↓',
      updateTime: now.toLocaleTimeString('zh-CN'),
    };
  });

  currentData = data;
  return data;
}

// 获取当前数据（不重新生成）
export function getCurrentData() {
  return currentData || generateCrowdData();
}

// 获取总客流
export function getTotalFlow(data) {
  return data.reduce((sum, s) => sum + s.currentFlow, 0);
}

export { spots };
