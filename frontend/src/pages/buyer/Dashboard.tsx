import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Download, Award, FileText } from 'lucide-react';
import axios from 'axios';

const BuyerDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/buyer/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token]);

  if (loading) return <div className="min-h-screen pt-32 text-center text-forest">Loading...</div>;

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-forest mb-2">Buyer Dashboard</h1>
        <p className="text-xl text-forest/70 mb-12">Welcome, {user?.name}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-sage/20 shadow-soft">
            <h3 className="text-2xl font-bold text-forest mb-6 flex items-center"><Award className="mr-2" /> Your Certificates</h3>
            {data?.certificates?.length === 0 ? (
              <p className="text-forest/70">No certificates yet.</p>
            ) : (
              <div className="space-y-4">
                {data?.certificates?.map((cert: any) => (
                  <div key={cert._id} className="p-4 bg-cream border border-sage/20 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-forest">Carbon Offset Certificate</h4>
                      <p className="text-xs text-forest/70 font-mono">Hash: {cert.hash.substring(0, 16)}...</p>
                    </div>
                    <a href={cert.pdfUrl} target="_blank" rel="noreferrer" className="bg-sage/20 text-forest p-2 rounded-full hover:bg-sage/40">
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl border border-sage/20 shadow-soft">
            <h3 className="text-2xl font-bold text-forest mb-6 flex items-center"><FileText className="mr-2" /> Recent Transactions</h3>
            {data?.transactions?.length === 0 ? (
              <p className="text-forest/70">No recent transactions.</p>
            ) : (
              <div className="space-y-4">
                {data?.transactions?.map((tx: any) => (
                  <div key={tx._id} className="p-4 bg-cream border border-sage/20 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-forest">Purchase from {tx.farmerId?.name || 'Farmer'}</h4>
                      <span className="font-bold text-success">${tx.amount}</span>
                    </div>
                    <p className="text-sm text-forest/70">Date: {new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8">
              <Link to="/marketplace" className="bg-forest text-cream px-8 py-3 rounded-lg font-medium inline-block hover:bg-opacity-90 w-full text-center">
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
