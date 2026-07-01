# AI-Based Intelligent Interview Evaluation

AI-Based Intelligent Interview Evaluation is a full-stack interview practice platform that scans a candidate's resume, builds interview context from that resume and profile, runs a live AI-driven interview, scores each answer, and produces a final scorecard with practical feedback.

The application uses a React + Vite frontend, an Express + MongoDB backend, and NVIDIA Build API models for resume analysis, question generation, answer evaluation, and final feedback.

## What This Project Does

The flow is:

1. A user signs up or logs in.
2. The user uploads a resume in PDF or TXT format.
3. The backend extracts text from the file and sends it to the AI resume scanner.
4. The system stores resume insights such as skills, experience level, ATS-style score, summary, strengths, and improvements.
5. The user starts an interview by choosing a domain, difficulty, and mode.
6. During the interview, the system generates one question at a time, evaluates each answer, and stores scores.
7. When the interview ends, the system generates a final report with averages, strengths, weaknesses, resume alignment, and next steps.

## Tech Stack

- Frontend: React 18, Vite, React Router, Axios
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, multer, pdf-parse
- Database: MongoDB
- AI provider: NVIDIA Build API chat completions endpoint
- Speech support: Browser Web Speech API for voice input and speech output

## Repository Structure

```
.
├── package.json
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Answer.js
│   │   ├── FeedbackReport.js
│   │   ├── Interview.js
│   │   ├── Question.js
│   │   ├── Resume.js
│   │   ├── Score.js
│   │   └── User.js
│   ├── mcp/
│   │   ├── aiModelTool.js
│   │   ├── candidateTool.js
│   │   ├── evaluationTool.js
│   │   ├── feedbackTool.js
│   │   ├── questionTool.js
│   │   └── resumeTool.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── resumeRoutes.js
│   │   └── userRoutes.js
│   └── .env.example
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── .env.example
    └── src/
        ├── App.jsx
        ├── api/client.js
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   └── useSpeech.js
        └── pages/
            ├── Dashboard.jsx
            ├── InterviewRoom.jsx
            ├── Landing.jsx
            ├── Login.jsx
            ├── Scorecard.jsx
            ├── SetupInterview.jsx
            └── Signup.jsx
```

## How The System Works

### 1. Authentication

The backend exposes signup, login, and current-user endpoints. Passwords are hashed with bcrypt, and authenticated requests use a JWT stored on the client.

### 2. Resume Upload and Scanning

Users upload a resume from the dashboard. The backend accepts PDF and plain text files up to 5 MB, extracts the text, and passes it to the resume scan tool. The scan returns:

- ATS-style score
- extracted skills
- experience level
- suggested interview domain
- short resume summary
- resume strengths
- resume improvements

### 3. Candidate Context

The backend combines:

- the user profile
- the latest scanned resume
- recent completed interview history

This context is used to personalize interview question generation and final feedback.

### 4. Live Interview

When an interview starts, the backend creates an interview record and generates one question at a time based on the candidate context, chosen technology, difficulty, and previous questions.

The interview supports:

- voice mode using the browser speech APIs
- typed fallback when speech is unsupported

### 5. Answer Scoring

Each answer is evaluated on a 0 to 10 scale with these dimensions:

- technical score
- communication score
- overall score

The evaluation is stored with a short remark for each answer.

### 6. Final Scorecard

At the end of the interview, the backend gathers all question, answer, and score records and asks the AI model to generate:

- strengths
- improvements
- summary
- resume alignment feedback
- recommended next steps

The system also calculates average technical, communication, and overall scores.

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Express server port. Defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `NVIDIA_API_KEY` | Yes | API key for NVIDIA Build API. |
| `NVIDIA_API_URL` | No | NVIDIA chat completions endpoint. Defaults to `https://integrate.api.nvidia.com/v1/chat/completions`. |
| `NVIDIA_MODEL` | No | Model name used for resume scanning, question generation, scoring, and feedback. |
| `JWT_SECRET` | Yes | Secret used to sign JWTs. |
| `JWT_EXPIRES_IN` | No | JWT lifetime, such as `7d`. |
| `CLIENT_ORIGIN` | No | Allowed frontend origin for CORS. Defaults to `http://localhost:5173` in the example file. |

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | No | Base URL for API requests. Defaults to `/api`, which works for both local proxy mode and the single-port production build. |

## Setup

### Install Dependencies

From the project root:

```bash
npm install
```

This installs the root workspace dependencies. The root scripts also install backend and frontend dependencies when you run `start` or `dev`.

### Production Style Run

```bash
npm start
```

This script:

1. installs backend dependencies
2. installs frontend dependencies
3. builds the frontend
4. starts the Express server

Open:

```text
http://localhost:5000
```

In this mode, the backend serves the compiled frontend from `frontend/dist`, so the API and UI share one origin.

### Development Run

```bash
npm run dev
```

This script starts:

- the backend on port `5000` with nodemon
- the frontend on port `5173` with Vite

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

Open:

```text
http://localhost:5173
```

## Root Scripts

| Script | Command | What it does |
| --- | --- | --- |
| `install:all` | `npm install --prefix backend && npm install --prefix frontend` | Installs both app dependencies. |
| `build` | `npm run build --prefix frontend` | Builds the React app. |
| `start` | `npm run install:all && npm run build && npm start --prefix backend` | Installs, builds, and starts the production server. |
| `dev` | `npm run install:all && concurrently ...` | Runs backend and frontend dev servers together. |

## Backend Scripts

| Script | Command | What it does |
| --- | --- | --- |
| `start` | `node server.js` | Starts the Express server. |
| `dev` | `nodemon server.js` | Starts the Express server with auto-reload. |

## Frontend Scripts

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `vite` | Starts the Vite dev server. |
| `build` | `vite build` | Produces a production build. |
| `preview` | `vite preview` | Serves the production build locally. |

## API Endpoints

### Health

- `GET /api/health`

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Resume

- `POST /api/resume/upload`
- `GET /api/resume/latest`

### Interviews

- `POST /api/interviews/start`
- `POST /api/interviews/:interviewId/next-question`
- `POST /api/interviews/:interviewId/answer`
- `POST /api/interviews/:interviewId/finish`
- `GET /api/interviews/:interviewId/report`
- `GET /api/interviews`

### User Profile

- `PUT /api/users/profile`

All authenticated routes require:

```http
Authorization: Bearer <token>
```

## Data Models And Properties

### User

Stored fields:

- `name`
- `email`
- `passwordHash`
- `phone`
- `targetRole`
- `skills`
- `experience`
- `hasResume`
- timestamps

### Resume

Stored fields:

- `userId`
- `fileName`
- `rawText`
- `atsScore`
- `extractedSkills`
- `extractedExperienceLevel`
- `suggestedDomain`
- `summary`
- `resumeStrengths`
- `resumeImprovements`
- timestamps

### Interview

Stored fields:

- `userId`
- `resumeId`
- `technology`
- `difficulty`
- `mode`
- `status`
- `scheduledAt`
- timestamps

### Question

Stored fields:

- `interviewId`
- `question`
- `order`
- timestamps

### Answer

Stored fields:

- `questionId`
- `answer`
- `transcribedVoice`
- timestamps

### Score

Stored fields:

- `interviewId`
- `questionId`
- `technicalScore`
- `communicationScore`
- `overallScore`
- `remarks`
- timestamps

### FeedbackReport

Stored fields:

- `interviewId`
- `strengths`
- `improvements`
- `summary`
- `averageScore`
- `technicalAvg`
- `communicationAvg`
- `resumeAlignment`
- `recommendedNextSteps`
- timestamps

## AI Tool Layer

The backend isolates AI interactions in `backend/mcp/`:

- `aiModelTool.js`: shared NVIDIA API wrapper and JSON parsing helper
- `resumeTool.js`: scans resume text and returns structured candidate data
- `candidateTool.js`: builds a combined candidate context from profile, resume, and interview history
- `questionTool.js`: generates the next interview question
- `evaluationTool.js`: scores an individual answer
- `feedbackTool.js`: generates the final report and next-step recommendations

This separation keeps the HTTP routes thin and makes the AI pipeline easier to maintain.

## Frontend Notes

- The app uses `frontend/src/api/client.js` for all API calls.
- The client automatically attaches the JWT from local storage.
- `frontend/src/hooks/useSpeech.js` provides speech support and falls back gracefully when browser support is unavailable.
- `frontend/vite.config.js` proxies `/api` to the backend in development.

## Security And Deployment Notes

- Do not commit real `.env` files.
- Use a strong random `JWT_SECRET` in any shared or deployed environment.
- Restrict MongoDB Atlas network access to trusted IPs.
- Treat the NVIDIA API key like a secret and rotate it if it is exposed.

## Troubleshooting

- If the backend never connects to MongoDB, verify `MONGO_URI` and Atlas network access.
- If AI requests fail, verify `NVIDIA_API_KEY`, `NVIDIA_API_URL`, and `NVIDIA_MODEL`.
- If voice features do not work, use Chrome or Edge and make sure browser speech permissions are allowed.
- If the production server shows a missing frontend build message, run `npm run build` from the project root.

## License

No license file is currently included in the repository.
