import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmer extends Document {
  ngoId: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  village?: string;
  joinedDate: Date;
}

const FarmerSchema: Schema = new Schema({
  ngoId: { type: Schema.Types.ObjectId, ref: 'NgoProfile', required: true },
  name: { type: String, required: true },
  phone: { type: String },
  village: { type: String },
  joinedDate: { type: Date, default: Date.now },
});

export default mongoose.model<IFarmer>('Farmer', FarmerSchema);
