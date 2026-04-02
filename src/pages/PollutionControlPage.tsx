import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Camera, 
  Send, 
  TrendingUp, 
  Activity,
  Layers,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { Card, Button } from '../components/UI';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

// Fix Leaflet marker icon issue using CDN
let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapContainerAny = MapContainer as any;
const TileLayerAny = TileLayer as any;
const PopupAny = Popup as any;
const CircleMarkerAny = CircleMarker as any;

interface PollutionReport {
  id: string;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl: string;
  createdAt: any;
  userId: string;
  intensity: number;
}

// Component to handle map center updates
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function PollutionControlPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]); // Default to Bangalore or some coastal area
  const [showReportForm, setShowReportForm] = useState(false);
  
  // Form State
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intensity, setIntensity] = useState(5);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // AI Prediction State
  const [prediction, setPrediction] = useState<number | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'pollutionReports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let createdAt = new Date();
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            createdAt = data.createdAt;
          } else if (typeof data.createdAt === 'string' || typeof data.createdAt === 'number') {
            createdAt = new Date(data.createdAt);
          }
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt
        } as PollutionReport;
      });
      setReports(reportsData);
      
      if (reportsData.length > 0) {
        calculatePrediction(reportsData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pollutionReports');
    });

    return () => unsubscribe();
  }, []);

  const calculatePrediction = (data: PollutionReport[]) => {
    if (data.length < 2) return;

    // Simple Linear Regression on report count over time (grouped by day)
    const dailyCounts: { [key: string]: number } = {};
    data.forEach(r => {
      const date = r.createdAt.toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const dates = Object.keys(dailyCounts).sort();
    const x = dates.map((_, i) => i);
    const y = dates.map(d => dailyCounts[d]);

    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
    }

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Predict next day
    const nextVal = m * n + b;
    setPrediction(Math.max(0, Math.round(nextVal * 10) / 10));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude.toFixed(6));
        setLng(longitude.toFixed(6));
        setMapCenter([latitude, longitude]);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location", error);
        let msg = "Could not retrieve your location";
        if (error.code === 1) msg = "Location permission denied";
        else if (error.code === 2) msg = "Location unavailable";
        else if (error.code === 3) msg = "Location request timed out";
        
        setLocationError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = async () => {
    if (!user || !lat || !lng || !description) return;
    setIsSubmitting(true);

    try {
      const reportData = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        description,
        imageUrl: image || '',
        createdAt: Timestamp.now(),
        userId: user.uid,
        intensity: intensity
      };

      // 1. Firestore
      await addDoc(collection(db, 'pollutionReports'), reportData);

      // 2. Backend API
      try {
        await fetch('/api/pollution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });
      } catch (apiErr) {
        console.error("API failed", apiErr);
      }

      setShowReportForm(false);
      setLat('');
      setLng('');
      setDescription('');
      setImage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'pollutionReports');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get color based on intensity
  const getIntensityColor = (val: number) => {
    if (val > 8) return '#FF0000'; // Critical
    if (val > 5) return '#FF8800'; // High
    if (val > 3) return '#FFFF00'; // Medium
    return '#00FF00'; // Low
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#0A0A0A] border-b border-[#1A1A1A] p-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#D1FF4D]/10 rounded-xl">
            <Activity className="text-[#D1FF4D]" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Pollution <span className="text-[#D1FF4D]">Control</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Marine Monitoring System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {prediction !== null && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-[#1A1A1A] rounded-full">
              <TrendingUp size={14} className="text-[#D1FF4D]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">AI Prediction:</span>
              <span className="text-xs font-black text-[#D1FF4D]">{prediction} reports/day expected</span>
            </div>
          )}
          <Button 
            onClick={() => setShowReportForm(true)}
            className="bg-[#D1FF4D] text-black px-6 py-2 rounded-full font-black uppercase text-xs hover:shadow-[0_0_20px_rgba(209,255,77,0.3)]"
          >
            Report Pollution
          </Button>
        </div>
      </div>

      {/* Main Content: Map + Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Map Container */}
        <div className="flex-1 h-[50vh] md:h-auto z-0">
          <MapContainerAny 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%', background: '#000' }}
            zoomControl={false}
          >
            <ChangeView center={mapCenter} />
            <TileLayerAny
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {/* Markers */}
            {reports.map((report) => (
              <Marker 
                key={report.id} 
                position={[report.latitude, report.longitude]}
              >
                <PopupAny className="custom-popup">
                  <div className="bg-[#0A0A0A] text-white p-2 rounded-lg border border-[#1A1A1A] min-w-[200px]">
                    {report.imageUrl && (
                      <img 
                        src={report.imageUrl} 
                        alt="Pollution" 
                        className="w-full h-32 object-cover rounded-md mb-2"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <p className="text-xs font-bold mb-1">{report.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[9px] uppercase tracking-widest text-gray-500">
                        {report.createdAt.toLocaleDateString()}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#D1FF4D]/20 text-[#D1FF4D]">
                        INTENSITY: {report.intensity}
                      </span>
                    </div>
                  </div>
                </PopupAny>
              </Marker>
            ))}

            {/* Heatmap-like Circles */}
            {reports.map((report) => (
              <CircleMarkerAny
                key={`heat-${report.id}`}
                center={[report.latitude, report.longitude]}
                radius={20 + report.intensity * 5}
                pathOptions={{
                  fillColor: getIntensityColor(report.intensity),
                  fillOpacity: 0.15,
                  color: 'transparent',
                  stroke: false
                }}
              />
            ))}
          </MapContainerAny>
        </div>

        {/* Sidebar: Recent Reports */}
        <div className="w-full md:w-80 bg-[#0A0A0A] border-l border-[#1A1A1A] overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Live Feed</h3>
            <span className="text-[10px] font-bold text-[#D1FF4D]">{reports.length} Reports</span>
          </div>

          {reports.map((report) => (
            <motion.div 
              key={report.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-black border border-[#1A1A1A] rounded-xl hover:border-[#D1FF4D]/30 transition-all cursor-pointer group"
              onClick={() => setMapCenter([report.latitude, report.longitude])}
            >
              <div className="flex gap-3">
                {report.imageUrl ? (
                  <img src={report.imageUrl} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                    <AlertTriangle size={16} className="text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate group-hover:text-[#D1FF4D] transition-colors">{report.description}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-tighter mt-1">
                    {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Report Form Modal */}
      <AnimatePresence>
        {showReportForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportForm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0A0A] border border-[#1A1A1A] p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#D1FF4D]/10 rounded-lg">
                      <MapPin className="text-[#D1FF4D]" size={20} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Submit Report</h2>
                  </div>
                  <button onClick={() => setShowReportForm(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Latitude</label>
                    <input 
                      type="text" 
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="0.000000"
                      className="w-full p-4 bg-black border border-[#1A1A1A] font-mono text-sm text-white focus:outline-none focus:border-[#D1FF4D]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Longitude</label>
                    <input 
                      type="text" 
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="0.000000"
                      className="w-full p-4 bg-black border border-[#1A1A1A] font-mono text-sm text-white focus:outline-none focus:border-[#D1FF4D]"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleUseMyLocation}
                  variant="outline"
                  disabled={isLocating}
                  className={`w-full flex items-center justify-center gap-2 py-3 border-dashed transition-all ${locationError ? 'border-red-500 text-red-500' : 'border-gray-700 text-gray-400 hover:text-[#D1FF4D] hover:border-[#D1FF4D]'}`}
                >
                  <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {isLocating ? 'Acquiring Signal...' : locationError || 'Use My Current Location'}
                  </span>
                </Button>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the pollution type (oil spill, plastic accumulation, etc.)"
                    rows={3}
                    className="w-full p-4 bg-black border border-[#1A1A1A] text-sm text-white focus:outline-none focus:border-[#D1FF4D] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Pollution Intensity (1-10)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="flex-1 accent-[#D1FF4D]"
                    />
                    <span className="text-xl font-black text-[#D1FF4D] w-8">{intensity}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Evidence Image</label>
                  <div className="relative group cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-40 bg-black border border-dashed border-[#1A1A1A] rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-[#D1FF4D]/50 transition-all">
                      {image ? (
                        <img src={image} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                      ) : (
                        <>
                          <Camera size={32} className="text-gray-700 group-hover:text-[#D1FF4D] transition-colors" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Click to upload photo</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmitReport}
                  disabled={isSubmitting || !lat || !lng || !description}
                  className="w-full py-4 bg-[#D1FF4D] text-black flex items-center justify-center gap-3"
                >
                  <Send size={18} />
                  <span className="font-black uppercase tracking-tighter text-lg">
                    {isSubmitting ? 'Transmitting...' : 'Submit Report'}
                  </span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent;
          padding: 0;
          box-shadow: none;
        }
        .custom-popup .leaflet-popup-tip {
          background: #0A0A0A;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
