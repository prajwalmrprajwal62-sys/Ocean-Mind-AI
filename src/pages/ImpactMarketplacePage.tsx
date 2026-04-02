import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { 
  Heart, 
  Share2, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Leaf, 
  Anchor, 
  Search,
  Filter,
  ArrowRight,
  Info,
  CheckCircle2,
  Lock,
  Globe,
  Award,
  Zap,
  Gift,
  ShoppingBag
} from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';

const PROJECTS = [
  {
    id: '1',
    title: 'Save Olive Ridley Nests - Rushikonda Beach',
    ngo: 'Wildlife Trust of India',
    category: 'Protection',
    goal: 1200000,
    raised: 880000,
    sponsors: 47,
    daysLeft: 22,
    impact: 'Protect 80 turtle nests, 6,000+ baby turtles saved',
    scoreBoost: '+12 PTS',
    image: 'https://picsum.photos/seed/turtle/800/400',
    description: 'Protect 80 turtle nests during March-May nesting season through patrols, sensors, and community training.',
    updates: [
      { date: 'April 12', text: '58 nests protected so far. 12 poaching attempts prevented.' },
      { date: 'March 28', text: 'Project launched! First 10 nests secured.' }
    ]
  },
  {
    id: '2',
    title: 'Recover 50 Ghost Nets - Goa Coast',
    ngo: 'Olive Ridley Project',
    category: 'Cleanup',
    goal: 1800000,
    raised: 1200000,
    sponsors: 32,
    daysLeft: 45,
    impact: 'Save 200+ marine animals, +12pts coastal health',
    scoreBoost: '+15 PTS',
    image: 'https://picsum.photos/seed/ghostnet/800/400',
    description: 'Organized recovery dive to remove 50 large ghost nets from high-density areas along the Goa coastline.',
    updates: [
      { date: 'May 05', text: '8 nets recovered in first week. 3 dolphins freed.' }
    ]
  },
  {
    id: '3',
    title: 'Mangrove Blue Carbon Project',
    ngo: 'Global Mangrove Alliance',
    category: 'Restoration',
    goal: 4000000,
    raised: 2500000,
    sponsors: 12,
    daysLeft: 90,
    impact: 'Sequester 500 tons CO2, fish nursery habitat',
    scoreBoost: '+20 PTS',
    image: 'https://picsum.photos/seed/mangrove/800/400',
    description: 'Replanting 15 hectares of degraded mangrove forest to restore biodiversity and sequester carbon.',
    updates: []
  }
];

const REWARDS = [
  {
    id: 'r1',
    title: 'Eco-Friendly Water Bottle',
    points: 500,
    category: 'Physical',
    image: 'https://picsum.photos/seed/bottle/400/300',
    description: 'Stainless steel, vacuum-insulated water bottle to reduce single-use plastic.'
  },
  {
    id: 'r2',
    title: 'Ocean Guardian Digital Badge',
    points: 200,
    category: 'Digital',
    image: 'https://picsum.photos/seed/badge/400/300',
    description: 'Exclusive digital badge for your profile and social media.'
  },
  {
    id: 'r3',
    title: 'E-Waste Recycling Voucher',
    points: 300,
    category: 'Service',
    image: 'https://picsum.photos/seed/ewaste/400/300',
    description: 'Free pickup and certified recycling for up to 5kg of e-waste.'
  }
];

export default function ImpactMarketplacePage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'rewards'>('projects');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRedeem = async (reward: typeof REWARDS[0]) => {
    if (!user || !profile) {
      toast.error("Please sign in to redeem rewards.");
      return;
    }
    
    if ((profile.points || 0) < reward.points) {
      toast.error(`Insufficient points! You need ${reward.points - (profile.points || 0)} more BluePoints.`);
      return;
    }

    toast.promise(
      async () => {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          points: (profile.points || 0) - reward.points
        });
      },
      {
        loading: 'Processing redemption...',
        success: `Successfully redeemed ${reward.title}! Check your email for details.`,
        error: 'Redemption failed. Please try again later.',
      }
    );
  };

  const filteredProjects = PROJECTS.filter(p => 
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.ngo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="text-red-500 fill-red-500" size={32} />
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Impact Marketplace</h1>
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs leading-relaxed">
              Fund verified ocean interventions or redeem your BluePoints for sustainable rewards.
            </p>
          </div>
          <div className="flex bg-[#1A1A1A] p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'projects' ? 'bg-[#D1FF4D] text-black' : 'text-gray-500 hover:text-white'}`}
            >
              Projects
            </button>
            <button 
              onClick={() => setActiveTab('rewards')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'rewards' ? 'bg-[#D1FF4D] text-black' : 'text-gray-500 hover:text-white'}`}
            >
              Rewards
            </button>
          </div>
        </div>

        {activeTab === 'projects' ? (
          <>
            {/* Categories */}
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {['All', 'Cleanup', 'Restoration', 'Protection', 'Livelihood', 'Research'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-[#D1FF4D] text-black' 
                      : 'bg-[#0A0A0A] text-gray-500 border border-[#1A1A1A] hover:border-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="bg-[#0A0A0A] border-[#1A1A1A] overflow-hidden group hover:border-[#D1FF4D]/30 transition-all flex flex-col h-full">
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge variant="accent" className="text-[8px]">{project.category}</Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10">
                            <p className="text-[8px] font-black text-[#D1FF4D] uppercase tracking-widest">{project.scoreBoost} BOOST</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 flex-1 flex flex-col">
                        <div className="mb-6">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{project.ngo}</p>
                          <h3 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-[#D1FF4D] transition-colors">{project.title}</h3>
                        </div>

                        <div className="space-y-4 mb-8">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-gray-500">Goal: ₹{(project.goal / 100000).toFixed(1)}L</span>
                            <span className="text-white">{Math.round((project.raised / project.goal) * 100)}% Funded</span>
                          </div>
                          <div className="h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(project.raised / project.goal) * 100}%` }}
                              className="h-full bg-[#D1FF4D]" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="text-center">
                            <p className="text-lg font-black text-white tracking-tighter">₹{(project.raised / 100000).toFixed(1)}L</p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Raised</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-black text-white tracking-tighter">{project.sponsors}</p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Sponsors</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-black text-white tracking-tighter">{project.daysLeft}</p>
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Days Left</p>
                          </div>
                        </div>

                        <div className="p-4 bg-black rounded-2xl border border-[#1A1A1A] mb-8">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                            <span className="text-[#D1FF4D]">Impact:</span> {project.impact}
                          </p>
                        </div>

                        <div className="mt-auto space-y-3">
                          <Button className="w-full py-4 text-[10px] font-black uppercase tracking-widest">Fund This Project</Button>
                          <Button variant="outline" className="w-full py-4 text-[10px] font-black uppercase tracking-widest">View Details</Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {REWARDS.map((reward) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-[#0A0A0A] border-[#1A1A1A] overflow-hidden group hover:border-[#D1FF4D]/30 transition-all flex flex-col h-full">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={reward.image} 
                      alt={reward.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="accent" className="text-[8px]">{reward.category}</Badge>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h3 className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-[#D1FF4D] transition-colors">{reward.title}</h3>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{reward.description}</p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-[#1A1A1A] flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-[#D1FF4D]" />
                        <span className="text-lg font-black text-[#D1FF4D]">{reward.points}</span>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Points</span>
                      </div>
                      <Button 
                        onClick={() => handleRedeem(reward)}
                        className="px-6 py-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        Redeem
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Section: Why Fund? */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-[#1A1A1A]">
          {[
            { title: 'Blockchain Verified', desc: 'Every rupee tracked and every impact verified with immutable proof.', icon: ShieldCheck },
            { title: 'Corporate Score Boost', desc: 'Directly improve your Ocean Responsibility Score with every project funded.', icon: TrendingUp },
            { title: 'Direct Livelihoods', desc: 'Support local NGOs and coastal communities executing the work.', icon: Users },
          ].map((feature, i) => (
            <div key={i} className="flex gap-6">
              <div className="p-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl text-[#D1FF4D] h-fit">
                <feature.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-tight uppercase text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
