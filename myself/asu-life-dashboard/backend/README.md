# Asu Life Dashboard Backend

Express + MongoDB API for the React/Vite dashboard.

## Install

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

The API runs at `http://127.0.0.1:5000/api` by default.

## Demo Accounts

- `asu@asu-yaso.app` / `AsuYaso123!`
- `yaso@asu-yaso.app` / `YasoAsu123!`

## API Examples

Register:

```http
POST /api/auth/register
{
  "name": "Asu",
  "email": "asu@example.com",
  "password": "AsuYaso123!",
  "role": "asu"
}
```

Login response:

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "mongo-id",
    "name": "Asu",
    "email": "asu@asu-yaso.app",
    "role": "asu",
    "theme": "pinkDream"
  }
}
```

Create a habit:

```http
POST /api/habits
Authorization: Bearer jwt-token
{
  "name": "Morning planning",
  "streak": 0,
  "completed": false
}
```

Toggle a habit:

```http
PATCH /api/habits/:id/toggle
Authorization: Bearer jwt-token
```

Analytics:

```http
GET /api/analytics
Authorization: Bearer jwt-token
```

```json
{
  "success": true,
  "data": {
    "totalSavings": 3500,
    "monthlySavings": 3500,
    "weeklyExpenses": 970,
    "productivityScore": 5,
    "completedHabits": 2,
    "totalHabits": 3,
    "studyProgress": 85
  }
}
```

## Frontend Connection

Create a root `.env` file:

```bash
VITE_API_URL=http://127.0.0.1:5000/api
```

The frontend uses `src/services/api.js` for axios setup and `src/context/UserContext.jsx` for auth-aware dashboard state.

## Production Notes

- Use a strong `JWT_SECRET`.
- Use a hosted MongoDB URI in `MONGO_URI`.
- Set `CLIENT_URL` to your production frontend domain.
- Put HTTPS, rate limiting, request logging, and a process manager in front of this API for deployment.
- Real-time, notifications, and AI chatbot placeholder routes exist under `/api/realtime`, `/api/notifications`, and `/api/ai`.
