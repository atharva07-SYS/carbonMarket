import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import ngoRoutes from './routes/ngo.routes';
import verifierRoutes from './routes/verifier.routes';
import buyerRoutes from './routes/buyer.routes';
import publicRoutes from './routes/public.routes';
import farmerRoutes from './routes/farmer.routes';
import connectDB from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/farmer', farmerRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
