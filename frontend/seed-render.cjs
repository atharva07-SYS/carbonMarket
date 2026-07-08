const axios = require('axios');
const BASE = 'https://carbonmarket.onrender.com';

async function createUsers() {
  const users = [
    { name: 'Global Earth NGO', email: 'ngo@global.org', password: 'password123', role: 'ngo' },
    { name: 'Global Verifiers Inc.', email: 'verify@global.org', password: 'password123', role: 'verifier' },
    { name: 'TechCorp Industries', email: 'sustainability@techcorp.com', password: 'password123', role: 'buyer' },
  ];

  for (const u of users) {
    try {
      const r = await axios.post(`${BASE}/api/auth/register`, u);
      console.log(`✅ Created: ${u.email}`);
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      console.log(`⚠️  ${u.email}: ${msg}`);
    }
  }

  // Test login
  try {
    const r = await axios.post(`${BASE}/api/auth/login`, { email: 'ngo@global.org', password: 'password123' });
    console.log('🎉 LOGIN SUCCESS:', r.data.user.email, r.data.user.role);
  } catch (e) {
    console.log('❌ LOGIN FAILED:', e.response?.data?.message || e.message);
  }
}

createUsers();
