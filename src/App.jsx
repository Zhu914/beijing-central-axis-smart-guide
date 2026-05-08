import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { axisSpots, crowdMeta, getRouteNames, getRoutePositions, guideSourceMap, routePlans } from './data/axisData';

const navItems = [
  { id: 'explore', icon: '⌖', label: '探索' },
  { id: 'routes', icon: '⌁', label: '路线' },
  { id: 'heatmap', icon: '▤', label: '热力' },
  { id: 'time', icon: '◷', label: '时间' },
  { id: 'user', icon: '♙', label: '我的' },
];

const statCards = [
  ['景点内精准管控', '19处', '核心节点实时监测'],
  ['景点间智能联动', '3类', '跨景点路线策略'],
  ['错峰推荐窗口', '24h', '按时段动态更新'],
  ['服务体验优化', '4项', '离线/咨询/求助/预约'],
];

const timeSlotLabels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

function formatClock(date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getLiveLevel(value) {
  if (value >= 72) return 'high';
  if (value >= 44) return 'medium';
  return 'low';
}

function getLiveSpotData(spot, now) {
  const hourValue = now.getHours() + now.getMinutes() / 60;
  const slotIndex = Math.max(0, Math.min(spot.trend.length - 1, Math.floor((hourValue - 8) / 2)));
  const nextIndex = Math.min(spot.trend.length - 1, slotIndex + 1);
  const progress = Math.max(0, Math.min(1, (hourValue - (8 + slotIndex * 2)) / 2));
  const curveValue = spot.trend[slotIndex] + (spot.trend[nextIndex] - spot.trend[slotIndex]) * progress;
  const minuteWave = Math.sin((now.getMinutes() + spot.id * 7) / 60 * Math.PI * 2) * 4;
  const liveCrowd = Math.max(10, Math.min(98, Math.round(curveValue + minuteWave)));
  const crowdLevel = getLiveLevel(liveCrowd);
  const liveCount = Math.max(300, Math.round(spot.crowdCount * (0.42 + liveCrowd / 100)));
  const recommendation = crowdLevel === 'high' ? '建议错峰' : crowdLevel === 'medium' ? '适中通行' : '当前舒适';

  return {
    ...spot,
    crowdLevel,
    liveCrowd,
    liveCount,
    liveTimeLabel: timeSlotLabels[slotIndex],
    recommendation,
  };
}

function getLiveSnapshot(now) {
  const spots = axisSpots.map((spot) => getLiveSpotData(spot, now));
  const avgCrowd = Math.round(spots.reduce((sum, spot) => sum + spot.liveCrowd, 0) / spots.length);
  const highCount = spots.filter((spot) => spot.crowdLevel === 'high').length;
  const mediumCount = spots.filter((spot) => spot.crowdLevel === 'medium').length;
  const lowCount = spots.filter((spot) => spot.crowdLevel === 'low').length;
  const totalCount = spots.reduce((sum, spot) => sum + spot.liveCount, 0);
  const updatedAt = formatClock(now);

  return {
    spots,
    updatedAt,
    avgCrowd,
    highCount,
    mediumCount,
    lowCount,
    totalCount,
    statCards: [
      [statCards[0][0], `${spots.length}处`, `实时更新 ${updatedAt}`],
      [statCards[1][0], `${highCount + mediumCount}处`, '按当前拥挤度联动'],
      [statCards[2][0], `${lowCount}处`, '当前舒适窗口'],
      [statCards[3][0], `${Math.round(totalCount / 1000)}k`, '在线客流估算'],
    ],
  };
}

const platformHighlights = [
  ['实时查', '全域热力与景点详情同步更新，帮助游客快速判断当前游览状态。'],
  ['个性化', '结合游览时长、人群类型和兴趣标签，生成更贴合个人需求的方案。'],
  ['优体验', '联动离线行程、在线咨询、语音求助和服务预约，提升全流程体验。'],
];

const serviceModules = [
  ['适老模式', '字号放大、低强度路线、无台阶导览。'],
  ['我的行程', '离线保存路线、预约、景点内动线。'],
  ['服务预约', '讲解、轮椅、寄存、亲子陪同统一管理。'],
  ['语音求助', '高峰拥挤或突发情况一键触达服务点。'],
];

const axisNodes = [
  { name: '钟楼', x: 50, y: 8, type: 'tower' },
  { name: '鼓楼', x: 50, y: 15, type: 'gate' },
  { name: '万宁桥', x: 42, y: 24, type: 'bridge' },
  { name: '景山', x: 55, y: 31, type: 'hill' },
  { name: '故宫', x: 50, y: 43, type: 'palace', hot: true },
  { name: '端门', x: 52, y: 52, type: 'gate' },
  { name: '天安门', x: 50, y: 58, type: 'gate' },
  { name: '外金水桥', x: 39, y: 62, type: 'bridge' },
  { name: '英雄纪念碑', x: 52, y: 68, type: 'monument' },
  { name: '正阳门', x: 50, y: 80, type: 'gate' },
  { name: '永定门', x: 50, y: 92, type: 'gate' },
  { name: '天坛', x: 74, y: 86, type: 'temple' },
  { name: '社稷坛', x: 24, y: 54, type: 'palace' },
  { name: '太庙', x: 76, y: 54, type: 'palace' },
];

function PanelShell({ title, kicker, children }) {
  return (
    <div className="panel-scroll control-panel-scroll h-full overflow-y-auto px-5 py-5">
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[#8B0000]/45">{kicker}</p>
        <h2 className="mt-2 text-2xl font-bold text-[#8B0000]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function AxisDiagram({ mode = 'default', compact = false, onSelectSpot }) {
  const showRoute = mode === 'routes';
  const showTime = mode === 'time';
  const showHeat = mode === 'heatmap' || mode === 'default';

  return (
    <div className={`coded-axis ${compact ? 'compact' : ''} ${showHeat ? 'with-heat' : ''}`}>
      <div className="axis-spine" />
      {showRoute && (
        <svg className="route-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="50,92 41,78 35,62 50,43 55,31 50,15" className="route-red" />
          <polyline points="50,92 56,72 70,58 55,31 50,8" className="route-blue" />
        </svg>
      )}
      {axisNodes.map((node) => {
        const spot = axisSpots.find((item) => item.name.includes(node.name) || node.name.includes(item.name));
        return (
          <button
            key={node.name}
            type="button"
            className={`axis-node ${node.type} ${node.hot ? 'is-hot' : ''}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onClick={() => spot && onSelectSpot?.(spot)}
          >
            {showHeat && <span className={`node-heat ${node.hot ? 'hot' : node.y > 50 ? 'warm' : 'cool'}`} />}
            <span className="building-shape">
              <i />
              <b />
            </span>
            <span className="node-label">{node.name}</span>
          </button>
        );
      })}
      {showTime && (
        <div className="time-bubble" style={{ left: '70%', top: '31%' }}>
          <b>10:20进入</b>
          <span>游览2-3小时</span>
        </div>
      )}
    </div>
  );
}

function PalaceGuideDiagram() {
  const areas = [
    ['午门', '太和门', '太和殿'],
    ['中和殿', '保和殿', '乾清门'],
    ['乾清宫', '交泰殿', '坤宁宫'],
    ['御花园', '神武门', '服务点'],
  ];

  return (
    <div className="palace-guide-code">
      <div className="palace-axis-line" />
      {areas.flatMap((row, rowIndex) =>
        row.map((name, colIndex) => (
          <span
            key={name}
            className={`palace-block ${colIndex === 1 ? 'main' : ''}`}
            style={{
              left: `${18 + colIndex * 30}%`,
              top: `${12 + rowIndex * 20}%`,
            }}
          >
            <i />
            <b>{name}</b>
          </span>
        ))
      )}
      <svg className="palace-route" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points="50,88 50,70 50,50 50,32 50,14" />
        <polyline points="50,50 78,52 78,72 50,70" />
      </svg>
    </div>
  );
}

function TrendChart({ values = [] }) {
  const points = values.length ? values : [20, 35, 58, 72, 64, 48, 30];
  const step = 310 / (points.length - 1);
  const coords = points.map((value, index) => {
    const x = 30 + index * step;
    const y = 170 - (Math.min(100, Math.max(0, value)) / 100) * 138;
    return [Number(x.toFixed(1)), Number(y.toFixed(1))];
  });
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `${line} 340,170 30,170`;

  return (
    <svg viewBox="0 0 360 190" aria-label="实时人流趋势图">
      <path d="M28 32H340M28 78H340M28 124H340M28 170H340" className="grid-line" />
      <polygon points={area} className="trend-area-code" />
      <polyline points={line} className="trend-line-code" />
      {coords.map(([x, y], index) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={index === coords.length - 1 ? 5 : 3.5} className="trend-dot" />
      ))}
      <text x="28" y="186">08:00</text>
      <text x="128" y="186">12:00</text>
      <text x="230" y="186">16:00</text>
      <text x="304" y="186">20:00</text>
    </svg>
  );
}

function GuideDiagram({ spot }) {
  const source = guideSourceMap[spot.guideType] || guideSourceMap.axis;
  const route = spot.internalRoute || [];

  return (
    <div className={`guide-map-code guide-map-${spot.guideType || 'axis'}`}>
      <div className="guide-map-bg" />
      <svg className="guide-route-code" viewBox="0 0 100 100" preserveAspectRatio="none">
        {spot.guideType === 'tiantan' && <polyline points="52,10 52,30 52,50 52,72 52,90" />}
        {spot.guideType === 'jingshan' && <polyline points="50,88 42,70 50,52 58,34 50,14" />}
        {spot.guideType === 'bell' && <polyline points="50,78 50,52 50,28" />}
        {spot.guideType === 'palace' && (
          <>
            <polyline points="50,90 50,70 50,50 50,30 50,10" />
            <polyline points="50,50 76,54 76,74 50,70" />
          </>
        )}
        {(!spot.guideType || spot.guideType === 'axis') && <polyline points="50,90 48,68 52,48 50,28 50,10" />}
      </svg>
      {route.map((name, index) => {
        const count = Math.max(1, route.length - 1);
        const y = 88 - (index / count) * 76;
        const xOffset = spot.guideType === 'jingshan' ? (index % 2 ? -9 : 9) : spot.guideType === 'tiantan' ? (index % 2 ? 7 : -7) : 0;
        return (
          <span key={name} className="guide-node-code" style={{ left: `${50 + xOffset}%`, top: `${y}%` }}>
            <i />
            <b>{name}</b>
          </span>
        );
      })}
      <a className="guide-source-link" href={source.url} target="_blank" rel="noreferrer">
        参考：{source.title}
      </a>
      <p className="guide-source-note">{source.note}</p>
    </div>
  );
}

function Splash({ onStart }) {
  return (
    <div className="splash-shell min-h-screen bg-paper text-[#8B0000]">
      <div className="splash-grid">
        <section className="splash-copy">
          <div className="seal-mark">京</div>
          <p className="mb-4 text-sm tracking-[0.45em] text-[#8B0000]/55">BEIJING CENTRAL AXIS</p>
          <h1 className="font-calligraphy text-6xl leading-tight md:text-8xl">中轴智调</h1>
          <p className="mt-4 max-w-2xl text-xl leading-9 text-[#6f1f18]">
            通过数字化技术与智能算法，构建“景点内精准管控 + 景点间智能联动”的北京中轴线景点客流智调平台。
          </p>
          <div className="mt-8 grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-3">
            {platformHighlights.map(([title, text]) => (
              <article key={title} className="intro-card">
                <strong>{title}</strong>
                <span>{text}</span>
              </article>
            ))}
          </div>
          <button type="button" onClick={onStart} className="launch-button mt-10">
            进入智调平台
          </button>
        </section>
        <section className="phone-stage" aria-label="代码构建的中轴线示意">
          <div className="phone-frame generated">
            <div className="phone-search">⌕ 你要去哪儿</div>
            <AxisDiagram compact />
            <div className="phone-tabs">
              <b>推荐路线</b>
              <b>热力图</b>
              <b>推荐游览时间</b>
              <b>用户</b>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SideNav({ activeTab, onChange }) {
  return (
    <nav className="side-nav">
      <div className="nav-seal">京</div>
      <div className="nav-stack">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function ExplorePanel({ search, setSearch, setSelectedSpot, liveSnapshot }) {
  const filtered = liveSnapshot.spots.filter((spot) => spot.name.includes(search));

  return (
    <PanelShell title="北京中轴线" kicker="Smart Guide">
      <div className="search-box">
        <span>⌕</span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="你要去哪儿" />
      </div>

      <div className="live-strip">
        <span>实时 {liveSnapshot.updatedAt}</span>
        <b>全域承载率 {liveSnapshot.avgCrowd}%</b>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {liveSnapshot.statCards.map(([title, value, desc]) => (
          <article key={title} className="metric-card">
            <span>{title}</span>
            <strong>{value}</strong>
            <small>{desc}</small>
          </article>
        ))}
      </div>

      <section className="mt-5 panel-card">
        <h3>核心服务</h3>
        <div className="mt-3 space-y-3">
          {platformHighlights.map(([title, text]) => (
            <div key={title} className="pain-row">
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 panel-card">
        <h3>景点列表</h3>
        <div className="mt-3 max-h-[340px] space-y-2 overflow-y-auto pr-1 panel-scroll">
          {filtered.map((spot) => {
            const meta = crowdMeta[spot.crowdLevel];
            return (
              <button key={spot.id} type="button" onClick={() => setSelectedSpot(spot)} className="spot-row">
                <span>
                  <b>{spot.name}</b>
                  <small>{spot.recommendation} · 实时客流 {spot.liveCount.toLocaleString('zh-CN')}人</small>
                </span>
                <i style={{ color: meta.color, background: `${meta.color}1f` }}>{meta.text}</i>
              </button>
            );
          })}
        </div>
      </section>
    </PanelShell>
  );
}

function RoutesPanel({ selectedPlan, setSelectedPlan }) {
  return (
    <PanelShell title="智能路线推荐" kicker="AI Route">
      <section className="panel-card">
        <h3>推荐策略</h3>
        <div className="mt-4 space-y-3">
          {routePlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={`route-option ${selectedPlan === plan.id ? 'active' : ''}`}
            >
              <span>
                <b>{plan.title}</b>
                <small>{plan.time} | {plan.audience}</small>
              </span>
              <em>{plan.path.length}站</em>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 panel-card">
        <h3>当前路线</h3>
        {routePlans.filter((plan) => plan.id === selectedPlan).map((plan) => (
          <div key={plan.id} className="route-summary">
            <p>{getRouteNames(plan.path)}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <span><b>少排队</b><small>错峰入场</small></span>
              <span><b>低拥堵</b><small>热力避让</small></span>
              <span><b>可离线</b><small>行程缓存</small></span>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-5 panel-card">
        <h3>跨景点衔接</h3>
        <p className="mt-2 text-sm leading-7 text-[#8B0000]/70">
          系统根据景点实时承载率、开放时间和游客偏好，动态调整景点间顺序，并提示公共交通、步行、骑行的预计耗时。
        </p>
      </section>
    </PanelShell>
  );
}

function HeatPanel({ heatEnabled, setHeatEnabled }) {
  return (
    <PanelShell title="实时热力监测" kicker="Crowd Heat">
      <section className="panel-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3>地图热力叠加层</h3>
            <p className="mt-2 text-sm text-[#8B0000]/60">开启后将在右侧地图直接显示各景点拥挤程度。</p>
          </div>
          <button type="button" onClick={() => setHeatEnabled(!heatEnabled)} className={`switch ${heatEnabled ? 'on' : ''}`}>
            <span />
          </button>
        </div>
      </section>

      <section className="mt-5 panel-card">
        <h3>全区人流趋势（24h）</h3>
        <div className="trend-chart">
          <svg viewBox="0 0 360 190" role="img" aria-label="全区人流趋势">
            <defs>
              <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8B0000" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B0000" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path className="grid-line" d="M28 28H340M28 72H340M28 116H340M28 160H340" />
            <path className="trend-fill" d="M30 160 C72 136 76 46 132 42 C184 38 218 82 258 104 C302 128 326 142 340 160 L30 160Z" />
            <path className="trend-line" d="M30 160 C72 136 76 46 132 42 C184 38 218 82 258 104 C302 128 326 142 340 160" />
            <path className="trend-dash" d="M30 148 C72 120 82 56 136 50 C186 44 224 72 264 96 C304 120 322 130 340 150" />
            <text x="42" y="184">08:00</text><text x="144" y="184">12:00</text><text x="246" y="184">16:00</text><text x="316" y="184">20:00</text>
          </svg>
        </div>
      </section>

      <section className="mt-5 panel-card">
        <h3>区域预警</h3>
        <div className="mt-3 space-y-3">
          {axisSpots.filter((spot) => spot.crowdLevel !== 'low').slice(0, 5).map((spot) => {
            const meta = crowdMeta[spot.crowdLevel];
            return (
              <div key={spot.id} className="warning-row">
                <span>{spot.name}</span>
                <b style={{ color: meta.color }}>{meta.text}</b>
                <i><em style={{ width: meta.bar, background: meta.color }} /></i>
              </div>
            );
          })}
        </div>
      </section>
    </PanelShell>
  );
}

function TimePanel() {
  return (
    <PanelShell title="推荐游览时间" kicker="Time Advice">
      <section className="panel-card">
        <h3>分时段入园建议</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {['08:00-10:00 推荐', '10:00-12:00 较挤', '12:00-14:00 较挤', '14:00-16:00 较挤'].map((time, index) => (
            <div key={time} className={`time-chip ${index === 0 ? 'primary' : ''}`}>{time}</div>
          ))}
        </div>
      </section>

      <section className="mt-5 panel-card">
        <h3>重点景点建议</h3>
        <div className="mt-3 space-y-3">
          {axisSpots.slice(7, 14).map((spot) => (
            <div key={spot.id} className="time-row">
              <span>{spot.name}</span>
              <b>{spot.bestTime}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 panel-card">
        <h3>调度逻辑</h3>
        <p className="mt-2 text-sm leading-7 text-[#8B0000]/70">
          推荐结果综合实时客流、景区开放时间、路线距离和游客偏好，在高峰区间主动推荐错峰进入或替代节点。
        </p>
      </section>
    </PanelShell>
  );
}

const personalizedPlanRules = {
  '2h': {
    label: '\u0032\u5c0f\u65f6',
    route: ['\u9f13\u697c', '\u949f\u9f13\u697c', '\u4ec0\u5239\u6d77\u5317\u6cbf'],
    pace: '\u77ed\u65f6\u8f7b\u91cf\u6e38\u89c8\uff0c\u4f18\u5148\u9009\u62e9\u8ddd\u79bb\u8fd1\u3001\u6b65\u884c\u538b\u529b\u5c0f\u3001\u505c\u7559\u70b9\u96c6\u4e2d\u7684\u666f\u70b9\u3002',
  },
  'half-day': {
    label: '\u534a\u65e5',
    route: ['\u666f\u5c71', '\u6545\u5bab\u5317\u95e8', '\u4e07\u5b81\u6865', '\u949f\u9f13\u697c'],
    pace: '\u534a\u65e5\u4e32\u8054\u4e2d\u8f74\u5317\u6bb5\uff0c\u4fdd\u7559\u89c2\u666f\u3001\u62cd\u7167\u4e0e\u4f11\u606f\u65f6\u95f4\u3002',
  },
  'full-day': {
    label: '\u5168\u5929',
    route: ['\u6c38\u5b9a\u95e8', '\u5929\u575b', '\u524d\u95e8', '\u6545\u5bab', '\u666f\u5c71', '\u949f\u9f13\u697c'],
    pace: '\u5168\u5929\u8de8\u666f\u70b9\u8054\u52a8\uff0c\u9002\u5408\u5b8c\u6574\u4f53\u9a8c\u4e2d\u8f74\u7ebf\u5386\u53f2\u7a7a\u95f4\u3002',
  },
};

const groupPlanRules = {
  silver: {
    label: '\u94f6\u53d1\u6e38\u5ba2',
    focus: '\u5df2\u52a0\u5165\u9002\u8001\u4f11\u606f\u70b9\u3001\u9519\u5cf0\u65f6\u6bb5\u548c\u5728\u7ebf\u54a8\u8be2\u5165\u53e3\u3002',
    avoid: '\u907f\u5f00\u957f\u8ddd\u79bb\u8fde\u7eed\u6b65\u884c\u4e0e\u5348\u540e\u9ad8\u5cf0\u3002',
  },
  family: {
    label: '\u5bb6\u5ead\u6e38\u5ba2',
    focus: '\u589e\u52a0\u4eb2\u5b50\u8bb2\u89e3\u3001\u536b\u751f\u95f4\u4e0e\u9910\u996e\u8865\u7ed9\u8282\u70b9\u3002',
    avoid: '\u51cf\u5c11\u6392\u961f\u65f6\u95f4\uff0c\u4f18\u5148\u5b89\u6392\u5f00\u653e\u7a7a\u95f4\u3002',
  },
  student: {
    label: '\u7814\u5b66\u56e2\u961f',
    focus: '\u5f3a\u5316\u5386\u53f2\u8bb2\u89e3\u3001\u4efb\u52a1\u6253\u5361\u548c\u56e2\u961f\u96c6\u5408\u70b9\u3002',
    avoid: '\u907f\u5f00\u72ed\u7a84\u901a\u9053\uff0c\u4fdd\u7559\u7edf\u4e00\u96c6\u5408\u65f6\u95f4\u3002',
  },
  culture: {
    label: '\u6587\u5316\u6df1\u5ea6\u6e38\u5ba2',
    focus: '\u589e\u52a0\u5efa\u7b51\u793c\u5236\u3001\u975e\u9057\u6587\u5316\u548c\u535a\u7269\u9986\u5f0f\u8bb2\u89e3\u8282\u70b9\u3002',
    avoid: '\u51cf\u5c11\u6d45\u5c42\u6253\u5361\u70b9\uff0c\u5ef6\u957f\u91cd\u70b9\u666f\u70b9\u505c\u7559\u3002',
  },
};

function getPersonalPlan(duration, group, tags) {
  const durationRule = personalizedPlanRules[duration] || personalizedPlanRules['half-day'];
  const groupRule = groupPlanRules[group] || groupPlanRules.silver;
  const tagText = tags.length ? tags.slice(0, 3).join('\u3001') : '\u4e2d\u8f74\u6587\u5316';
  const extraSpot = tags.some((tag) => tag.includes('\u5efa\u7b51') || tag.includes('\u6587\u5316')) ? '\u6545\u5bab' : tags.some((tag) => tag.includes('\u4eb2\u5b50')) ? '\u5929\u575b' : '\u666f\u5c71';
  const route = Array.from(new Set([...durationRule.route, extraSpot]));

  return {
    title: `${groupRule.label}${durationRule.label}\u4e13\u5c5e\u65b9\u6848`,
    route,
    summary: `${route.join(' \u2192 ')}\uff0c\u56f4\u7ed5\u201c${tagText}\u201d\u504f\u597d\u751f\u6210\u3002${groupRule.focus}`,
    advice: `${durationRule.pace}${groupRule.avoid}`,
  };
}

function UserPanel({ seniorMode, setSeniorMode, tags, setTags }) {
  const [input, setInput] = useState('');
  const [duration, setDuration] = useState('2h');
  const [group, setGroup] = useState('silver');

  function addTag() {
    const value = input.trim();
    if (value && !tags.includes(value)) setTags([...tags, value]);
    setInput('');
  }

  const personalPlan = getPersonalPlan(duration, group, tags);

  return (
    <PanelShell title="用户中心" kicker="Personal Center">
      <section className="user-hero">
        <div className="avatar">游</div>
        <span>
          <b>游客用户</b>
          <small>个性化方案已生成</small>
        </span>
      </section>

      <section className="mt-5 panel-card">
        <div className="flex items-center justify-between">
          <h3>个性化设置</h3>
          <button type="button" onClick={() => setSeniorMode(!seniorMode)} className={`switch ${seniorMode ? 'on' : ''}`}><span /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <select value={duration} onChange={(event) => setDuration(event.target.value)}>
            <option value="2h">{'\u0032\u5c0f\u65f6'}</option>
            <option value="half-day">{'\u534a\u65e5'}</option>
            <option value="full-day">{'\u5168\u5929'}</option>
          </select>
          <select value={group} onChange={(event) => setGroup(event.target.value)}>
            <option value="silver">{'\u94f6\u53d1\u6e38\u5ba2'}</option>
            <option value="family">{'\u5bb6\u5ead\u6e38\u5ba2'}</option>
            <option value="student">{'\u7814\u5b66\u56e2\u961f'}</option>
            <option value="culture">{'\u6587\u5316\u6df1\u5ea6\u6e38\u5ba2'}</option>
          </select>
        </div>
        <div className="tag-input">
          <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTag()} placeholder="添加兴趣标签" />
          <button type="button" onClick={addTag}>添加</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button key={tag} type="button" onClick={() => setTags(tags.filter((item) => item !== tag))} className="tag-pill">{tag} ×</button>
          ))}
        </div>
      </section>

      <section className="mt-5 panel-card personal-plan-card">
        <h3>{personalPlan.title}</h3>
        <div className="personal-route">
          {personalPlan.route.map((spot) => (
            <span key={spot}>{spot}</span>
          ))}
        </div>
        <p className="mt-3 text-sm leading-7 text-[#8B0000]/75">{personalPlan.summary}</p>
        <small>{personalPlan.advice}</small>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {serviceModules.map(([title, text]) => (
          <article key={title} className="service-card">
            <b>{title}</b>
            <span>{text}</span>
          </article>
        ))}
      </div>
    </PanelShell>
  );
}

function createPinIcon(level) {
  return L.divIcon({
    className: 'live-pin-wrapper',
    html: `<span class="live-pin live-pin-${level}"><i></i></span>`,
    iconSize: [34, 46],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });
}

function BeijingMapView({ activePlan, heatEnabled, setSelectedSpot, liveSnapshot }) {
  const routePositions = getRoutePositions(activePlan.path);

  return (
    <div className="beijing-map-shell">
      <MapContainer center={[39.914, 116.397]} zoom={12} scrollWheelZoom className="beijing-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={routePositions}
          pathOptions={{ color: '#8B0000', weight: 5, opacity: 0.78, lineCap: 'round' }}
        />
        {liveSnapshot.spots.map((spot) => {
          const meta = crowdMeta[spot.crowdLevel];
          const radius = spot.crowdLevel === 'high' ? 13 : spot.crowdLevel === 'medium' ? 10 : 8;

          return (
            <React.Fragment key={spot.id}>
              {heatEnabled && (
                <CircleMarker
                  center={spot.position}
                  radius={radius * 2.5}
                  pathOptions={{
                    color: meta.color,
                    fillColor: meta.color,
                    fillOpacity: 0.14,
                    opacity: 0.18,
                    weight: 1,
                  }}
                />
              )}
              <Marker
                position={spot.position}
                icon={createPinIcon(spot.crowdLevel)}
                eventHandlers={{ click: () => setSelectedSpot(spot) }}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>{spot.name}</strong>
                    <span>{meta.text} · 实时客流 {spot.liveCount.toLocaleString('zh-CN')}人</span>
                    <span>当前承载率：{spot.liveCrowd}% · {liveSnapshot.updatedAt}</span>
                    <span>推荐时段：{spot.bestTime}</span>
                    <button type="button" onClick={() => setSelectedSpot(spot)}>查看景点内页</button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
      <div className="map-caption">北京地图 · {liveSnapshot.updatedAt} 实时调度图层</div>
    </div>
  );
}

function AxisCanvas({ activeTab, selectedPlan, selectedSpot, setSelectedSpot, heatEnabled, liveSnapshot }) {
  const [stageView, setStageView] = useState('map');
  const activePlan = routePlans.find((plan) => plan.id === selectedPlan) || routePlans[0];
  const routeNames = getRouteNames(activePlan.path);
  const mode = activeTab === 'routes' ? 'routes' : activeTab === 'time' ? 'time' : activeTab === 'heatmap' || heatEnabled ? 'heatmap' : 'default';

  return (
    <main className="axis-stage">
      <div className="axis-toolbar">
        <span>{activeTab === 'heatmap' ? '拥挤程度热力图' : activeTab === 'routes' ? '智能路线推荐' : activeTab === 'time' ? '推荐游览时间' : '中轴线全域总览'}</span>
        <strong>景点内精准管控 + 景点间智能联动</strong>
      </div>

      <div className="compass-mark">北</div>

      <div className="stage-switch" aria-label="主视图切换">
        <button type="button" className={stageView === 'axis' ? 'active' : ''} onClick={() => setStageView('axis')}>示意</button>
        <button type="button" className={stageView === 'map' ? 'active' : ''} onClick={() => setStageView('map')}>地图</button>
      </div>

      {stageView === 'map' ? (
        <BeijingMapView activePlan={activePlan} heatEnabled={heatEnabled} setSelectedSpot={setSelectedSpot} liveSnapshot={liveSnapshot} />
      ) : (
        <div className="axis-visual code-built">
          <AxisDiagram mode={mode} onSelectSpot={setSelectedSpot} />
        </div>
      )}

      <div className="floating-legend">
        <b>景点位置</b>
        <span><i className="green" />舒适</span>
        <span><i className="yellow" />适中</span>
        <span><i className="red" />拥挤</span>
      </div>

      <div className="route-ribbon">
        <span>{activePlan.title}</span>
        <p>{routeNames}</p>
      </div>

      {selectedSpot && <SpotDetail spot={selectedSpot} onBack={() => setSelectedSpot(null)} />}
    </main>
  );
}

function SpotDetail({ spot, onBack }) {
  const meta = crowdMeta[spot.crowdLevel];

  return (
    <div className="detail-overlay">
      <aside className="detail-side">
        <button type="button" onClick={onBack} className="back-link">← 返回列表</button>
        <div className="detail-placeholder">正在查看详情页<br />详情内容覆盖全屏</div>
      </aside>
      <section className="detail-main">
        <div className="detail-header">
          <button type="button" onClick={onBack}>←</button>
          <h2>{spot.name === '午门' ? '故宫北门(神武门)' : spot.name}</h2>
        </div>
        <div className="detail-grid">
          <article className="blue-card">
            <h3>景点概况</h3>
            <p>{spot.description}</p>
            <div className="detail-tags">
              <span>建议游玩: 1.5 - 2 小时</span>
              <span>当前舒适度: {meta.text}</span>
            </div>
          </article>
          <article className="blue-card">
            <h3>分时段入园建议</h3>
            <div className="time-grid">
              <b>08:00-10:00 推荐</b>
              <span>10:00-12:00 较挤</span>
              <span>12:00-14:00 较挤</span>
              <span>14:00-16:00 较挤</span>
            </div>
          </article>
          <article className="blue-card">
            <h3>实时人流趋势</h3>
            <div className="mini-chart">
              <TrendChart values={spot.trend} />
            </div>
          </article>
          <article className="blue-card guide-card">
            <h3>内部游览路线</h3>
            <div className="guide-image code-guide">
              <GuideDiagram spot={spot} />
              <span>点击查看高清导览图</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedPlan, setSelectedPlan] = useState('classic');
  const [search, setSearch] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [heatEnabled, setHeatEnabled] = useState(true);
  const [seniorMode, setSeniorMode] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [tags, setTags] = useState(['历史建筑', '文化遗产']);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const liveSnapshot = getLiveSnapshot(now);

  if (!started) return <Splash onStart={() => setStarted(true)} />;

  return (
    <div className={`app-shell ${seniorMode ? 'senior-mode' : ''}`}>
      <SideNav activeTab={activeTab} onChange={setActiveTab} />
      <aside className="control-panel">
        {activeTab === 'explore' && <ExplorePanel search={search} setSearch={setSearch} setSelectedSpot={setSelectedSpot} liveSnapshot={liveSnapshot} />}
        {activeTab === 'routes' && <RoutesPanel selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />}
        {activeTab === 'heatmap' && <HeatPanel heatEnabled={heatEnabled} setHeatEnabled={setHeatEnabled} />}
        {activeTab === 'time' && <TimePanel />}
        {activeTab === 'user' && <UserPanel seniorMode={seniorMode} setSeniorMode={setSeniorMode} tags={tags} setTags={setTags} />}
      </aside>
      <AxisCanvas
        activeTab={activeTab}
        selectedPlan={selectedPlan}
        selectedSpot={selectedSpot}
        setSelectedSpot={setSelectedSpot}
        heatEnabled={heatEnabled}
        liveSnapshot={liveSnapshot}
      />
    </div>
  );
}

export default App;
