import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

const axisPoints = [
  { name: '永定门', position: [39.875, 116.394] },
  { name: '天坛', position: [39.882, 116.406] },
  { name: '故宫', position: [39.916, 116.397] },
  { name: '景山', position: [39.926, 116.396] },
  { name: '钟鼓楼', position: [39.941, 116.393] },
];

function MapPage() {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-axis-detailSub rounded-lg shadow-lg p-4"
    >
      <h2 className="text-3xl font-calligraphy text-axis-accentBlue mb-4">北京中轴线地图</h2>
      <MapContainer center={[39.916, 116.397]} zoom={13} style={{ height: '500px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {axisPoints.map((point, idx) => (
          <Marker key={idx} position={point.position}>
            <Popup>{point.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  );
}

export default MapPage;