import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    completed: { type: Boolean, default: false },
    notificationEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Reminder = mongoose.model('Reminder', reminderSchema);
