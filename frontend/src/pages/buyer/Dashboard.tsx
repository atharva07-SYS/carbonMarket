import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';

const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-forest mb-2">Buyer Dashboard</h1>
        <p className="text-xl text-forest/70 mb-12">Welcome, {user?.name}</p>

        <div className="bg-white p-12 rounded-2xl text-center border border-sage/20 shadow-soft">
          <h3 className="text-2xl font-bold text-forest mb-4">Your Purchased Credits & Certificates</h3>
          <p className="text-forest/70 max-w-2xl mx-auto mb-8">
            View your verified carbon offset portfolio and download blockchain-secured digital certificates.
          </p>
          <Link to="/marketplace" className="bg-forest text-cream px-8 py-3 rounded-lg font-medium inline-block hover:bg-opacity-90">
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
