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

const isProduction = process.env.NODE_ENV === 'production' || !process.env.DB_HOST.includes('localhost');

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
  console.log(`[MIDDLEWARE] ${req.method} ${req.url}`);
  console.log(` - Session ID: ${req.sessionID}`);
  console.log(` - Admin ID in session: ${req.session.adminId || 'none'}`);
  console.log(` - Cookies: ${req.headers.cookie || 'none'}`);
  next();
});

app.use("/auth", authRoutes);
app.get("/auth/me", (req, res) => {
  if (req.session.adminId) {
    res.json({ loggedIn: true, role: 'admin', id: req.session.adminId, sessionId: req.sessionID });
  } else if (req.session.memberId) {
    res.json({ loggedIn: true, role: 'member', id: req.session.memberId, sessionId: req.sessionID });
  } else {
    res.json({ loggedIn: false, sessionId: req.sessionID, cookiesFound: !!req.headers.cookie });
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

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

module.exports = app;