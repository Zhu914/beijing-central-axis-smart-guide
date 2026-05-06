import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip } from 'react-leaflet';
import { motion } from 'framer-motion';
import SpotDetail from '../components/SpotDetail';
import { generateCrowdData, getTotalFlow, getCrowdLevel } from '../components/CrowdSimulator';
import L from 'leaflet';

// 自定义彩色标记图标
function createColoredIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width:24px; height:24px; border-radius:50%;
      background:${color}; border:3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// 添加脉冲动画样式
const pulseStyle = `
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.3); }
  70% { box-shadow: 0 0 0 10px rgba(0,0,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
}
`;

function MapPage() {
  const [crowdData, setCrowdData] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedSpotData, setSelectedSpotData] = useState(null);
  const [totalFlow, setTotalFlow] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('');

  // 刷新客流数据
  const refreshData = useCallback(() => {
    const data = generateCrowdData();
    setCrowdData(data);
    setTotalFlow(getTotalFlow(data));
    setLastUpdate(new Date().toLocaleTimeString('zh-CN'));

    // 如果当前有选中的景点，更新其数据
    if (selectedSpot) {
      const updated = data.find(d => d.name === selectedSpot);
      if (updated) setSelectedSpotData(updated);
    }
  }, [selectedSpot]);

  // 初始加载和定时刷新
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <style>{pulseStyle}</style>

      {/* 地图标题与状态栏 */}
      <div className="bg-axis-detailSub rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-calligraphy text-axis-accentBlue">
            🗺️ 北京中轴线地图
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="bg-white/80 px-3 py-1 rounded-full text-axis-accentBlue font-semibold">
              👥 全轴实时客流：{totalFlow.toLocaleString()} 人
            </span>
            <span className="text-axis-accentBlue/60">
              📡 更新于 {lastUpdate}
            </span>
          </div>
        </div>

        {/* 图例 */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full inline-block" style={{background:'#34D399'}}></span>
            畅通 (&lt;600人)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full inline-block" style={{background:'#FBBF24'}}></span>
            较拥挤 (600-2000人)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full inline-block" style={{background:'#EF4444'}}></span>
            拥堵 (&gt;2000人)
          </span>
        </div>
      </div>

      {/* Leaflet 地图 */}
      <div className="rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={[39.916, 116.397]}
          zoom={13}
          style={{ height: '550px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {crowdData.map((spot) => (
            <React.Fragment key={spot.id}>
              {/* 彩色圆点标记 */}
              <CircleMarker
                center={[spot.lat, spot.lng]}
                radius={12 + Math.min(spot.currentFlow / 200, 12)}
                pathOptions={{
                  fillColor: spot.crowdColor,
                  fillOpacity: 0.5,
                  color: spot.crowdColor,
                  weight: 2,
                  opacity: 0.9,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedSpot(spot.name);
                    setSelectedSpotData(spot);
                  },
                }}
              >
                <Tooltip permanent direction="top" offset={[0, -16]}>
                  <div className="text-center">
                    <div style={{fontWeight:'bold',color:spot.crowdColor}}>
                      {spot.crowdIcon} {spot.name}
                    </div>
                    <div style={{fontSize:'0.85em'}}>
                      {spot.currentFlow.toLocaleString()} 人
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>

              {/* 标准 Leaflet 标记（可点击出弹窗） */}
              <Marker
                position={[spot.lat, spot.lng]}
                icon={createColoredIcon(spot.crowdColor)}
                eventHandlers={{
                  click: () => {
                    setSelectedSpot(spot.name);
                    setSelectedSpotData(spot);
                  },
                }}
              >
                <Popup maxWidth={280}>
                  <div className="font-serif-sc" style={{minWidth:'200px'}}>
                    <h3 className="text-lg font-bold mb-2" style={{color:spot.crowdColor}}>
                      {spot.crowdIcon} {spot.name}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>实时客流：</strong>
                        <span style={{color:spot.crowdColor,fontWeight:'bold',fontSize:'1.1em'}}>
                          {spot.currentFlow.toLocaleString()} 人
                        </span>
                      </p>
                      <p><strong>状态：</strong>{spot.crowdLevel}</p>
                      <p><strong>趋势：</strong>{spot.trend}（近5分钟）</p>
                      <p className="text-xs opacity-60">更新于 {spot.updateTime}</p>
                    </div>
                    <p className="mt-2 text-xs text-axis-accentBlue/70">
                      💡 点击查看内部游览路线
                    </p>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* 景点详情面板 */}
      {selectedSpot && (
        <SpotDetail spotName={selectedSpot} crowdData={selectedSpotData} />
      )}

      {/* 客流概览卡片列表 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {crowdData.map((spot) => (
          <motion.div
            key={spot.id}
            whileHover={{ scale: 1.03 }}
            onClick={() => { setSelectedSpot(spot.name); setSelectedSpotData(spot); }}
            className="bg-axis-detailSub rounded-lg p-3 text-center cursor-pointer shadow hover:shadow-lg transition"
          >
            <div className="text-lg font-calligraphy text-axis-accentBlue mb-1">
              {spot.name}
            </div>
            <div
              className="text-xl font-bold"
              style={{ color: spot.crowdColor }}
            >
              {spot.crowdIcon} {spot.currentFlow.toLocaleString()}
            </div>
            <div className="text-xs text-axis-accentBlue/60">
              人 · {spot.crowdLevel} {spot.trend}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default MapPage;
