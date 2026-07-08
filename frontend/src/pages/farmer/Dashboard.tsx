import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Map, FileText, Award } from 'lucide-react';
import axios from 'axios';
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

export default function FarmerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/farmer/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          alert('Farmer profile not found. Please contact your NGO.');
          navigate('/');
        } else {
          alert('Error loading dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [token, navigate]);

  if (loading) return <div className="pt-32 text-center">Loading dashboard...</div>;
  if (!data) return <div className="pt-32 text-center">Error loading dashboard</div>;

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-forest mb-2">Farmer Dashboard</h1>
          <p className="text-xl text-forest/70">Welcome back, {data.farmer.name} | {data.farmer.village}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sage/20">
            <div className="text-forest/70 font-medium mb-2 flex items-center"><Map className="w-5 h-5 mr-2"/> Total Land Parcels</div>
            <div className="text-3xl font-bold text-forest">{data.lands.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sage/20">
            <div className="text-forest/70 font-medium mb-2 flex items-center"><Leaf className="w-5 h-5 mr-2"/> Carbon Credits Generated</div>
            <div className="text-3xl font-bold text-success">
              {data.credits.reduce((acc: number, curr: any) => acc + curr.tonsCO2, 0)} Tons
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-sage/20">
            <div className="text-forest/70 font-medium mb-2 flex items-center"><FileText className="w-5 h-5 mr-2"/> Documents Uploaded</div>
            <div className="text-3xl font-bold text-forest">{data.documents.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lands Section */}
          <div className="bg-white p-8 rounded-2xl border border-sage/20 shadow-soft">
            <h3 className="text-2xl font-serif font-bold text-forest mb-6 flex items-center"><Map className="w-6 h-6 mr-2"/> Your Registered Lands</h3>
            {data.lands.length === 0 ? (
              <p className="text-forest/70">No land parcels registered yet.</p>
            ) : (
              <div className="space-y-4">
                {data.lands.map((land: any) => (
                  <div key={land._id} className="bg-cream p-4 rounded-xl border border-sage/20">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-forest">{land.location}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${land.status === 'Verified' ? 'bg-success/20 text-success' : 'bg-earth/20 text-earth'}`}>
                        {land.status}
                      </span>
                    </div>
                    <div className="text-sm text-forest/70">
                      Area: {land.area} acres | Trees: {land.treeType} | Soil: {land.soilType}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="bg-white p-8 rounded-2xl border border-sage/20 shadow-soft">
            <h3 className="text-2xl font-serif font-bold text-forest mb-6 flex items-center"><FileText className="w-6 h-6 mr-2"/> Your Documents</h3>
            {data.documents.length === 0 ? (
              <p className="text-forest/70">No documents uploaded.</p>
            ) : (
              <div className="space-y-4">
                {data.documents.map((doc: any) => (
                  <div key={doc._id} className="bg-cream p-4 rounded-xl border border-sage/20 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-forest">{doc.type}</div>
                      <div className="text-sm text-forest/70">Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}</div>
                    </div>
                    <span className="px-3 py-1 bg-sage/20 text-forest rounded-full text-sm font-medium">Verified: {doc.verificationStatus ? 'Yes' : 'Pending'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
