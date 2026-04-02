import { Waves, Shield, Zap, Globe, ArrowRight, Hexagon, Cpu, Clock, BarChart3, Target, ZapOff, Camera, Anchor, Heart, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '../components/UI';
import { motion } from 'motion/react';
import { WeatherWidget } from '../components/WeatherWidget';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D1FF4D] selection:text-black">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-4 md:px-24 overflow-hidden grid-pattern">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D1FF4D]/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="accent" className="mb-6">v2.0 AI Decision Engine</Badge>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
              Protect Our<br />
              <span className="text-[#D1FF4D]">Oceans</span> With<br />
              AI Intelligence.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mb-12">
              OceanMind+ is the first platform to link individual behavior, real-time AI pollution detection, and predictive policy action into one exponential impact loop.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/dashboard">
                <Button className="text-lg px-10 py-4">Join the Mission</Button>
              </Link>
              <Link to="/map">
                <Button variant="outline" className="text-lg px-10 py-4">Live Risk Map</Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Hexagon Background */}
        <div className="absolute right-[-10%] top-[20%] opacity-10 hidden lg:block">
          <Hexagon size={600} className="text-[#D1FF4D] animate-pulse" strokeWidth={0.5} />
        </div>
      </section>

      {/* Secondary Nav */}
      <div className="border-y border-[#1A1A1A] bg-black/50 backdrop-blur sticky top-[73px] z-40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center gap-12">
          {['Features', 'Weather', 'Use Cases', 'Testimonials', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-[#D1FF4D] transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Weather Section */}
      <section id="weather" className="py-32 px-4 bg-[#050505] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div>
              <Badge variant="accent" className="mb-6">Real-Time Environmental Intelligence</Badge>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-tight">
                Marine Weather <br />
                <span className="text-[#D1FF4D]">Monitoring.</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                OceanMind+ integrates real-time meteorological data to provide fishers, coastal communities, and policy makers with critical safety information. Our AI models analyze wind patterns, humidity, and pressure to predict marine risks.
              </p>
              <div className="flex gap-4">
                <Link to="/weather">
                  <Button className="px-8 py-3">Explore Weather Station</Button>
                </Link>
                <Link to="/map">
                  <Button variant="outline" className="px-8 py-3">View Risk Map</Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#D1FF4D]/10 blur-[100px] rounded-full" />
              <div className="relative z-10 scale-110">
                <WeatherWidget />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight — “The Hexagon” */}
      <section id="features" className="py-32 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-24 items-center">
          <div className="relative flex justify-center">
            <div className="absolute inset-0 bg-[#D1FF4D]/20 blur-[100px] rounded-full" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative z-10"
            >
              <Hexagon size={300} className="text-[#D1FF4D]" strokeWidth={1} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu size={80} className="text-[#D1FF4D]" />
              </div>
            </motion.div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">Pollution Control Engine</h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Our AI doesn't just track data; it predicts hotspots 7 days ahead, enabling rapid response and predictive prevention instead of reactive cleanup.
            </p>
            <div className="space-y-6">
              {[
                { title: 'Instant Reporting', desc: 'Snap a photo, AI classifies it, and it appears on the map in 30 seconds.' },
                { title: 'Predictive Mapping', desc: 'ML models forecast pollution movement based on currents and weather.' },
                { title: 'Automated Alerts', desc: 'Authorities are notified instantly when risk levels spike in critical zones.' },
                { title: 'Public Validation', desc: 'See your report turn into action with real-time status tracking.' },
              ].map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1"><div className="w-2 h-2 bg-[#D1FF4D] rounded-full shadow-[0_0_8px_#D1FF4D]" /></div>
                  <div>
                    <h4 className="font-bold uppercase tracking-tight text-white">{f.title}</h4>
                    <p className="text-sm text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Impact Loop: Priya's Journey */}
      <section className="py-32 px-4 bg-[#0A0A0A] border-y border-[#1A1A1A] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <Badge variant="accent" className="mb-4">The Complete User Journey</Badge>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">The Impact Loop</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs max-w-2xl mx-auto">
              How 6 modules work together to transform a single citizen's action into a global marine restoration movement.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#D1FF4D] via-[#D1FF4D]/20 to-transparent hidden md:block" />

            <div className="space-y-24">
              {[
                {
                  week: 'Week 1',
                  title: 'The Spark',
                  desc: 'Priya downloads OceanMind+, logs her first waste cleanup. Score: 45/100.',
                  module: 'Module 1: Social & Gamification',
                  align: 'left',
                  icon: <Zap size={24} />
                },
                {
                  week: 'Week 2',
                  title: 'Data Intelligence',
                  desc: 'Priya reports beach litter with a photo. AI classifies it instantly. Score → 52.',
                  module: 'Module 2: AI Pollution Detection',
                  align: 'right',
                  icon: <Camera size={24} />
                },
                {
                  week: 'Week 3',
                  title: 'Policy Action',
                  desc: 'Her report triggers a high-priority alert on the Policy Dashboard. A cleanup is organized.',
                  module: 'Module 6: Decision & Policy',
                  align: 'left',
                  icon: <Shield size={24} />
                },
                {
                  week: 'Week 4',
                  title: 'Community Synergy',
                  desc: 'At the cleanup, she meets local fishers using the Fisher Hub to track biodiversity.',
                  module: 'Module 4: Fisher Hub',
                  align: 'right',
                  icon: <Anchor size={24} />
                },
                {
                  week: 'Month 3',
                  title: 'Regional Health',
                  desc: 'Collective action improves Mumbai’s coastal health score from 58 to 61.',
                  module: 'Module 5: Regional Health Index',
                  align: 'left',
                  icon: <Globe size={24} />
                },
                {
                  week: 'Month 9',
                  title: 'Corporate Funding',
                  desc: 'A corporate sponsor sees the impact and funds a ₹18L mangrove project in her zone.',
                  module: 'Module 6: Impact Marketplace',
                  align: 'right',
                  icon: <Heart size={24} />
                }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`flex flex-col md:flex-row items-center gap-12 ${step.align === 'right' ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={`flex-1 ${step.align === 'left' ? 'md:text-right' : 'md:text-left'}`}>
                    <p className="text-[#D1FF4D] font-black text-2xl mb-2">{step.week}</p>
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">{step.title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed mb-4">{step.desc}</p>
                    <Badge variant="outline" className="text-[8px] border-gray-800 text-gray-500">{step.module}</Badge>
                  </div>
                  <div className="relative z-10 w-16 h-16 bg-black border-2 border-[#D1FF4D] rounded-full flex items-center justify-center text-[#D1FF4D] shadow-[0_0_20px_rgba(209,255,77,0.3)]">
                    {step.icon}
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section id="use-cases" className="py-32 bg-[#050505] border-y border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Engineered for Impact</h2>
            <p className="text-gray-500 font-mono uppercase tracking-widest text-sm">Scalable Solutions for Global Marine Protection</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'AI Classification', icon: <Zap size={24} />, desc: '89% accuracy in identifying marine litter types.' },
              { title: 'Risk Prediction', icon: <Shield size={24} />, desc: 'Forecast hotspots with 73% precision 7 days ahead.' },
              { title: 'Rapid Response', icon: <Clock size={24} />, desc: 'Average response time reduced from 5 days to 18 hours.' },
              { title: 'Policy Insights', icon: <BarChart3 size={24} />, desc: 'Data-driven prioritization for government intervention.' },
              { title: 'Citizen Science', icon: <Target size={24} />, desc: 'Gamified reporting system for coastal communities.' },
              { title: 'ESG Compliance', icon: <Cpu size={24} />, desc: 'Automated reporting for businesses and industries.' },
            ].map((use, i) => (
              <Card key={i} className="group hover:bg-[#0A0A0A] hover:border-[#D1FF4D]/30 transition-all">
                <div className="text-[#D1FF4D] mb-4 group-hover:scale-110 transition-transform">{use.icon}</div>
                <h4 className="text-lg font-bold uppercase tracking-tight mb-2">{use.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{use.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Partners / Pricing */}
      <section id="pricing" className="py-32 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-24">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8">Access Models</h2>
            <div className="space-y-8">
              <div className="p-8 bg-[#0A0A0A] border border-[#1A1A1A] rounded-3xl relative overflow-hidden group hover:border-[#D1FF4D]/50 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Globe size={120} className="text-[#D1FF4D]" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Citizen</h3>
                    <Badge variant="accent">FREE FOREVER</Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">For individuals, coastal residents, and ocean lovers. Track your impact, join squads, and protect your local coast.</p>
                  <ul className="space-y-3 mb-8">
                    {['AI Incident Reporting', 'Personal Impact Score', 'Live Risk Map Access', 'Community Leaderboards'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <div className="w-1.5 h-1.5 bg-[#D1FF4D] rounded-full" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full py-4 text-[10px] font-black uppercase tracking-widest">Download App</Button>
                </div>
              </div>

              <div className="p-8 bg-[#0A0A0A] border border-[#1A1A1A] rounded-3xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Building2 size={120} className="text-blue-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Enterprise</h3>
                    <Badge variant="outline" className="text-blue-500 border-blue-500/30">CUSTOM QUOTE</Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">For Governments, NGOs, and Corporations. Advanced decision intelligence, ESG reporting, and intervention simulation.</p>
                  <ul className="space-y-3 mb-8">
                    {['Policy Dashboard Access', 'ESG Compliance Reporting', 'Intervention Simulator', 'API & Raw Data Export'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full py-4 text-[10px] font-black uppercase tracking-widest border-blue-500/30 text-blue-500 hover:bg-blue-500/10">Contact Sales</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <Badge variant="accent" className="mb-6 w-fit">Strategic Partners</Badge>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">Trusted by Global<br />Conservation Leaders</h2>
            <p className="text-gray-400 text-lg mb-12 leading-relaxed">
              We collaborate with the world's leading marine organizations to ensure our data models are scientifically rigorous and our impact is measurable.
            </p>
            <div className="grid grid-cols-2 gap-8">
              {[
                { name: 'UN Ocean Decade', logo: 'https://picsum.photos/seed/un/200/100' },
                { name: 'Global Mangrove Alliance', logo: 'https://picsum.photos/seed/mangrove/200/100' },
                { name: 'Wildlife Trust of India', logo: 'https://picsum.photos/seed/wti/200/100' },
                { name: 'Ocean Conservancy', logo: 'https://picsum.photos/seed/ocean/200/100' },
              ].map((partner, i) => (
                <div key={i} className="grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100 cursor-pointer">
                  <img src={partner.logo} alt={partner.name} className="h-12 w-auto object-contain mb-2" referrerPolicy="no-referrer" />
                  <p className="text-[8px] font-bold uppercase tracking-widest text-gray-600">{partner.name}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 p-6 bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl">
              <p className="text-xs text-gray-500 leading-relaxed italic">
                "OceanMind+ has transformed how we prioritize beach cleanups in Mumbai. The predictive AI allows us to deploy volunteers where they are needed most, before the pollution even arrives."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-full bg-gray-800" />
                <div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">Dr. Anjali Shah</p>
                  <p className="text-[8px] text-gray-600 uppercase tracking-widest">Director, Coastal Research India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#D1FF4D]/5 blur-[120px] rounded-full translate-y-1/2" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8">
            Ready to Protect <br />Our Oceans?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join 10M+ users driving exponential impact through AI-powered conservation.
          </p>
          <Link to="/dashboard">
            <Button className="text-xl px-16 py-6 shadow-[0_0_30px_rgba(209,255,77,0.3)]">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
