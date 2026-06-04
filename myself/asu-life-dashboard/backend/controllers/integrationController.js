import { asyncHandler } from '../utils/asyncHandler.js';

export const realtimeStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      provider: 'socket.io-ready',
      channels: [`user:${req.user._id}`, `role:${req.user.role}`],
      message: 'Add Socket.IO or MongoDB change streams here when real-time UI updates are enabled.',
    },
  });
});

export const notificationStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      provider: 'web-push-ready',
      reminderQueue: true,
      message: 'Store push subscriptions here when browser notifications are enabled.',
    },
  });
});

export const aiChatStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      provider: 'ai-chatbot-ready',
      contextSources: ['goals', 'habits', 'study', 'finance', 'health'],
      message: 'Connect an AI provider here to answer dashboard questions with user-scoped context.',
    },
  });
});
