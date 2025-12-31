// server.js
import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import sequelize from "./config/database.js";
import db from "./models/index.js";
import routes from "./routes/index.js";
import syncPendingUploads from "./utils/syncToCloudinary.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

const io = new Server(httpServer, {
  cors: corsOptions,
});

// Auth Socket.io
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Token requis"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    if (decoded.role === "superadmin") {
      socket.join("superadmin");
    }
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Token invalide"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ Client connecté:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client déconnecté:", socket.id);
  });
});

// Injecter io dans req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middlewares
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes API
app.use("/api", routes);

app.get("/", (req, res) =>
  res.json({
    message: "Backend NNOMO en ligne ✅",
    env: process.env.NODE_ENV,
  })
);

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "ok" });
  } catch (e) {
    res.status(500).json({ status: "db_error", error: e.message });
  }
});

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ DB connectée");

    if (process.env.NODE_ENV !== "production") {
      console.log("🔄 DEV: sequelize.sync()");
      await sequelize.sync({ alter: true });
    } else {
      console.log("🚫 PROD: pas de sync() (migrations manuelles si besoin)");
      // éventuellement lancer ton job cron + syncPendingUploads ici
      setInterval(syncPendingUploads, 10 * 60 * 1000);
    }

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Serveur sur port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("💥 Erreur démarrage:", err);
    process.exit(1);
  });

export default app;
