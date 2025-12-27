// jobs/reservationReminderJob.js
import cron from "node-cron";
import db from "../models/index.js";
import { Op } from "sequelize";
import { sendMail } from "../utils/mailer.js";

const ReservationAppart = db.ReservationAppart;
const ConfigReservationAppart = db.ConfigReservationAppart;

const startReservationReminderJob = () => {
  // Toutes les 10 minutes (tu peux ajuster: */5 * * * * pour 5 min, * * * * * pour 1 min)
  cron.schedule("*/10 * * * *", async () => {
    try {
      const cfg = await ConfigReservationAppart.findOne();
      const delaiHeures = cfg?.delaiAlerteHeures || 5;

      const now = new Date();
      const nowMs = now.getTime();
      const seuilMs = delaiHeures * 60 * 60 * 1000;

      // on récupère uniquement les réservations validées / occupées, encore en cours
      const reservations = await ReservationAppart.findAll({
        where: {
          statut: { [Op.in]: ["validee", "occupee"] },
          dateFin: { [Op.gte]: now },
        },
      });

      for (const r of reservations) {
        if (!r.email) continue;

        const finMs = new Date(r.dateFin).getTime();
        const diff = finMs - nowMs;

        // on veut envoyer un mail quand diff est entre 0 et seuil (donc < delaiHeures avant la fin)
        // pour éviter les doublons, ajoute un flag "alerteFinEnvoyee" dans le modèle si tu veux plus tard
        if (diff > 0 && diff <= seuilMs && !r.alerteFinEnvoyee) {
          await sendMail({
            to: r.email,
            subject: "Votre séjour se termine bientôt",
            html: `
              <p>Bonjour ${r.prenomClient} ${r.nomClient},</p>
              <p>Votre séjour dans l'appartement <strong>${r.appartementId}</strong> se termine dans moins de ${delaiHeures} heures.</p>
              <p>Si vous souhaitez prolonger votre séjour, veuillez contacter l'accueil du complexe NNOMO dès que possible.</p>
            `,
          });

          r.alerteFinEnvoyee = true;
          await r.save();
        }
      }
    } catch (err) {
      console.error("reservationReminderJob error:", err);
    }
  });
};

export default startReservationReminderJob;
