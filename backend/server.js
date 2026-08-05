require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// CORS: accept configured origins + any Cloud Shell preview origin automatically
const rawOrigin = process.env.CLIENT_ORIGIN;
app.use(
  cors({
    credentials: true,
    origin: (incomingOrigin, callback) => {
      // Non-browser requests (curl, server-to-server) have no Origin header
      if (!incomingOrigin) return callback(null, true);
      // Always allow Google Cloud Shell web-preview origins
      if (incomingOrigin.endsWith(".cloudshell.dev")) return callback(null, true);
      // Always allow Replit dev-domain previews
      if (incomingOrigin.endsWith(".replit.dev") || incomingOrigin.endsWith(".repl.co"))
        return callback(null, true);
      // No CLIENT_ORIGIN configured → allow everything (local dev)
      if (!rawOrigin) return callback(null, true);
      // Match against the configured list
      const allowed = rawOrigin.split(",").map((s) => s.trim());
      if (allowed.includes(incomingOrigin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${incomingOrigin} not allowed`));
    },
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Interview backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/users", userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Serve the built React frontend (single-port setup: one server, one URL)
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send(
      "Frontend build not found. Run 'npm run build' in /frontend first, or use 'npm run dev' from the project root for separate dev servers."
    );
  });
}

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Interview running at http://localhost:${PORT}`);
  });
});
