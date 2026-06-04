import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'Other', trim: true },
    note: { type: String, default: '' },
    date: { type: String, required: true },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

export const Expense = mongoose.model('Expense', expenseSchema);
