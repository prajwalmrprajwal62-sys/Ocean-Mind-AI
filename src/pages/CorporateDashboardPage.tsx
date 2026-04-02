import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  TrendingUp, 
  Map as MapIcon, 
  Zap, 
  CheckCircle2, 
  Download, 
  FileText, 
  BarChart3, 
  ArrowRight,
  Shield,
  Globe,
  Anchor,
  Leaf,
  Users,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Activity
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, Button, Badge } from '../components/UI';
import { CorporateFacility } from '../types';
import { toast } from 'sonner';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

const FACILITIES: CorporateFacility[] = [
  { id: '1', name: 'Mumbai Port Terminal 3', location: { lat: 18.94, lng: 72.84 }, healthScore: 58, riskProfile: { pollution: 'Medium', biodiversity: 'High', compliance: 'Good' } },
  { id: '2', name: 'Chennai Logistics Hub', location: { lat: 13.08, lng: 80.27 }, healthScore: 48, riskProfile: { pollution: 'High', biodiversity: 'Medium', compliance: 'Fair' } },
  { id: '3', name: 'Goa Storage Facility', location: { lat: 15.49, lng: 73.82 }, healthScore: 72, riskProfile: { pollution: 'Low', biodiversity: 'Medium', compliance: 'Good' } },
];

const INDUSTRY_LEADERBOARD = [
  { rank: 1, name: 'Maersk India', score: 92, tier: 'Ocean Leader', action: '50 hectare mangrove, zero-waste ports' },
  { rank: 2, name: 'Adani Ports', score: 87, tier: 'Ocean Leader', action: '₹15Cr ocean fund, MPA partnership' },
  { rank: 3, name: 'DP World', score: 84, tier: 'Ocean Advocate', action: 'Fisher training, waste-to-energy' },
  { rank: 4, name: 'XYZ SHIPPING (YOU)', score: 81, tier: 'Ocean Advocate', action: 'Ghost gear, mangroves planned' },
  { rank: 5, name: 'Global Logistics', score: 76, tier: 'Ocean Advocate', action: 'Basic compliance' },
];

export default function CorporateDashboardPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [baseScore, setBaseScore] = useState(81);
  const [fluctuation, setFluctuation] = useState(0);
  const [selectedFacility, setSelectedFacility] = useState<CorporateFacility | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [blockchainLogs, setBlockchainLogs] = useState<any[]>([]);

  // Real-time blockchain logs listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'blockchainLogs'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlockchainLogs(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'blockchainLogs');
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time score fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setFluctuation(Math.sin(Date.now() / 5000) * 0.5);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentScore = Math.round(baseScore + fluctuation + (selectedProjects.length * 2.5));

  const handleProjectSelect = async (projectTitle: string) => {
    if (!user) {
      toast.error('Please log in to manage strategic projects.');
      return;
    }

    if (selectedProjects.includes(projectTitle)) {
      setSelectedProjects(prev => prev.filter(p => p !== projectTitle));
      toast.info(`Project "${projectTitle}" removed from strategy.`);
    } else {
      setSelectedProjects(prev => [...prev, projectTitle]);
      toast.success(`Project "${projectTitle}" selected for intervention! Score will improve.`);
      
      // Log to blockchain
      try {
        await addDoc(collection(db, 'blockchainLogs'), {
          userId: user.uid,
          txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
          action: `Strategic Project Selection: ${projectTitle}`,
          type: 'strategy',
          status: 'Confirmed',
          impactValue: '+10 PTS (Est.)',
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'blockchainLogs');
      }
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Generating ESG Report...',
      success: 'ESG Data Exported Successfully!',
      error: 'Export failed.',
    });
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleMintNFT = async () => {
    if (!user) {
      toast.error('Please log in to mint impact certificates.');
      return;
    }

    setIsMinting(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 3000)), {
      loading: 'Minting ESG Impact Certificate on OceanChain...',
      success: 'Impact NFT Minted Successfully! View on Explorer.',
      error: 'Minting failed.',
    });

    setTimeout(async () => {
      try {
        await addDoc(collection(db, 'blockchainLogs'), {
          userId: user.uid,
          txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
          action: 'ESG Impact Certificate Minted',
          type: 'minting',
          status: 'Confirmed',
          impactValue: `${currentScore} ESG PTS`,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'blockchainLogs');
      }
      setIsMinting(false);
    }, 3000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-12">
            {/* Section 1: Ocean Responsibility Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 bg-[#0A0A0A] border-[#1A1A1A] p-12 flex flex-col md:flex-row items-center gap-12">
                <div className="relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-[#1A1A1A]"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={552.9}
                      initial={{ strokeDashoffset: 552.9 }}
                      animate={{ strokeDashoffset: 552.9 * (1 - currentScore / 100) }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="text-[#D1FF4D] drop-shadow-[0_0_15px_#D1FF4D]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                      key={currentScore}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl font-black text-white tracking-tighter"
                    >
                      {currentScore}
                    </motion.span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">/ 100</span>
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <Badge variant="accent" className="mb-4">
                      {currentScore > 90 ? 'OCEAN LEADER' : currentScore > 80 ? 'OCEAN ADVOCATE' : 'OCEAN CONTRIBUTOR'}
                    </Badge>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Ocean Responsibility Score</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">Top 15% of your industry</p>
                  </div>
                  <div className="flex items-center gap-4 text-[#D1FF4D]">
                    <TrendingUp size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">+7 PTS VS LAST QUARTER</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit">
                    <Shield size={12} className="text-blue-400" />
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Blockchain Verified Score</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                    Your score reflects active engagement in ghost gear recovery and mangrove restoration. 
                    You are currently eligible for <span className="text-white font-bold">Sustainability Bonds</span>.
                  </p>
                </div>
              </Card>

              <Card className="bg-[#0A0A0A] border-[#1A1A1A] p-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8">Industry Benchmarks</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Industry Average', value: 68, color: 'bg-gray-800' },
                    { label: 'Industry Leader', value: 92, color: 'bg-[#D1FF4D]' },
                    { label: 'Your Ranking', value: currentScore, color: 'bg-blue-500', isRank: true },
                  ].map((bench, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-500">{bench.label}</span>
                        <span className="text-white">{bench.isRank ? `#${currentScore > 90 ? '1' : currentScore > 85 ? '2' : '4'} / 23` : bench.value}</span>
                      </div>
                      <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${bench.color}`} 
                          initial={{ width: 0 }}
                          animate={{ width: `${bench.value}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-[#1A1A1A]">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                    <span className="text-[#D1FF4D]">Insight:</span> You are {92 - currentScore}pts behind Maersk. {selectedProjects.length === 0 ? 'Select a strategic project to improve your ranking.' : 'Strategic projects are being integrated into your score.'}
                  </p>
                </div>
              </Card>
            </div>

            {/* Section 3: Impact Summary & Business Value */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-[#0A0A0A] border-[#1A1A1A] p-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8">Impact Summary</h2>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'Pollution Prevented', value: '340kg', sub: 'Plastic intercepted', icon: Shield, color: 'text-red-500' },
                    { label: 'Habitat Restored', value: '15ha', sub: 'Mangrove replanted', icon: Leaf, color: 'text-[#D1FF4D]' },
                    { label: 'Community Trained', value: '120', sub: 'Sustainable fishers', icon: Users, color: 'text-blue-500' },
                    { label: 'Incident Reduction', value: '31%', sub: 'Near facilities', icon: TrendingUp, color: 'text-orange-500' },
                  ].map((metric, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.02)' }}
                      className="p-6 bg-black rounded-3xl border border-[#1A1A1A] group hover:border-white/10 transition-all cursor-default"
                    >
                      <metric.icon size={20} className={`${metric.color} mb-4`} />
                      <p className="text-2xl font-black text-white tracking-tighter">{metric.value}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{metric.label}</p>
                      <p className="text-[8px] font-mono text-gray-600 uppercase mt-1">{metric.sub}</p>
                    </motion.div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-8 py-4 text-[10px] font-black uppercase tracking-widest">
                  <Globe size={14} className="mr-2" /> View Blockchain-Backed Proof
                </Button>
              </Card>

              <Card className="bg-[#0A0A0A] border-[#1A1A1A] p-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8">Business Value Proof</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-black rounded-2xl border border-[#1A1A1A]">
                      <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">CSR Spend</p>
                      <p className="text-lg font-black text-white tracking-tighter">₹2.3Cr</p>
                    </div>
                    <div className="p-4 bg-black rounded-2xl border border-[#1A1A1A]">
                      <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Value Created</p>
                      <p className="text-lg font-black text-[#D1FF4D] tracking-tighter">₹14.8Cr</p>
                    </div>
                    <div className="p-4 bg-[#D1FF4D]/10 rounded-2xl border border-[#D1FF4D]/20">
                      <p className="text-[9px] font-bold text-[#D1FF4D] uppercase mb-1">ROI</p>
                      <p className="text-lg font-black text-[#D1FF4D] tracking-tighter">6.4×</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Sustainability Bonds', desc: 'Access to ₹500Cr green bond market', value: 'Unlocked' },
                      { label: 'Insurance Discounts', desc: 'Environmental risk mitigation', value: '12% Off' },
                      { label: 'Tax Incentives', desc: 'CSR deduction (Govt Scheme)', value: '150% Ded.' },
                    ].map((benefit, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ x: 5 }}
                        className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/5"
                      >
                        <div>
                          <p className="text-xs font-black text-white tracking-tight">{benefit.label}</p>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{benefit.desc}</p>
                        </div>
                        <Badge variant="accent" className="text-[9px]">{benefit.value}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      case 'Facilities':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-[#0A0A0A] border-[#1A1A1A] p-8 relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Facility Impact Map</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Monitoring 50km zone of influence</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[8px]">POLLUTION</Badge>
                  <Badge variant="outline" className="text-[8px]">BIODIVERSITY</Badge>
                </div>
              </div>
              <div className="aspect-video bg-[#050505] rounded-2xl border border-[#1A1A1A] flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-20 bg-[url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/0/0/0.png')] bg-cover grayscale" />
                
                {FACILITIES.map((f, i) => (
                  <motion.div 
                    key={f.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="absolute"
                    style={{ 
                      left: `${30 + (i * 20)}%`, 
                      top: `${40 + (i * 10)}%` 
                    }}
                  >
                    <div 
                      onClick={() => setSelectedFacility(f)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        selectedFacility?.id === f.id ? 'bg-blue-500/40 border-2 border-blue-400' : 'bg-blue-500/20 border border-blue-500'
                      } animate-pulse`}
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                  </motion.div>
                ))}

                <div className="relative z-10 pointer-events-none">
                  <Anchor size={48} className="text-blue-500 mx-auto mb-4 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{FACILITIES.length} Facilities Active</p>
                </div>
              </div>

              <AnimatePresence>
                {selectedFacility && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-8 left-8 right-8 p-6 bg-black/90 backdrop-blur-md border border-blue-500/30 rounded-2xl z-20"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                          <Activity size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tighter">{selectedFacility.name}</h3>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Real-time Health: {selectedFacility.healthScore}%</p>
                        </div>
                      </div>
                      <Button variant="outline" className="text-[10px] h-8" onClick={() => setSelectedFacility(null)}>Close</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            <div className="space-y-4">
              {FACILITIES.map((facility) => (
                <Card 
                  key={facility.id} 
                  onClick={() => setSelectedFacility(facility)}
                  className={`bg-[#0A0A0A] border-[#1A1A1A] p-6 hover:border-blue-500/30 transition-all cursor-pointer group ${
                    selectedFacility?.id === facility.id ? 'border-blue-500/50 bg-blue-500/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Anchor size={16} />
                      </div>
                      <h4 className="font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">{facility.name}</h4>
                    </div>
                    <span className="text-sm font-black text-blue-500">{facility.healthScore}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(facility.riskProfile).map(([key, value]) => (
                      <div key={key} className="text-center p-2 bg-black rounded-lg border border-[#1A1A1A]">
                        <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">{key}</p>
                        <p className={`text-[9px] font-black uppercase ${
                          value === 'High' ? 'text-red-500' : value === 'Good' ? 'text-[#D1FF4D]' : 'text-orange-400'
                        }`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'Strategic Projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Recommended Interventions</h2>
                <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mt-1">AI-Optimized for maximum ESG ROI</p>
              </div>
              <Badge variant="accent" className="px-4 py-2">{selectedProjects.length} PROJECTS SELECTED</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Ghost Gear Recovery', cost: '₹12-18L', impact: '+8 PTS', desc: 'Recover 18 reported nets near Mumbai terminal.', icon: Anchor },
                { title: 'Mangrove Blue Carbon', cost: '₹25-40L', impact: '+12 PTS', desc: 'Sequester 500 tons CO2 in coastal area.', icon: Leaf },
                { title: 'Sustainable Fisher Partnership', cost: '₹8-12L', impact: '+6 PTS', desc: 'Improve 127 livelihoods near your facility.', icon: Users },
              ].map((opp, i) => (
                <Card 
                  key={i} 
                  className={`bg-[#0A0A0A] border-[#1A1A1A] p-8 group hover:border-[#D1FF4D]/30 transition-all flex flex-col ${
                    selectedProjects.includes(opp.title) ? 'border-[#D1FF4D]/50 bg-[#D1FF4D]/5' : ''
                  }`}
                >
                  <opp.icon size={32} className={`${selectedProjects.includes(opp.title) ? 'text-[#D1FF4D]' : 'text-gray-600'} mb-6 transition-colors`} />
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-black text-white tracking-tight">{opp.title}</h3>
                    {selectedProjects.includes(opp.title) && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <Shield size={8} className="text-blue-400" />
                        <span className="text-[6px] font-black text-blue-400 uppercase tracking-widest">Anchored</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-1">{opp.desc}</p>
                  <div className="flex justify-between items-center pt-6 border-t border-[#1A1A1A]">
                    <div className="font-mono text-xs text-gray-400">{opp.cost}</div>
                    <div className="font-black text-[#D1FF4D] text-sm">{opp.impact}</div>
                  </div>
                  <Button 
                    onClick={() => handleProjectSelect(opp.title)}
                    variant={selectedProjects.includes(opp.title) ? 'accent' : 'outline'}
                    className="w-full mt-6 py-3 text-[10px] font-black uppercase tracking-widest"
                  >
                    {selectedProjects.includes(opp.title) ? 'Deselect Strategy' : 'Select Opportunity'}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'Leaderboard':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Industry Leaderboard</h2>
            <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-3xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1A1A1A] bg-black/40">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Rank</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Company</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Score</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Tier</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Notable Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {INDUSTRY_LEADERBOARD.map((company) => {
                    const isYou = company.name.includes('YOU');
                    const displayScore = isYou ? currentScore : company.score;
                    const displayRank = isYou ? (currentScore > 90 ? 1 : currentScore > 85 ? 2 : 4) : company.rank;

                    return (
                      <tr key={company.rank} className={`border-b border-[#1A1A1A] hover:bg-white/5 transition-colors ${
                        isYou ? 'bg-[#D1FF4D]/5' : ''
                      }`}>
                        <td className="p-6 font-mono text-sm text-gray-500">{displayRank}</td>
                        <td className="p-6 font-black text-white tracking-tight">
                          {company.name}
                          {isYou && <Badge variant="accent" className="ml-3 text-[8px]">LIVE</Badge>}
                        </td>
                        <td className="p-6 font-black text-[#D1FF4D]">{displayScore}</td>
                        <td className="p-6">
                          <Badge variant={company.tier === 'Ocean Leader' ? 'accent' : 'outline'} className="text-[8px]">
                            {company.tier}
                          </Badge>
                        </td>
                        <td className="p-6 text-xs text-gray-400">{company.action}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Blockchain':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 bg-[#0A0A0A] border-[#1A1A1A] p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white">OceanChain Ledger</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Immutable proof of environmental impact</p>
                  </div>
                  <Badge variant="outline" className="text-blue-400 border-blue-500/30">Network: Mainnet</Badge>
                </div>
                
                <div className="space-y-4">
                  {blockchainLogs.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[#1A1A1A] rounded-xl">
                      <Shield size={32} className="text-gray-700 mx-auto mb-4 opacity-20" />
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No blockchain records found</p>
                    </div>
                  ) : (
                    blockchainLogs.map((log, i) => (
                      <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 bg-black border border-[#1A1A1A] rounded-xl group hover:border-blue-500/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Shield size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-white tracking-tight">{log.action}</p>
                            <p className="text-[9px] font-mono text-gray-500 uppercase">
                              {log.txHash} // {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : 'Processing...'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-500/20 text-blue-400 border-none text-[8px]">{log.status}</Badge>
                          <ExternalLink size={12} className="text-gray-700 group-hover:text-blue-500 cursor-pointer" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </Card>

              <div className="space-y-8">
                <Card className="bg-[#0A0A0A] border-[#1A1A1A] p-8 space-y-6">
                  <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-center">
                    <Award size={32} className="text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Impact Certificates</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Convert your ESG score into tradable assets</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-gray-500">Available Credits</span>
                      <span className="text-white">1,240 OCN</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-gray-500">Market Value</span>
                      <span className="text-[#D1FF4D]">₹4.2L</span>
                    </div>
                    <Button 
                      onClick={handleMintNFT}
                      disabled={isMinting}
                      className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                      {isMinting ? 'Minting...' : 'Mint Impact NFT'}
                    </Button>
                  </div>
                </Card>

                <Card className="bg-[#0A0A0A] border-[#1A1A1A] p-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6">Transparency Protocol</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Validator Nodes', value: '12 Active' },
                      { label: 'Consensus', value: 'Proof of Impact' },
                      { label: 'Audit Frequency', value: 'Real-time' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-[#1A1A1A]">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">{item.label}</span>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'Reports':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'GRI Standards', icon: FileText },
              { title: 'SASB Maritime', icon: BarChart3 },
              { title: 'CDP Disclosure', icon: Globe },
              { title: 'Annual Report', icon: Download },
            ].map((report, i) => (
              <button 
                key={i} 
                onClick={() => toast.info(`Downloading ${report.title}...`)}
                className="bg-[#0A0A0A] border border-[#1A1A1A] p-6 rounded-2xl flex items-center justify-between hover:border-[#D1FF4D]/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-black rounded-lg text-gray-500 group-hover:text-[#D1FF4D] transition-colors">
                    <report.icon size={20} />
                  </div>
                  <span className="font-black text-white text-xs tracking-tight uppercase">{report.title}</span>
                </div>
                <ChevronRight size={16} className="text-gray-700 group-hover:text-[#D1FF4D] transition-all" />
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Corporate Impact Dashboard</h1>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
              Enterprise-grade ESG monitoring and strategic intervention
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="text-[10px] h-8"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download size={12} className="mr-2" /> {isExporting ? 'Exporting...' : 'Export ESG Data'}
            </Button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#1A1A1A] pb-4">
          {['Overview', 'Facilities', 'Strategic Projects', 'Leaderboard', 'Blockchain', 'Reports'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-[#D1FF4D] text-black shadow-[0_0_15px_rgba(209,255,77,0.3)]' 
                : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
}
