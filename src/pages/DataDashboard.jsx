import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ['永定门', '天坛', '故宫', '景山', '钟鼓楼'],
  datasets: [
    {
      label: '游客流量 (千人)',
      data: [12, 19, 3, 5, 2],
      backgroundColor: 'rgba(134, 38, 23, 0.6)',
    },
  ],
};

function DataDashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-axis-sub rounded-lg shadow-lg p-8"
    >
      <h2 className="text-3xl font-calligraphy text-axis-accentRed mb-4">实时数据仪表盘</h2>
      <Bar data={data} options={{ responsive: true }} />
      <p className="mt-4">模拟数据：实际可连接API获取实时游客流量。</p>
    </motion.div>
  );
}

export default DataDashboard;