import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import NgoDashboard from './pages/ngo/Dashboard';
import NgoRegistration from './pages/ngo/RegisterLand'; // This will be refactored
import VerifierDashboard from './pages/verifier/Dashboard';
import BuyerDashboard from './pages/buyer/Dashboard';
import BuyerVerification from './pages/buyer/Verification';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-cream font-sans text-forest">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute allowedRoles={['ngo']} />}>
              <Route path="/ngo/dashboard" element={<NgoDashboard />} />
              <Route path="/ngo/register" element={<NgoRegistration />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['verifier']} />}>
              <Route path="/verifier/dashboard" element={<VerifierDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
              <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="/buyer/verify" element={<BuyerVerification />} />
            </Route>
            
            <Route path="/marketplace" element={<Marketplace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
