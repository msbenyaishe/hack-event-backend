const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const authRoutes = require("../routes/authRoutes");
const eventRoutes = require("../routes/eventRoutes");
const teamRoutes = require("../routes/teamRoutes");
const invitationRoutes = require("../routes/invitationRoutes");
const workshopRoutes = require("../routes/workshopRoutes");
const timerRoutes = require("../routes/timerRoutes");
const adminRoutes = require("../routes/adminRoutes");

const app = express();

app.get("/debug", (req, res) => {
  res.json({ 
    message: "API is running", 
    version: "1.0.2 - Priority Routing",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'not set'
  });
});

app.set('trust proxy', 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://hack-event-frontend.vercel.app"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

console.log("[CONFIG] Allowed Origins:", allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.indexOf(normalizedOrigin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json());

const MySQLStore = require("express-mysql-session")(session);
const pool = require("../config/db"); // This is a promise pool
const mysql = require("mysql2"); // Import standard mysql2 for callback pool

// Create a separate callback pool for express-mysql-session
const sessionPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false } // Common requirement for remote DBs
});

const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
  createDatabaseTable: true,
}, sessionPool);

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  key: 'hackevent_session_cookie',
  secret: process.env.SESSION_SECRET || 'hackathon_secret_777',
  store: sessionStore,
  resave: true, 
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: isProduction, 
    sameSite: isProduction ? 'none' : 'lax', 
    httpOnly: true,
    partitioned: isProduction,
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

// Debugging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[MIDDLEWARE] ${req.method} ${req.url} - Start`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[MIDDLEWARE] ${req.method} ${req.url} - Finished in ${duration}ms`);
  });

  try {
    if (req.session) {
      console.log(` - Session ID: ${req.sessionID}`);
      console.log(` - Admin ID in session: ${req.session.adminId || 'none'}`);
    } else {
      console.log(` - Session: UNDEFINED`);
    }
    console.log(` - Cookies: ${req.headers.cookie || 'none'}`);
  } catch (err) {
    console.error("[DEBUG MIDDLEWARE] Error:", err.message);
  }
  next();
});

app.use("/auth", authRoutes);
const authMiddleware = require("../middleware/authMiddleware");

app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    if (user.role === 'admin') {
      const [rows] = await pool.query("SELECT id, login as email, 'admin' as role FROM admins WHERE id = ?", [user.id]);
      if (rows.length === 0) return res.status(404).json({ error: "Admin not found" });
      return res.json({ loggedIn: true, user: rows[0] });
    } else {
      const [rows] = await pool.query("SELECT id, email, role, event_id, team_id FROM members WHERE id = ?", [user.id]);
      if (rows.length === 0) return res.status(404).json({ error: "Member not found" });
      return res.json({ loggedIn: true, user: rows[0] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use("/events", eventRoutes);
app.use("/teams", teamRoutes);
app.use("/invites", invitationRoutes);
app.use("/workshops", workshopRoutes);
app.use("/timers", timerRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: "API Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR]", err);
  const status = err.status || 500;
  res.status(status).json({ 
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

module.exports = app;