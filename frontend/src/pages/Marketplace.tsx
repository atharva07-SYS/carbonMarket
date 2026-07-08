import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Listing {
  _id: string;
  creditId: {
    _id: string;
    tonsCO2: number;
    pricePerTon: number;
    landId: {
      location: string;
      treeType: string;
    };
  };
  listedDate: string;
  active: boolean;
}

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/buyer/marketplace');
      setListings(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (creditId: string) => {
    if (!user || user.role !== 'buyer') {
      alert("Only buyers can purchase credits. Please log in as a buyer.");
      return;
    }
    
    setPurchasingId(creditId);
    try {
      const res = await axios.post(`http://localhost:5000/api/buyer/purchase/${creditId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Purchase successful! Certificate Hash: ${res.data.certificate.hash}`);
      fetchListings(); // Refresh
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Purchase failed';
      alert(errMsg);
      if (errMsg.toLowerCase().includes('verified') || errMsg.toLowerCase().includes('kyc')) {
        navigate('/buyer/verify');
      }
    } finally {
      setPurchasingId(null);
    }
  };

  if (loading) return <div className="min-h-screen pt-32 text-center text-forest font-medium">Loading marketplace...</div>;

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-forest mb-4">Carbon Credit Marketplace</h1>
            <p className="text-xl text-forest/80 max-w-2xl">
              Purchase high-quality, AI-verified carbon credits directly from sustainable farmers.
            </p>
          </div>
        </div>

        {error && <div className="bg-rust/10 text-rust p-4 rounded-lg mb-8 flex items-center"><AlertCircle className="mr-2" /> {error}</div>}

        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-2xl border border-sage/20">
            <Leaf className="mx-auto h-12 w-12 text-forest/40 mb-4" />
            <h3 className="text-xl font-medium text-forest">No credits currently available</h3>
            <p className="text-forest/70 mt-2">Check back soon for newly verified projects.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => {
              const credit = listing.creditId;
              const total = credit.tonsCO2 * credit.pricePerTon;
              
              return (
                <motion.div 
                  key={listing._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-soft border border-sage/20 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-sage/20 text-forest px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-1 text-success" />
                      AI Verified
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-serif font-bold text-success">${total.toLocaleString()}</div>
                      <div className="text-sm text-forest/70">${credit.pricePerTon}/ton</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-forest mb-2">{credit.landId.location} Project</h3>
                  
                  <div className="space-y-4 mb-8 flex-grow">
                    <div className="bg-sage/10 p-3 rounded-lg border border-sage/20">
                      <span className="block text-forest/70 text-xs font-bold uppercase mb-1">Location</span>
                      <span className="block font-medium text-forest text-lg">{credit.landId.location} Region</span>
                    </div>
                    <div className="bg-sage/10 p-3 rounded-lg border border-sage/20">
                      <span className="block text-forest/70 text-xs font-bold uppercase mb-1">Carbon Quantity</span>
                      <span className="block font-medium text-forest text-lg">{credit.tonsCO2.toLocaleString()} Tons Verified CO₂</span>
                    </div>
                    <div className="bg-sage/10 p-3 rounded-lg border border-sage/20">
                      <span className="block text-forest/70 text-xs font-bold uppercase mb-1">Carbon Credits Available</span>
                      <span className="block font-medium text-success text-lg">{credit.tonsCO2.toLocaleString()} Credits</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(credit._id)}
                    disabled={purchasingId === credit._id}
                    className="w-full bg-success text-cream py-5 rounded-xl font-bold text-xl uppercase tracking-wide hover:bg-opacity-90 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:transform-none"
                  >
                    {purchasingId === credit._id ? 'Processing...' : 'Buy Carbon Credits'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
