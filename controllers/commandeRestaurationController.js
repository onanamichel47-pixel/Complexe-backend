// controllers/commandeRestaurationController.js
import db from '../models/index.js';

const CommandeRestauration = db.CommandeRestauration;
const Livreur = db.Livreur;

/**
 * ✅ Création commande restauration (client)
 */
export const creerCommandeRestauration = async (req, res) => {
  try {
    const {
      nomClient,
      prenomClient,
      sexe,
      email,
      telephone,
      modePayement,
      items,                  // [{menuId, type, quantite, prixUnitaire, nom}]
      prixTotal,
      fraisLivraison,
      localisationClient,
      itineraire,
      livreurId,
      localisationClientLat,
      localisationClientLng,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Aucun plat/boisson dans la commande.' });
    }

    if (!livreurId) {
      return res.status(400).json({ message: "Aucun livreur sélectionné." });
    }

    // Optionnel : vérifier que le livreur existe et n'est pas suspendu
    const livreur = await Livreur.findByPk(livreurId);
    if (!livreur) {
      return res.status(404).json({ message: "Livreur introuvable." });
    }
    if (livreur.statut === 'suspendu') {
      return res.status(403).json({ message: "Ce livreur est suspendu." });
    }

    const commande = await CommandeRestauration.create({
      nomClient,
      prenomClient,
      sexe,
      email,
      telephone,
      modePayement,
      items,
      prixTotal,
      fraisLivraison,
      localisationClient,
      itineraire: itineraire || null,
      // nouveaux champs
      livreurId,
      localisationClientLat: localisationClientLat ?? null,
      localisationClientLng: localisationClientLng ?? null,
      // statuts de départ
      statut: 'validee',
      statutLivraison: 'en route',
    });

    return res.status(201).json(commande);
  } catch (err) {
    console.error('creerCommandeRestauration error:', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ lister les commandes (pour l’admin)
 */
export const listCommandes = async (req, res) => {
  try {
    const commandes = await CommandeRestauration.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.json(commandes);
  } catch (err) {
    console.error('listCommandes error:', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ annuler une commande (admin)
 */
export const annulerCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await CommandeRestauration.findByPk(id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }

    commande.statut = 'annulee';
    await commande.save();

    return res.json({ success: true, commande });
  } catch (err) {
    console.error('annulerCommande error:', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * ✅ LOGIQUE BACKEND DU LIVREUR
 */

// GET /api/commande-restau/pour-livreur/:livreurId
// GET /api/commande-restau/pour-livreur/:livreurId
export const getCommandePourLivreur = async (req, res) => {
  try {
    const { livreurId } = req.params;

    // Vérifier que le livreur existe et est disponible
    const livreur = await Livreur.findByPk(livreurId);
    if (!livreur || livreur.statut !== 'disponible') {
      return res
        .status(404)
        .json({ message: "Aucune commande pour ce livreur." });
    }

    const commande = await CommandeRestauration.findOne({
      where: {
        livreurId,
        statut: 'validee',
        // adapter si tu veux aussi 'en attente'
        statutLivraison: 'en route',
      },
      order: [['createdAt', 'DESC']],
    });

    if (!commande) {
      return res
        .status(404)
        .json({ message: "Aucune commande en cours pour ce livreur." });
    }

    return res.json(commande);
  } catch (err) {
    console.error('Erreur getCommandePourLivreur', err);
    return res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la commande." });
  }
};

// PATCH /api/commande-restau/:id/livraison-statut
export const updateStatutLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, livreurId } = req.body;

    const commande = await CommandeRestauration.findByPk(id);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable." });
    }

    // sécurité : seul le livreur assigné peut modifier sa commande
    if (commande.livreurId !== livreurId) {
      return res.status(403).json({ message: "Vous n'êtes pas le livreur assigné à cette commande." });
    }

    if (!['en route', 'livré'].includes(statut)) {
      return res.status(400).json({ message: "Statut livraison invalide." });
    }

    commande.statutLivraison = statut;
    if (statut === 'livré') {
      commande.heureArriveeLivreur = new Date();
    }

    await commande.save();
    res.json(commande);
  } catch (err) {
    console.error('Erreur updateStatutLivraison', err);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut de livraison." });
  }
};