import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Droplets, Leaf, Anchor, MapPin, ArrowRight, Info, Zap } from 'lucide-react';
import { getRegionalHealth } from '../services/scoringService';
import { RegionalHealth } from '../types';
import { useAuth } from '../hooks/useAuth';
import { COASTAL_REGIONS } from '../constants';

export default function RegionalHealthPage() {
  const [health, setHealth] = useState<RegionalHealth | null>(null);
  const [activeRegion, setActiveRegion] = useState('mumbai');

  useEffect(() => {
    setHealth(getRegionalHealth(activeRegion));
  }, [activeRegion]);

  if (!health) return null;

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-[#D1FF4D]';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-orange-400';
    return 'text-red-500';
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'pollution': return Droplets;
      case 'biodiversity': return Leaf;
      case 'resource': return Anchor;
      default: return Info;
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Region Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {COASTAL_REGIONS.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveRegion(r.id)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeRegion === r.id 
                ? 'bg-[#D1FF4D] text-black border-[#D1FF4D] shadow-[0_0_15px_rgba(209,255,77,0.3)]' 
                : 'bg-black text-gray-500 border-[#1A1A1A] hover:border-[#D1FF4D]/30 hover:text-white'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-[#D1FF4D]" size={24} />
              <h1 className="text-5xl font-black uppercase tracking-tighter text-white">{health.regionName}</h1>
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs max-w-xl">
              Real-time coastal health report card. Aggregating pollution, biodiversity, and resource data into a single actionable score.
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-6 rounded-3xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={120} className="text-[#D1FF4D]" />
            </div>
            <div>
              <div className="text-6xl font-black text-white tracking-tighter mb-1">{health.score}</div>
              <div className={`text-xl font-black uppercase tracking-tighter ${getGradeColor(health.grade)}`}>
                Grade {health.grade} - {health.grade === 'C' ? 'Fair' : 'Excellent'}
              </div>
            </div>
            <div className="text-right">
              <div className={`flex items-center justify-end gap-1 font-bold ${health.trend > 0 ? 'text-[#D1FF4D]' : 'text-red-500'}`}>
                {health.trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(health.trend)} PTS
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">vs last quarter</p>
            </div>
          </div>
        </div>

        {/* 3-Pillar Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {Object.entries(health.pillars).map(([key, value]) => {
            const Icon = getPillarIcon(key);
            return (
              <div key={key} className="bg-[#0A0A0A] border border-[#1A1A1A] p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-[#1A1A1A] rounded-lg text-[#D1FF4D]">
                    <Icon size={20} />
                  </div>
                  <span className="text-2xl font-black text-white tracking-tighter">{value}/100</span>
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">{key} Index</h3>
                <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${value > 70 ? 'bg-[#D1FF4D]' : value > 50 ? 'bg-orange-400' : 'bg-red-500'}`}
                  />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mt-3">
                  {value > 70 ? 'Stable' : value > 50 ? 'Action Needed' : 'Critical'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Threats & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Threats */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-8">
              <AlertCircle className="text-red-500" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">What's Happening</h2>
            </div>
            <div className="space-y-6">
              {health.topThreats.map((threat, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">{threat}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="text-[#D1FF4D]" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Top 3 Actions</h2>
            </div>
            <div className="space-y-4">
              {health.recommendations.map((rec, idx) => (
                <div key={idx} className="group flex items-center justify-between p-4 bg-[#1A1A1A]/30 rounded-xl border border-transparent hover:border-[#D1FF4D]/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-[#D1FF4D] w-6">0{idx + 1}</span>
                    <p className="text-sm text-white font-bold tracking-tight">{rec}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-600 group-hover:text-[#D1FF4D] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Timeline (Placeholder) */}
        <div className="mt-12 bg-[#0A0A0A] border border-[#1A1A1A] p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Progress Timeline</h2>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#D1FF4D]" /> Score</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Incidents</span>
            </div>
          </div>
          <div className="h-64 flex items-end gap-2">
            {[65, 68, 72, 70, 67, 69, 73, 71, 68, 67, 65, 67].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="opacity-0 group-hover:opacity-100 text-[8px] font-mono text-[#D1FF4D] transition-opacity">{val}</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  className="w-full bg-[#1A1A1A] group-hover:bg-[#D1FF4D] rounded-t-sm transition-colors"
                />
                <span className="text-[8px] font-mono text-gray-600 uppercase">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
