import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, addDoc, doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Badge } from '../components/UI';
import { 
  Anchor, 
  TrendingUp, 
  Map as MapIcon, 
  CloudRain, 
  DollarSign, 
  Award, 
  Plus, 
  Clock, 
  Fish, 
  AlertCircle, 
  ChevronRight,
  Wind,
  Waves,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getFishingZones, calculateCPUE, getSustainabilityScore, getCertificationLevel, getPricePremium } from '../services/fisherService';
import { FishingTrip, FishingZone } from '../types';

export default function FisherDashboardPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [zones, setZones] = useState<FishingZone[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [hours, setHours] = useState(4);
  const [catchKg, setCatchKg] = useState(20);
  const [selectedZone, setSelectedZone] = useState('');
  const [species, setSpecies] = useState('');
  const [gearType, setGearType] = useState('Handline');
  const [earnings, setEarnings] = useState(1500);
  const [lastCpue, setLastCpue] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'fishing_trips'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FishingTrip));
      setTrips(tripsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'fishing_trips');
    });

    setZones(getFishingZones());
    setSelectedZone(getFishingZones()[0].id);

    return () => unsubscribe();
  }, [user]);

  const handleSubmitTrip = async () => {
    if (!user || !selectedZone) return;
    setFormError(null);

    // Validation
    if (hours <= 0) {
      setFormError("Hours fished must be greater than 0.");
      return;
    }
    if (catchKg < 0) {
      setFormError("Catch quantity cannot be negative.");
      return;
    }
    if (!species.trim()) {
      setFormError("Please specify at least one species.");
      return;
    }
    if (earnings < 0) {
      setFormError("Estimated earnings cannot be negative.");
      return;
    }

    const cpue = calculateCPUE(catchKg, hours);
    
    const newTrip = {
      userId: user.uid,
      date: new Date().toISOString(),
      hoursFished: hours,
      gearType: gearType,
      zoneId: selectedZone,
      catchKg: catchKg,
      species: species.split(',').map(s => s.trim()),
      earnings: earnings,
      cpue: cpue,
      status: 'logged'
    };

    try {
      await addDoc(collection(db, 'fishing_trips'), newTrip);
      
      // Update user stats - use setDoc with merge to ensure doc exists
      const score = getSustainabilityScore([...trips, newTrip as any]);
      const level = getCertificationLevel(score);
      
      await setDoc(doc(db, 'users', user.uid), {
        totalCatchKg: increment(catchKg),
        totalEarnings: increment(earnings),
        sustainabilityScore: score,
        certificationLevel: level
      }, { merge: true });

      setLastCpue(cpue);
      setShowSuccess(true);
      
      // Reset form after delay
      setTimeout(() => {
        setShowLogForm(false);
        setShowSuccess(false);
        setCatchKg(20);
        setHours(4);
        setSpecies('');
        setEarnings(1500);
        setLastCpue(null);
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'fishing_trips');
    }
  };

  const currentScore = getSustainabilityScore(trips);
  const currentLevel = getCertificationLevel(currentScore);
  const premium = getPricePremium(currentLevel);

  const recentTripsForChart = [...trips].slice(0, 7).reverse();
  const chartData = recentTripsForChart.map(t => {
    const date = (t.date as any)?.toDate ? (t.date as any).toDate() : new Date(t.date);
    return {
      date: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      cpue: t.cpue,
      catch: t.catchKg
    };
  });

  const getAIInsight = () => {
    if (trips.length < 2) return "Start logging more trips to unlock AI-powered resource intelligence.";
    
    const latest = trips[0].cpue;
    const previous = trips[1].cpue;
    const diff = latest - previous;
    
    const bestZone = zones.reduce((prev, current) => (prev.avgCpue > current.avgCpue) ? prev : current, zones[0]);

    if (diff < -1) {
      return `Intelligence: CPUE declining (-${Math.abs(diff).toFixed(1)}). Consider exploring ${bestZone.name} for better stocks.`;
    } else if (diff > 1) {
      return `Intelligence: CPUE increasing (+${diff.toFixed(1)}). Your current strategy in ${trips[0].zoneId} is highly effective.`;
    } else {
      return `Intelligence: CPUE stable. Resource levels in ${trips[0].zoneId} are maintaining healthy equilibrium.`;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 grid-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-4 mb-2">
              <Link to="/dashboard" className="p-2 bg-[#0A0A0A] border border-[#1A1A1A] rounded-full text-gray-400 hover:text-[#D1FF4D] transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#D1FF4D] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D1FF4D]">Fisher Hub // Resource Optimization</span>
              </div>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter">Ocean Steward</h1>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">Empowering sustainable fishing through real-time intelligence</p>
          </div>
          <Button 
            onClick={() => setShowLogForm(true)}
            className="flex items-center gap-2 py-4 px-8 shadow-[0_0_20px_rgba(209,255,77,0.2)]"
          >
            <Plus size={20} />
            Log Catch
          </Button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#050505] border-[#1A1A1A] p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-[#D1FF4D]/10 rounded border border-[#D1FF4D]/20">
                <TrendingUp size={20} className="text-[#D1FF4D]" />
              </div>
              <Badge variant="outline" className="text-[#D1FF4D] border-[#D1FF4D]/30">↑ 12%</Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Current CPUE</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black tracking-tighter">
                  {trips.length > 0 ? trips[0].cpue.toFixed(1) : '0.0'}
                </h4>
                <span className="text-[10px] font-mono text-gray-600">KG/HR</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#050505] border-[#1A1A1A] p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <Fish size={20} className="text-blue-400" />
              </div>
              <Badge variant="outline" className="text-blue-400 border-blue-500/30">Total</Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Catch</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black tracking-tighter">
                  {trips.reduce((acc, t) => acc + t.catchKg, 0).toLocaleString()}
                </h4>
                <span className="text-[10px] font-mono text-gray-600">KG</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#050505] border-[#1A1A1A] p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                <DollarSign size={20} className="text-emerald-400" />
              </div>
              <Badge variant="accent" className="bg-emerald-500 text-black border-none">+{premium * 100}% Premium</Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Earnings (Monthly)</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black tracking-tighter">
                  ₹{trips.reduce((acc, t) => acc + t.earnings, 0).toLocaleString()}
                </h4>
                <span className="text-[10px] font-mono text-gray-600">INR</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#D1FF4D]/5 border-[#D1FF4D]/20 p-6 space-y-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Award size={120} strokeWidth={1} className="text-[#D1FF4D]" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <div className="p-2 bg-[#D1FF4D]/10 rounded border border-[#D1FF4D]/20">
                <Award size={20} className="text-[#D1FF4D]" />
              </div>
              <Badge className="bg-[#D1FF4D] text-black border-none uppercase text-[8px]">{currentLevel}</Badge>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sustainability Score</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black tracking-tighter text-[#D1FF4D]">{currentScore}</h4>
                <span className="text-[10px] font-mono text-gray-600">/100</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Trends & History */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-[#050505] border-[#1A1A1A] p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#D1FF4D]" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">CPUE Trend Analysis</h3>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[8px]">7 DAYS</Badge>
                  <Badge variant="outline" className="text-[8px] opacity-50">30 DAYS</Badge>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCpue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D1FF4D" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D1FF4D" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#333" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#333" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}kg`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #1A1A1A', fontSize: '10px' }}
                      itemStyle={{ color: '#D1FF4D' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cpue" 
                      stroke="#D1FF4D" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCpue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 p-4 bg-black border border-[#1A1A1A] flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded">
                  <AlertCircle size={16} className="text-blue-400" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400 leading-relaxed">
                  {getAIInsight()}
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#050505] border-[#1A1A1A] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapIcon size={18} className="text-[#D1FF4D]" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Zone Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {zones.map(zone => (
                    <div key={zone.id} className="p-3 bg-black border border-[#1A1A1A] flex justify-between items-center group hover:border-[#D1FF4D]/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          zone.status === 'safe' ? 'bg-[#D1FF4D]' : 
                          zone.status === 'caution' ? 'bg-orange-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-white">{zone.name}</p>
                          <p className="text-[8px] font-mono text-gray-600">{zone.avgCpue} KG/HR // {zone.activeFishers} FISHERS</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-700 group-hover:text-[#D1FF4D]" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-[#050505] border-[#1A1A1A] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CloudRain size={18} className="text-blue-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Marine Forecast</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-3">
                      <Wind size={16} className="text-blue-400" />
                      <span className="text-[10px] font-bold uppercase">Wind Speed</span>
                    </div>
                    <span className="text-sm font-mono">12 KNOTS</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-3">
                      <Waves size={16} className="text-blue-400" />
                      <span className="text-[10px] font-bold uppercase">Wave Height</span>
                    </div>
                    <span className="text-sm font-mono">1.2 METERS</span>
                  </div>
                  <div className="p-3 bg-[#D1FF4D]/10 border border-[#D1FF4D]/20 rounded">
                    <p className="text-[10px] font-bold uppercase text-[#D1FF4D] text-center">Safe to Fish: YES</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column: Recent Activity & Certification */}
          <div className="space-y-8">
            <Card className="bg-[#050505] border-[#1A1A1A] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock size={18} className="text-gray-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Recent Trips</h3>
              </div>
              <div className="space-y-4">
                {trips.length === 0 ? (
                  <p className="text-[10px] text-gray-600 text-center py-8">No trips logged yet.</p>
                ) : (
                  trips.slice(0, 5).map(trip => (
                    <div key={trip.id} className="p-4 bg-black border border-[#1A1A1A] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-gray-500">
                          {(trip.date as any)?.toDate ? (trip.date as any).toDate().toLocaleDateString() : new Date(trip.date).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-[8px]">{trip.cpue.toFixed(1)} KG/HR</Badge>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-xs font-bold uppercase">{trip.catchKg}KG Catch</p>
                        <p className="text-[10px] font-mono text-emerald-400">₹{trip.earnings.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="bg-[#050505] border-[#1A1A1A] p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Award size={18} className="text-[#D1FF4D]" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Certification Progress</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-bold uppercase text-gray-500">Next Level: {currentLevel === 'gold' ? 'MAX' : currentLevel === 'silver' ? 'GOLD' : currentLevel === 'bronze' ? 'SILVER' : 'BRONZE'}</p>
                  <p className="text-xs font-black text-[#D1FF4D]">{currentScore}%</p>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#D1FF4D] shadow-[0_0_10px_#D1FF4D] transition-all duration-1000" 
                    style={{ width: `${currentScore}%` }} 
                  />
                </div>
                
                <div className="space-y-2 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Requirements:</p>
                  {[
                    { text: 'Follow 5 safe zone recommendations', done: true },
                    { text: 'Log 10 consecutive trips', done: trips.length >= 10 },
                    { text: 'Maintain CPUE > 8.0', done: trips.length > 0 && trips[0].cpue > 8 },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {req.done ? <CheckCircle2 size={12} className="text-[#D1FF4D]" /> : <div className="w-3 h-3 rounded-full border border-gray-800" />}
                      <span className={`text-[10px] ${req.done ? 'text-gray-300' : 'text-gray-600'}`}>{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>

      {/* Log Trip Modal */}
      <AnimatePresence>
        {showLogForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#050505] border border-[#1A1A1A] p-8 space-y-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Log Catch</h3>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Trip Data Entry</p>
                </div>
                <button onClick={() => setShowLogForm(false)} className="text-gray-600 hover:text-white">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                {showSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-[#D1FF4D] rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(209,255,77,0.4)]">
                      <CheckCircle2 size={32} className="text-black" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tighter">Trip Logged!</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#D1FF4D]">CPUE: {lastCpue?.toFixed(2)} KG/HR</p>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Your sustainability score has been updated.</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fishing Zone</label>
                      <select 
                        value={selectedZone} 
                        onChange={(e) => setSelectedZone(e.target.value)}
                        className="w-full p-3 bg-black border border-[#1A1A1A] font-bold uppercase text-sm text-white focus:outline-none focus:border-[#D1FF4D] transition-colors appearance-none"
                      >
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Hours Fished</label>
                        <input 
                          type="number" 
                          value={hours} 
                          onChange={(e) => setHours(Number(e.target.value))}
                          className="w-full p-3 bg-black border border-[#1A1A1A] font-mono text-sm text-white focus:outline-none focus:border-[#D1FF4D]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Catch (KG)</label>
                        <input 
                          type="number" 
                          value={catchKg} 
                          onChange={(e) => setCatchKg(Number(e.target.value))}
                          className="w-full p-3 bg-black border border-[#1A1A1A] font-mono text-sm text-white focus:outline-none focus:border-[#D1FF4D]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Gear Type</label>
                        <select 
                          value={gearType} 
                          onChange={(e) => setGearType(e.target.value)}
                          className="w-full p-3 bg-black border border-[#1A1A1A] font-bold uppercase text-sm text-white focus:outline-none focus:border-[#D1FF4D] transition-colors appearance-none"
                        >
                          <option value="Handline">Handline</option>
                          <option value="Longline">Longline</option>
                          <option value="Gillnet">Gillnet</option>
                          <option value="Trawler">Trawler</option>
                          <option value="Trap">Trap</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Earnings (₹)</label>
                        <input 
                          type="number" 
                          value={earnings} 
                          onChange={(e) => setEarnings(Number(e.target.value))}
                          className="w-full p-3 bg-black border border-[#1A1A1A] font-mono text-sm text-white focus:outline-none focus:border-[#D1FF4D]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Species (Comma separated)</label>
                      <input 
                        type="text" 
                        value={species} 
                        onChange={(e) => setSpecies(e.target.value)}
                        placeholder="Pomfret, Mackerel, etc."
                        className="w-full p-3 bg-black border border-[#1A1A1A] font-medium text-sm text-white focus:outline-none focus:border-[#D1FF4D]"
                      />
                    </div>

                    {formError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                        <AlertCircle size={14} className="text-red-400" />
                        <p className="text-[10px] font-bold uppercase text-red-400">{formError}</p>
                      </div>
                    )}

                    <div className="p-4 bg-[#D1FF4D]/5 border border-[#D1FF4D]/20 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-gray-500">Calculated CPUE:</span>
                        <span className="text-[#D1FF4D]">{calculateCPUE(catchKg, hours)} KG/HR</span>
                      </div>
                    </div>

                    <Button onClick={handleSubmitTrip} className="w-full py-4 text-lg">
                      Confirm & Log Trip
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
