import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BuyerVerification: React.FC = () => {
  const [formData, setFormData] = useState({ companyName: '', panDetails: '' });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/buyer/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.status) {
        setStatus(res.data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:5000/api/buyer/verify', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus('Pending');
      alert('Verification details submitted successfully!');
      navigate('/marketplace');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'Verified') {
    return (
      <div className="min-h-screen pt-32 px-4 text-center">
        <ShieldCheck className="w-16 h-16 text-success mx-auto mb-4" />
        <h2 className="text-3xl font-serif font-bold text-forest mb-2">Account Verified</h2>
        <p className="text-forest/70">You can now purchase carbon credits on the marketplace.</p>
        <button onClick={() => navigate('/marketplace')} className="mt-8 bg-forest text-cream px-6 py-2 rounded-lg">Go to Marketplace</button>
      </div>
    );
  }

  if (status === 'Pending') {
    return (
      <div className="min-h-screen pt-32 px-4 text-center">
        <div className="bg-sage/20 inline-block p-8 rounded-2xl border border-sage/40">
          <AlertCircle className="w-12 h-12 text-forest mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-forest mb-2">Verification Pending</h2>
          <p className="text-forest/70">Your company details are being reviewed by our administrators.</p>
          <button onClick={() => navigate('/marketplace')} className="mt-6 border border-forest text-forest px-6 py-2 rounded-lg hover:bg-forest/5">Browse Marketplace</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-forest mb-4">Complete Your Profile</h1>
        <p className="text-forest/70 mb-8">Before purchasing carbon credits, we need to verify your company details (KYC).</p>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-soft border border-sage/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-rust bg-rust/10 p-3 rounded">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-forest mb-1">Company Name</label>
              <input
                type="text" required
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-2 bg-cream border border-sage/40 rounded-lg focus:border-forest outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-forest mb-1">Company PAN Details</label>
              <input
                type="text" required placeholder="e.g. ABCDE1234F"
                value={formData.panDetails}
                onChange={e => setFormData({ ...formData, panDetails: e.target.value })}
                className="w-full px-4 py-2 bg-cream border border-sage/40 rounded-lg focus:border-forest outline-none uppercase"
              />
            </div>
            
            <button
              type="submit" disabled={loading}
              className="w-full bg-forest text-cream py-3 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BuyerVerification;
