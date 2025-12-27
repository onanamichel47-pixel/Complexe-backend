// routes/admin/reservationAppartRoutes.js
import express from "express";
import {
  listReservationsAppart,
  updateReservationStatut,
  getConfigReservationAppart,
  updateConfigReservationAppart,
  deleteReservationAppart,
} from "../../controllers/reservationAppartController.js";
import { auth, superAdminOnly } from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, superAdminOnly, listReservationsAppart);
router.put("/:id/statut", auth, superAdminOnly, updateReservationStatut);
router.get("/config", auth, superAdminOnly, getConfigReservationAppart);
router.post("/config", auth, superAdminOnly, updateConfigReservationAppart);

// ➜ nécessaire pour ton DELETE
router.delete("/:id", auth, superAdminOnly, deleteReservationAppart);

export default router;
