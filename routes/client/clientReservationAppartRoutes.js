// routes/client/clientReservationAppartRoutes.js
import express from "express";
import {
  createReservationAppart,
  downloadRecuReservation,
  getConfigReservationAppart,      // ⬅️ ajouter ceci
} from "../../controllers/reservationAppartController.js";

import { getMesReservationsAppart } from "../../controllers/client/clientReservationClientController.js";

const router = express.Router();

router.post("/apparts/reserver", createReservationAppart);
router.get("/reservation-appart/:id/recu", downloadRecuReservation);

// Mes réservations par téléphone/email
router.get("/mes-reservations-appart", getMesReservationsAppart);

// Config réservation accessible au client
router.get("/config-reservation-appart", getConfigReservationAppart);

export default router;
