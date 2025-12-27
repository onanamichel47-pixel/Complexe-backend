// routes/reservationAppartRoutes.js
import express from "express";
import {
  createReservationAppart,
  listReservationsAdmin,
  updateReservationStatut,
} from "../controllers/reservationAppartController.js";
import { requireSuperAdminOrAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", createReservationAppart);
router.get("/admin", requireSuperAdminOrAdmin, listReservationsAdmin);
router.put("/:id/statut", requireSuperAdminOrAdmin, updateReservationStatut);

export default router;
