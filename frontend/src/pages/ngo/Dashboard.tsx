import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Map, Trash2, Leaf, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

export default function NgoDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('farmers'); // 'farmers' or 'add_farmer'
  
  // New Farmer Form
  const [newFarmer, setNewFarmer] = useState({ name: '', phone: '', village: '' });
  const [farmerDoc, setFarmerDoc] = useState<File | null>(null);
  
  // New Land Form
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [newLand, setNewLand] = useState({ area: '', location: '', treeType: '', soilType: '' });
  const [sevenTwelveDoc, setSevenTwelveDoc] = useState<File | null>(null);
  const [proofOfOwnerDoc, setProofOfOwnerDoc] = useState<File | null>(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ngo/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        navigate('/ngo/register');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerDoc) { alert('Identity document is required'); return; }
    try {
      const formData = new FormData();
      formData.append('name', newFarmer.name);
      formData.append('phone', newFarmer.phone);
      formData.append('village', newFarmer.village);
      formData.append('document', farmerDoc);

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ngo/farmers`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewFarmer({ name: '', phone: '', village: '' });
      setFarmerDoc(null);
      setActiveTab('farmers');
      fetchDashboard();
    } catch (err) {
      alert('Failed to add farmer');
    }
  };

  const handleDeleteFarmer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this farmer and all their land data?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ngo/farmers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboard();
    } catch (err) {
      alert('Failed to delete farmer');
    }
  };

  const handleAddLand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmerId) return;
    if (!sevenTwelveDoc || !proofOfOwnerDoc) { alert('Both 7/12 Extract and Proof of Ownership are required'); return; }
    try {
      const formData = new FormData();
      formData.append('area', newLand.area);
      formData.append('location', newLand.location);
      formData.append('treeType', newLand.treeType);
      formData.append('soilType', newLand.soilType);
      formData.append('coordinates', JSON.stringify([[0,0], [0,1], [1,1], [1,0]]));
      formData.append('sevenTwelve', sevenTwelveDoc);
      formData.append('proofOfOwner', proofOfOwnerDoc);

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ngo/farmers/${selectedFarmerId}/land`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewLand({ area: '', location: '', treeType: '', soilType: '' });
      setSevenTwelveDoc(null);
      setProofOfOwnerDoc(null);
      setSelectedFarmerId(null);
      fetchDashboard();
    } catch (err) {
      alert('Failed to add land');
    }
  };

  const handleDeleteLand = async (id: string) => {
    if (!window.confirm('Delete this land parcel?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ngo/land/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboard();
    } catch (err) {
      alert('Failed to delete land');
    }
  };

  if (loading) return <div className="pt-32 text-center">Loading dashboard...</div>;
  if (!data) return <div className="pt-32 text-center">Error loading dashboard</div>;

  return (
    <div className="min-h-screen bg-cream pt-10 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-10">
          <Leaf className="w-8 h-8 text-forest" />
          <span className="text-2xl font-bold font-serif text-forest tracking-wide">EcoLedger</span>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-forest mb-2">NGO Dashboard</h1>
          <p className="text-xl text-forest/70">{data.ngo.organizationName} - {data.ngo.region}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sage/20">
            <div className="text-forest/70 font-medium mb-2 flex items-center"><Users className="w-5 h-5 mr-2"/> Total Farmers</div>
            <div className="text-3xl font-bold text-forest">{data.farmers.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sage/20">
            <div className="text-forest/70 font-medium mb-2 flex items-center"><Map className="w-5 h-5 mr-2"/> Land Parcels</div>
            <div className="text-3xl font-bold text-forest">{data.lands.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sage/20">
            <div className="text-forest/70 font-medium mb-2 flex items-center"><Leaf className="w-5 h-5 mr-2"/> Carbon Projects</div>
            <div className="text-3xl font-bold text-success">
              {data.lands.filter((l:any) => l.status === 'Verified').length}
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          <button onClick={() => setActiveTab('farmers')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'farmers' ? 'bg-forest text-cream' : 'bg-sage/20 text-forest'}`}>Manage Farmers</button>
          <button onClick={() => setActiveTab('add_farmer')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'add_farmer' ? 'bg-forest text-cream' : 'bg-sage/20 text-forest'}`}>Add New Farmer</button>
        </div>

        {activeTab === 'add_farmer' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-2xl border border-sage/20 shadow-soft max-w-2xl">
            <h3 className="text-2xl font-serif font-bold text-forest mb-6">Register a Farmer</h3>
            <form onSubmit={handleAddFarmer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest mb-1">Full Name</label>
                <input type="text" required value={newFarmer.name} onChange={e => setNewFarmer({...newFarmer, name: e.target.value})} className="w-full px-4 py-2 border border-sage/40 rounded-lg focus:border-forest outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest mb-1">Phone</label>
                <input type="text" value={newFarmer.phone} onChange={e => setNewFarmer({...newFarmer, phone: e.target.value})} className="w-full px-4 py-2 border border-sage/40 rounded-lg focus:border-forest outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest mb-1">Village/Town</label>
                <input type="text" required value={newFarmer.village} onChange={e => setNewFarmer({...newFarmer, village: e.target.value})} className="w-full px-4 py-2 border border-sage/40 rounded-lg focus:border-forest outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest mb-1">Identity Document (PDF/Image)</label>
                <input type="file" required onChange={e => setFarmerDoc(e.target.files?.[0] || null)} className="w-full px-4 py-2 border border-sage/40 rounded-lg focus:border-forest outline-none" />
              </div>
              <button type="submit" className="bg-forest text-cream px-6 py-3 rounded-lg font-bold w-full hover:bg-opacity-90">Add Farmer</button>
            </form>
          </motion.div>
        )}

        {activeTab === 'farmers' && (
          <div className="space-y-8">
            {data.farmers.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-sage/20">
                <Users className="mx-auto h-12 w-12 text-forest/40 mb-4" />
                <h3 className="text-xl font-medium text-forest">No farmers added yet</h3>
              </div>
            ) : (
              data.farmers.map((farmer: any) => {
                const farmerLands = data.lands.filter((l:any) => l.farmerId === farmer._id);
                return (
                  <motion.div key={farmer._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-sage/20 shadow-soft">
                    <div className="flex justify-between items-start mb-6 border-b border-sage/20 pb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-forest">{farmer.name}</h3>
                        <p className="text-forest/70 mb-1">{farmer.village} {farmer.phone && `| ${farmer.phone}`}</p>
                        {farmer.userId && farmer.userId.email && (
                          <div className="text-sm bg-sage/20 text-forest px-3 py-1 rounded inline-block font-medium">
                            Login ID: {farmer.userId.email} <span className="text-forest/50 font-normal ml-2">(Default Pass: password123)</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <button onClick={() => setSelectedFarmerId(farmer._id)} className="flex items-center text-sm font-medium bg-sage/20 text-forest px-4 py-2 rounded-lg hover:bg-sage/30">
                          <Plus className="w-4 h-4 mr-1"/> Add Land
                        </button>
                        <button onClick={() => handleDeleteFarmer(farmer._id)} className="flex items-center text-sm font-medium bg-rust/10 text-rust px-4 py-2 rounded-lg hover:bg-rust/20">
                          <Trash2 className="w-4 h-4 mr-1"/> Delete
                        </button>
                      </div>
                    </div>

                    {/* Add Land Form (inline) */}
                    {selectedFarmerId === farmer._id && (
                      <div className="mb-8 bg-sage/10 p-6 rounded-xl border border-sage/30">
                        <h4 className="font-bold text-forest mb-4">Register New Land for {farmer.name}</h4>
                        <form onSubmit={handleAddLand} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase text-forest/70 mb-1">Area (Acres/Hectares)</label>
                            <input type="number" required value={newLand.area} onChange={e => setNewLand({...newLand, area: e.target.value})} className="w-full p-2 rounded border border-sage/40 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-forest/70 mb-1">Location</label>
                            <input type="text" required value={newLand.location} onChange={e => setNewLand({...newLand, location: e.target.value})} className="w-full p-2 rounded border border-sage/40 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-forest/70 mb-1">Tree Type</label>
                            <input type="text" required value={newLand.treeType} onChange={e => setNewLand({...newLand, treeType: e.target.value})} className="w-full p-2 rounded border border-sage/40 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-forest/70 mb-1">Soil Type</label>
                            <input type="text" required value={newLand.soilType} onChange={e => setNewLand({...newLand, soilType: e.target.value})} className="w-full p-2 rounded border border-sage/40 outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-forest/70 mb-1">7/12 Extract Document</label>
                            <input type="file" required onChange={e => setSevenTwelveDoc(e.target.files?.[0] || null)} className="w-full p-2 rounded border border-sage/40 outline-none bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase text-forest/70 mb-1">Proof of Ownership</label>
                            <input type="file" required onChange={e => setProofOfOwnerDoc(e.target.files?.[0] || null)} className="w-full p-2 rounded border border-sage/40 outline-none bg-white" />
                          </div>
                          <div className="md:col-span-2 flex space-x-3 mt-2">
                            <button type="submit" className="bg-forest text-cream px-6 py-2 rounded font-bold">Save Land</button>
                            <button type="button" onClick={() => { setSelectedFarmerId(null); setSevenTwelveDoc(null); setProofOfOwnerDoc(null); }} className="border border-forest/30 text-forest px-6 py-2 rounded font-bold">Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Land List */}
                    {farmerLands.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {farmerLands.map((land: any) => (
                          <div key={land._id} className="bg-cream p-4 rounded-xl border border-sage/20 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-forest">{land.location} - {land.area} acres</div>
                              <div className="text-sm text-forest/70">{land.treeType} | Status: <span className="font-medium text-success">{land.status}</span></div>
                            </div>
                            <button onClick={() => handleDeleteLand(land._id)} className="text-rust p-2 hover:bg-rust/10 rounded-full">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
