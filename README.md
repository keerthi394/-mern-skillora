# Skillora — Student-Mentor Matching Platform

Skillora is a full-stack MERN application that connects students with experienced mentors. This repository contains the **authentication module** — a fully functional, deployment-ready login and registration system.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS v4, React Router v7, Axios |
| Backend   | Node.js, Express 5, Mongoose, bcryptjs, JWT     |
| Database  | MongoDB Atlas                                   |
| Deploy    | Vercel (frontend) · Render (backend)            |

---

## Project Structure

```
Skillora/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # AuthLayout, Button, InputField
│   │   ├── context/          # AuthContext (global auth state)
│   │   ├── pages/            # LoginPage, RegisterPage, DashboardPage
│   │   └── services/         # Axios instance + authAPI helpers
│   ├── public/               # Static assets (favicon, icons)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env                  # (not committed)
│   └── .env.example
│
├── server/                   # Express backend
│   ├── controllers/          # authController.js
│   ├── middleware/            # auth.js (JWT protect middleware)
│   ├── models/               # User.js (Mongoose schema)
│   ├── routes/               # auth.js (register / login / me)
│   ├── index.js              # App entry point
│   ├── package.json
│   ├── .env                  # (not committed)
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Environment Variables

### Backend — `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/skillora?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> **Never commit real credentials.** See `server/.env.example` for a safe template.

### Frontend — `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

> In production, set `VITE_API_URL` to your Render backend URL, e.g. `https://skillora-api.onrender.com/api`.

---

## Local Installation & Running

### 1. Clone & install

```bash
git clone <repo-url>
cd skillora
```

### 2. Run the backend

```bash
cd server
npm install
# fill in server/.env from server/.env.example
npm run dev       # node --watch index.js (development)
# or
npm start         # node index.js (production)
```

Server starts on `http://localhost:5000`.

### 3. Run the frontend

```bash
cd client
npm install
# fill in client/.env from client/.env.example
npm run dev
```

Frontend starts on `http://localhost:5173`.

---

## Authentication API Endpoints

Base URL (local): `http://localhost:5000/api`

| Method | Endpoint           | Auth Required | Description              |
|--------|--------------------|:-------------:|--------------------------|
| POST   | `/auth/register`   | No            | Register a new user      |
| POST   | `/auth/login`      | No            | Login and receive JWT    |
| GET    | `/auth/me`         | Yes (Bearer)  | Get authenticated user   |
| GET    | `/health`          | No            | Server health check      |

### POST `/auth/register`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "mypassword123",
  "role": "student"
}
```

Returns: `{ success, message, token, user: { _id, name, email, role, createdAt } }`

### POST `/auth/login`

```json
{
  "email": "jane@example.com",
  "password": "mypassword123"
}
```

Returns: `{ success, message, token, user: { _id, name, email, role, createdAt } }`

### GET `/auth/me`

Headers: `Authorization: Bearer <token>`

Returns: `{ success, user: { _id, name, email, role, createdAt } }`

---

## Deployment

### MongoDB Atlas Configuration

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add a database user (username + password)
3. Whitelist `0.0.0.0/0` (all IPs) for Render deployment
4. Copy your connection string to `MONGODB_URI`

### Backend → Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `server`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add environment variables in Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = your Vercel frontend URL (e.g. `https://skillora.vercel.app`)
7. Deploy — note the service URL (e.g. `https://skillora-api.onrender.com`)

### Frontend → Vercel

1. Create a new project on [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set **Root Directory** to `client`
4. Set **Framework Preset** to `Vite`
5. Add environment variable:
   - `VITE_API_URL` = `https://skillora-api.onrender.com/api`
6. Deploy

---

## Security Notes

- Passwords are **bcrypt hashed** (cost factor 12) — never stored in plain text
- JWT secret is loaded from environment variables — never hardcoded
- MongoDB URI is loaded from environment variables — never exposed to the frontend
- `.env` files are in `.gitignore` — never committed to Git
- CORS is restricted to known frontend origins only
