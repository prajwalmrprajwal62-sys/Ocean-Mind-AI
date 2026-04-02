import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Badge } from '../components/UI';
import { Camera, Upload, MapPin, AlertTriangle, CheckCircle2, Loader2, X, Info } from 'lucide-react';
import { analyzeMarineImage, analyzeMarineWildlife } from '../services/geminiService';
import { COASTAL_REGIONS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Fish, Trash2 } from 'lucide-react';

export default function ScanOrLogPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [region, setRegion] = useState(COASTAL_REGIONS[0].id);
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState<'pollution' | 'wildlife'>('pollution');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        handleAnalyze(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (base64: string) => {
    setAnalyzing(true);
    setConfirmed(false);
    try {
      const base64Data = base64.split(',')[1];
      const result = reportType === 'pollution' 
        ? await analyzeMarineImage(base64Data)
        : await analyzeMarineWildlife(base64Data);
      setReportData(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !reportData) return;

    try {
      const selectedRegion = COASTAL_REGIONS.find(r => r.id === region);
      
      // Calculate points based on quality
      let basePoints = reportType === 'wildlife' ? 25 : 15; // Wildlife reports are more critical
      if (image) basePoints += 20; // Photo verification bonus
      if (description.length > 50) basePoints += 10; // Detailed description bonus
      
      const reportPayload: any = {
        userId: user.uid,
        type: reportType,
        location: {
          lat: selectedRegion?.lat,
          lng: selectedRegion?.lng,
          regionLabel: selectedRegion?.name,
        },
        description: description || reportData.description,
        status: 'new',
        createdAt: new Date().toISOString(),
        credibilityScore: image ? 20 : 0,
      };

      if (reportType === 'pollution') {
        reportPayload.severity = reportData.severity;
        reportPayload.confidence = reportData.confidence;
        reportPayload.quantity = reportData.quantity;
        reportPayload.category = reportData.type;
      } else {
        reportPayload.species = reportData.species;
        reportPayload.condition = reportData.condition;
        reportPayload.animalType = reportData.animalType;
        reportPayload.severity = reportData.condition === 'injured' || reportData.condition === 'entangled' ? 'high' : 'medium';
        reportPayload.category = reportData.animalType;
      }
      
      await addDoc(collection(db, 'reports'), reportPayload);

      // Reward points
      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(basePoints),
        reportCount: increment(1),
      });

      navigate('/dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reports');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24 grid-pattern">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black uppercase tracking-tighter">30-Sec Reporting</h1>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">System: AI Vision // Module: {reportType === 'pollution' ? 'Pollution Control' : 'Wildlife Rescue'}</p>
          </div>
          <div className="flex bg-[#1A1A1A] p-1 rounded-lg border border-white/5 self-center md:self-end">
            <button 
              onClick={() => { setReportType('pollution'); setReportData(null); setImage(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${reportType === 'pollution' ? 'bg-[#D1FF4D] text-black shadow-[0_0_15px_rgba(209,255,77,0.3)]' : 'text-gray-500 hover:text-white'}`}
            >
              <Trash2 size={14} />
              Pollution
            </button>
            <button 
              onClick={() => { setReportType('wildlife'); setReportData(null); setImage(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${reportType === 'wildlife' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-white'}`}
            >
              <Fish size={14} />
              Wildlife
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="relative min-h-[450px] flex flex-col items-center justify-center border-[#1A1A1A] overflow-hidden group">
            <div className="absolute inset-0 bg-[#D1FF4D]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {image ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative w-full h-full flex flex-col"
                >
                  <img src={image} alt="Preview" className="w-full h-80 object-cover border border-[#1A1A1A]" />
                  <div className="p-4 flex justify-between items-center bg-black/80 backdrop-blur border-t border-[#1A1A1A]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Visual Evidence Captured</span>
                    <button 
                      onClick={() => { setImage(null); setReportData(null); setConfirmed(false); }}
                      className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded border border-white/10 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer group/upload"
                >
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#1A1A1A] flex items-center justify-center group-hover/upload:border-[#D1FF4D] group-hover/upload:shadow-[0_0_20px_rgba(209,255,77,0.2)] transition-all">
                    <Camera size={32} className="text-gray-500 group-hover/upload:text-[#D1FF4D]" />
                  </div>
                  <p className="mt-6 font-bold uppercase tracking-widest text-gray-500 group-hover/upload:text-[#D1FF4D]">Snap + Submit</p>
                  <p className="text-[10px] text-gray-600 mt-2 font-mono uppercase">Take photo of pollution</p>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {analyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <Loader2 className="animate-spin text-[#D1FF4D] mb-4" size={40} />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D1FF4D] animate-pulse">
                  {reportType === 'pollution' ? 'AI Classifying Pollution...' : 'AI Identifying Species...'}
                </p>
              </div>
            )}
          </Card>

          {/* Report Details */}
          <Card className="border-[#1A1A1A] bg-[#050505]">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-[#D1FF4D]" />
              <h3 className="text-xl font-bold uppercase tracking-tight">AI Classification</h3>
            </div>

            {!reportData ? (
              <div className="h-[350px] flex flex-col items-center justify-center text-gray-600 space-y-4">
                <Info size={40} strokeWidth={1} />
                <p className="text-xs font-bold uppercase tracking-widest text-center max-w-[200px]">Upload visual evidence for instant AI classification</p>
              </div>
            ) : (
              <div className="space-y-6">
                {!confirmed ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg space-y-4 ${reportType === 'pollution' ? 'bg-[#D1FF4D]/10 border-[#D1FF4D]/30' : 'bg-blue-500/10 border-blue-500/30'}`}
                  >
                    <p className={`text-sm font-bold uppercase tracking-tight ${reportType === 'pollution' ? 'text-[#D1FF4D]' : 'text-blue-400'}`}>
                      AI Suggests: "Looks like {reportType === 'pollution' ? reportData.type : reportData.species} - correct?"
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => setConfirmed(true)} className="flex-1 py-2 text-xs">Yes, Correct</Button>
                      <Button variant="outline" onClick={() => setConfirmed(true)} className="flex-1 py-2 text-xs">No, Edit</Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          {reportType === 'pollution' ? 'Type' : 'Species'}
                        </label>
                        <Badge variant="outline" className={`w-full text-center py-2 border-[#D1FF4D]/30 ${reportType === 'pollution' ? 'text-[#D1FF4D]' : 'text-blue-400'}`}>
                          {reportType === 'pollution' ? reportData.type : reportData.species}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          {reportType === 'pollution' ? 'Severity' : 'Condition'}
                        </label>
                        <Badge 
                          variant={
                            (reportType === 'pollution' && reportData.severity.toLowerCase() === 'high') || 
                            (reportType === 'wildlife' && (reportData.condition.toLowerCase() === 'injured' || reportData.condition.toLowerCase() === 'entangled'))
                            ? 'accent' : 'outline'
                          } 
                          className="w-full text-center py-2"
                        >
                          {reportType === 'pollution' ? reportData.severity : reportData.condition}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Confidence</label>
                        <div className="p-3 bg-white/5 border border-[#1A1A1A] font-mono text-xs text-[#D1FF4D]">
                          {reportData.confidence}% VERIFIED
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          {reportType === 'pollution' ? 'Est. Quantity' : 'Animal Type'}
                        </label>
                        <div className="p-3 bg-white/5 border border-[#1A1A1A] font-mono text-xs text-white">
                          {reportType === 'pollution' ? reportData.quantity : reportData.animalType}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Target Region</label>
                      <select 
                        value={region} 
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full p-3 bg-black border border-[#1A1A1A] font-bold uppercase text-sm text-white focus:outline-none focus:border-[#D1FF4D] transition-colors appearance-none"
                      >
                        {COASTAL_REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">1-Line Description</label>
                      <textarea 
                        value={description || reportData.description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional: Add more details..."
                        className="w-full p-3 bg-black border border-[#1A1A1A] font-medium text-sm h-20 text-gray-300 focus:outline-none focus:border-[#D1FF4D] transition-colors resize-none"
                      />
                    </div>

                    <Button onClick={handleSubmit} className="w-full py-4 text-lg shadow-[0_0_20px_rgba(209,255,77,0.2)]">
                      Submit Report
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <AlertTriangle className="text-orange-500" />, text: 'Reports help train our pollution prediction engine.' },
            { icon: <CheckCircle2 className="text-[#D1FF4D]" />, text: 'Verified sightings improve regional health scores.' },
            { icon: <MapPin className="text-blue-500" />, text: 'Location data is used for policy intervention mapping.' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-[#050505] border border-[#1A1A1A] flex gap-4 items-start">
              <div className="mt-1">{item.icon}</div>
              <p className="text-[10px] font-bold uppercase tracking-tight text-gray-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
