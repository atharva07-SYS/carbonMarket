import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  creditId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
}

const TransactionSchema: Schema = new Schema({
  creditId: { type: Schema.Types.ObjectId, ref: 'CarbonCredit', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
