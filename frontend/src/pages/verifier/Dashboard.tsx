import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, Check, X, Building, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifierDashboard: React.FC = () => {
  const [projectQueue, setProjectQueue] = useState<any[]>([]);
  const [buyerQueue, setBuyerQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'buyers'
  const { token } = useAuth();

  useEffect(() => {
    fetchQueues();
  }, [token]);

  const fetchQueues = async () => {
    try {
      const resProjects = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/verifier/queue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectQueue(resProjects.data);

      const resBuyers = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/verifier/buyers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBuyerQueue(resBuyers.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewProject = async (id: string, decision: 'Approved' | 'Rejected') => {
    let reason = '';
    if (decision === 'Rejected') {
      reason = prompt('Please enter a reason for rejection:') || 'No reason provided';
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/verifier/review/${id}`, { decision, reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQueues();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error processing review');
    }
  };

  const handleReviewBuyer = async (id: string, status: 'Verified' | 'Rejected') => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/verifier/buyers/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQueues();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error processing buyer review');
    }
  };

  // Group projects by NGO
  const groupedProjects = projectQueue.reduce((acc: any, item: any) => {
    const ngoName = item.landId?.farmerId?.ngoId?.organizationName || 'Unknown NGO';
    if (!acc[ngoName]) acc[ngoName] = [];
    acc[ngoName].push(item);
    return acc;
  }, {});

  if (loading) return <div className="min-h-screen pt-32 text-center text-forest">Loading queue...</div>;

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-forest mb-2">Verification Dashboard</h1>
        <p className="text-xl text-forest/70 mb-8">Review pending projects and buyer KYC details.</p>

        <div className="flex space-x-4 mb-8 border-b border-sage/20 pb-4">
          <button 
            onClick={() => setActiveTab('projects')} 
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'projects' ? 'bg-forest text-cream' : 'text-forest hover:bg-sage/20'}`}
          >
            Project Approvals ({projectQueue.length})
          </button>
          <button 
            onClick={() => setActiveTab('buyers')} 
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'buyers' ? 'bg-forest text-cream' : 'text-forest hover:bg-sage/20'}`}
          >
            Buyer Approvals ({buyerQueue.length})
          </button>
        </div>

        {activeTab === 'projects' && (
          Object.keys(groupedProjects).length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center border border-sage/20">
              <ShieldCheck className="mx-auto h-12 w-12 text-forest/40 mb-4" />
              <h3 className="text-xl font-bold text-forest">No projects pending review</h3>
              <p className="text-forest/70">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedProjects).map(([ngoName, items]: [string, any]) => (
                <div key={ngoName} className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-forest flex items-center border-b border-sage/20 pb-2">
                    <Building className="mr-2" /> {ngoName}
                  </h2>
                  
                  {items.map((item: any) => (
                    <motion.div key={item._id} className="bg-white p-6 rounded-2xl shadow-soft border border-sage/20 flex flex-col lg:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-forest mb-1">{item.landId?.location || 'Unknown Location'} Project</h3>
                        <div className="text-forest/70 text-sm mb-4">
                          Farmer: {item.landId?.farmerId?.name || 'Unknown'} • {item.landId?.area} Hectares • {item.landId?.treeType}
                        </div>
                        
                        <div className="bg-sage/10 p-4 rounded-lg mt-4">
                          <h4 className="text-md font-bold text-forest mb-2 flex justify-between">
                            <span>Trust Score: {item.trustScore}/100</span>
                            <span className="text-sm font-normal">NDVI: {item.ndviValue}</span>
                          </h4>
                          <div className="w-full bg-sage/30 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${item.trustScore >= 50 ? 'bg-forest' : 'bg-rust'}`} style={{ width: `${item.trustScore}%` }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row lg:flex-col gap-3 justify-center">
                        <button onClick={() => handleReviewProject(item._id, 'Approved')} className="flex items-center justify-center bg-forest text-cream px-6 py-2 rounded-lg font-medium hover:bg-opacity-90">
                          Approve & Mint
                        </button>
                        <button onClick={() => handleReviewProject(item._id, 'Rejected')} className="flex items-center justify-center bg-white text-rust border border-rust/30 px-6 py-2 rounded-lg font-medium hover:bg-rust/10">
                          Reject
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'buyers' && (
          buyerQueue.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center border border-sage/20">
              <ShieldCheck className="mx-auto h-12 w-12 text-forest/40 mb-4" />
              <h3 className="text-xl font-bold text-forest">No buyers pending KYC review</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {buyerQueue.map((buyer) => (
                <motion.div key={buyer._id} className="bg-white p-6 rounded-2xl shadow-soft border border-sage/20">
                  <h3 className="text-xl font-bold text-forest mb-2">{buyer.companyName}</h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between border-b border-sage/10 pb-2 text-sm">
                      <span className="text-forest/70">PAN Details:</span>
                      <span className="font-mono text-forest font-bold uppercase">{buyer.panDetails}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-forest/70">Status:</span>
                      <span className="text-rust font-bold">{buyer.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button onClick={() => handleReviewBuyer(buyer._id, 'Verified')} className="flex-1 bg-success text-cream py-2 rounded-lg font-medium hover:bg-opacity-90">Verify Buyer</button>
                    <button onClick={() => handleReviewBuyer(buyer._id, 'Rejected')} className="flex-1 bg-white border border-rust/30 text-rust py-2 rounded-lg font-medium hover:bg-rust/10">Reject</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
export default VerifierDashboard;
