import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Badge } from '../components/UI';
import { AlertCircle, CheckCircle2, Clock, Trash2, Filter, Download, Activity, Shield, Target, TrendingUp, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPollutionForecast } from '../services/pollutionService';

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [forecasts, setForecasts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    setForecasts(getPollutionForecast(7).filter(f => f.riskScore > 70));
    return () => unsubscribe();
  }, []);

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <Card className="max-w-md text-center border-red-500/30">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-black uppercase tracking-tighter text-red-500 mb-2">Unauthorized Access</h2>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">System: Security Protocol // Status: Blocked</p>
        </Card>
      </div>
    );
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'reports', id), { status });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this report?')) {
      await deleteDoc(doc(db, 'reports', id));
    }
  };

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 grid-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter">Policy Dashboard</h1>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">Government & NGO Decision Interface // Admin: {profile?.displayName}</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="flex items-center gap-2 text-xs border-[#1A1A1A] hover:border-[#D1FF4D]/30">
              <Download size={14} /> Export Intelligence
            </Button>
            <Button variant="outline" className="flex items-center gap-2 text-xs border-[#1A1A1A] hover:border-[#D1FF4D]/30">
              <Filter size={14} /> Filter Feed
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Critical', value: reports.filter(r => r.severity === 'high').length, sub: 'High Severity', color: 'text-red-500' },
            { label: 'Predicted', value: forecasts.length, sub: '7-Day Hotspots', color: 'text-[#D1FF4D]' },
            { label: 'Pending', value: reports.filter(r => r.status === 'new').length, sub: 'New Intelligence', color: 'text-orange-500' },
            { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, sub: 'Action Taken', color: 'text-blue-500' },
          ].map((stat, i) => (
            <Card key={i} className="border-[#1A1A1A] bg-[#050505] group hover:border-[#D1FF4D]/20 transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
              <h2 className={`text-4xl font-black ${stat.color} group-hover:scale-110 transition-transform origin-left`}>{stat.value}</h2>
              <p className="text-[10px] font-mono text-gray-600 mt-2 uppercase">{stat.sub}</p>
            </Card>
          ))}
        </div>

        {/* Predictive Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-[#D1FF4D]/20 bg-[#D1FF4D]/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Zap className="text-[#D1FF4D]" size={20} />
                <h3 className="text-xl font-bold uppercase tracking-tight text-[#D1FF4D]">Predictive Hotspot Alerts</h3>
              </div>
              <Badge variant="accent" className="text-[10px] animate-pulse">AI FORECAST ACTIVE</Badge>
            </div>
            <div className="space-y-4">
              {forecasts.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black border border-[#D1FF4D]/10 hover:border-[#D1FF4D]/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#D1FF4D]/10 rounded flex items-center justify-center text-[#D1FF4D] font-black">
                      {f.riskScore}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tight text-white">{f.regionId.replace('_', ' ')}</p>
                      <p className="text-[10px] text-gray-500 font-mono italic">Forecast: {f.date} // {f.reason}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="text-[9px] py-1 px-3 border-[#D1FF4D]/20 text-[#D1FF4D]">Deploy Response</Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-[#1A1A1A] bg-[#050505] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Info className="text-blue-500" size={20} />
              <h3 className="text-xl font-bold uppercase tracking-tight">System Status</h3>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">AI Accuracy</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-white leading-none">89.4%</span>
                  <span className="text-[10px] text-[#D1FF4D] font-bold mb-1">+1.2%</span>
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Avg Response Time</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-white leading-none">18.2h</span>
                  <span className="text-[10px] text-[#D1FF4D] font-bold mb-1">-4.5h</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Incident Feed Table */}
        <Card className="border-[#1A1A1A] bg-[#050505] p-0 overflow-hidden">
          <div className="p-6 border-b border-[#1A1A1A] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="text-[#D1FF4D]" size={20} />
              <h3 className="text-xl font-bold uppercase tracking-tight">Incident Feed</h3>
            </div>
            <Badge variant="outline" className="text-[10px] border-[#D1FF4D]/30 text-[#D1FF4D]">Live Updates</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <th className="p-4 border-b border-[#1A1A1A]">Type</th>
                  <th className="p-4 border-b border-[#1A1A1A]">Category</th>
                  <th className="p-4 border-b border-[#1A1A1A]">Region</th>
                  <th className="p-4 border-b border-[#1A1A1A]">Severity</th>
                  <th className="p-4 border-b border-[#1A1A1A]">Status</th>
                  <th className="p-4 border-b border-[#1A1A1A]">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <AnimatePresence>
                  {filteredReports.map((report) => (
                    <motion.tr 
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-[#1A1A1A] hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 font-bold uppercase tracking-tight text-[#D1FF4D]">{report.type}</td>
                      <td className="p-4 text-gray-400 font-medium">{report.category.replace('_', ' ')}</td>
                      <td className="p-4 text-gray-400">{report.location.regionLabel}</td>
                      <td className="p-4">
                        <Badge variant={report.severity === 'high' ? 'accent' : 'outline'} className="text-[10px]">
                          {report.severity}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {report.status === 'new' ? (
                            <Clock size={14} className="text-orange-500" />
                          ) : (
                            <CheckCircle2 size={14} className="text-[#D1FF4D]" />
                          )}
                          <span className={`text-[10px] font-bold uppercase ${report.status === 'new' ? 'text-orange-500' : 'text-[#D1FF4D]'}`}>
                            {report.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {report.status !== 'resolved' && (
                            <button 
                              onClick={() => handleUpdateStatus(report.id, 'resolved')}
                              className="p-2 bg-[#D1FF4D]/10 text-[#D1FF4D] hover:bg-[#D1FF4D] hover:text-black rounded transition-colors"
                              title="Resolve"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(report.id)}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Policy Recommendations */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-[#1A1A1A] bg-[#050505]">
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-red-500" size={20} />
              <h3 className="text-xl font-bold uppercase tracking-tight">Urgent Intervention Zones</h3>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Adyar River Mouth', desc: 'Plastic accumulation critical.', severity: 'CRITICAL', color: 'border-red-500/30 bg-red-500/5' },
                { name: 'Goa North Coast', desc: 'Ghost gear reports rising.', severity: 'MONITORING', color: 'border-orange-500/30 bg-orange-500/5' },
              ].map((zone, i) => (
                <div key={i} className={`p-4 border ${zone.color} flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-transform`}>
                  <div>
                    <p className="font-black uppercase tracking-tighter text-white">{i + 1}. {zone.name}</p>
                    <p className="text-[10px] text-gray-500 italic mt-1">{zone.desc}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{zone.severity}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-[#1A1A1A] bg-[#050505]">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-blue-500" size={20} />
              <h3 className="text-xl font-bold uppercase tracking-tight">ESG Intelligence</h3>
            </div>
            <div className="space-y-6">
              <p className="text-xs text-gray-400 leading-relaxed">
                Port of Chennai has improved its Ocean Responsibility Score by <span className="text-[#D1FF4D] font-bold">12%</span> this month after sponsoring 3 ghost gear recovery missions.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Corporate Avg</span>
                  <span className="text-white">65% / 75% TARGET</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D1FF4D] shadow-[0_0_10px_#D1FF4D]" style={{ width: '65%' }} />
                </div>
              </div>
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 text-[10px] font-mono text-blue-400 uppercase tracking-tighter">
                Recommendation: Incentivize local fishers for ghost gear reporting in Zone B.
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
