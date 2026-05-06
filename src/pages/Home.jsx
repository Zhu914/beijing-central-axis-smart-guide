import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { generateCrowdData, getTotalFlow } from '../components/CrowdSimulator';

const BASE = import.meta.env.BASE_URL;

function Home() {
  const [crowdData, setCrowdData] = useState([]);
  const [totalFlow, setTotalFlow] = useState(0);

  const refreshData = useCallback(() => {
    const data = generateCrowdData();
    setCrowdData(data);
    setTotalFlow(getTotalFlow(data));
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="space-y-6"
    >
      {/* 欢迎区域 */}
      <div className="bg-axis-sub rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-calligraphy text-axis-accentRed mb-4">
          欢迎来到北京中轴线智能展示
        </h2>
        <p className="text-lg mb-2 text-axis-accentBlue">
          探索世界遗产北京中轴线，体验智能调度与实时监测。
        </p>
        <p className="text-axis-accentBlue/70 text-sm">
          全轴 5 大核心景点 · 7.8 公里 · 实时客流全覆盖
        </p>
      </div>

      {/* 实时客流概览 */}
      <div className="bg-axis-detailSub rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-serif-sc font-bold text-axis-accentBlue mb-4">
          📊 全域实时客流概览
        </h3>
        <div className="text-center mb-4">
          <span className="text-4xl font-bold text-axis-accentRed">
            {totalFlow.toLocaleString()}
          </span>
          <span className="text-axis-accentBlue ml-2">人（全轴实时）</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {crowdData.map((spot) => (
            <div key={spot.id} className="bg-white/60 rounded-lg p-3 text-center">
              <div className="font-calligraphy text-axis-accentBlue text-lg mb-1">
                {spot.name}
              </div>
              <div className="text-xl font-bold" style={{color: spot.crowdColor}}>
                {spot.crowdIcon} {spot.currentFlow.toLocaleString()}
              </div>
              <div className="text-xs text-axis-accentBlue/60">
                {spot.crowdLevel} {spot.trend}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 导航卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/map" className="bg-axis-detailBg p-6 rounded-lg shadow hover:shadow-xl transition group">
          <div className="text-4xl mb-2">🗺️</div>
          <h3 className="text-2xl font-serif-sc font-bold text-axis-accentBlue group-hover:text-axis-accentRed transition">
            互动地图
          </h3>
          <p className="text-axis-accentBlue/70 mt-2">
            查看中轴线点位 · 实时客流数据 · 内部游览路线
          </p>
        </Link>
        <Link to="/dashboard" className="bg-axis-detailBg p-6 rounded-lg shadow hover:shadow-xl transition group">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="text-2xl font-serif-sc font-bold text-axis-accentBlue group-hover:text-axis-accentRed transition">
            数据仪表盘
          </h3>
          <p className="text-axis-accentBlue/70 mt-2">
            游客流量图表 · 实时对比分析 · 趋势可视化
          </p>
        </Link>
        <a href="#spot-detail" className="bg-axis-detailBg p-6 rounded-lg shadow hover:shadow-xl transition group">
          <div className="text-4xl mb-2">🚶</div>
          <h3 className="text-2xl font-serif-sc font-bold text-axis-accentBlue group-hover:text-axis-accentRed transition">
            内部游览路线
          </h3>
          <p className="text-axis-accentBlue/70 mt-2">
            故宫 · 天坛 · 景山 · 钟鼓楼 · 永定门
          </p>
        </a>
      </div>

      {/* 产品截图展示 */}
      <div className="bg-axis-sub rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-calligraphy text-axis-accentRed mb-4 text-center">
          📱 产品界面展示
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-axis-detailSub rounded-lg p-4 shadow text-center">
            <img
              src={`${BASE}assets/image69.png`}
              alt="全域客流热力图"
              className="w-full h-auto rounded-lg mb-3"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p className="text-axis-accentBlue text-sm font-semibold">全域客流热力图展示</p>
          </div>
          <div className="bg-axis-detailSub rounded-lg p-4 shadow text-center">
            <img
              src={`${BASE}assets/image70.png`}
              alt="推荐游览时段"
              className="w-full h-auto rounded-lg mb-3"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p className="text-axis-accentBlue text-sm font-semibold">推荐游览时段</p>
          </div>
          <div className="bg-axis-detailSub rounded-lg p-4 shadow text-center">
            <img
              src={`${BASE}assets/image72.png`}
              alt="AI 智能路线规划"
              className="w-full h-auto rounded-lg mb-3"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p className="text-axis-accentBlue text-sm font-semibold">AI 智能路线规划</p>
          </div>
        </div>
      </div>

      {/* 网页演示链接 */}
      <div className="bg-gradient-to-r from-axis-accentRed to-axis-accentRed/80 rounded-lg shadow-lg p-8 text-center text-white">
        <h3 className="text-2xl font-calligraphy mb-2">🌐 产品演示</h3>
        <p className="opacity-90 mb-2">网页核心功能已完成，进入迭代优化阶段</p>
        <div className="mt-4">
          <img
            src={`${BASE}assets/image75.png`}
            alt="网页演示截图"
            className="max-w-full rounded-lg shadow-md mx-auto"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default Home;
