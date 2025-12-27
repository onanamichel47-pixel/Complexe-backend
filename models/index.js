// models/index.js
import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const db = {};

// --- SuperAdmin ---
db.SuperAdmin = sequelize.define(
  "SuperAdmin",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    prenom: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    motDePasse: { type: DataTypes.STRING, allowNull: false },
    lastLogin: { type: DataTypes.DATE },
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ["email"] }],
  }
);

// --- AdminSecondaire ---
db.AdminSecondaire = sequelize.define(
  "AdminSecondaire",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    prenom: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    motDePasse: { type: DataTypes.STRING, allowNull: false },
    sexe: { type: DataTypes.ENUM("Homme", "Femme"), allowNull: false },
    privileges: { type: DataTypes.JSON, allowNull: false },
    sections: { type: DataTypes.JSON, allowNull: true },
    lastLogin: { type: DataTypes.DATE },
    statut: { type: DataTypes.ENUM("actif", "suspendu"), defaultValue: "actif" },
  },
  { timestamps: true }
);

// --- Employe ---
db.Employe = sequelize.define(
  "Employe",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    telephone: { type: DataTypes.STRING },
    motDePasse: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: true }
);

// --- Vitrine ---
db.Vitrine = sequelize.define(
  "Vitrine",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nomComplexe: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    heureOuverture: { type: DataTypes.STRING },
    heureFermeture: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    contactClient: { type: DataTypes.STRING },
    nomLocalisation: { type: DataTypes.STRING },
    latitude: { type: DataTypes.FLOAT },
    longitude: { type: DataTypes.FLOAT },
    activeServiceRestauration: { type: DataTypes.BOOLEAN, defaultValue: true },
    maxPhotos: { type: DataTypes.INTEGER, defaultValue: 3 },
  },
  { timestamps: true }
);

// --- ImgVitrine ---
db.ImgVitrine = sequelize.define(
  "ImgVitrine",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    urlLocal: { type: DataTypes.STRING },
    urlCloud: { type: DataTypes.STRING, allowNull: true },
    type: { type: DataTypes.ENUM("image", "video"), allowNull: false },
  },
  { timestamps: true }
);

// --- Service ---
db.Service = sequelize.define(
  "Service",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    logoLocal: { type: DataTypes.STRING },
    logoCloud: { type: DataTypes.STRING },
    photoLocal: { type: DataTypes.STRING },
    photoCloud: { type: DataTypes.STRING },
    ordreAffichage: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: true }
);

// --- Menu ---
db.Menu = sequelize.define(
  "Menu",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: { type: DataTypes.ENUM("PLATS", "BOISSONS"), allowNull: false },
    nom: { type: DataTypes.STRING, allowNull: false },
    categorie: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    caracteristiques: { type: DataTypes.TEXT },
    prixUnitaire: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    photoLocal: { type: DataTypes.STRING },
    photoCloud: { type: DataTypes.STRING },
    disponible: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { timestamps: true }
);

// --- CommandeRestauration ---
db.CommandeRestauration = sequelize.define(
  "CommandeRestauration",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nomClient: { type: DataTypes.STRING },
    prenomClient: { type: DataTypes.STRING },
    sexe: { type: DataTypes.ENUM("Homme", "Femme") },
    email: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING },
    modePayement: {
      type: DataTypes.ENUM("cash physique", "Orange Money", "Mobile Money", "carte bancaire"),
    },
    items: { type: DataTypes.JSON },
    quantites: { type: DataTypes.JSON },
    prixTotal: { type: DataTypes.DECIMAL(10, 2) },
    fraisLivraison: { type: DataTypes.DECIMAL(10, 2) },
    localisationClient: { type: DataTypes.STRING },
    itineraire: { type: DataTypes.TEXT },
    statut: { type: DataTypes.ENUM("en cours", "validee", "annulee") },
    statutLivraison: { type: DataTypes.ENUM("livré", "en route", "pas livré") },
    recu: { type: DataTypes.STRING },

    // tracking livreur
    livreurId: {
      type: DataTypes.UUID,
      field: "livreur_id", // colonne en BDD
    },
    localisationClientLat: { type: DataTypes.FLOAT },
    localisationClientLng: { type: DataTypes.FLOAT },
    heureArriveeLivreur: { type: DataTypes.DATE },

    nombreFoisSup20000: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: true }
);

// --- LivraisonMenu ---
db.LivraisonMenu = sequelize.define(
  "LivraisonMenu",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    commandeId: { type: DataTypes.UUID },
    platsBoissons: { type: DataTypes.JSON },
    prixTotal: { type: DataTypes.DECIMAL(10, 2) },
    quantites: { type: DataTypes.JSON },
    fraisLivraison: { type: DataTypes.DECIMAL(10, 2) },
    localisationClient: { type: DataTypes.STRING },
    itineraire: { type: DataTypes.TEXT },
    statut: { type: DataTypes.ENUM("livré", "en route", "pas livré") },
    alertes: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: true }
);

// --- CategorieAppart ---
db.CategorieAppart = sequelize.define(
  "CategorieAppart",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    categorie: { type: DataTypes.STRING, allowNull: false },
    nombreApparts: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    statut: {
      type: DataTypes.ENUM("haut standing premium", "standing ultra luxueux VIP"),
      allowNull: false,
    },
    photoLocal: { type: DataTypes.STRING },
    photoCloud: { type: DataTypes.STRING },
    nombreDisponible: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: true }
);

// --- Appartement ---
db.Appartement = sequelize.define(
  "Appartement",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    categorieId: { type: DataTypes.UUID, field: "categorie_id" },
    nom: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    ordre: { type: DataTypes.INTEGER, defaultValue: 0 },
    prixNuit: { type: DataTypes.DECIMAL(10, 2) },
    prixJournalier: { type: DataTypes.DECIMAL(10, 2) },
    photoLocal: { type: DataTypes.STRING },
    photoCloud: { type: DataTypes.STRING },
    disponible: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { timestamps: true }
);

// models/AppartementPhoto.js ou dans models/index.js
db.AppartementPhoto = sequelize.define("AppartementPhoto", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  appartementId: { type: DataTypes.UUID },
  urlLocal: { type: DataTypes.STRING },
  urlCloud: { type: DataTypes.STRING },
}, { timestamps: true });


// --- ReservationAppart ---
db.ReservationAppart = sequelize.define(
  "ReservationAppart",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nomClient: { type: DataTypes.STRING },
    prenomClient: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    sexe: { type: DataTypes.ENUM("Homme", "Femme") },
    motifs: { type: DataTypes.TEXT },
    typeSejour: { type: DataTypes.ENUM("nuit", "journalier") },
    categorieId: { type: DataTypes.UUID, field: "categorie_id" },
    appartementId: { type: DataTypes.UUID, field: "appartement_id" },
    caracteristiques: { type: DataTypes.TEXT },
    duree: { type: DataTypes.INTEGER },
    periode: { type: DataTypes.STRING },
    dateDebut: { type: DataTypes.DATE, field: "date_debut" },
    dateFin: { type: DataTypes.DATE, field: "date_fin" },
    prixTotal: { type: DataTypes.DECIMAL(10, 2) },
    statut: {
      type: DataTypes.ENUM("en cours", "validee", "annulee", "occupee"),
    },
    recu: { type: DataTypes.STRING },        // chemin du fichier PDF
    nombreSejoursSup5: { type: DataTypes.INTEGER, defaultValue: 0 },
    alerteFinEnvoyee: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: true, indexes: [{ fields: ["date_debut", "date_fin"] }] }
);
// --- ConfigReservationAppart ---


db.ConfigReservationAppart = sequelize.define(
  "ConfigReservationAppart",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reservationsActives: { type: DataTypes.BOOLEAN, defaultValue: true },
    delaiAlerteHeures: { type: DataTypes.INTEGER, defaultValue: 5 }, // ex: 5h avant fin
  },
  { timestamps: true }
);

// --- ProduitLongrich ---
db.ProduitLongrich = sequelize.define(
  "ProduitLongrich",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    categorie: {
      type: DataTypes.ENUM(
        "soin de santé",
        "cosmétique",
        "complément alimentaire",
        "électronique",
        "electro-menager",
        "chaussure",
        "textile",
        "electrique"
      ),
    },
    prixUnitaire: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    prixPromo: { type: DataTypes.DECIMAL(10, 2) },
    consignePromo: { type: DataTypes.TEXT },
    promoVideo: { type: DataTypes.STRING },
    prixPromoVisibleNotification: { type: DataTypes.BOOLEAN, defaultValue: false },
    stock: { type: DataTypes.INTEGER, allowNull: false },
    photoLocal: { type: DataTypes.STRING },
    photoCloud: { type: DataTypes.STRING },
    pvs: { type: DataTypes.DECIMAL(10, 2) },
    statut: {
      type: DataTypes.ENUM("disponible", "indisponible"),
      defaultValue: "disponible",
    },
    bienfaits: { type: DataTypes.TEXT },
  },
  { timestamps: true }
);

// --- CommandeLongrich ---
db.CommandeLongrich = sequelize.define(
  "CommandeLongrich",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nomClient: { type: DataTypes.STRING },
    prenomClient: { type: DataTypes.STRING },
    sexe: { type: DataTypes.ENUM("Homme", "Femme") },
    email: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING },
    modePayement: { type: DataTypes.ENUM("cash", "Orange Money", "Mobile Money") },
    items: { type: DataTypes.JSON },
    prixTotal: { type: DataTypes.DECIMAL(10, 2) },
    fraisLivraison: { type: DataTypes.DECIMAL(10, 2) },
    modeReception: {
      type: DataTypes.ENUM("livraison", "recuperation sur place"),
    },
    statutPaiement: { type: DataTypes.ENUM("paye", "non paye") },
    statutLivraison: { type: DataTypes.ENUM("livré", "en route", "pas livré") },
    adminSecondaireId: { type: DataTypes.UUID },
    recu: { type: DataTypes.STRING },
  },
  { timestamps: true }
);

// --- PanierLongrich ---
db.PanierLongrich = sequelize.define(
  "PanierLongrich",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    commandeId: { type: DataTypes.UUID },
    produits: { type: DataTypes.JSON },
    quantites: { type: DataTypes.JSON },
    prixTotal: { type: DataTypes.DECIMAL(10, 2) },
  },
  { timestamps: true }
);

// --- Coiffure ---
db.Coiffure = sequelize.define(
  "Coiffure",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    categorie: { type: DataTypes.ENUM("homme", "femme") },
    description: { type: DataTypes.TEXT },
    prixHomme: { type: DataTypes.DECIMAL(10, 2) },
    prixFemme: { type: DataTypes.DECIMAL(10, 2) },
    photoLocal: { type: DataTypes.STRING },
    photoCloud: { type: DataTypes.STRING },
  },
  { timestamps: true }
);

// --- CommandePressing ---
db.CommandePressing = sequelize.define(
  "CommandePressing",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nomClient: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING },
    nombreHabits: { type: DataTypes.INTEGER },
    typeLinge: { type: DataTypes.STRING },
    prixUnitaire: { type: DataTypes.DECIMAL(10, 2) },
    prixTotal: { type: DataTypes.DECIMAL(10, 2) },
    statut: { type: DataTypes.ENUM("en cours", "validee") },
    recu: { type: DataTypes.STRING },
  },
  { timestamps: true }
);

// --- JeuConcours ---
db.JeuConcours = sequelize.define(
  "JeuConcours",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    regle: { type: DataTypes.TEXT, allowNull: false },
    recompense: { type: DataTypes.TEXT },
    nombreParticipants: { type: DataTypes.INTEGER },
    prixParticipation: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    nomGagnant: { type: DataTypes.STRING },
    emailGagnant: { type: DataTypes.STRING },
    telephoneGagnant: { type: DataTypes.STRING },
    statut: {
      type: DataTypes.ENUM("actif", "bloquer", "en attente"),
    },
    natif: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: true }
);

// --- Notification ---
db.Notification = sequelize.define(
  "Notification",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM("nouveaute", "promo", "message admin") },
    expiration: { type: DataTypes.DATE },
  },
  { timestamps: true }
);

// --- Commentaire ---
db.Commentaire = sequelize.define(
  "Commentaire",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: {
      type: DataTypes.ENUM(
        "preoccupation",
        "suggestion",
        "courtoisie",
        "remarques",
        "probleme",
        "appreciation",
        "juste pour parler"
      ),
    },
    note: { type: DataTypes.INTEGER, validate: { min: 0, max: 5 } },
    serviceId: { type: DataTypes.UUID },
    reponse: { type: DataTypes.TEXT },
    statut: { type: DataTypes.ENUM("actif", "supprime") },
  },
  { timestamps: true }
);

// --- HistoriqueCommande ---
db.HistoriqueCommande = sequelize.define(
  "HistoriqueCommande",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: {
      type: DataTypes.ENUM("restauration", "longrich", "pressing", "appart"),
    },
    commandeId: { type: DataTypes.UUID },
    prixTotal: { type: DataTypes.DECIMAL(10, 2) },
    frequence: { type: DataTypes.INTEGER },
    periode: {
      type: DataTypes.ENUM("jour", "semaine", "mois", "annee"),
    },
  },
  { timestamps: true, indexes: [{ fields: ["created_at"] }] }
);

// --- Statistique ---
db.Statistique = sequelize.define(
  "Statistique",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    caRestaurantLivraisons: { type: DataTypes.DECIMAL(10, 2) },
    caRestaurantSurPlace: { type: DataTypes.DECIMAL(10, 2) },
    caApparts: { type: DataTypes.DECIMAL(10, 2) },
    caLongrich: { type: DataTypes.DECIMAL(10, 2) },
    caPressing: { type: DataTypes.DECIMAL(10, 2) },
    caCoiffure: { type: DataTypes.DECIMAL(10, 2) },
    caTotal: { type: DataTypes.DECIMAL(10, 2) },
    periode: {
      type: DataTypes.ENUM("jour", "semaine", "mois", "annee"),
    },
    gagnants: { type: DataTypes.INTEGER },
    servicesNotes: { type: DataTypes.JSON },
    clientsActifs: { type: DataTypes.INTEGER },
  },
  { timestamps: true }
);

// --- Logs ---
db.Logs = sequelize.define(
  "Logs",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: { type: DataTypes.ENUM("erreur", "attaque", "sante") },
    message: { type: DataTypes.TEXT, allowNull: false },
    details: { type: DataTypes.TEXT },
    santePourcentage: { type: DataTypes.INTEGER },
  },
  { timestamps: true }
);

// --- ConfigLivraison ---
db.ConfigLivraison = sequelize.define(
  "ConfigLivraison",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    seuilMinimumLivraison: { type: DataTypes.DECIMAL(10, 2), defaultValue: 4500 },
    fraisBase: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1000 },
    incrementPar: { type: DataTypes.DECIMAL(10, 2), defaultValue: 700 },
    incrementFrais: { type: DataTypes.DECIMAL(10, 2), defaultValue: 150 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { timestamps: true }
);

// --- Livreur ---
db.Livreur = sequelize.define(
  "Livreur",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    prenom: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    motDePasse: { type: DataTypes.STRING },
    statut: {
      type: DataTypes.ENUM("disponible", "indisponible", "suspendu"),
      defaultValue: "indisponible",
    },
    localisationLat: { type: DataTypes.FLOAT },
    localisationLng: { type: DataTypes.FLOAT },
    peutPrendreDecision: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { timestamps: true }
);

// Associations

// Livreur <-> CommandeRestauration
db.Livreur.hasMany(db.CommandeRestauration, { foreignKey: "livreur_id" });
db.CommandeRestauration.belongsTo(db.Livreur, { foreignKey: "livreur_id" });

// Vitrine <-> ImgVitrine
db.Vitrine.hasMany(db.ImgVitrine);
db.ImgVitrine.belongsTo(db.Vitrine);

// Service <-> Menu
db.Service.hasMany(db.Menu);
db.Menu.belongsTo(db.Service);

// CategorieAppart <-> Appartement (avec alias)
db.CategorieAppart.hasMany(db.Appartement, {
  foreignKey: "categorie_id",
  as: "appartements",
});
db.Appartement.belongsTo(db.CategorieAppart, {
  foreignKey: "categorie_id",
  as: "categorie",
});


db.Appartement.hasMany(db.AppartementPhoto, {
  foreignKey: "appartementId",
  as: "photos",
});
db.AppartementPhoto.belongsTo(db.Appartement, {
  foreignKey: "appartementId",
});

// Appartement <-> ReservationAppart
db.Appartement.hasMany(db.ReservationAppart, {
  foreignKey: "appartement_id",
});
db.ReservationAppart.belongsTo(db.Appartement, {
  foreignKey: "appartement_id",
});
db.ReservationAppart.belongsTo(db.CategorieAppart, {
  foreignKey: "categorie_id",
});

// Longrich many-to-many
db.ProduitLongrich.belongsToMany(db.CommandeLongrich, {
  through: "PanierLongrich",
});
db.CommandeLongrich.belongsToMany(db.ProduitLongrich, {
  through: "PanierLongrich",
});

// CommandeLongrich -> AdminSecondaire
db.CommandeLongrich.belongsTo(db.AdminSecondaire);

// CommandeRestauration <-> LivraisonMenu
db.CommandeRestauration.hasOne(db.LivraisonMenu, {
  foreignKey: "commandeId",
});
db.LivraisonMenu.belongsTo(db.CommandeRestauration, {
  foreignKey: "commandeId",
});

// Service <-> Commentaire
db.Service.hasMany(db.Commentaire);
db.Commentaire.belongsTo(db.Service);

// JeuConcours <-> Notification
db.JeuConcours.hasMany(db.Notification);
db.Notification.belongsTo(db.JeuConcours);

// HistoriqueCommande liens
db.HistoriqueCommande.belongsTo(db.CommandeRestauration, {
  foreignKey: "commandeId",
  constraints: false,
});
db.HistoriqueCommande.belongsTo(db.CommandeLongrich, {
  foreignKey: "commandeId",
  constraints: false,
});
db.HistoriqueCommande.belongsTo(db.CommandePressing, {
  foreignKey: "commandeId",
  constraints: false,
});
db.HistoriqueCommande.belongsTo(db.ReservationAppart, {
  foreignKey: "commandeId",
  constraints: false,
});

// Export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
