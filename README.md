# MentorLink

**Bridging Knowledge and Opportunities**

A full-stack student-mentor platform that connects the right student with the right mentor based on their goals, skills, and expertise.

---

## Features

- 🎯 **Goal-Based Matching** — Algorithm scores mentors based on skill overlap, career goal relevance, availability, and rating
- 👥 **Two Roles** — Student and Mentor with role-specific dashboards and protected routes
- 📨 **Mentorship Requests** — Students send requests; mentors accept/reject
- 📅 **Session Booking** — Book 1-on-1 sessions with date/time/duration; double-booking prevention
- 💬 **Real-Time Chat** — Socket.IO messaging between accepted pairs with message persistence
- ⭐ **Ratings & Reviews** — Rate completed sessions; mentor average auto-recalculates
- 🔔 **In-App Notifications** — Notify on requests, accepts, session bookings, messages
- 🔒 **JWT Authentication** — Secure login, role-based access, protected routes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS v4, React Router v7, Axios, Socket.IO Client |
| Backend | Node.js, Express, MongoDB Atlas, Mongoose, JWT, bcryptjs, Socket.IO |
| Database | MongoDB Atlas |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
MentorLink/
├── client/                 # Frontend (Vite + React)
│   ├── public/logo.png     # MentorLink logo
│   ├── src/
│   │   ├── pages/
│   │   │   ├── student/    # Student dashboard, profile, mentors, sessions, chat
│   │   │   ├── mentor/     # Mentor dashboard, profile, requests, sessions, chat
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── components/     # AppLayout (sidebar), Navbar
│   │   ├── context/        # AuthContext
│   │   └── services/       # api.js (all API calls)
│   └── vercel.json         # SPA routing for Vercel
│
├── server/                 # Backend (Express + Socket.IO)
│   ├── models/             # User, MentorshipRequest, Session, Message, Rating, Notification
│   ├── routes/             # auth, users, mentors, requests, sessions, messages, ratings, notifications
│   ├── controllers/        # authController
│   ├── middleware/         # auth (JWT protect)
│   └── index.js            # Entry point with Socket.IO
│
├── .gitignore
└── README.md
```

---

## Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mentorlink
JWT_SECRET=your_long_random_secret_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

> In local dev, leave `VITE_API_URL` unset — Vite proxy handles `/api` → `http://localhost:5000`

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account

### Backend

```bash
cd server
npm install
# Create .env from .env.example and fill in values
npm run dev
```

### Frontend

```bash
cd client
npm install
# For local dev, no .env needed (Vite proxy handles API)
npm run dev
```

### Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register student or mentor |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user |
| GET/PUT | `/api/users/profile` | Get/update profile |
| GET | `/api/mentors` | List mentors (search/filter) |
| GET | `/api/mentors/recommended` | Matched mentors for student |
| GET | `/api/mentors/:id` | Mentor profile |
| POST | `/api/requests` | Send mentorship request |
| GET | `/api/requests` | List user's requests |
| PUT | `/api/requests/:id/accept` | Mentor accepts request |
| PUT | `/api/requests/:id/reject` | Mentor rejects request |
| POST | `/api/sessions` | Book session |
| GET | `/api/sessions` | List sessions |
| PUT | `/api/sessions/:id` | Update session status |
| GET | `/api/messages/conversations` | List conversations |
| GET | `/api/messages/:conversationId` | Get messages |
| POST | `/api/messages` | Send message |
| POST | `/api/ratings` | Rate a session |
| GET | `/api/ratings/mentor/:id` | Get mentor ratings |
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |

---

## Deployment

### Backend → Render

1. Connect GitHub repo to Render
2. **Root Directory**: `server`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Add environment variables in Render dashboard

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. **Root Directory**: `client`
3. **Framework**: Vite
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`

---

## User Flows

**Student**: Register → Complete Profile → Find/Filter Mentors → Send Request → Book Session → Chat → Rate

**Mentor**: Register → Complete Profile → Accept Requests → Confirm Sessions → Chat → Mark Complete

---

*MentorLink © 2026 — Bridging Knowledge and Opportunities*
