import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { Card, Badge, Button } from '../components/UI';
import { COASTAL_REGIONS } from '../constants';
import { AlertTriangle, ShieldCheck, Fish, Info, Filter, Layers, Activity, TrendingUp, TrendingDown, ChevronRight, BarChart3, AlertCircle as AlertIcon } from 'lucide-react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { getPollutionForecast, getRiskLevel } from '../services/pollutionService';
import { getHabitats } from '../services/biodiversityService';

// Fix for default marker icons in Leaflet
const DefaultIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #D1FF4D; width: 12px; height: 12px; border-radius: 50%; border: 2px solid black; box-shadow: 0 0 10px #D1FF4D;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function OceanMapPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showPredictions, setShowPredictions] = useState(false);
  const [showBiodiversity, setShowBiodiversity] = useState(true);
  const [forecastDay, setForecastDay] = useState(0);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const habitats = getHabitats();

  useEffect(() => {
    // Query standard reports
    const qReports = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribeReports = onSnapshot(qReports, (snapshot) => {
      const standardReports = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          // Ensure location is in the right format if it's flat
          location: data.location || { lat: data.latitude, lng: data.longitude }
        };
      });
      
      setReports(prev => {
        const pollutionOnly = prev.filter(r => r.isPollutionOnly);
        return [...pollutionOnly, ...standardReports];
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reports');
    });

    // Query specific pollution reports
    const qPollution = query(collection(db, 'pollutionReports'), orderBy('createdAt', 'desc'));
    const unsubscribePollution = onSnapshot(qPollution, (snapshot) => {
      const pollutionReports = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          type: 'pollution',
          isPollutionOnly: true,
          location: { lat: data.latitude, lng: data.longitude },
          severity: data.intensity > 7 ? 'high' : data.intensity > 4 ? 'medium' : 'low',
          category: 'pollution_incident'
        };
      });

      setReports(prev => {
        const standardOnly = prev.filter(r => !r.isPollutionOnly);
        return [...standardOnly, ...pollutionReports];
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pollutionReports');
    });
    
    setForecastData(getPollutionForecast(7));
    return () => {
      unsubscribeReports();
      unsubscribePollution();
    };
  }, []);

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.type === filter);

  const getRegionForecast = (regionId: string) => {
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + forecastDay);
    const dateStr = targetDate.toISOString().split('T')[0];
    return forecastData.find(f => f.regionId === regionId && f.date === dateStr);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-black text-white selection:bg-[#D1FF4D] selection:text-black">
      {/* Sidebar Controls */}
      <div className="w-full md:w-96 bg-[#050505] border-r border-[#1A1A1A] p-6 overflow-y-auto space-y-8 z-10 grid-pattern">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[#D1FF4D] rounded-full animate-pulse shadow-[0_0_8px_#D1FF4D]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D1FF4D]">Live Intelligence</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Ocean Map</h2>
          <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Marine Risk & Biodiversity Feed</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter size={14} />
            <label className="text-[10px] font-bold uppercase tracking-widest">Intelligence Layers</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['all', 'pollution', 'biodiversity', 'resource'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`p-3 border border-[#1A1A1A] font-bold uppercase text-[10px] tracking-widest transition-all ${filter === f ? 'bg-[#D1FF4D] text-black shadow-[0_0_15px_rgba(209,255,77,0.3)]' : 'bg-black text-gray-500 hover:border-[#D1FF4D]/30 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Fish size={14} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Biodiversity Layers</h3>
            </div>
            <button 
              onClick={() => setShowBiodiversity(!showBiodiversity)}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${showBiodiversity ? 'text-blue-400' : 'text-gray-600'}`}
            >
              {showBiodiversity ? 'VISIBLE' : 'HIDDEN'}
            </button>
          </div>
          
          {showBiodiversity && (
            <div className="grid grid-cols-3 gap-2">
              {['coral', 'mangrove', 'seagrass'].map(type => (
                <div key={type} className="p-2 bg-black border border-[#1A1A1A] text-center">
                  <div className={`w-1 h-1 mx-auto mb-1 rounded-full ${type === 'coral' ? 'bg-pink-500' : type === 'mangrove' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                  <span className="text-[8px] font-bold uppercase tracking-tighter text-gray-500">{type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-400">
              <Activity size={14} />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">7-Day Forecast</h3>
            </div>
            <button 
              onClick={() => setShowPredictions(!showPredictions)}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${showPredictions ? 'text-[#D1FF4D]' : 'text-gray-600'}`}
            >
              {showPredictions ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
          
          {showPredictions && (
            <div className="space-y-4 p-4 bg-black border border-[#D1FF4D]/20 animate-in fade-in slide-in-from-top-2">
              <input 
                type="range" 
                min="0" 
                max="6" 
                value={forecastDay} 
                onChange={(e) => setForecastDay(parseInt(e.target.value))}
                className="w-full h-1 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#D1FF4D]"
              />
              <div className="flex justify-between text-[9px] font-mono text-gray-500">
                <span>TODAY</span>
                <span>+{forecastDay} DAYS</span>
                <span>+7D</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Layers size={14} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Hotspot Legend</h3>
          </div>
          <div className="space-y-3 p-4 bg-black border border-[#1A1A1A]">
            {[
              { color: '#FF4444', label: 'Pollution High Risk' },
              { color: '#D1FF4D', label: 'Biodiversity Sighting' },
              { color: '#3b82f6', label: 'Wildlife SOS Alert' },
              { color: '#ec4899', label: 'Coral Reef Zone' },
              { color: '#10b981', label: 'Mangrove Forest' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                <span className="text-[10px] font-bold uppercase tracking-tight text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedRegion ? (
            <motion.div
              key={selectedRegion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="border-[#D1FF4D]/20 bg-[#D1FF4D]/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={80} strokeWidth={1} className="text-[#D1FF4D]" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#D1FF4D] mb-1">Region Intelligence</p>
                      <h4 className="text-xl font-black uppercase tracking-tighter text-white">{selectedRegion.name}</h4>
                    </div>
                    <button onClick={() => setSelectedRegion(null)} className="text-gray-600 hover:text-white"><ChevronRight size={20} /></button>
                  </div>

                  {showPredictions ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Risk Forecast</span>
                        <Badge style={{ backgroundColor: getRiskLevel(getRegionForecast(selectedRegion.id)?.riskScore || 0).color }} className="text-black border-none">
                          {getRiskLevel(getRegionForecast(selectedRegion.id)?.riskScore || 0).label}
                        </Badge>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white leading-none">{getRegionForecast(selectedRegion.id)?.riskScore}</span>
                        <span className="text-[10px] font-mono text-gray-500 mb-1">/100 RISK_INDEX</span>
                      </div>
                      <p className="text-[10px] font-medium text-gray-400 italic leading-relaxed">
                        "{getRegionForecast(selectedRegion.id)?.reason}"
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Health Score</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            selectedRegion.trend === 'improving' ? 'text-[#D1FF4D]' : 
                            selectedRegion.trend === 'declining' ? 'text-red-500' : 'text-blue-400'
                          }`}>
                            {selectedRegion.trend}
                          </span>
                          {selectedRegion.trend === 'improving' ? <TrendingUp size={12} className="text-[#D1FF4D]" /> : 
                           selectedRegion.trend === 'declining' ? <TrendingDown size={12} className="text-red-500" /> : 
                           <Activity size={12} className="text-blue-400" />}
                        </div>
                      </div>
                      
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white leading-none">{selectedRegion.healthScore}</span>
                        <span className="text-[10px] font-mono text-gray-500 mb-1">/100 HEALTH_INDEX</span>
                      </div>

                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full shadow-[0_0_10px_currentColor] ${
                            selectedRegion.healthScore > 75 ? 'text-[#D1FF4D] bg-[#D1FF4D]' : 
                            selectedRegion.healthScore > 50 ? 'text-blue-400 bg-blue-400' : 'text-red-500 bg-red-500'
                          }`} 
                          style={{ width: `${selectedRegion.healthScore}%` }} 
                        />
                      </div>

                      <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Top Threats</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedRegion.threats.map((threat: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-[8px] border-white/10 text-gray-400">
                              {threat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t border-white/10 flex gap-2">
                    <Link to="/health" className="flex-1">
                      <Button variant="outline" className="w-full text-[10px] py-2 flex items-center justify-center gap-2">
                        <BarChart3 size={12} />
                        Health Report
                      </Button>
                    </Link>
                    <Button className="flex-1 text-[10px] py-2">Intervene</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="p-6 border border-dashed border-[#1A1A1A] text-center">
              <Info size={24} className="mx-auto text-gray-600 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Select a region marker to view tactical metrics</p>
            </div>
          )}
        </AnimatePresence>

        <div className="p-4 bg-black border border-[#1A1A1A] font-mono text-[10px] text-gray-500 space-y-1">
          <div className="flex justify-between"><span>SYSTEM_STATUS:</span> <span className="text-[#D1FF4D]">ACTIVE</span></div>
          <div className="flex justify-between"><span>DATA_NODES:</span> <span>128_CONNECTED</span></div>
          <div className="flex justify-between"><span>LAST_SYNC:</span> <span>{new Date().toLocaleTimeString()}</span></div>
          <div className="flex justify-between"><span>LATENCY:</span> <span>12ms</span></div>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative z-0">
        {/* @ts-ignore */}
        <MapContainer center={[15.0, 78.0]} zoom={5} style={{ height: '100%', width: '100%', background: '#000' }}>
          {/* @ts-ignore */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            /* @ts-ignore */
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {/* Prediction Heatmap Overlay */}
          {showPredictions && COASTAL_REGIONS.map(region => {
            const forecast = getRegionForecast(region.id);
            if (!forecast) return null;
            return (
              <Circle
                key={`forecast-${region.id}`}
                center={[region.lat, region.lng]}
                /* @ts-ignore */
                radius={50000}
                pathOptions={{
                  fillColor: getRiskLevel(forecast.riskScore).color,
                  fillOpacity: 0.2,
                  color: getRiskLevel(forecast.riskScore).color,
                  weight: 1,
                  dashArray: '5, 10'
                }}
              />
            );
          })}
          
          {/* Habitat Layers */}
          {showBiodiversity && habitats.map(habitat => (
            <Circle
              key={habitat.id}
              center={[habitat.location.lat, habitat.location.lng]}
              /* @ts-ignore */
              radius={15000}
              pathOptions={{
                color: habitat.type === 'coral' ? '#ec4899' : habitat.type === 'mangrove' ? '#10b981' : '#06b6d4',
                fillColor: habitat.type === 'coral' ? '#ec4899' : habitat.type === 'mangrove' ? '#10b981' : '#06b6d4',
                fillOpacity: 0.15,
                weight: 1,
                dashArray: '5, 5'
              }}
            >
              {/* @ts-ignore */}
              <Popup className="dark-popup">
                <div className="p-2 min-w-[150px] bg-black text-white">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-black uppercase tracking-tighter text-lg">{habitat.type}</h4>
                    <Badge variant={habitat.healthScore < 50 ? 'accent' : 'outline'}>{habitat.healthScore}% HEALTH</Badge>
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Threat: {habitat.threatLevel}</p>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${habitat.healthScore < 50 ? 'bg-red-500' : 'bg-[#D1FF4D]'}`} style={{ width: `${habitat.healthScore}%` }} />
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
          
          {/* Region Markers */}
          {COASTAL_REGIONS.map(r => (
            <Marker key={r.id} position={[r.lat, r.lng]} eventHandlers={{ click: () => setSelectedRegion(r) }}>
              {/* @ts-ignore */}
              <Popup className="dark-popup">
                <div className="p-2 min-w-[180px] bg-black text-white">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black uppercase tracking-tighter text-lg">{r.name}</h4>
                    <Badge 
                      variant={r.healthScore > 75 ? 'outline' : 'accent'} 
                      className={r.healthScore > 75 ? 'text-[#D1FF4D] border-[#D1FF4D]/30' : ''}
                    >
                      {r.healthScore}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Trend</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${
                          r.trend === 'improving' ? 'text-[#D1FF4D]' : 
                          r.trend === 'declining' ? 'text-red-500' : 'text-blue-400'
                        }`}>
                          {r.trend}
                        </span>
                        {r.trend === 'improving' ? <TrendingUp size={10} className="text-[#D1FF4D]" /> : 
                         r.trend === 'declining' ? <TrendingDown size={10} className="text-red-500" /> : 
                         <Activity size={10} className="text-blue-400" />}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Top Threats</p>
                      <div className="flex flex-wrap gap-1">
                        {r.threats.slice(0, 2).map((threat, i) => (
                          <span key={i} className="text-[8px] text-gray-400 border border-white/10 px-1 rounded">
                            {threat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/10">
                    <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">Click for full tactical metrics</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Incident Reports */}
          {filteredReports.map(report => (
            <Circle
              key={report.id}
              center={[report.location.lat, report.location.lng]}
              /* @ts-ignore */
              radius={report.type === 'wildlife' && report.severity === 'high' ? 12000 : 8000}
              pathOptions={{
                color: report.type === 'pollution' ? '#FF4444' : report.type === 'wildlife' ? (report.severity === 'high' ? '#3b82f6' : '#D1FF4D') : '#FFA500',
                fillColor: report.type === 'pollution' ? '#FF4444' : report.type === 'wildlife' ? (report.severity === 'high' ? '#3b82f6' : '#D1FF4D') : '#FFA500',
                fillOpacity: report.type === 'wildlife' && report.severity === 'high' ? 0.6 : 0.3,
                weight: report.type === 'wildlife' && report.severity === 'high' ? 3 : 1,
                dashArray: report.type === 'wildlife' && report.severity === 'high' ? '5, 5' : 'none'
              }}
            >
              {/* @ts-ignore */}
              <Popup className="dark-popup">
                <div className="p-2 max-w-[200px] bg-black text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={report.severity === 'high' ? 'accent' : 'outline'}>{report.type}</Badge>
                    {report.type === 'wildlife' && report.severity === 'high' && (
                      <span className="text-[10px] font-black text-blue-400 animate-pulse">SOS_ALERT</span>
                    )}
                  </div>
                  <h4 className="font-bold uppercase tracking-tight">{report.species || report.category?.replace('_', ' ')}</h4>
                  {report.condition && (
                    <p className="text-[10px] font-bold uppercase text-blue-400 mt-1">Condition: {report.condition}</p>
                  )}
                  <p className="text-[10px] mt-2 text-gray-400 italic leading-relaxed">{report.description}</p>
                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-bold text-[#D1FF4D]">VERIFIED</span>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>

        {/* Floating Map Legend Overlay */}
        <div className="absolute top-6 right-6 z-[1000] space-y-3 hidden sm:block">
          <div className="bg-black/60 backdrop-blur-md p-3 border border-[#D1FF4D]/30 shadow-[0_0_20px_rgba(209,255,77,0.1)] flex items-center gap-3">
            <div className="w-2 h-2 bg-[#D1FF4D] rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Live Prediction Layer: ON</span>
          </div>
        </div>
      </div>

      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #000;
          color: #fff;
          border: 1px solid #1A1A1A;
          border-radius: 0;
        }
        .dark-popup .leaflet-popup-tip {
          background: #000;
          border: 1px solid #1A1A1A;
        }
        .leaflet-container {
          background: #000 !important;
        }
      `}</style>
    </div>
  );
}
