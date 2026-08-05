# AI Interview Pro

An AI-powered mock interview platform. Upload a resume → get it scanned → run a live interview → receive a detailed performance scorecard.

## Stack

- **Frontend**: React 18 + Vite (served from `frontend/`)
- **Backend**: Node.js + Express + Mongoose (in `backend/`)
- **Database**: MongoDB (Atlas)
- **AI**: NVIDIA Build API (`openai/gpt-oss-20b`) for resume scanning, question generation, answer evaluation, and final feedback

## How to run

The single `npm start` command at the project root installs all dependencies, builds the React frontend, and starts the Express server on **port 5000**. The backend serves the built frontend, so everything runs from one URL.

```
npm start
```

For hot-reload development (backend + Vite dev server concurrently):

```
npm run dev
```

The Vite dev server runs on port 5173 and proxies `/api` calls to the backend on port 5000.

## Environment variables (set as Replit Secrets / env vars)

| Key | Description |
|-----|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `NVIDIA_API_KEY` | NVIDIA Build API key |
| `JWT_SECRET` | Secret for signing JWTs |
| `NVIDIA_API_URL` | Base URL — `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_MODEL` | Model name — `openai/gpt-oss-20b` |
| `JWT_EXPIRES_IN` | Token lifetime — `7d` |
| `PORT` | Backend port — `5000` |
| `VITE_API_BASE_URL` | Frontend API prefix — `/api` |

## User flow

1. Sign up / log in
2. Upload a PDF or TXT resume — the AI scans it and extracts skills, experience level, ATS score
3. From the dashboard, start a mock interview (choose domain, difficulty, mode)
4. Answer questions one at a time (voice or text); each answer is evaluated in real time
5. Finish the interview to generate a full scorecard with scores, feedback, and next steps

## Key directories

```
backend/
  config/db.js          MongoDB connection
  middleware/auth.js    JWT guard
  models/               Mongoose schemas
  mcp/                  AI tool layer (resume, question, evaluation, feedback)
  routes/               Express routers
  server.js             Entry point

frontend/src/
  api/client.js         Axios instance + all API calls
  pages/                Landing, Login, Signup, Dashboard, SetupInterview, InterviewRoom, Scorecard
  hooks/useSpeech.js    Web Speech API wrapper
  context/AuthContext   Auth state
```

## User preferences

- Keep the existing project structure; do not restructure or migrate unless asked.
