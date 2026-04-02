import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Users, Building2, Anchor, MapPin, Search, Filter, ArrowUpRight, Shield } from 'lucide-react';
import { getLeaderboard } from '../services/scoringService';
import { LeaderboardEntry } from '../types';
import { useAuth } from '../hooks/useAuth';

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardEntry['type']>('user');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setEntries(getLeaderboard(activeTab));
  }, [activeTab]);

  const filteredEntries = entries.filter(entry => 
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'user', label: 'Users', icon: Users },
    { id: 'squad', label: 'Squads', icon: Shield },
    { id: 'city', label: 'Cities', icon: MapPin },
    { id: 'corporate', label: 'Corporate', icon: Building2 },
    { id: 'fisher', label: 'Fishers', icon: Anchor },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-[#D1FF4D]" size={32} />
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Ocean Leaderboards</h1>
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            Competition drives conservation. See who's leading the wave.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-[#0A0A0A] p-1 rounded-xl border border-[#1A1A1A]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#D1FF4D] text-black shadow-[0_0_20px_rgba(209,255,77,0.3)]'
                    : 'text-gray-500 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder={`Search ${activeTab}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#D1FF4D] transition-colors"
          />
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative bg-[#0A0A0A] border ${
                  entry.name === profile?.displayName ? 'border-[#D1FF4D] bg-[#0D1200]' : 'border-[#1A1A1A]'
                } p-4 rounded-2xl flex items-center gap-6 hover:border-gray-700 transition-all`}
              >
                {/* Rank */}
                <div className="w-10 text-center">
                  {index < 3 ? (
                    <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  ) : (
                    <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center overflow-hidden">
                    {entry.photoUrl ? (
                      <img src={entry.photoUrl} alt={entry.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-black text-gray-700">{entry.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white tracking-tight">{entry.name}</h3>
                      {entry.tier && (
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#1A1A1A] text-[#D1FF4D] rounded-full border border-[#D1FF4D]/20">
                          {entry.tier}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">
                      {activeTab === 'user' ? 'Ocean Guardian' : activeTab === 'squad' ? 'Collective Impact' : activeTab === 'city' ? 'Coastal Region' : 'Impact Partner'}
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-2xl font-black text-white tracking-tighter">{entry.score}</div>
                  <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${
                    entry.delta > 0 ? 'text-[#D1FF4D]' : 'text-red-500'
                  }`}>
                    {entry.delta > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(entry.delta)} PTS
                  </div>
                </div>

                {/* Action */}
                <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-[#D1FF4D] transition-all">
                  <ArrowUpRight size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* User's Position Footer */}
        {profile && activeTab === 'user' && (
          <div className="mt-12 p-6 bg-[#D1FF4D] rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(209,255,77,0.2)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-xl">
                🌊
              </div>
              <div>
                <p className="text-black font-black uppercase tracking-tighter text-xl">You're #47 in Mumbai</p>
                <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest">Top 2% of all Mumbaikars!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-black/60 text-[10px] font-bold uppercase tracking-widest mb-1">Next Milestone</p>
              <p className="text-black font-bold text-sm tracking-tight">3 points to crack Top 40</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
