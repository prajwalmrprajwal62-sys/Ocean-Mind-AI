import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Plus, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Leaf,
  Recycle,
  Droplets,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { Card, Button } from '../components/UI';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

interface WasteLog {
  id: string;
  userId: string;
  date: any;
  plastic: number;
  organic: number;
  recyclable: number;
  eWaste: number;
  score: number;
}

export default function WasteManagementPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [plastic, setPlastic] = useState(0);
  const [organic, setOrganic] = useState(0);
  const [recyclable, setRecyclable] = useState(0);
  const [eWaste, setEWaste] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'wasteLogs'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let date = new Date();
        if (data.date) {
          if (typeof data.date.toDate === 'function') {
            date = data.date.toDate();
          } else if (data.date instanceof Date) {
            date = data.date;
          } else if (typeof data.date === 'string' || typeof data.date === 'number') {
            date = new Date(data.date);
          }
        }
        
        return {
          id: doc.id,
          ...data,
          date
        } as WasteLog;
      });
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'wasteLogs');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const calculateScore = (p: number, o: number, r: number, e: number) => {
    // Simple score logic: lower total waste is better, higher recyclable ratio is better
    const total = p + o + r + e;
    if (total === 0) return 100;
    
    const wastePenalty = Math.min(total * 2, 50); // Up to 50 points penalty for volume
    const recycleBonus = ((r + e) / total) * 50; // Up to 50 points bonus for recycling ratio (including e-waste)
    
    return Math.round(100 - wastePenalty + recycleBonus);
  };

  const handleLogWaste = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const score = calculateScore(plastic, organic, recyclable, eWaste);
      const logData = {
        userId: user.uid,
        date: Timestamp.now(),
        plastic,
        organic,
        recyclable,
        eWaste,
        score,
        // For the backend API requirement
        plasticCount: plastic,
        organicCount: organic,
        recycledCount: recyclable,
        eWasteCount: eWaste
      };

      // 1. Log to Firestore (Primary)
      await addDoc(collection(db, 'wasteLogs'), logData);

      // 2. Log to Backend API (Requirement)
      try {
        await fetch('/api/waste', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            plastic,
            organic,
            recyclable,
            eWaste
          })
        });
      } catch (apiErr) {
        console.error("Backend API failed, but Firestore succeeded", apiErr);
      }

      setShowForm(false);
      setPlastic(0);
      setOrganic(0);
      setRecyclable(0);
      setEWaste(0);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'wasteLogs');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAISuggestion = () => {
    if (logs.length === 0) return "Start logging to get AI-powered waste reduction strategies.";
    const latest = logs[0];
    if (latest.plastic > latest.recyclable) {
      return "AI Insight: Your plastic footprint is high. Switch to bulk purchases and reusable containers to reduce non-recyclable waste.";
    }
    if (latest.organic > 5) {
      return "AI Insight: High organic waste detected. Consider starting a home composting system to divert this from landfills.";
    }
    return "AI Insight: Great job! Your recycling ratio is excellent. Keep maintaining this sustainable balance.";
  };

  const chartData = [...logs].reverse().slice(-7).map(l => ({
    date: l.date.toLocaleDateString(undefined, { weekday: 'short' }),
    score: l.score,
    total: l.plastic + l.organic + l.recyclable
  }));

  const weeklyData = [
    { name: 'Plastic', value: logs.reduce((acc, l) => acc + l.plastic, 0), color: '#FF4D4D' },
    { name: 'Organic', value: logs.reduce((acc, l) => acc + l.organic, 0), color: '#4DFF88' },
    { name: 'Recyclable', value: logs.reduce((acc, l) => acc + l.recyclable, 0), color: '#4D88FF' },
    { name: 'E-Waste', value: logs.reduce((acc, l) => acc + (l.eWaste || 0), 0), color: '#D1FF4D' },
  ];

  const currentScore = logs.length > 0 ? logs[0].score : 0;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 grid-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#D1FF4D]">
              <Trash2 size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Waste Intelligence</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Smart <span className="text-outline">Waste</span>
            </h1>
            <p className="text-gray-500 max-w-md text-xs font-medium uppercase tracking-widest leading-relaxed">
              Monitor, analyze, and reduce your environmental footprint with AI-driven waste management.
            </p>
          </div>

          <Button 
            onClick={() => setShowForm(true)}
            className="group flex items-center gap-3 px-8 py-4 bg-[#D1FF4D] text-black hover:shadow-[0_0_30px_rgba(209,255,77,0.4)]"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-black uppercase tracking-tighter">Log New Waste</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 bg-black border-[#1A1A1A] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={80} />
            </div>
            <div className="relative z-10 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Current Waste Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter text-[#D1FF4D]">{currentScore}</span>
                <span className="text-xs font-bold text-gray-600 uppercase">/ 100</span>
              </div>
              <div className="w-full h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentScore}%` }}
                  className="h-full bg-[#D1FF4D]"
                />
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-black border-[#1A1A1A] md:col-span-2 flex flex-col justify-center">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-[#D1FF4D]/10 rounded-2xl">
                <AlertCircle size={32} className="text-[#D1FF4D]" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D1FF4D]">AI Optimization Insight</p>
                <p className="text-lg font-bold leading-tight text-white max-w-xl">
                  {getAISuggestion()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-8 bg-black border-[#1A1A1A] space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tighter">Daily Score Trend</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Last 7 Entries</p>
              </div>
              <Calendar size={20} className="text-gray-700" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D1FF4D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D1FF4D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#444" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#444" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #1A1A1A', borderRadius: '8px' }}
                    itemStyle={{ color: '#D1FF4D', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#D1FF4D" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#scoreGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 bg-black border-[#1A1A1A] space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tighter">Waste Composition</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total KG by Category</p>
              </div>
              <Recycle size={20} className="text-gray-700" />
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #1A1A1A', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Logs Table */}
        <Card className="bg-black border-[#1A1A1A] overflow-hidden">
          <div className="p-6 border-b border-[#1A1A1A] flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tighter">Recent Logs</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{logs.length} Total Entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1A1A1A] bg-[#050505]">
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Date</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Plastic</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Organic</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Recyclable</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">E-Waste</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Score</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[#1A1A1A] hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-xs">{log.date.toLocaleDateString()}</td>
                    <td className="p-4 text-sm font-bold text-red-400">{log.plastic} KG</td>
                    <td className="p-4 text-sm font-bold text-green-400">{log.organic} KG</td>
                    <td className="p-4 text-sm font-bold text-blue-400">{log.recyclable} KG</td>
                    <td className="p-4 text-sm font-bold text-[#D1FF4D]">{log.eWaste || 0} KG</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black ${
                        log.score > 80 ? 'bg-green-500/20 text-green-400' : 
                        log.score > 50 ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {log.score}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                      No waste data recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Log Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#0A0A0A] border border-[#1A1A1A] p-8 rounded-3xl shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Log Waste</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Droplets size={12} className="text-red-400" /> Plastic Waste (KG)
                    </label>
                    <input 
                      type="number" 
                      value={plastic}
                      onChange={(e) => setPlastic(Number(e.target.value))}
                      className="w-full p-4 bg-black border border-[#1A1A1A] font-mono text-lg text-white focus:outline-none focus:border-[#D1FF4D] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Leaf size={12} className="text-green-400" /> Organic Waste (KG)
                    </label>
                    <input 
                      type="number" 
                      value={organic}
                      onChange={(e) => setOrganic(Number(e.target.value))}
                      className="w-full p-4 bg-black border border-[#1A1A1A] font-mono text-lg text-white focus:outline-none focus:border-[#D1FF4D] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Recycle size={12} className="text-blue-400" /> Recyclable Waste (KG)
                    </label>
                    <input 
                      type="number" 
                      value={recyclable}
                      onChange={(e) => setRecyclable(Number(e.target.value))}
                      className="w-full p-4 bg-black border border-[#1A1A1A] font-mono text-lg text-white focus:outline-none focus:border-[#D1FF4D] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Zap size={12} className="text-[#D1FF4D]" /> E-Waste (KG)
                    </label>
                    <input 
                      type="number" 
                      value={eWaste}
                      onChange={(e) => setEWaste(Number(e.target.value))}
                      className="w-full p-4 bg-black border border-[#1A1A1A] font-mono text-lg text-white focus:outline-none focus:border-[#D1FF4D] transition-colors"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#D1FF4D]/5 border border-[#D1FF4D]/20 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-gray-500">Estimated Score:</span>
                    <span className="text-[#D1FF4D]">{calculateScore(plastic, organic, recyclable, eWaste)} / 100</span>
                  </div>
                </div>

                <Button 
                  onClick={handleLogWaste}
                  disabled={isSubmitting}
                  className="w-full py-4 text-lg bg-[#D1FF4D] text-black"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm & Log Waste'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
