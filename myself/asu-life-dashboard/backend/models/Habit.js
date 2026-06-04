import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    streak: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: false },
    lastCompletedAt: { type: Date },
  },
  { timestamps: true }
);

export const Habit = mongoose.model('Habit', habitSchema);
