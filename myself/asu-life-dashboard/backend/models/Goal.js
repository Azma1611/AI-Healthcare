import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'General', trim: true },
    description: { type: String, default: '' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    deadline: { type: String, default: '' },
    target: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Goal = mongoose.model('Goal', goalSchema);
