import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'ngo', phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      login(res.data.user, res.data.token);
      
      if (res.data.user.role === 'ngo') navigate('/ngo/dashboard');
      else if (res.data.user.role === 'verifier') navigate('/verifier/dashboard');
      else navigate('/buyer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#95B8A4_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-soft border border-sage/20 relative z-10"
      >
        <div className="text-center">
          <Leaf className="mx-auto h-12 w-12 text-forest" />
          <h2 className="mt-6 text-3xl font-serif font-bold text-forest">Create an account</h2>
          <p className="mt-2 text-sm text-forest/70">
            Join the transparent carbon ecosystem
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="text-rust text-sm text-center font-medium bg-rust/10 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-forest">Full Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-cream border border-sage/40 rounded-lg focus:ring-forest focus:border-forest" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-forest">Email address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-cream border border-sage/40 rounded-lg focus:ring-forest focus:border-forest" />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest">Phone (Optional)</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-cream border border-sage/40 rounded-lg focus:ring-forest focus:border-forest" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-forest">Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-cream border border-sage/40 rounded-lg focus:ring-forest focus:border-forest">
              <option value="ngo">NGO / Cooperative</option>
              <option value="buyer">Credit Buyer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest">Password</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full px-4 py-2 bg-cream border border-sage/40 rounded-lg focus:ring-forest focus:border-forest" />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-cream bg-forest hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest transition-colors disabled:opacity-50">
              {loading ? 'Creating...' : 'Register'}
            </button>
          </div>
          
          <div className="text-center text-sm text-forest/80">
            Already have an account? <Link to="/login" className="text-forest font-bold hover:underline">Log in</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
