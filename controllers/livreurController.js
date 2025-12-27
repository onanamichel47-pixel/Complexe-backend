// controllers/livreurController.js
import db from '../models/index.js';
const { Livreur } = db;


// GET /api/livreurs?statut=disponible
export const getLivreurs = async (req, res) => {
  try {
    const where = {};
    if (req.query.statut) {
      where.statut = req.query.statut; // 'disponible', 'indisponible', 'suspendu'
    }

    const livreurs = await Livreur.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(livreurs);
  } catch (err) {
    console.error('Erreur getLivreurs', err);
    res.status(500).json({ message: "Erreur lors de la récupération des livreurs." });
  }
};

// POST /api/livreurs
export const createLivreur = async (req, res) => {
  try {
    const { nom, prenom, telephone, email, motDePasse, statut, peutPrendreDecision } = req.body;

    if (!nom || !telephone) {
      return res.status(400).json({ message: "Nom et téléphone sont obligatoires." });
    }

    const nouveau = await Livreur.create({
      nom,
      prenom,
      telephone,
      email,
      motDePasse,          // à hasher si tu fais un vrai login livreur
      statut: statut || 'indisponible',
      peutPrendreDecision: peutPrendreDecision ?? true,
    });

    res.status(201).json(nouveau);
  } catch (err) {
    console.error('Erreur createLivreur', err);
    res.status(500).json({ message: "Erreur lors de la création du livreur." });
  }
};

// PATCH /api/livreurs/:id
export const updateLivreur = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, telephone, email, statut, peutPrendreDecision } = req.body;

    const livreur = await Livreur.findByPk(id);
    if (!livreur) {
      return res.status(404).json({ message: "Livreur introuvable." });
    }

    await livreur.update({
      nom: nom ?? livreur.nom,
      prenom: prenom ?? livreur.prenom,
      telephone: telephone ?? livreur.telephone,
      email: email ?? livreur.email,
      statut: statut ?? livreur.statut,
      peutPrendreDecision: 
        typeof peutPrendreDecision === 'boolean' 
          ? peutPrendreDecision 
          : livreur.peutPrendreDecision,
    });

    res.json(livreur);
  } catch (err) {
    console.error('Erreur updateLivreur', err);
    res.status(500).json({ message: "Erreur lors de la mise à jour du livreur." });
  }
};

// PATCH /api/livreurs/:id/statut
export const toggleStatutLivreur = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body; // 'disponible', 'indisponible', 'suspendu'

    const livreur = await Livreur.findByPk(id);
    if (!livreur) {
      return res.status(404).json({ message: "Livreur introuvable." });
    }

    if (!['disponible', 'indisponible', 'suspendu'].includes(statut)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    livreur.statut = statut;
    await livreur.save();

    res.json(livreur);
  } catch (err) {
    console.error('Erreur toggleStatutLivreur', err);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut." });
  }
};

// PATCH /api/livreurs/:id/pouvoir-decision
export const togglePouvoirDecision = async (req, res) => {
  try {
    const { id } = req.params;
    const { peutPrendreDecision } = req.body; // booléen

    const livreur = await Livreur.findByPk(id);
    if (!livreur) {
      return res.status(404).json({ message: "Livreur introuvable." });
    }

    if (typeof peutPrendreDecision !== 'boolean') {
      return res.status(400).json({ message: "Valeur invalide pour peutPrendreDecision." });
    }

    livreur.peutPrendreDecision = peutPrendreDecision;
    await livreur.save();

    res.json(livreur);
  } catch (err) {
    console.error('Erreur togglePouvoirDecision', err);
    res.status(500).json({ message: "Erreur lors de la mise à jour du pouvoir de décision." });
  }
};

// PATCH /api/livreurs/:id/localisation
export const updateLocalisationLivreur = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const livreur = await Livreur.findByPk(id);
    if (!livreur) {
      return res.status(404).json({ message: "Livreur introuvable." });
    }

    livreur.localisationLat = lat;
    livreur.localisationLng = lng;
    await livreur.save();

    res.json({ message: "Localisation mise à jour.", livreur });
  } catch (err) {
    console.error('Erreur updateLocalisationLivreur', err);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la localisation." });
  }
};


// POST /api/livreurs/login
export const loginLivreur = async (req, res) => {
  try {
    const { nom, email } = req.body;

    if (!nom || !email) {
      return res.status(400).json({ message: "Nom et email sont obligatoires." });
    }

    const livreur = await Livreur.findOne({ where: { nom, email } });

    if (!livreur) {
      return res.status(404).json({ message: "Livreur introuvable." });
    }

    if (livreur.statut === 'suspendu') {
      return res.status(403).json({ message: "Votre compte livreur est suspendu." });
    }

    return res.json({
      id: livreur.id,
      nom: livreur.nom,
      prenom: livreur.prenom,
      statut: livreur.statut,
      peutPrendreDecision: livreur.peutPrendreDecision,
    });
  } catch (err) {
    console.error('Erreur loginLivreur', err);
    res.status(500).json({ message: "Erreur lors du login livreur." });
  }
};


// GET /api/livreurs/public/disponibles
export const getLivreursDisponibles = async (req, res) => {
  try {
    const livreurs = await Livreur.findAll({
      where: { statut: 'disponible' },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'nom', 'prenom', 'telephone', 'email', 'peutPrendreDecision', 'statut'],
    });
    res.json(livreurs);
  } catch (err) {
    console.error('Erreur getLivreursDisponibles', err);
    res.status(500).json({ message: "Erreur lors de la récupération des livreurs disponibles." });
  }
};



// DELETE /api/livreurs/:id
export const deleteLivreur = async (req, res) => {
  try {
    const { id } = req.params;

    const livreur = await Livreur.findByPk(id);
    if (!livreur) {
      return res.status(404).json({ message: "Livreur introuvable." });
    }

    await livreur.destroy();
    return res.json({ success: true, message: "Livreur supprimé avec succès." });
  } catch (err) {
    console.error('Erreur deleteLivreur', err);
    return res
      .status(500)
      .json({ message: "Erreur lors de la suppression du livreur." });
  }
};
// DELETE /api/livreurs/:id