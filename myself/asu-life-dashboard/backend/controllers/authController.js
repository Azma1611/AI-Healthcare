import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/token.js';
import { seedUserDashboard } from '../utils/seedUserDashboard.js';
import { defaultDashboardData } from '../utils/defaultDashboardData.js';

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  theme: user.theme,
  darkMode: user.darkMode,
});

const sendAuth = (res, user, statusCode = 200) => {
  const token = signToken(user);
  res.status(statusCode).json({ success: true, token, user: publicUser(user) });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!['asu', 'yaso'].includes(role)) {
    throw new ApiError('Role must be either asu or yaso.', 400);
  }

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError('Email is already registered.', 409);

  const defaults = defaultDashboardData[role]?.user || {};
  const user = await User.create({
    name: name || defaults.name,
    email,
    password,
    role,
    avatar: req.body.avatar || defaults.avatar,
    theme: req.body.theme || defaults.theme,
  });

  await seedUserDashboard(user);
  sendAuth(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError('Wrong email or password.', 401);
  }

  await seedUserDashboard(user);
  sendAuth(res, user);
});

export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out on client. Delete the JWT token.' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'avatar', 'theme', 'darkMode'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });
  await req.user.save();
  res.json({ success: true, user: publicUser(req.user) });
});
