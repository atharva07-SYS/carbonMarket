import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  transactionId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  pdfUrl: string;
  hash: string;
  issuedDate: Date;
}

const CertificateSchema: Schema = new Schema({
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Land', required: true },
  pdfUrl: { type: String, required: true },
  hash: { type: String, required: true },
  issuedDate: { type: Date, default: Date.now },
});

export default mongoose.model<ICertificate>('Certificate', CertificateSchema);
