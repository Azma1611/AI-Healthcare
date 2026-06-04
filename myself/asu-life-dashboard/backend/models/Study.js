import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    credits: { type: Number, default: 0 },
    grade: { type: String, default: '' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: true }
);

const attendanceSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    percentage: { type: Number, default: 100, min: 0, max: 100 },
  },
  { _id: true }
);

const hourSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    hours: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: '' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: true }
);

const studySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentSemester: { type: Number, default: 1 },
    gpa: { type: Number, default: 0, min: 0, max: 10 },
    subjects: [subjectSchema],
    attendance: [attendanceSchema],
    hours: [hourSchema],
    aiRobotics: {
      learningPath: [{ type: String }],
      currentLevel: { type: Number, default: 1 },
      projects: [projectSchema],
    },
  },
  { timestamps: true }
);

export const Study = mongoose.model('Study', studySchema);
