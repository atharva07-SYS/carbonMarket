import mongoose, { Schema, Document } from 'mongoose';

export interface IVerification extends Document {
  landId: mongoose.Types.ObjectId;
  ocrData: any;
  ndviValue: number;
  satelliteChecked: boolean;
  trustScore: number;
  carbonEstimated: number;
  verifierReviewed: boolean;
  reviewedBy?: mongoose.Types.ObjectId;
  decision?: 'Approved' | 'Rejected';
  reason?: string;
}

const VerificationSchema: Schema = new Schema({
  landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true },
  ocrData: { type: Schema.Types.Mixed },
  ndviValue: { type: Number },
  satelliteChecked: { type: Boolean, default: false },
  trustScore: { type: Number },
  carbonEstimated: { type: Number },
  verifierReviewed: { type: Boolean, default: false },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  decision: { type: String, enum: ['Approved', 'Rejected'] },
  reason: { type: String },
});

export default mongoose.model<IVerification>('Verification', VerificationSchema);
