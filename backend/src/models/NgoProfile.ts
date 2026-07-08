import mongoose, { Schema, Document } from 'mongoose';

export interface INgoProfile extends Document {
  userId: mongoose.Types.ObjectId;
  organizationName: string;
  contactPerson: string;
  region: string;
  joinedDate: Date;
}

const NgoProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  region: { type: String, required: true },
  joinedDate: { type: Date, default: Date.now },
});

export default mongoose.model<INgoProfile>('NgoProfile', NgoProfileSchema);
