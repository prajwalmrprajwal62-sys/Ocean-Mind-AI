import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  AlertCircle, 
  TrendingUp, 
  Map as MapIcon, 
  Zap, 
  Users, 
  Download, 
  FileText, 
  BarChart3, 
  ChevronRight,
  Filter,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  LineChart,
  Line
} from 'recharts';
import { Card, Button, Badge } from '../components/UI';
import { UrgentZone, Intervention } from '../types';

const URGENT_ZONES: UrgentZone[] = [
  { rank: 1, zone: 'Vizag Coast', healthScore: 41, primaryThreat: 'Mass fish kills (12 incidents)', recommendedAction: 'Emergency water quality assessment', estCost: '₹2.5L', estImpact: '+15pts', priority: 'CRITICAL' },
  { rank: 2, zone: 'Chennai Marina', healthScore: 48, primaryThreat: 'Ghost gear accumulation (22 nets)', recommendedAction: 'Organized recovery dive', estCost: '₹1.8L', estImpact: '+12pts', priority: 'HIGH' },
  { rank: 3, zone: 'Goa Calangute', healthScore: 52, primaryThreat: 'Tourist season pollution spike', recommendedAction: 'Double cleanup frequency (3mo)', estCost: '₹4.2L', estImpact: '+10pts', priority: 'MEDIUM' },
  { rank: 4, zone: 'Mumbai Juhu', healthScore: 58, primaryThreat: 'Monsoon runoff pollution', recommendedAction: 'Install river trash traps', estCost: '₹6.0L', estImpact: '+8pts', priority: 'MEDIUM' },
];

const INTERVENTIONS: Intervention[] = [
  { id: '1', name: 'Beach cleanup campaign (3 months)', cost: 350000, impact: 8, description: 'Intensive cleanup with 200+ volunteers' },
  { id: '2', name: 'Install 2 river trash traps', cost: 600000, impact: 10, description: 'Catch debris before it reaches the ocean' },
  { id: '3', name: 'Establish 5km² MPA', cost: 800000, impact: 12, description: 'Marine Protected Area with strict enforcement' },
  { id: '4', name: 'Fisher training program (50 fishers)', cost: 200000, impact: 4, description: 'Sustainable gear and practice workshops' },
];

export default function PolicyDashboardPage() {
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<{ cost: number, impact: number } | null>(null);

  const toggleIntervention = (id: string) => {
    setSelectedInterventions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const calculateSimulation = () => {
    const selected = INTERVENTIONS.filter(i => selectedInterventions.includes(i.id));
    const totalCost = selected.reduce((sum, i) => sum + i.cost, 0);
    const totalImpact = selected.reduce((sum, i) => sum + i.impact, 0);
    setSimulationResult({ cost: totalCost, impact: totalImpact });
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex items-center gap-6 mb-12">
          <Link to="/dashboard" className="p-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-full text-gray-400 hover:text-[#D1FF4D] transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <Badge className="bg-[#D1FF4D]/10 text-[#D1FF4D] border-[#D1FF4D]/20 mb-2">Policy Intelligence</Badge>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white">
              Decision <span className="text-[#D1FF4D]">Framework</span>
            </h1>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Incidents (30d)', value: '847', trend: '+12%', icon: AlertCircle, color: 'text-red-500' },
            { label: 'High-Priority Alerts', value: '23', trend: 'Critical', icon: Shield, color: 'text-[#D1FF4D]' },
            { label: 'At-Risk Zones', value: '8', trend: 'Action Needed', icon: MapIcon, color: 'text-orange-500' },
            { label: 'Improvement Rate', value: '+4.2%', trend: 'Positive', icon: TrendingUp, color: 'text-blue-500' },
          ].map((kpi, i) => (
            <Card key={i} className="bg-[#0A0A0A] border-[#1A1A1A] p-6 group hover:border-[#D1FF4D]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 bg-black rounded-lg ${kpi.color}`}>
                  <kpi.icon size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{kpi.trend}</span>
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">{kpi.label}</h3>
              <div className="text-3xl font-black text-white tracking-tighter">{kpi.value}</div>
            </Card>
          ))}
        </div>

        {/* Section 2: Hotspot Map (Placeholder/Visual) */}
        <Card className="bg-[#0A0A0A] border-[#1A1A1A] p-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Decision Hotspots</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Intervention Map</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="text-[10px] py-1 px-3">Pollution</Button>
              <Button variant="outline" className="text-[10px] py-1 px-3">Biodiversity</Button>
              <Button className="text-[10px] py-1 px-3">All Layers</Button>
            </div>
          </div>
          <div className="aspect-video bg-[#050505] rounded-2xl border border-[#1A1A1A] flex items-center justify-center relative group">
            <div className="absolute inset-0 opacity-20 bg-[url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/0/0/0.png')] bg-cover grayscale" />
            <div className="relative z-10 text-center">
              <MapIcon size={48} className="text-[#D1FF4D] mx-auto mb-4 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Interactive GIS Layer Active</p>
            </div>
            {/* Mock Zone Info Card */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute right-8 top-8 w-64 bg-black/80 backdrop-blur-md border border-[#D1FF4D]/30 p-6 rounded-2xl z-20"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={14} className="text-[#D1FF4D]" />
                <h4 className="font-black uppercase tracking-tight text-white">Juhu Beach, Mumbai</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Health Score</span>
                  <span className="text-sm font-black text-orange-400">58/100</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">• 18 pollution reports</div>
                  <div className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">• 3 turtle strandings</div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-[9px] font-bold text-gray-500 uppercase mb-2">Recommended Action:</p>
                  <p className="text-[10px] text-white font-medium italic leading-relaxed">"Deploy cleanup crew (est. ₹45K, impact: +8pts)"</p>
                </div>
                <Badge variant="accent" className="w-full justify-center py-1 text-[9px]">INTERVENTION NEEDED</Badge>
              </div>
            </motion.div>
          </div>
        </Card>

        {/* Section 3: Top 10 Urgent Zones */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Top Urgent Zones</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Prioritized by health score and threat severity</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="text-[10px]"><Filter size={14} className="mr-2" /> Filter</Button>
              <Button variant="outline" className="text-[10px]"><Download size={14} className="mr-2" /> Export PDF</Button>
            </div>
          </div>
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1A1A1A] bg-black/40">
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Rank</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Zone</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Health</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Primary Threat</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Recommended Action</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Est. Cost</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Impact</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Priority</th>
                </tr>
              </thead>
              <tbody>
                {URGENT_ZONES.map((zone) => (
                  <tr key={zone.rank} className="border-b border-[#1A1A1A] hover:bg-white/5 transition-colors group">
                    <td className="p-6 font-mono text-sm text-gray-500">{zone.rank}</td>
                    <td className="p-6 font-black text-white tracking-tight">{zone.zone}</td>
                    <td className="p-6 font-black text-orange-400">{zone.healthScore}/100</td>
                    <td className="p-6 text-xs text-gray-400">{zone.primaryThreat}</td>
                    <td className="p-6 text-xs text-white italic">{zone.recommendedAction}</td>
                    <td className="p-6 font-mono text-xs text-gray-500">{zone.estCost}</td>
                    <td className="p-6 font-black text-[#D1FF4D] text-xs">{zone.estImpact}</td>
                    <td className="p-6">
                      <Badge variant={zone.priority === 'CRITICAL' ? 'accent' : 'outline'} className="text-[8px]">
                        {zone.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Trend Analysis & Citizen Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-[#0A0A0A] border-[#1A1A1A] p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Strategic Trends</h2>
              <div className="flex gap-2">
                <Badge variant="outline">12 Months</Badge>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { month: 'Jan', health: 62, incidents: 45 },
                  { month: 'Feb', health: 64, incidents: 42 },
                  { month: 'Mar', health: 68, incidents: 38 },
                  { month: 'Apr', health: 65, incidents: 48 },
                  { month: 'May', health: 58, incidents: 62 },
                  { month: 'Jun', health: 61, incidents: 55 },
                ]}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D1FF4D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D1FF4D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis dataKey="month" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #D1FF4D', borderRadius: '4px', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="health" stroke="#D1FF4D" strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-orange-400 uppercase tracking-widest">
              <AlertCircle size={12} />
              <span>Note: May spike due to monsoon runoff (expected seasonal anomaly)</span>
            </div>
          </Card>

          <Card className="bg-[#0A0A0A] border-[#1A1A1A] p-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8">Citizen Engagement</h2>
            <div className="space-y-6">
              {[
                { label: 'Active Guardians', value: '12,847', sub: 'Maharashtra State' },
                { label: 'Reports Filed', value: '2,341', sub: 'This Month' },
                { label: 'Volunteer Hours', value: '4,560', sub: 'Valued at ₹9.1L' },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-end pb-4 border-b border-[#1A1A1A]">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-[9px] font-mono text-gray-600 uppercase">{stat.sub}</p>
                  </div>
                  <div className="text-2xl font-black text-white tracking-tighter">{stat.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-[#D1FF4D]/5 border border-[#D1FF4D]/20 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                <span className="text-[#D1FF4D]">Insight:</span> High citizen engagement correlates with 23% faster coastal improvement.
              </p>
            </div>
          </Card>
        </div>

        {/* Section 5: Intervention Simulator */}
        <Card className="bg-[#0A0A0A] border-[#1A1A1A] p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-[#D1FF4D]" size={32} />
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Intervention Simulator</h2>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-12">
                Project the impact of your policy decisions before committing budget.
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Select Zone</h3>
                  <Badge variant="outline">Chennai Marina Beach</Badge>
                </div>
                <div className="space-y-3">
                  {INTERVENTIONS.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => toggleIntervention(i.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedInterventions.includes(i.id)
                          ? 'bg-[#D1FF4D] border-[#D1FF4D] text-black'
                          : 'bg-black border-[#1A1A1A] text-white hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedInterventions.includes(i.id) ? 'border-black' : 'border-gray-700'
                        }`}>
                          {selectedInterventions.includes(i.id) && <CheckCircle2 size={12} />}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold uppercase tracking-tight">{i.name}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${
                            selectedInterventions.includes(i.id) ? 'text-black/60' : 'text-gray-500'
                          }`}>₹{(i.cost / 100000).toFixed(1)}L</p>
                        </div>
                      </div>
                      <span className="text-xs font-black">+{i.impact} PTS</span>
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={calculateSimulation} 
                  className="w-full mt-8 py-4 flex items-center justify-center gap-2"
                  disabled={selectedInterventions.length === 0}
                >
                  <PlayCircle size={18} />
                  Calculate Projected Impact
                </Button>
              </div>
            </div>

            <div className="bg-black/40 rounded-3xl border border-white/5 p-8 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {simulationResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-12"
                  >
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Total Investment</p>
                        <p className="text-4xl font-black text-white tracking-tighter">₹{(simulationResult.cost / 100000).toFixed(1)}L</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Projected Score</p>
                        <p className="text-4xl font-black text-[#D1FF4D] tracking-tighter">48 → {48 + simulationResult.impact}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-500">Grade Improvement</span>
                        <span className="text-white">D (Poor) → B (Good)</span>
                      </div>
                      <div className="h-4 bg-[#1A1A1A] rounded-full overflow-hidden flex">
                        <div className="h-full bg-red-500" style={{ width: '48%' }} />
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${simulationResult.impact}%` }}
                          className="h-full bg-[#D1FF4D] shadow-[0_0_15px_#D1FF4D]" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-[#1A1A1A]/30 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">ROI Index</p>
                        <p className="text-xl font-black text-white tracking-tighter">6.4× Value</p>
                      </div>
                      <div className="p-4 bg-[#1A1A1A]/30 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Confidence</p>
                        <p className="text-xl font-black text-white tracking-tighter">78%</p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full py-4 flex items-center justify-center gap-2">
                      <FileText size={18} />
                      Export Implementation Plan
                    </Button>
                  </motion.div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto opacity-20">
                      <Zap size={32} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Select interventions to see projected ROI</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        {/* Section 6: Export & Reporting */}
        <div className="flex flex-col md:flex-row gap-6">
          {[
            { title: 'Monthly Summary', desc: '2-page executive brief for ministers', icon: FileText },
            { title: 'Quarterly Deep Dive', desc: '15-page analysis with all trends', icon: BarChart3 },
            { title: 'Budget Proposal', desc: 'Pre-formatted finance submission', icon: Download },
          ].map((report, i) => (
            <button key={i} className="flex-1 bg-[#0A0A0A] border border-[#1A1A1A] p-6 rounded-2xl flex items-center gap-6 hover:border-[#D1FF4D]/30 transition-all text-left group">
              <div className="p-3 bg-black rounded-xl text-gray-500 group-hover:text-[#D1FF4D] transition-colors">
                <report.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-tight">{report.title}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{report.desc}</p>
              </div>
              <ArrowRight size={18} className="ml-auto text-gray-700 group-hover:text-[#D1FF4D] transition-all" />
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

function MapPin({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
