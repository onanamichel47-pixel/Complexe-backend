// controllers/client/clientAppartController.js
import db from "../../models/index.js";
import { Op } from "sequelize";

const CategorieAppart = db.CategorieAppart;
const Appartement = db.Appartement;
const ReservationAppart = db.ReservationAppart;
const AppartementPhoto = db.AppartementPhoto;

// GET /api/client/apparts/categories
export const getCategoriesWithApparts = async (req, res) => {
  try {
    const categories = await CategorieAppart.findAll({
      include: [
        {
          model: Appartement,
          as: "appartements",
          required: false,
          include: [{ model: AppartementPhoto, as: "photos" }],
        },
      ],
    });

    const categoriesFormatted = await Promise.all(
      categories.map(async (cat) => {
        const apparts = await Promise.all(
          (cat.appartements || []).map(async (app) => {
            const reservationActive = await ReservationAppart.findOne({
              where: {
                appartementId: app.id,
                statut: { [Op.in]: ["validee", "occupee"] },
              },
              order: [["createdAt", "DESC"]],
            });

            const appJson = app.toJSON();
            if (reservationActive) {
              appJson.disponible = false;
              appJson.statutReservation = reservationActive.statut === "validee"
                ? "en_attente_validation"
                : "occupee";
              appJson.dateFinOccupee = reservationActive.dateFin;
            } else {
              appJson.disponible = true;
              appJson.statutReservation = null;
              appJson.dateFinOccupee = null;
            }
            return appJson;
          })
        );

        const libres = apparts.filter((a) => a.disponible).length;

        return {
          id: cat.id,
          categorie: cat.categorie,
          description: cat.description,
          photoCloud: cat.photoCloud,
          photoLocal: cat.photoLocal,
          nombreApparts: apparts.length,
          nombreDisponible: libres,
          statut: libres > 0 ? "Ouverte" : "Complet",
          appartements: apparts,
        };
      })
    );

    res.json({ categories: categoriesFormatted });
  } catch (err) {
    console.error("🔥 Erreur getCategoriesWithApparts:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// GET /api/client/apparts/categorie/:id
export const getAppartsByCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    const categorie = await CategorieAppart.findByPk(id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie introuvable" });
    }

    const apparts = await Appartement.findAll({
      where: { categorieId: id },
      order: [
        ["ordre", "ASC"],
        ["createdAt", "DESC"],
      ],
      include: [{ model: AppartementPhoto, as: "photos" }],
    });

    if (!apparts || apparts.length === 0) {
      return res.json({
        categorie: {
          id: categorie.id,
          categorie: categorie.categorie,
          description: categorie.description,
          photoCloud: categorie.photoCloud,
          photoLocal: categorie.photoLocal,
          nombreApparts: 0,
          nombreDisponible: 0,
          statut: "Aucun appartement",
        },
        appartements: [],
        message:
          "Aucun appartement disponible dans cette catégorie pour le moment.",
      });
    }

    const appartements = await Promise.all(
      apparts.map(async (app) => {
        const reservationActive = await ReservationAppart.findOne({
          where: {
            appartementId: app.id,
            statut: { [Op.in]: ["validee", "occupee"] },
          },
          order: [["createdAt", "DESC"]],
        });

        const appJson = app.toJSON();

        if (reservationActive) {
          appJson.disponible = false;
          appJson.statutReservation =
            reservationActive.statut === "validee"
              ? "en_attente_validation"
              : "occupee";
          appJson.dateFinOccupee = reservationActive.dateFin;
        } else {
          appJson.disponible = true;
          appJson.statutReservation = null;
          appJson.dateFinOccupee = null;
        }

        return appJson;
      })
    );

    const nombreApparts = appartements.length;
    const nombreDisponible = appartements.filter((a) => a.disponible).length;

    return res.json({
      categorie: {
        id: categorie.id,
        categorie: categorie.categorie,
        description: categorie.description,
        photoCloud: categorie.photoCloud,
        photoLocal: categorie.photoLocal,
        nombreApparts,
        nombreDisponible,
        statut: nombreDisponible > 0 ? "Ouverte" : "Complet",
      },
      appartements,
    });
  } catch (err) {
    console.error("getAppartsByCategorie error:", err);
    return res.status(500).json({ message: err.message });
  }
};


export const getAppartementStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const appart = await Appartement.findByPk(id);
    if (!appart) {
      return res.status(404).json({ message: "Appartement introuvable" });
    }

    const now = new Date();

    const reservations = await ReservationAppart.findAll({
      where: {
        appartementId: id,
        dateDebut: { [Op.lte]: now },
        dateFin: { [Op.gte]: now },
        statut: { [Op.in]: ["en cours", "validee", "occupee"] },
      },
      order: [["createdAt", "DESC"]],
    });

    let status = "libre";
    let reservation = null;

    if (reservations.length > 0) {
      reservation = reservations[0];
      if (reservation.statut === "en cours") status = "en_attente_validation";
      if (["validee", "occupee"].includes(reservation.statut)) status = "occupee";
    }

    return res.json({ status, reservation, appartement: appart });
  } catch (err) {
    console.error("getAppartementStatus error:", err);
    return res.status(500).json({ message: err.message });
  }
};
