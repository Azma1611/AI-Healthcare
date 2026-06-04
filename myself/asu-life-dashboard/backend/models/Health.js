import mongoose from 'mongoose';

const sleepSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    hours: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const mealSchema = new mongoose.Schema(
  {
    meal: { type: String, required: true },
    time: { type: String, default: '' },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const healthSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    waterReminder: {
      daily: { type: Number, default: 8, min: 0 },
      completed: { type: Number, default: 0, min: 0 },
    },
    sleepTracker: [sleepSchema],
    foodReminders: [mealSchema],
  },
  { timestamps: true }
);

export const Health = mongoose.model('Health', healthSchema);
