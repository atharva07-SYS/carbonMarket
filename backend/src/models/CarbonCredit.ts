import mongoose, { Schema, Document } from 'mongoose';

export interface ICarbonCredit extends Document {
  landId: mongoose.Types.ObjectId;
  tonsCO2: number;
  pricePerTon: number;
  owner: mongoose.Types.ObjectId;
  available: boolean;
}

const CarbonCreditSchema: Schema = new Schema({
  landId: { type: Schema.Types.ObjectId, ref: 'Land', required: true },
  tonsCO2: { type: Number, required: true },
  pricePerTon: { type: Number, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  available: { type: Boolean, default: true },
});

export default mongoose.model<ICarbonCredit>('CarbonCredit', CarbonCreditSchema);
