// routes/index.js
import express from "express";
import { registerSuper, login } from "../controllers/authController.js";
import {
  createVitrine,
  getVitrine,
  updateVitrine,
  toggleServiceRestauration,
  getVitrineStatus,
} from "../controllers/vitrineController.js";
import menuRoutes from "./menuRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import categorieAppartRoutes from "./categorieAppartRoutes.js";
import appartementRoutes from "./appartementRoutes.js";
import jeuConcoursRoutes from "./jeuConcoursRoutes.js";
import produitLongrichRoutes from "./produitLongrichRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import employeRoutes from "./employeRoutes.js";
import coiffureRoutes from "./coiffureRoutes.js";
import adminSecondaireRoutes from "./adminSecondaireRoutes.js";

import clientAppartRoutes from "./client/clientAppartRoutes.js";
import commandeRestaurationRoutes from "./commandeRestaurationRoutes.js";
import livreurRoutes from "./livreurRoutes.js";
import clientRoutes from "./client/clientRoutes.js";
import clientReservationAppartRoutes from "./client/clientReservationAppartRoutes.js";
import adminReservationAppartRoutes from "./admin/reservationAppartRoutes.js";

import {
  uploadImgVitrine,
  listImgVitrine,
  deleteImgVitrine,
} from "../controllers/imgVitrineController.js";
import { auth, superAdminOnly } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

/**
 * AUTH SUPER ADMIN
 */
router.post(process.env.SUPER_REGISTER_URL, registerSuper);
router.post(process.env.SUPER_LOGIN_URL, login);

// login générique
router.post("/auth/login", login);

/**
 * ROUTES RESTAURATION CLIENT (vitrine + statut)
 */
router.get("/vitrine-status", getVitrineStatus);
router.post(
  "/vitrine-toggle-restauration",
  auth,
  superAdminOnly,
  toggleServiceRestauration
);

/**
 * VITRINE
 */
router.post(
  "/vitrine",
  auth,
  superAdminOnly,
  upload.array("imgs", 10),
  createVitrine
);
router.put(
  "/vitrine",
  auth,
  superAdminOnly,
  upload.array("imgs", 10),
  updateVitrine
);
router.get("/vitrine", getVitrine);

/**
 * IMG-VITRINE (admin)
 */
router.post(
  "/img-vitrine",
  auth,
  superAdminOnly,
  upload.array("medias", 20),
  uploadImgVitrine
);
router.get("/img-vitrine", auth, superAdminOnly, listImgVitrine);
router.delete("/img-vitrine/:id", auth, superAdminOnly, deleteImgVitrine);

/**
 * ROUTES MODULAIRES
 */
router.use("/", menuRoutes);
router.use("/service", serviceRoutes);
router.use("/categorie-appart", categorieAppartRoutes);
router.use("/appartement", appartementRoutes);
router.use("/jeu-concours", jeuConcoursRoutes);
router.use("/produit-longrich", produitLongrichRoutes);
router.use("/notification", notificationRoutes);
router.use("/employes", employeRoutes);
router.use("/coiffures", coiffureRoutes);
router.use("/admin-secondaire", adminSecondaireRoutes);

/**
 * ROUTES CLIENT (login client)
 */
router.use("/client", clientRoutes);

/**
 * ROUTES COMMANDE RESTAU (client)
 * URL finale: /api/commande-restau/...
 */
router.use("/commande-restau", commandeRestaurationRoutes);
router.use("/livreurs", livreurRoutes);

/**
 * ROUTES CLIENT APPARTS
 */
router.use("/client/apparts", clientAppartRoutes);
router.use("/client", clientReservationAppartRoutes);

/**
 * ROUTES ADMIN RESERVATIONS APPART
 * URL finale: /api/admin/reservations-appart/...
 */
router.use("/admin/reservations-appart", adminReservationAppartRoutes);

export default router;
