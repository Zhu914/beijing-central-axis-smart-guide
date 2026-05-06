import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { generateCrowdData, getTotalFlow, spots } from '../components/CrowdSimulator';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DataDashboard() {
  const [crowdData, setCrowdData] = useState([]);
  const [totalFlow, setTotalFlow] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('');

  const refreshData = useCallback(() => {
    const data = generateCrowdData();
    setCrowdData(data);
    setTotalFlow(getTotalFlow(data));
    setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const chartData = {
    labels: crowdData.map(s => s.name),
    datasets: [
      {
        label: '实时客流 (人)',
        data: crowdData.map(s => s.currentFlow),
        backgroundColor: crowdData.map(s => s.crowdColor + '99'),
        borderColor: crowdData.map(s => s.crowdColor),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '中轴线各景点实时客流对比',
        font: { size: 16, family: '"Noto Serif SC", serif' },
        color: '#191D6B',
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw.toLocaleString()} 人`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => v.toLocaleString() + ' 人' },
        grid: { color: 'rgba(134,38,23,0.1)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* 顶部状态卡片 */}
      <div className="bg-axis-sub rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-calligraphy text-axis-accentRed">
            📊 实时数据仪表盘
          </h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="bg-axis-accentRed/10 px-3 py-1 rounded-full text-axis-accentRed font-semibold">
              👥 总客流：{totalFlow.toLocaleString()} 人
            </span>
            <span className="text-axis-accentBlue/60">
              📡 {lastUpdate}
            </span>
          </div>
        </div>
      </div>

      {/* 图表 */}
      <div className="bg-axis-detailSub rounded-lg shadow-lg p-6">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* 实时数据网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {crowdData.map((spot, i) => (
          <motion.div
            key={spot.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-axis-detailSub rounded-lg p-5 text-center shadow-md"
          >
            <div className="text-xl font-calligraphy text-axis-accentBlue mb-3">
              {spot.name}
            </div>
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: spot.crowdColor }}
            >
              {spot.crowdIcon}
            </div>
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: spot.crowdColor }}
            >
              {spot.currentFlow.toLocaleString()}
            </div>
            <div className="text-sm text-axis-accentBlue/70">人</div>
            <div
              className="mt-2 px-3 py-1 rounded-full text-xs font-semibold inline-block"
              style={{
                backgroundColor: spot.crowdColor + '20',
                color: spot.crowdColor,
              }}
            >
              {spot.crowdLevel} {spot.trend}
            </div>
            <div className="text-xs text-axis-accentBlue/40 mt-2">
              更新于 {spot.updateTime}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 图例与说明 */}
      <div className="bg-axis-sub rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{background:'#34D399'}}></span>
              畅通 &lt;600人
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{background:'#FBBF24'}}></span>
              较拥挤 600-2000人
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{background:'#EF4444'}}></span>
              拥堵 &gt;2000人
            </span>
          </div>
          <span className="text-axis-accentBlue/50">
            数据每 5 秒自动刷新 · 模拟实时客流监测
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default DataDashboard;
