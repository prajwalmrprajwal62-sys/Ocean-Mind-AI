import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { db, signInWithGoogle, getAuthErrorMessage } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Badge } from '../components/UI';
import { 
  TrendingUp, 
  TrendingDown,
  Award, 
  Zap, 
  Droplets,
  Trash2,
  AlertTriangle,
  Lightbulb,
  Minus,
  Plus,
  Fish,
  ShieldCheck,
  Target,
  BarChart3,
  Globe,
  ChevronRight,
  Activity,
  Trophy,
  ArrowUpRight,
  Info,
  User
} from 'lucide-react';
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
  Cell
} from 'recharts';
import { getOceanMindAdvice } from '../services/geminiService';
import { getUserScore, getTierIcon, getTierLabel } from '../services/scoringService';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { WeatherWidget } from '../components/WeatherWidget';
import { toast } from 'sonner';

export default function UserDashboard() {
  const { user, profile, loading } = useAuth();
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [newLog, setNewLog] = useState({ plastic: 0, organic: 0, recycled: 0, eWaste: 0 });

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  };

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'wasteLogs'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc'),
        limit(7)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setWasteLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse());
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    async function fetchAdvice() {
      if (profile) {
        setLoadingAdvice(true);
        try {
          const res = await getOceanMindAdvice(profile);
          setAdvice(res);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingAdvice(false);
        }
      }
    }
    fetchAdvice();
  }, [profile]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#D1FF4D] font-mono">LOADING_SYSTEM_DATA...</div>;
  
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md text-center border-[#D1FF4D]/30">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">Sign in to track your marine impact and join the OceanMind+ community.</p>
          <Button onClick={handleSignIn} className="w-full">Sign in with Google</Button>
        </Card>
      </div>
    );
  }

  const handleLogWaste = async () => {
    try {
      const total = newLog.plastic + newLog.organic + newLog.recycled + newLog.eWaste;
      const score = total > 0 ? (total * 5) + ((newLog.recycled + newLog.eWaste) * 10) - (newLog.plastic * 2) : 0;

      await addDoc(collection(db, 'wasteLogs'), {
        userId: user.uid,
        date: new Date().toISOString(),
        plasticCount: newLog.plastic,
        organicCount: newLog.organic,
        recycledCount: newLog.recycled,
        eWasteCount: newLog.eWaste,
        score: score,
      });
      setIsLogging(false);
      setNewLog({ plastic: 0, organic: 0, recycled: 0, eWaste: 0 });
    } catch (error) {
      console.error("Error logging waste", error);
    }
  };

  // Mock data if no logs yet
  const chartData = wasteLogs.length > 0 ? wasteLogs.map(log => ({
    name: new Date(log.date).toLocaleDateString([], { weekday: 'short' }),
    score: log.score || ((log.recycledCount + (log.eWasteCount || 0)) * 10) - (log.plasticCount * 5) + 50
  })) : [
    { name: 'Mon', score: 65 },
    { name: 'Tue', score: 72 },
    { name: 'Wed', score: 68 },
    { name: 'Thu', score: 85 },
    { name: 'Fri', score: 90 },
    { name: 'Sat', score: 88 },
    { name: 'Sun', score: 95 },
  ];

  // Reputation Logic
  const getReputation = (points: number) => {
    if (points >= 5000) return { title: 'Ocean Guardian', level: 5, color: '#D1FF4D' };
    if (points >= 2500) return { title: 'Marine Sentinel', level: 4, color: '#00FFCC' };
    if (points >= 1000) return { title: 'Coast Watcher', level: 3, color: '#00CCFF' };
    if (points >= 500) return { title: 'Active Scout', level: 2, color: '#FFFF00' };
    return { title: 'Observer', level: 1, color: '#888888' };
  };

  const reputation = getReputation(profile?.points || 0);
  const userScore = getUserScore(user.uid);

  const breakdownData = [
    { name: 'Waste', value: userScore.breakdown.waste, max: 40, color: '#D1FF4D' },
    { name: 'Reporting', value: userScore.breakdown.reporting, max: 30, color: '#00FFCC' },
    { name: 'Community', value: userScore.breakdown.community, max: 20, color: '#00CCFF' },
    { name: 'Streak', value: userScore.breakdown.streak, max: 10, color: '#FFFF00' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 grid-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#D1FF4D] p-1 overflow-hidden bg-black">
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D1FF4D] rounded-full flex items-center justify-center text-black font-black text-[10px] border-2 border-black">
                {reputation.level}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black uppercase tracking-tighter">{profile?.displayName || 'Agent'}</h1>
                <Badge style={{ backgroundColor: reputation.color }} className="text-black border-none text-[8px] font-black uppercase tracking-widest">
                  {reputation.title}
                </Badge>
              </div>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
                ID: {user.uid.slice(0, 8)}... // Credibility: {profile?.credibilityScore || 85}%
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Card className="py-2 px-4 flex items-center gap-3 border-[#D1FF4D]/20 bg-[#D1FF4D]/5">
              <Activity size={14} className="text-[#D1FF4D]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D1FF4D]">System Online</span>
            </Card>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-2 relative overflow-hidden group border-[#1A1A1A] bg-[#0A0A0A]">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Score Circle */}
              <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-3xl border border-white/5">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      fill="none"
                      stroke="#1A1A1A"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="58"
                      fill="none"
                      stroke="#D1FF4D"
                      strokeWidth="8"
                      strokeDasharray={364}
                      initial={{ strokeDashoffset: 364 }}
                      animate={{ strokeDashoffset: 364 - (364 * userScore.total) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white tracking-tighter">{userScore.total}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Impact Score</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="flex items-center gap-1 text-[#D1FF4D] text-xs font-black uppercase tracking-widest">
                    <span>{getTierIcon(userScore.total)}</span>
                    <span>{getTierLabel(userScore.total)}</span>
                  </div>
                  <div className={`flex items-center justify-center gap-1 text-[10px] font-bold mt-1 ${userScore.trend > 0 ? 'text-[#D1FF4D]' : 'text-red-500'}`}>
                    {userScore.trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(userScore.trend)} vs last month
                  </div>
                </div>
              </div>

              {/* Breakdown Bar Chart */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Score Breakdown</h3>
                  <Link to="/leaderboard" className="text-[9px] font-bold uppercase tracking-widest text-[#D1FF4D] hover:underline flex items-center gap-1">
                    Leaderboard <ArrowUpRight size={10} />
                  </Link>
                </div>
                <div className="space-y-4">
                  {breakdownData.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                        <span className="text-gray-500">{item.name}</span>
                        <span className="text-white">{item.value}/{item.max}</span>
                      </div>
                      <div className="h-1.5 bg-black rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / item.max) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-3 bg-[#1A1A1A]/50 rounded-xl border border-white/5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                    <span className="text-[#D1FF4D]">Tip:</span> 8 points to Ocean Guardian! Join a beach cleanup this week (+5pts)
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <WeatherWidget />

          <div className="grid grid-cols-1 gap-6">
            <Card className="flex flex-col justify-between border-[#1A1A1A] bg-white/5 hover:border-[#D1FF4D]/30 transition-all group">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">BluePoints</p>
                <h2 className="text-4xl font-black text-[#D1FF4D] group-hover:scale-110 transition-transform origin-left">{profile?.points || 0}</h2>
              </div>
              <div className="flex justify-between items-end">
                <Link to="/marketplace" className="text-[9px] font-bold text-[#D1FF4D] uppercase tracking-widest hover:underline flex items-center gap-1">
                  Redeem Rewards <ArrowUpRight size={10} />
                </Link>
                <Award className="text-[#D1FF4D]" size={24} />
              </div>
            </Card>

            <Card className="flex flex-col justify-between border-[#1A1A1A] bg-white/5 hover:border-[#D1FF4D]/30 transition-all group">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Pollution Removed</p>
                <h2 className="text-4xl font-black text-white group-hover:scale-110 transition-transform origin-left">
                  {profile?.totalWasteRemoved || 12.4} <span className="text-xs font-mono text-gray-500">KG</span>
                </h2>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-mono text-gray-600 uppercase">CO2 Offset: 4.2kg</span>
                <Trash2 className="text-white opacity-50" size={24} />
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart Section */}
          <Card className="lg:col-span-2 p-6 border-[#1A1A1A]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold uppercase tracking-tight">Performance Analytics</h3>
              <div className="flex gap-2">
                <Badge variant="outline">7 Days</Badge>
                <Badge variant="outline" className="opacity-30">30 Days</Badge>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D1FF4D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D1FF4D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#444" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontWeight: 'bold' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #D1FF4D', borderRadius: '4px', fontSize: '10px', color: '#fff' }}
                    itemStyle={{ color: '#D1FF4D' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#D1FF4D" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsLogging(true)}>Log Daily Action</Button>
            </div>
          </Card>

          {/* AI Advice Section */}
          <div className="space-y-6">
            <Card className="border-[#D1FF4D]/30 bg-[#D1FF4D]/5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-[#D1FF4D]" size={20} />
                <h3 className="text-lg font-bold uppercase tracking-tight text-[#D1FF4D]">AI Tactical Advice</h3>
              </div>
              <div className="text-sm text-gray-300 leading-relaxed font-medium italic">
                {loadingAdvice ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                  </div>
                ) : (
                  advice || "Analyze your data to receive personalized tactical suggestions."
                )}
              </div>
            </Card>

            <Card className="border-[#1A1A1A]">
              <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Recent Operations</h3>
              <div className="space-y-4">
                {wasteLogs.length > 0 ? (
                  wasteLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5 hover:border-[#D1FF4D]/30 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-black rounded border border-white/10 text-gray-400 group-hover:text-[#D1FF4D] transition-colors">
                          <Trash2 size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-tight">Waste Logged</p>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {log.date?.toDate ? log.date.toDate().toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#D1FF4D]">+{log.score || 0}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600 font-bold uppercase tracking-widest text-[10px]">
                    No recent operations found.
                  </div>
                )}
              </div>
              <Link to="/waste">
                <Button variant="outline" className="w-full mt-6 text-[10px]">View All Logs</Button>
              </Link>
            </Card>

            <Card className="border-[#1A1A1A] bg-[#0A0A0A]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold uppercase tracking-tight">Your Squad</h3>
                <Badge variant="accent" className="text-[8px]">Rank #12</Badge>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#D1FF4D] rounded-2xl flex items-center justify-center text-black font-black text-xl">
                  BW
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-tighter text-white">Beach Warriors</h4>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Mumbai Chapter // 12 Members</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Monthly Goal</span>
                  <span className="text-white">850kg / 1000kg</span>
                </div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-[#D1FF4D] w-[85%]" />
                </div>
                <div className="flex -space-x-2 pt-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[8px] font-bold">
                      {i === 5 ? '+7' : <User size={10} />}
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6 text-[10px]">Squad Dashboard</Button>
            </Card>
          </div>

        </div>
      </div>

      {/* Log Modal */}
      {isLogging && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-[#D1FF4D]/30" title="Log Daily Waste" subtitle="Land-to-Sea Impact">
            <div className="space-y-6 my-8">
              {(['plastic', 'organic', 'recycled', 'eWaste'] as const).map(type => (
                <div key={type} className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-tighter text-white">{type} Items</span>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setNewLog(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }))}
                      className="w-8 h-8 border border-[#1A1A1A] flex items-center justify-center hover:bg-[#D1FF4D] hover:text-black transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-2xl font-black w-8 text-center text-[#D1FF4D]">{newLog[type]}</span>
                    <button 
                      onClick={() => setNewLog(prev => ({ ...prev, [type]: prev[type] + 1 }))}
                      className="w-8 h-8 border border-[#1A1A1A] flex items-center justify-center hover:bg-[#D1FF4D] hover:text-black transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Button onClick={handleLogWaste} className="flex-1">Save Log</Button>
              <button onClick={() => setIsLogging(false)} className="flex-1 border border-[#1A1A1A] font-bold uppercase text-xs hover:bg-white/5 transition-colors">Cancel</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
