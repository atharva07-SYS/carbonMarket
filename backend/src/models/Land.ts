import mongoose, { Schema, Document } from 'mongoose';

export interface ILand extends Document {
  farmerId: mongoose.Types.ObjectId;
  area: number; // in hectares or acres
  location: string;
  coordinates: number[][]; // [[lat, lng], [lat, lng], ...]
  treeType: string;
  soilType: string;
  status: 'Pending Verification' | 'Processing' | 'Verified' | 'Rejected';
}

const LandSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
  area: { type: Number, required: true },
  location: { type: String, required: true },
  coordinates: { type: [[Number]], required: true },
  treeType: { type: String, required: true },
  soilType: { type: String, required: true },
  status: { type: String, enum: ['Pending Verification', 'Processing', 'Verified', 'Rejected'], default: 'Pending Verification' },
});

export default mongoose.model<ILand>('Land', LandSchema);
