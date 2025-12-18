import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-axis-accentBlue text-white py-6 shadow-md"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/">
          <h1 className="text-4xl font-calligraphy">北京中轴线智能调度</h1>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:text-axis-accentRed">首页</Link></li>
            <li><Link to="/map" className="hover:text-axis-accentRed">地图</Link></li>
            <li><Link to="/dashboard" className="hover:text-axis-accentRed">仪表盘</Link></li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}

export default Header;