import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Stats {
  totalFarmers: number;
  tonsCO2Verified: number;
  totalRevenue: number;
}

const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ totalFarmers: 0, tonsCO2Verified: 0, totalRevenue: 0 });

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public/stats`)
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background SVG Texture (mocked with simple CSS pattern for now) */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#95B8A4_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Leaf className="text-forest h-8 w-8" />
          <span className="font-serif text-2xl font-bold tracking-tight text-forest">Carbon Market</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-forest font-medium hover:text-opacity-80 transition-colors">Log In</Link>
          <Link to="/login" className="text-forest font-medium hover:text-opacity-80 transition-colors">Verifier Login</Link>
          <Link to="/register" className="bg-forest text-cream px-5 py-2.5 rounded-lg font-medium hover:bg-opacity-90 shadow-soft transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold text-forest leading-tight mb-6"
          >
            Verified Carbon Credits, <br />
            <span className="text-earth">Powered by AI</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-forest/80 mb-12 max-w-2xl mx-auto"
          >
            Connecting sustainable farmers directly with industry buyers through transparent, satellite-verified carbon offsets.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link to="/register" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-forest text-cream px-8 py-4 rounded-lg text-lg font-medium hover:bg-opacity-90 shadow-soft transition-all">
              <span>Register NGO</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/register" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-earth/20 text-forest border border-earth/50 px-8 py-4 rounded-lg text-lg font-medium hover:bg-earth/30 transition-all">
              <span>Register Buyer</span>
            </Link>
          </motion.div>
        </div>

        {/* Live Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-soft border border-sage/20 flex flex-col items-center text-center">
            <div className="bg-sage/20 p-4 rounded-full mb-4">
              <Leaf className="h-8 w-8 text-forest" />
            </div>
            <h3 className="text-4xl font-serif font-bold text-forest mb-2">{stats.totalFarmers.toLocaleString()}</h3>
            <p className="text-forest/70 font-medium">Farmers Onboarded</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-soft border border-sage/20 flex flex-col items-center text-center">
            <div className="bg-sage/20 p-4 rounded-full mb-4">
              <ShieldCheck className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-4xl font-serif font-bold text-forest mb-2">{stats.tonsCO2Verified.toLocaleString()}t</h3>
            <p className="text-forest/70 font-medium">CO₂ Verified & Removed</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-soft border border-sage/20 flex flex-col items-center text-center">
            <div className="bg-sage/20 p-4 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-earth" />
            </div>
            <h3 className="text-4xl font-serif font-bold text-forest mb-2">${(stats.totalRevenue / 1000).toFixed(1)}k</h3>
            <p className="text-forest/70 font-medium">Farmer Revenue Generated</p>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-32 max-w-5xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-forest text-center mb-12">Platform Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-forest">For Farmers & NGOs</h3>
              <ul className="space-y-3 text-forest/80">
                <li className="flex items-start"><CheckCircle className="h-5 w-5 text-success mr-2 mt-0.5 shrink-0" /> Monetize sustainable farming practices quickly and easily.</li>
                <li className="flex items-start"><CheckCircle className="h-5 w-5 text-success mr-2 mt-0.5 shrink-0" /> AI-driven verification replaces expensive manual audits.</li>
                <li className="flex items-start"><CheckCircle className="h-5 w-5 text-success mr-2 mt-0.5 shrink-0" /> Direct access to the industry marketplace with no middlemen.</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-forest">For Industry Buyers</h3>
              <ul className="space-y-3 text-forest/80">
                <li className="flex items-start"><CheckCircle className="h-5 w-5 text-success mr-2 mt-0.5 shrink-0" /> 100% transparent, satellite-verified carbon credits.</li>
                <li className="flex items-start"><CheckCircle className="h-5 w-5 text-success mr-2 mt-0.5 shrink-0" /> Direct funding to communities creating real impact.</li>
                <li className="flex items-start"><CheckCircle className="h-5 w-5 text-success mr-2 mt-0.5 shrink-0" /> Instant digital certificates and atomic blockchain-like ledger.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default LandingPage;
