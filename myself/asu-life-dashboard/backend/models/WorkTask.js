import mongoose from 'mongoose';

const workTaskSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: String, default: '' },
  },
  { timestamps: true }
);

export const WorkTask = mongoose.model('WorkTask', workTaskSchema);
