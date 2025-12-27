// controllers/client/clientReservationClientController.js
import db from "../../models/index.js";

const ReservationAppart = db.ReservationAppart;
const Appartement = db.Appartement;
const CategorieAppart = db.CategorieAppart;

// GET /api/client/mes-reservations-appart
// Query: telephone=...&email=...
export const getMesReservationsAppart = async (req, res) => {
  try {
    const { telephone, email } = req.query;

    if (!telephone && !email) {
      return res
        .status(400)
        .json({ message: "Téléphone ou email requis pour retrouver vos réservations." });
    }

    const where = {};
    if (telephone) where.telephone = telephone;
    if (email) where.email = email;

    const reservations = await ReservationAppart.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Appartement },
        { model: CategorieAppart },
      ],
    });

    return res.json({ reservations });
  } catch (err) {
    console.error("getMesReservationsAppart error:", err);
    return res.status(500).json({ message: err.message });
  }
};
