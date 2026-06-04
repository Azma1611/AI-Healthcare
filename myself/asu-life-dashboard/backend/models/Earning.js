import mongoose from 'mongoose';

const earningSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    source: { type: String, default: 'General', trim: true },
    note: { type: String, default: '' },
    date: { type: String, required: true },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

export const Earning = mongoose.model('Earning', earningSchema);
