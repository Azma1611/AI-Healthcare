import mongoose from 'mongoose';

const languageEntrySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    activity: { type: String, default: 'Practice' },
    value: { type: Number, default: 0 },
  },
  { _id: true }
);

const languageSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    key: { type: String, required: true, trim: true },
    level: { type: String, default: 'A1' },
    dailyStreak: { type: Number, default: 0, min: 0 },
    wordsLearned: { type: Number, default: 0, min: 0 },
    speakingConfidence: { type: Number, default: 0, min: 0, max: 10 },
    lastPractice: { type: String, default: '' },
    dailyGoal: { type: Number, default: 10, min: 0 },
    todayProgress: { type: Number, default: 0, min: 0 },
    entries: [languageEntrySchema],
  },
  { timestamps: true }
);

languageSchema.index({ owner: 1, key: 1 }, { unique: true });

export const Language = mongoose.model('Language', languageSchema);
