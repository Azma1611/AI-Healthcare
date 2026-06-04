import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import savingsRoutes from './routes/savingsRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import earningRoutes from './routes/earningRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import workTaskRoutes from './routes/workTaskRoutes.js';
import studyRoutes from './routes/studyRoutes.js';
import languageRoutes from './routes/languageRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

// Security and Utility Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression());
app.use(morgan('dev'));

// Routes Declaration
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/earnings', earningRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/work-tasks', workTaskRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/health-data', healthRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware (must be the last middleware)
app.use(errorHandler);

export { app };