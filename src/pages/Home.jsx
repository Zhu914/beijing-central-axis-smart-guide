import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-axis-sub rounded-lg shadow-lg p-8"
    >
      <h2 className="text-3xl font-calligraphy text-axis-accentRed mb-4">欢迎来到北京中轴线智能展示</h2>
      <p className="text-lg mb-6">探索世界遗产北京中轴线，体验智能调度与实时监测。</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/map" className="bg-axis-detailBg p-4 rounded hover:shadow-xl transition">
          <h3 className="text-2xl font-serif-sc">互动地图</h3>
          <p>查看中轴线点位和实时数据。</p>
        </Link>
        <Link to="/dashboard" className="bg-axis-detailBg p-4 rounded hover:shadow-xl transition">
          <h3 className="text-2xl font-serif-sc">数据仪表盘</h3>
          <p>游客流量、天气等可视化图表。</p>
        </Link>
      </div>
    </motion.div>
  );
}

export default Home;