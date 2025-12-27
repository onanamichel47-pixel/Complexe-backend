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

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // en prod: variable d'env / domaine du front
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware Socket.io auth avec récupération et assignation de socket.user
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Token requis"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    // Room Superadmin si rôle superadmin
    if (decoded.role === "superadmin") {
      socket.join("superadmin");
      console.log("👑 Superadmin rejoint room (via middleware)");
    }
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Token invalide"));
  }
});

// Écouteurs Socket.io
io.on("connection", (socket) => {
  console.log("✅ Client connecté:", socket.id);

  // Optionnel : join manuel (en plus de la détection automatique via le middleware)
  socket.on("join-superadmin", () => {
    if (socket.user?.role === "superadmin") {
      socket.join("superadmin");
      console.log("👑 Superadmin rejoint room (event join-superadmin)");
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client déconnecté:", socket.id);
  });
});

// Passer io aux controllers (req.io)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middlewares Express
app.use(
  cors({
    origin: "http://localhost:5173", // en prod: domaine du front
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes API
app.use("/api", routes);

app.get("/", (req, res) =>
  res.json({
    message: "Backend NNOMO en ligne ✅",
    socketio: true,
  })
);

// Sync Cloudinary toutes les 10 minutes
setInterval(syncPendingUploads, 10 * 60 * 1000);

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connexion MySQL réussie");

    if (process.env.NODE_ENV === "production") {
      console.log("🚫 Mode PRODUCTION : Aucun sync() appliqué");
      return Promise.resolve();
    }

    console.log("🔄 Mode DEV : Synchronisation sécurisée...");
    return sequelize.sync({ force: false, alter: false });
  })
  .then(() => {
    console.log("🔒 Synchronisation terminée");
    httpServer.listen(PORT, () => {
      console.log(`🚀 Serveur + Socket.io sur http://localhost:${PORT}`);
      console.log(`🔌 Socket.io rooms: superadmin`);
    });
  })
  .catch((err) => {
    console.error("💥 Erreur serveur:", err);
    process.exit(1);
  });

export default app;
