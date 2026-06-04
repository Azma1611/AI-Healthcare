import mongoose from 'mongoose';

const savingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'General', trim: true },
    note: { type: String, default: '' },
    date: { type: String, required: true },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

export const Saving = mongoose.model('Saving', savingSchema);
