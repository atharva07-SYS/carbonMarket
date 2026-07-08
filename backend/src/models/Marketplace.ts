import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketplace extends Document {
  creditId: mongoose.Types.ObjectId;
  listedDate: Date;
  active: boolean;
}

const MarketplaceSchema: Schema = new Schema({
  creditId: { type: Schema.Types.ObjectId, ref: 'CarbonCredit', required: true },
  listedDate: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

export default mongoose.model<IMarketplace>('Marketplace', MarketplaceSchema);
