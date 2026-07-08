import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  farmerId: mongoose.Types.ObjectId;
  type: string; // e.g., 'Land Ownership Proof', 'Soil Carbon Report'
  fileUrl: string; // path or URL
  uploadedDate: Date;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
}

const DocumentSchema: Schema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
  type: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedDate: { type: Date, default: Date.now },
  verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
});

export default mongoose.model<IDocument>('Document', DocumentSchema);
