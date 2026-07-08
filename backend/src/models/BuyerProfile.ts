import mongoose, { Schema, Document } from 'mongoose';

export interface IBuyerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  panDetails: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  joinedDate: Date;
}

const BuyerProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  panDetails: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
  joinedDate: { type: Date, default: Date.now },
});

export default mongoose.model<IBuyerProfile>('BuyerProfile', BuyerProfileSchema);
