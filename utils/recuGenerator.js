// utils/recuGenerator.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RECEIPTS_DIR = path.join(__dirname, "..", "receipts");

// s'assurer que le dossier existe
if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

// petit helper pour un rectangle avec coins arrondis
function roundedRect(doc, x, y, w, h, r) {
  doc
    .moveTo(x + r, y)
    .lineTo(x + w - r, y)
    .quadraticCurveTo(x + w, y, x + w, y + r)
    .lineTo(x + w, y + h - r)
    .quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    .lineTo(x + r, y + h)
    .quadraticCurveTo(x, y + h, x, y + h - r)
    .lineTo(x, y + r)
    .quadraticCurveTo(x, y, x + r, y)
    .closePath();
}

export const generateReservationRecu = async (reservation) => {
  const fileName = `recu-${reservation.id}.pdf`;
  const fullPath = path.join(RECEIPTS_DIR, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const writeStream = fs.createWriteStream(fullPath);
    doc.pipe(writeStream);

    // --------- FOND / MOTIFS STYLÉS ----------
    // Bande dégradée en haut
    doc
      .rect(0, 0, doc.page.width, 120)
      .fillColor("#020617")
      .fill();

    // Bande colorée
    const grad = doc.linearGradient(0, 0, doc.page.width, 0);
    grad.stop(0, "#22c55e").stop(1, "#0ea5e9");
    doc
      .rect(0, 90, doc.page.width, 10)
      .fill(grad);

    doc.fillColor("#ffffff");

    // --------- LOGOS / EN-TÊTE ----------
    const serviceLogoPath = path.join(
      __dirname,
      "..",
      "public",
      "logos",
      "LOGO APPART MEUBLE 1.jpeg"
    );
    const complexeLogoPath = path.join(
      __dirname,
      "..",
      "public",
      "logos",
      "logo.png"
    );

    let xLogo = 40;
    let yLogo = 30;

    if (fs.existsSync(complexeLogoPath)) {
      doc.image(complexeLogoPath, xLogo, yLogo, { width: 60 });
      xLogo += 70;
    }

    if (fs.existsSync(serviceLogoPath)) {
      doc.image(serviceLogoPath, xLogo, yLogo, { width: 60 });
    }

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Reçu de réservation d'appartement meublé", 40, 40, {
        align: "right",
        width: doc.page.width - 80,
      });

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#e5e7eb")
      .text("Complexe NNOMO · Service Apparts Meublés", 40, 70, {
        align: "right",
        width: doc.page.width - 80,
      });

    doc.moveDown(2);
    doc.fillColor("#020617");

    // --------- BLOC INFO PRINCIPALE ----------
    const infoTop = 130;
    const infoHeight = 110;

    // bloc fond
    doc.save();
    doc.lineWidth(1);

    roundedRect(doc, 40, infoTop, doc.page.width - 80, infoHeight, 10);
    const gradInfo = doc.linearGradient(40, infoTop, doc.page.width - 40, infoTop + infoHeight);
    gradInfo.stop(0, "#0f172a").stop(1, "#020617");
    doc.fill(gradInfo);
    doc.restore();

    doc
      .fillColor("#a5b4fc")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`Réservation N° ${reservation.id}`, 55, infoTop + 15);

    doc
      .fillColor("#e5e7eb")
      .fontSize(9)
      .font("Helvetica")
      .text(
        `Statut : ${reservation.statut || "en cours"}\n` +
          `Date : ${new Date().toLocaleString("fr-FR")}`,
        55,
        infoTop + 35
      );

    doc
      .fillColor("#e5e7eb")
      .fontSize(9)
      .text(
        `Complexe NNOMO\nService Apparts Meublés\nBP: --, Ville, Pays\nTél: --`,
        doc.page.width / 2,
        infoTop + 20,
        { align: "right", width: doc.page.width / 2 - 60 }
      );

    // --------- BLOC CLIENT ----------
    const clientTop = infoTop + infoHeight + 20;
    const blockHeight = 130;

    doc.save();
    roundedRect(doc, 40, clientTop, doc.page.width - 80, blockHeight, 10);
    doc.fillColor("#0b1120").fill();
    doc.restore();

    const leftX = 55;
    const rightX = doc.page.width / 2;

    doc
      .fillColor("#e5e7eb")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Informations du client", leftX, clientTop + 12);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#cbd5f5")
      .text(
        `${reservation.prenomClient} ${reservation.nomClient}\n` +
          `Téléphone : ${reservation.telephone}\n` +
          `Email : ${reservation.email || "-"}`,
        leftX,
        clientTop + 32
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#e5e7eb")
      .text("Informations de la réservation", rightX, clientTop + 12, {
        width: doc.page.width / 2 - 60,
      });

    const typeLabel =
      reservation.typeSejour === "journalier"
        ? "Séjour journalier (24h)"
        : "Séjour de nuit (20h - 8h)";

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#cbd5f5")
      .text(
        `${typeLabel}\n` +
          `Durée : ${reservation.duree} ${reservation.periode}\n` +
          `Du : ${reservation.dateDebut}\n` +
          `Au : ${reservation.dateFin}`,
        rightX,
        clientTop + 32,
        { width: doc.page.width / 2 - 60 }
      );

    // --------- BLOC APPARTEMENT ----------
    const appartTop = clientTop + blockHeight + 20;
    const appartHeight = 120;

    doc.save();
    roundedRect(doc, 40, appartTop, doc.page.width - 80, appartHeight, 10);
    doc.fillColor("#020617").fill();
    doc.restore();

    doc
      .fillColor("#e5e7eb")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Appartement réservé", 55, appartTop + 12);

    const appartNom =
      reservation.Appartement?.nom || reservation.appartementNom || "Appartement";
    const categorieNom =
      reservation.CategorieAppart?.categorie ||
      reservation.categorie ||
      "Catégorie";

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#cbd5f5")
      .text(
        `${appartNom}\nCatégorie : ${categorieNom}\n` +
          `Caractéristiques : ${reservation.caracteristiques || "-"}`,
        55,
        appartTop + 32,
        { width: doc.page.width - 110 }
      );

    // --------- PRIX / TOTAL ----------
    const priceTop = appartTop + appartHeight + 25;

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#e5e7eb")
      .text(
        "Montant total à régler au service d'accueil Apparts du Complexe NNOMO :",
        55,
        priceTop
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#22c55e")
      .text(
        reservation.prixTotal
          ? `${Number(reservation.prixTotal).toLocaleString("fr-FR")} FCFA`
          : "À confirmer par l'administration",
        55,
        priceTop + 18
      );

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        "Ce reçu est valable uniquement après validation définitive par l'administration du Complexe NNOMO. " +
          "Veuillez le présenter à l'accueil lors de votre arrivée.",
        55,
        priceTop + 40,
        { width: doc.page.width - 110 }
      );

    // Footer
    doc
      .fontSize(8)
      .fillColor("#9ca3af")
      .text(
        "Complexe NNOMO – Service Apparts meublés · Document généré automatiquement, aucune signature n'est requise.",
        40,
        doc.page.height - 50,
        { align: "center", width: doc.page.width - 80 }
      );

    doc.end();

    writeStream.on("finish", () => {
      resolve({
        url: `/api/client/reservation-appart/${reservation.id}/recu`,
        fullPath,
      });
    });

    writeStream.on("error", reject);
  });
};
