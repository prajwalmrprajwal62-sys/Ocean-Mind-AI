import { useState, useEffect, useMemo } from 'react';
import { 
  Cloud, 
  Droplets, 
  Wind, 
  MapPin, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Sun, 
  CloudRain, 
  CloudLightning, 
  Thermometer,
  Compass,
  Gauge,
  Waves,
  Moon
} from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { getWeatherData, WeatherData } from '../services/weatherService';
import { motion } from 'motion/react';

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'forecast' | 'safety' | 'tides'>('current');
  const [tideTime, setTideTime] = useState(new Date());

  // Simulation for real-time tide fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setTideTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const moonInfo = useMemo(() => {
    const date = tideTime;
    const lp = 2551443; 
    const now = date.getTime();
    const newMoon = new Date(1970, 0, 7, 20, 35, 0).getTime();
    const phase = ((now - newMoon) % lp) / lp;
    
    let label = "";
    let illumination = 0;
    
    if (phase < 0.0625 || phase > 0.9375) { label = "New Moon"; illumination = 0; }
    else if (phase < 0.1875) { label = "Waxing Crescent"; illumination = 25; }
    else if (phase < 0.3125) { label = "First Quarter"; illumination = 50; }
    else if (phase < 0.4375) { label = "Waxing Gibbous"; illumination = 75; }
    else if (phase < 0.5625) { label = "Full Moon"; illumination = 100; }
    else if (phase < 0.6875) { label = "Waning Gibbous"; illumination = 75; }
    else if (phase < 0.8125) { label = "Last Quarter"; illumination = 50; }
    else { label = "Waning Crescent"; illumination = 25; }

    return { label, illumination: Math.round(illumination + (Math.random() * 5)) };
  }, [tideTime.getDate()]);

  const currentTideHeight = useMemo(() => {
    const hours = tideTime.getHours() + tideTime.getMinutes() / 60 + tideTime.getSeconds() / 3600;
    return (2.0 + Math.sin((hours * Math.PI / 6) - (Math.PI / 2)) * 1.2).toFixed(2);
  }, [tideTime]);

  const fetchWeather = async (useDefault = false) => {
    setLoading(true);
    setError(null);
    
    if (useDefault) {
      try {
        // Fallback to Mumbai Harbor
        const data = await getWeatherData(18.94, 72.84);
        setWeather(data);
        setLastUpdated(new Date());
      } catch (err: any) {
        setError(err.message || "Failed to fetch weather data");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await getWeatherData(position.coords.latitude, position.coords.longitude);
            setWeather(data);
            setLastUpdated(new Date());
          } catch (err: any) {
            setError(err.message || "Failed to fetch weather data");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.warn("Geolocation error:", err);
          setError("Location access denied. Using default location (Mumbai Harbor).");
          fetchWeather(true);
        },
        { timeout: 10000 }
      );
    } catch (err: any) {
      setError(err.message);
      fetchWeather(true);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const renderTabContent = () => {
    if (!weather) return null;

    switch (activeTab) {
      case 'current':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Weather Card */}
            <Card className="lg:col-span-2 p-8 border-[#1A1A1A] bg-[#0A0A0A] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Waves size={200} className="text-[#D1FF4D]" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[#D1FF4D] mb-4">
                  <MapPin size={16} />
                  <span className="text-sm font-black uppercase tracking-widest">{weather.city}</span>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
                  <h2 className="text-9xl font-black tracking-tighter text-white">
                    {weather.temp}°
                  </h2>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                      <img 
                        src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`} 
                        alt={weather.description}
                        className="w-24 h-24 drop-shadow-[0_0_20px_rgba(209,255,77,0.4)]"
                      />
                      <div>
                        <p className="text-2xl font-black uppercase tracking-tight text-white">{weather.description}</p>
                        <Badge variant="accent" className="mt-1">Optimal Conditions</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Droplets className="text-[#00CCFF] mb-2" size={20} />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Humidity</p>
                    <p className="text-xl font-black text-white">{weather.humidity}%</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Wind className="text-[#FFFF00] mb-2" size={20} />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Wind Speed</p>
                    <p className="text-xl font-black text-white">{weather.windSpeed} m/s</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Gauge className="text-[#FF00FF] mb-2" size={20} />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pressure</p>
                    <p className="text-xl font-black text-white">{weather.pressure} hPa</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Thermometer className="text-[#FF6600] mb-2" size={20} />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Feels Like</p>
                    <p className="text-xl font-black text-white">{weather.temp}°C</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="border-[#1A1A1A]">
                <h3 className="text-lg font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Compass size={20} /> Regional Stations
                </h3>
                <div className="space-y-3">
                  {['Mumbai Harbor', 'Goa Coast', 'Chennai Port', 'Kochi Inlet'].map((station) => (
                    <div key={station} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5 hover:border-[#D1FF4D]/30 transition-colors cursor-pointer group">
                      <span className="text-xs font-bold uppercase tracking-tight text-gray-400 group-hover:text-white">{station}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#D1FF4D]">28°C</span>
                        <div className="w-1.5 h-1.5 bg-[#D1FF4D] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        );
      case 'forecast':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <Card key={day} className="p-6 border-[#1A1A1A] bg-[#0A0A0A] hover:border-[#D1FF4D]/30 transition-all">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                  {new Date(Date.now() + day * 24 * 60 * 60 * 1000).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Cloud className="text-gray-400" size={32} />
                    <div>
                      <p className="text-2xl font-black text-white">{28 + Math.floor(Math.random() * 5)}°</p>
                      <p className="text-[10px] font-bold uppercase text-gray-500">Partly Cloudy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[#00CCFF] uppercase">12% Rain</p>
                    <p className="text-[10px] font-bold text-[#FFFF00] uppercase">8 m/s Wind</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );
      case 'safety':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-[#D1FF4D]/30 bg-[#D1FF4D]/5 p-8">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#D1FF4D] mb-6 flex items-center gap-3">
                <ShieldCheck size={24} /> Marine Safety Advisory
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[#D1FF4D] rounded-full mt-2 shadow-[0_0_10px_#D1FF4D]" />
                  <div>
                    <h4 className="text-sm font-black uppercase text-white mb-1">Safe Navigation</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Current wind speeds are within safe limits for small to medium vessels. No major storm systems detected within 100 nautical miles.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-[#D1FF4D] rounded-full mt-2 shadow-[0_0_10px_#D1FF4D]" />
                  <div>
                    <h4 className="text-sm font-black uppercase text-white mb-1">Visibility Status</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {weather.description.includes('clear') ? 'Excellent' : 'Moderate'} visibility reported for coastal operations. Fog index is low (0.12).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shadow-[0_0_10px_#f97316]" />
                  <div>
                    <h4 className="text-sm font-black uppercase text-white mb-1">UV Radiation</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      High UV index (8.5). Protective gear and sunblock recommended for deck operations between 10:00 and 16:00.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-[#1A1A1A] bg-[#0A0A0A] p-8">
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-6 flex items-center gap-3">
                <AlertCircle size={24} className="text-red-500" /> Emergency Protocols
              </h3>
              <div className="space-y-4">
                <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">Coast Guard Channel</p>
                  <p className="text-xl font-black text-white">VHF CHANNEL 16</p>
                </div>
                <div className="p-4 border border-white/5 bg-white/5 rounded-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Nearest Rescue Station</p>
                  <p className="text-xl font-black text-white">Mumbai Central Station</p>
                  <p className="text-[10px] font-mono text-gray-500 mt-1">COORD: 18.9218° N, 72.8347° E</p>
                </div>
                <Button variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white">
                  View Full Safety Protocol
                </Button>
              </div>
            </Card>
          </div>
        );
      case 'tides':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-8 border-[#1A1A1A] bg-[#0A0A0A]">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Waves className="text-[#00CCFF]" size={24} />
                  <h3 className="text-xl font-black uppercase tracking-tight">Tide Cycle Analysis</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Height</p>
                  <p className="text-2xl font-black text-[#00CCFF] tracking-tighter">{currentTideHeight}m</p>
                </div>
              </div>
              
              <div className="space-y-12">
                <div className="relative h-40 flex items-end gap-1">
                  {[...Array(24)].map((_, i) => {
                    const currentHour = tideTime.getHours();
                    const height = 20 + Math.sin((i * Math.PI / 6) - (Math.PI / 2)) * 30 + 30;
                    const isPast = i < currentHour;
                    const isCurrent = i === currentHour;

                    return (
                      <div 
                        key={i} 
                        className={`flex-1 transition-all relative group ${
                          isCurrent ? 'bg-[#D1FF4D] shadow-[0_0_15px_#D1FF4D]' : 
                          isPast ? 'bg-[#00CCFF]/10' : 'bg-[#00CCFF]/40 hover:bg-[#00CCFF]'
                        }`}
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[8px] font-mono text-[#00CCFF] whitespace-nowrap">
                          {i}:00 | {(2.0 + Math.sin((i * Math.PI / 6) - (Math.PI / 2)) * 1.2).toFixed(1)}m
                        </div>
                        {isCurrent && (
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-[#D1FF4D]">NOW</div>
                        )}
                      </div>
                    );
                  })}
                  <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-white/10" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Next High Tide</p>
                    <p className="text-xl font-black text-white">14:45</p>
                    <p className="text-[10px] font-mono text-[#00CCFF]">3.2 METERS</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Next Low Tide</p>
                    <p className="text-xl font-black text-white">20:30</p>
                    <p className="text-[10px] font-mono text-gray-500">0.8 METERS</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Tidal Range</p>
                    <p className="text-xl font-black text-white">2.4m</p>
                    <Badge variant="outline" className="text-[8px]">MODERATE</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Current Phase</p>
                    <p className="text-xl font-black text-white">
                      {Math.sin((tideTime.getHours() * Math.PI / 6) - (Math.PI / 2)) > Math.sin(((tideTime.getHours() - 0.1) * Math.PI / 6) - (Math.PI / 2)) ? 'Flooding' : 'Ebbing'}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 uppercase">
                      {Math.sin((tideTime.getHours() * Math.PI / 6) - (Math.PI / 2)) > Math.sin(((tideTime.getHours() - 0.1) * Math.PI / 6) - (Math.PI / 2)) ? 'Incoming Flow' : 'Outgoing Flow'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-[#1A1A1A] bg-[#0A0A0A] p-8">
              <h3 className="text-lg font-black uppercase tracking-tight mb-6">Lunar Influence</h3>
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-[#1A1A1A] overflow-hidden border border-white/5">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-400"
                      animate={{ 
                        clipPath: moonInfo.illumination > 50 
                          ? `inset(0 0 0 ${100 - moonInfo.illumination}%)`
                          : `inset(0 ${50 - moonInfo.illumination}% 0 0)`
                      }}
                    />
                  </div>
                  <Moon className="absolute -top-2 -right-2 text-gray-600" size={16} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black uppercase text-white">{moonInfo.label}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{moonInfo.illumination}% Illumination</p>
                </div>
                <div className="w-full space-y-3 pt-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-500">Moonrise</span>
                    <span className="text-white">11:24</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-500">Moonset</span>
                    <span className="text-white">00:15</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 grid-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Marine Weather Station</h1>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
              Real-time environmental monitoring for ocean safety
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-[10px] font-mono text-gray-600 uppercase">
                Last Sync: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button 
              onClick={() => fetchWeather()} 
              variant="outline" 
              className="text-[10px] h-8"
              disabled={loading}
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh Data
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#1A1A1A] pb-4">
          {[
            { id: 'current', label: 'Current Conditions', icon: <Sun size={14} /> },
            { id: 'forecast', label: '7-Day Forecast', icon: <CloudRain size={14} /> },
            { id: 'safety', label: 'Marine Safety', icon: <ShieldCheck size={14} /> },
            { id: 'tides', label: 'Tide Cycle', icon: <Waves size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#D1FF4D] text-black shadow-[0_0_15px_rgba(209,255,77,0.3)]' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#D1FF4D]" size={48} />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">Synchronizing with Satellite Data...</p>
          </div>
        ) : error ? (
          <Card className="max-w-md mx-auto text-center p-12 border-red-500/30 bg-red-500/5">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2">Connection Error</h2>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <Button onClick={() => fetchWeather()}>Retry Connection</Button>
          </Card>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ShieldCheck({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
