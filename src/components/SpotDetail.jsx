import React from 'react';
import { motion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

// 各景点内部游览路线数据
const spotRoutes = {
  '故宫': {
    title: '故宫博物院 · 内部游览路线',
    route: '午门 → 太和殿 → 中和殿 → 保和殿 → 乾清宫 → 交泰殿 → 坤宁宫 → 御花园 → 神武门',
    duration: '2.5 - 3.5 小时',
    image: `${BASE}assets/image81.png`,
    areas: [
      { name: '御花园', level: '畅通', color: '#34D399' },
      { name: '太和殿广场', level: '较拥挤', color: '#FBBF24' },
      { name: '乾清宫区域', level: '较拥挤', color: '#FBBF24' },
      { name: '神武门出口', level: '畅通', color: '#34D399' },
    ],
    timeTips: [
      { time: '8:30-10:00', label: '推荐游览', color: '#34D399' },
      { time: '10:00-13:00', label: '客流高峰期', color: '#EF4444' },
      { time: '13:00-15:00', label: '较适宜', color: '#FBBF24' },
      { time: '15:00-17:00', label: '推荐游览', color: '#34D399' },
    ],
  },
  '天坛': {
    title: '天坛公园 · 内部游览路线',
    route: '南门 → 圜丘坛 → 皇穹宇 → 丹陛桥 → 祈年殿 → 皇乾殿 → 斋宫 → 神乐署 → 东门',
    duration: '1.5 - 2.5 小时',
    image: `${BASE}assets/image19.jpeg`,
    areas: [
      { name: '祈年殿区域', level: '较拥挤', color: '#FBBF24' },
      { name: '圜丘坛', level: '畅通', color: '#34D399' },
      { name: '斋宫', level: '畅通', color: '#34D399' },
      { name: '丹陛桥', level: '畅通', color: '#34D399' },
    ],
    timeTips: [
      { time: '8:00-10:00', label: '推荐游览', color: '#34D399' },
      { time: '10:00-12:00', label: '客流高峰期', color: '#EF4444' },
      { time: '12:00-14:00', label: '较适宜', color: '#FBBF24' },
      { time: '14:00-17:00', label: '推荐游览', color: '#34D399' },
    ],
  },
  '景山': {
    title: '景山公园 · 内部游览路线',
    route: '南门 → 绮望楼 → 万春亭 → 观妙亭 → 辑芳亭 → 寿皇殿 → 西门',
    duration: '1 - 1.5 小时',
    image: `${BASE}assets/image85.png`,
    areas: [
      { name: '万春亭', level: '较拥挤', color: '#FBBF24' },
      { name: '寿皇殿', level: '畅通', color: '#34D399' },
      { name: '南门入口', level: '畅通', color: '#34D399' },
    ],
    timeTips: [
      { time: '6:30-9:00', label: '推荐游览', color: '#34D399' },
      { time: '9:00-12:00', label: '客流高峰期', color: '#EF4444' },
      { time: '12:00-15:00', label: '较适宜', color: '#FBBF24' },
      { time: '15:00-20:00', label: '推荐游览', color: '#34D399' },
    ],
  },
  '钟鼓楼': {
    title: '钟鼓楼 · 内部游览路线',
    route: '鼓楼 → 钟楼 → 钟鼓楼广场 → 烟袋斜街 → 什刹海',
    duration: '1 - 2 小时',
    image: `${BASE}assets/image86.png`,
    areas: [
      { name: '鼓楼', level: '畅通', color: '#34D399' },
      { name: '钟楼', level: '畅通', color: '#34D399' },
      { name: '烟袋斜街', level: '较拥挤', color: '#FBBF24' },
    ],
    timeTips: [
      { time: '9:00-11:00', label: '推荐游览', color: '#34D399' },
      { time: '11:00-14:00', label: '客流高峰期', color: '#EF4444' },
      { time: '14:00-17:00', label: '推荐游览', color: '#34D399' },
    ],
  },
  '永定门': {
    title: '永定门 · 内部游览路线',
    route: '永定门城楼 → 永定门公园 → 中轴线南段 → 燕墩',
    duration: '0.5 - 1 小时',
    image: `${BASE}assets/image87.png`,
    areas: [
      { name: '城楼区域', level: '畅通', color: '#34D399' },
      { name: '公园步道', level: '畅通', color: '#34D399' },
    ],
    timeTips: [
      { time: '全天', label: '畅通游览', color: '#34D399' },
    ],
  },
};

function SpotDetail({ spotName, crowdData }) {
  const routeData = spotRoutes[spotName];
  if (!routeData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-axis-sub rounded-lg p-6 mt-6 border border-axis-accentRed/20"
    >
      {/* 标题 */}
      <h3 className="text-2xl font-calligraphy text-axis-accentRed mb-4">
        🚶 {routeData.title}
      </h3>

      {/* 景点图片 */}
      {routeData.image && (
        <div className="mb-4 rounded-lg overflow-hidden shadow-md">
          <img
            src={routeData.image}
            alt={routeData.title}
            className="w-full h-auto max-h-64 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* 推荐路线 */}
      <div className="bg-axis-detailSub rounded-lg p-4 mb-4">
        <h4 className="font-serif-sc font-bold text-axis-accentBlue mb-2">
          🗺️ 推荐游览路线
        </h4>
        <p className="text-axis-accentBlue text-sm leading-relaxed">
          {routeData.route}
        </p>
        <p className="text-axis-accentRed text-sm mt-2 font-semibold">
          ⏱️ 预计游览时长：{routeData.duration}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 区域客流分布 */}
        <div className="bg-white/60 rounded-lg p-4">
          <h4 className="font-serif-sc font-bold text-axis-accentBlue mb-3">
            👥 区域客流分布
          </h4>
          <div className="space-y-2">
            {routeData.areas.map((area, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-axis-accentBlue text-sm">{area.name}</span>
                <span
                  className="px-2 py-1 rounded text-xs font-semibold"
                  style={{ backgroundColor: area.color + '30', color: area.color }}
                >
                  {area.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 分时段建议 */}
        <div className="bg-white/60 rounded-lg p-4">
          <h4 className="font-serif-sc font-bold text-axis-accentBlue mb-3">
            ⏱️ 分时段游览建议
          </h4>
          <div className="space-y-2">
            {routeData.timeTips.map((tip, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-axis-accentBlue text-sm">{tip.time}</span>
                <span
                  className="px-2 py-1 rounded text-xs font-semibold"
                  style={{ backgroundColor: tip.color + '30', color: tip.color }}
                >
                  {tip.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 实时客流状态 */}
      {crowdData && (
        <div className="mt-4 bg-white/60 rounded-lg p-4">
          <h4 className="font-serif-sc font-bold text-axis-accentBlue mb-2">
            📊 实时客流状态
          </h4>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-lg font-bold" style={{ color: crowdData.crowdColor }}>
              {crowdData.crowdIcon} {crowdData.currentFlow} 人
            </span>
            <span className="text-sm text-axis-accentBlue">
              {crowdData.crowdLevel} · 趋势 {crowdData.trend}
            </span>
            <span className="text-xs text-axis-accentBlue/60">
              更新于 {crowdData.updateTime}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default SpotDetail;
