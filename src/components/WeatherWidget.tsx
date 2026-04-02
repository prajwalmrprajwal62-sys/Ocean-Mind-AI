import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from './UI';
import { getWeatherData, WeatherData } from '../services/weatherService';
import { motion } from 'motion/react';

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await getWeatherData(position.coords.latitude, position.coords.longitude);
            setWeather(data);
          } catch (err: any) {
            setError(err.message || "Failed to fetch weather data");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError("Location access denied. Please enable location to see local weather.");
          setLoading(false);
        }
      );
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <Card className="border-[#1A1A1A] bg-[#0A0A0A] flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-[#D1FF4D]" size={24} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[#1A1A1A] bg-[#0A0A0A] p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <AlertCircle className="text-red-500" size={24} />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
            {error}
          </p>
          <button 
            onClick={fetchWeather}
            className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#D1FF4D] hover:underline flex items-center gap-1"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="border-[#1A1A1A] bg-[#0A0A0A] overflow-hidden group hover:border-[#D1FF4D]/30 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <MapPin size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">{weather.city}</span>
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter">
            {weather.temp}°<span className="text-2xl text-gray-500">C</span>
          </h2>
        </div>
        <div className="relative">
          <img 
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
            alt={weather.description}
            className="w-16 h-16 drop-shadow-[0_0_15px_rgba(209,255,77,0.3)]"
          />
          <div className="absolute -bottom-2 right-0 text-[8px] font-black uppercase tracking-widest text-[#D1FF4D]">
            {weather.description}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
          <div className="p-2 bg-black rounded-lg text-[#00CCFF]">
            <Droplets size={14} />
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Humidity</p>
            <p className="text-sm font-black text-white">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
          <div className="p-2 bg-black rounded-lg text-[#FFFF00]">
            <Wind size={14} />
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Wind</p>
            <p className="text-sm font-black text-white">{weather.windSpeed} <span className="text-[8px]">m/s</span></p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#1A1A1A] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#D1FF4D] rounded-full animate-pulse" />
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Live Marine Data</span>
        </div>
        <p className="text-[8px] font-mono text-gray-600 uppercase">Pressure: {weather.pressure} hPa</p>
      </div>
    </Card>
  );
}
