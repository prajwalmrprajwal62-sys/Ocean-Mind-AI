import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import ChatBot from './components/ChatBot';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import ScanOrLogPage from './pages/ScanOrLogPage';
import OceanMapPage from './pages/OceanMapPage';
import FisherDashboardPage from './pages/FisherDashboardPage';
import LeaderboardPage from './pages/LeaderboardPage';
import RegionalHealthPage from './pages/RegionalHealthPage';
import PolicyDashboardPage from './pages/PolicyDashboardPage';
import CorporateDashboardPage from './pages/CorporateDashboardPage';
import ImpactMarketplacePage from './pages/ImpactMarketplacePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WasteManagementPage from './pages/WasteManagementPage';
import PollutionControlPage from './pages/PollutionControlPage';
import ResourceOptimizationPage from './pages/ResourceOptimizationPage';
import WeatherPage from './pages/WeatherPage';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#1A1A1A] border-t-[#D1FF4D] rounded-full animate-spin mx-auto mb-4 shadow-[0_0_15px_rgba(209,255,77,0.3)]" />
          <p className="font-black uppercase tracking-widest text-[#D1FF4D] text-xs animate-pulse">Initializing OceanMind+ Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D1FF4D] selection:text-black">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/log" element={<ScanOrLogPage />} />
              <Route path="/map" element={<OceanMapPage />} />
              <Route path="/fisher" element={<FisherDashboardPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/health" element={<RegionalHealthPage />} />
              <Route path="/policy" element={<PolicyDashboardPage />} />
              <Route path="/corporate" element={<CorporateDashboardPage />} />
              <Route path="/marketplace" element={<ImpactMarketplacePage />} />
              <Route path="/waste" element={<WasteManagementPage />} />
              <Route path="/pollution" element={<PollutionControlPage />} />
              <Route path="/resources" element={<ResourceOptimizationPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </main>
          <ChatBot />
          <Toaster position="top-right" theme="dark" richColors />
          
          <footer className="bg-[#050505] border-t border-[#1A1A1A] p-12 mt-24">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">OceanMind+</h2>
                <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mt-1">Protecting Marine Ecosystems with AI Intelligence</p>
              </div>
              <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <a href="#" className="hover:text-[#D1FF4D] transition-colors">Privacy Protocol</a>
                <a href="#" className="hover:text-[#D1FF4D] transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-[#D1FF4D] transition-colors">Contact Support</a>
              </div>
              <div className="text-[10px] font-mono text-gray-600 uppercase tracking-tighter">
                © 2026 OCEANMIND+ // SYSTEM_VERSION_2.0.4
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
