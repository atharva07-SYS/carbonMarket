import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, MapPin, User, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterNgo: React.FC = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    region: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Check if NGO profile already exists
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ngo/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.ngo) {
          navigate('/ngo/dashboard'); // Already registered
        }
      } catch (err) {
        // Will 404 if not found, which is expected
      }
    };
    checkProfile();
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ngo/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/ngo/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#95B8A4_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <Building className="mx-auto h-16 w-16 text-forest" />
          <h1 className="mt-4 text-4xl font-serif font-bold text-forest">Setup NGO Profile</h1>
          <p className="mt-4 text-lg text-forest/70">
            Welcome, {user?.name}. Please complete your NGO details to start onboarding farmers.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-soft border border-sage/20"
        >
          {error && <div className="mb-6 bg-rust/10 border border-rust/20 text-rust px-4 py-3 rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-forest mb-2">
                <Building className="w-4 h-4 mr-2" /> Organization Name
              </label>
              <input
                type="text" name="organizationName" required
                value={formData.organizationName} onChange={handleChange}
                className="w-full px-4 py-3 bg-cream border border-sage/40 rounded-lg focus:ring-forest focus:border-forest"
                placeholder="e.g. Green Earth Cooperative"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-forest mb-2">
                <User className="w-4 h-4 mr-2" /> Contact Person
              </label>
              <input
                type="text" name="contactPerson" required
                value={formData.contactPerson} onChange={handleChange}
                className="w-full px-4 py-3 bg-cream border border-sage/40 rounded-lg focus:ring-forest focus:border-forest"
                placeholder="e.g. Jane Doe"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-forest mb-2">
                <MapPin className="w-4 h-4 mr-2" /> Operating Region
              </label>
              <input
                type="text" name="region" required
                value={formData.region} onChange={handleChange}
                className="w-full px-4 py-3 bg-cream border border-sage/40 rounded-lg focus:ring-forest focus:border-forest"
                placeholder="e.g. Kerala, India"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-forest text-cream py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Create NGO Profile'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterNgo;
