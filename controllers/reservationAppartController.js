// controllers/reservationAppartController.js
import db from "../models/index.js";
import { sendMail } from "../utils/mailer.js";
import { Op } from "sequelize";
import { generateReservationRecu } from "../utils/recuGenerator.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  ReservationAppart,
  Appartement,
  CategorieAppart,
  Vitrine,
  ConfigReservationAppart,
} = db;

/* =========================
   CONFIG
========================= */
const getConfig = async () => {
  let cfg = await ConfigReservationAppart.findOne();
  if (!cfg) cfg = await ConfigReservationAppart.create({});
  return cfg;
};

/* =========================
   CREATE RESERVATION (CLIENT)
========================= */
export const createReservationAppart = async (req, res) => {
  try {
    const cfg = await getConfig();
    if (!cfg.reservationsActives) {
      return res.status(403).json({
        message: "Le service de réservation est temporairement désactivé.",
      });
    }

    const reservation = await ReservationAppart.create(req.body);

    /* 🔔 SOCKET — nouvelle réservation pour le superadmin */
const io = req.io;
if (io) {
  // ✅ FAIS ÇA (émet à TOUS les clients connectés)
io.emit("reservation_appart_validee", {
    appartementId: reservation.appartementId,
    reservationId: reservation.id,
    statut: reservation.statut,
  });
}


    return res.status(201).json({
      success: true,
      reservation,
    });
  } catch (err) {
    console.error("Erreur createReservationAppart:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   LISTE ADMIN
========================= */
export const listReservationsAppart = async (req, res) => {
  try {
    const reservations = await ReservationAppart.findAll({
      order: [["createdAt", "DESC"]],
      include: [Appartement, CategorieAppart],
    });
    res.json({ reservations });
  } catch (err) {
    console.error("Erreur listReservationsAppart:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   UPDATE STATUT (ADMIN)
========================= */
// controllers/reservationAppartController.js

export const updateReservationStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const reservation = await ReservationAppart.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable" });
    }

    reservation.statut = statut;
    await reservation.save();

    const io = req.io;

    // ✅ Validation
    if (io && statut === "validee") {
      io.emit("reservation_appart_validee", {
        appartementId: reservation.appartementId,
        reservationId: reservation.id,
        statut: reservation.statut,
      });
    }

    // ✅ Annulation / autre changement de statut
    if (io && statut !== "validee") {
      io.emit("reservation_appart_statut_change", {
        appartementId: reservation.appartementId,
        reservationId: reservation.id,
        statut: reservation.statut,
      });
    }

    return res.json({ success: true, reservation });
  } catch (err) {
    console.error("Erreur updateReservationStatut:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE
========================= */
export const deleteReservationAppart = async (req, res) => {
  try {
    const reservation = await ReservationAppart.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Introuvable" });
    }

    const appartementId = reservation.appartementId;
    const reservationId = reservation.id;

    await reservation.destroy();

    // On informe les clients qu'une réservation a été supprimée (optionnel)
    const io = req.io;
    if (io) {
      io.emit("reservation_appart_supprimee", {
        appartementId,
        reservationId,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur deleteReservationAppart:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   CONFIG ADMIN
========================= */
export const getConfigReservationAppart = async (req, res) => {
  try {
    const cfg = await getConfig();
    res.json({ config: cfg });
  } catch (err) {
    console.error("Erreur getConfigReservationAppart:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateConfigReservationAppart = async (req, res) => {
  try {
    const cfg = await getConfig();
    const { reservationsActives } = req.body;

    if (typeof reservationsActives !== "undefined") {
      cfg.reservationsActives = !!reservationsActives;
    }

    await cfg.save();

    /* 🔔 SOCKET — config modifiée (tous les clients) */
    const io = req.io;
    if (io) {
      io.emit("config_reservation_appart_change", {
        reservationsActives: cfg.reservationsActives,
      });
    }

    res.json({ success: true, config: cfg });
  } catch (err) {
    console.error("Erreur updateConfigReservationAppart:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DOWNLOAD REÇU
========================= */
export const downloadRecuReservation = async (req, res) => {
  try {
    const reservation = await ReservationAppart.findByPk(req.params.id, {
      include: [Appartement, CategorieAppart],
    });

    if (!reservation) {
      return res.status(404).json({ message: "Introuvable" });
    }

    const { fullPath } = await generateReservationRecu(reservation);
    res.sendFile(fullPath);
  } catch (err) {
    console.error("Erreur downloadRecuReservation:", err);
    res.status(500).json({ message: err.message });
  }
};
