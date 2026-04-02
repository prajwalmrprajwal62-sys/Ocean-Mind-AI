import { Link, useLocation } from 'react-router-dom';
import { Waves, Map as MapIcon, LayoutDashboard, Camera, LogOut, User, Shield, Anchor, Trophy, Building2, Heart, Trash2, Activity, Zap, Cloud } from 'lucide-react';
import { logout, signInWithGoogle, getAuthErrorMessage } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Button } from './UI';
import { toast } from 'sonner';

export const Navbar = () => {
  const { user, profile } = useAuth();
  const location = useLocation();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-[#1A1A1A] p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-[#D1FF4D] p-2 rounded-lg group-hover:shadow-[0_0_15px_rgba(209,255,77,0.5)] transition-all">
            <Waves className="text-black" size={20} />
          </div>
          <span className="text-xl font-black uppercase tracking-tighter text-white">OceanMind+</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/dashboard" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/dashboard') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-[#D1FF4D]'}`}>
            <LayoutDashboard size={14} className="group-hover:scale-110 transition-transform" />
            <span>Dashboard</span>
          </Link>
          <Link to="/map" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/map') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-[#D1FF4D]'}`}>
            <MapIcon size={14} className="group-hover:scale-110 transition-transform" />
            <span>Risk Map</span>
          </Link>
          <Link to="/log" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/log') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-white'}`}>
            <Camera size={14} className="group-hover:scale-110 transition-transform" />
            <span>Report</span>
          </Link>
          <Link to="/fisher" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/fisher') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-[#D1FF4D]'}`}>
            <Anchor size={14} className="group-hover:scale-110 transition-transform" />
            <span>Fisher Hub</span>
          </Link>
          <Link to="/leaderboard" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/leaderboard') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-[#D1FF4D]'}`}>
            <Trophy size={14} className="group-hover:scale-110 transition-transform" />
            <span>Leaderboard</span>
          </Link>
          <Link to="/waste" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/waste') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-[#D1FF4D]'}`}>
            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
            <span>Waste</span>
          </Link>
          <Link to="/pollution" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/pollution') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-[#D1FF4D]'}`}>
            <Activity size={14} className="group-hover:scale-110 transition-transform" />
            <span>Pollution</span>
          </Link>
          <Link to="/resources" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/resources') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-[#D1FF4D]'}`}>
            <Zap size={14} className="group-hover:scale-110 transition-transform" />
            <span>Resources</span>
          </Link>
          <Link to="/weather" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/weather') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-[#D1FF4D]'}`}>
            <Cloud size={14} className="group-hover:scale-110 transition-transform" />
            <span>Weather</span>
          </Link>
          <Link to="/corporate" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/corporate') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-[#D1FF4D]'}`}>
            <Building2 size={14} className="group-hover:scale-110 transition-transform" />
            <span>Corporate</span>
          </Link>
          <Link to="/marketplace" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/marketplace') ? 'text-[#D1FF4D]' : 'text-gray-400 hover:text-[#D1FF4D]'}`}>
            <Heart size={14} className="group-hover:scale-110 transition-transform" />
            <span>Marketplace</span>
          </Link>
          {profile?.role === 'admin' && (
            <Link to="/policy" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors group ${isActive('/policy') ? 'text-red-500' : 'text-red-500 hover:text-red-400'}`}>
              <Shield size={14} className="group-hover:scale-110 transition-transform" />
              <span>Policy</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold uppercase text-white tracking-widest">{profile?.displayName}</p>
                <p className="text-[9px] text-[#D1FF4D] font-mono tracking-tighter">{profile?.points} PTS</p>
              </div>
              <button onClick={logout} className="p-2 text-gray-400 hover:text-white transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Button 
              variant="accent" 
              onClick={handleSignIn}
              className="py-2 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-white text-black hover:bg-gray-200 border-none"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
