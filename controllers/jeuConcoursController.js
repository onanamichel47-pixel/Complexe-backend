// controllers/jeuConcoursController.js
import db from '../models/index.js';

const JeuConcours = db.JeuConcours;

export const listJeux = async (req, res) => {
  try {
    const jeux = await JeuConcours.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ jeux });
  } catch (err) {
    console.error(err); 
    return res.status(500).json({ message: err.message });
  }
};

export const createJeu = async (req, res) => {
  try {
    const { nom, regle, recompense, nombreParticipants, prixParticipation, statut, natif } = req.body;
    if (!nom || !regle) return res.status(400).json({ message: "Champs obligatoires manquants" });

    if (natif === true || natif === 'true') {
      const countNatif = await JeuConcours.count({ where: { natif: true }});
      if (countNatif >= 2) return res.status(400).json({ message: "Maximum de jeux natifs atteint" });
      const existing = await JeuConcours.findOne({ where: { nom, natif: true }});
      if (existing) return res.status(400).json({ message: "Ce jeu natif est déjà enregistré" });
    }

    const jeu = await JeuConcours.create({
      nom, regle, recompense, nombreParticipants, prixParticipation, statut, natif: !!natif
    });

    // ✅ ÉMIT NOTIFICATION si créé en mode actif
    if (statut === 'actif' && req.io) {
      req.io.emit('jeu-activated', {
        id: jeu.id,
        nom: jeu.nom,
        regle: jeu.regle,
        recompense: jeu.recompense,
        prixParticipation: jeu.prixParticipation
      });
      
      await db.Notification.create({
        message: `🎮 Nouveau jeu "${jeu.nom}" débloqué ! Cliquez pour participer.`,
        type: 'concours',
        expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    return res.status(201).json({ jeu });
  } catch (err) {
    console.error(err); 
    return res.status(500).json({ message: err.message });
  }
};

export const updateJeu = async (req, res) => {
  try {
    const { id } = req.params;
    const jeu = await JeuConcours.findByPk(id);
    if (!jeu) return res.status(404).json({ message: "Jeu introuvable" });

    const oldStatut = jeu.statut;
    const { nom, natif } = req.body;
    
    if (natif === true && !jeu.natif) {
      const countNatif = await JeuConcours.count({ where: { natif: true }});
      if (countNatif >= 2) return res.status(400).json({ message: "Maximum de jeux natifs atteint" });
    }

    Object.entries(req.body).forEach(([k, v]) => { if (typeof v !== 'undefined') jeu[k] = v; });
    await jeu.save();

    // ✅ ÉMIT SI passage à 'actif'
    if (req.body.statut === 'actif' && oldStatut !== 'actif' && req.io) {
      req.io.emit('jeu-activated', {
        id: jeu.id,
        nom: jeu.nom,
        regle: jeu.regle,
        recompense: jeu.recompense,
        prixParticipation: jeu.prixParticipation
      });
      
      await db.Notification.create({
        message: `🎮 "${jeu.nom}" est maintenant actif ! Participez maintenant.`,
        type: 'concours',
        expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    return res.json({ jeu });
  } catch (err) {
    console.error(err); 
    return res.status(500).json({ message: err.message });
  }
};

export const deleteJeu = async (req, res) => {
  try {
    const { id } = req.params;
    const jeu = await JeuConcours.findByPk(id);
    if (!jeu) return res.status(404).json({ message: "Jeu introuvable" });
    if (jeu.natif) return res.status(403).json({ message: "Impossible de supprimer un jeu natif" });
    await jeu.destroy();
    return res.json({ success: true });
  } catch (err) {
    console.error(err); 
    return res.status(500).json({ message: err.message });
  }
};

// Compter jeux ACTIFS (pour badge global)
export const getActiveJeuCount = async (req, res) => {
  try {
    const count = await db.JeuConcours.count({
      where: { statut: 'actif' }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer LE jeu ACTIF (pour toast global)
export const getActiveJeu = async (req, res) => {
  try {
    const jeu = await db.JeuConcours.findOne({
      where: { statut: 'actif' }
    });
    res.json({ jeu: jeu || null });
  } catch (err) {
    console.error('ERREUR getActiveJeu:', err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: Notifier fin de jeu (crée notification auto)
export const notifyJeuEnded = async (req, res) => {
  try {
    const { id } = req.params;
    const jeu = await db.JeuConcours.findByPk(id);
    if (!jeu) return res.status(404).json({ message: 'Jeu introuvable' });

    await db.Notification.create({
      message: `🎮 "${jeu.nom}" est terminé ! Résultats bientôt disponibles.`,
      type: 'concours',
      expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ NOUVEAU : Endpoint dédié activation jeu
export const notifyJeuActivated = async (req, res) => {
  try {
    const { id } = req.params;
    const jeu = await db.JeuConcours.findByPk(id);
    if (!jeu) return res.status(404).json({ message: 'Jeu introuvable' });
    
    const oldStatut = jeu.statut;
    await jeu.update({ statut: 'actif' });
    
    // ✅ ÉMETTRE À TOUS LES CLIENTS
    if (req.io) {
      req.io.emit('jeu-activated', {
        id: jeu.id,
        nom: jeu.nom,
        regle: jeu.regle,
        recompense: jeu.recompense,
        prixParticipation: jeu.prixParticipation
      });
    }
    
    // Créer notification DB aussi
    await db.Notification.create({
      message: `🎮 Nouveau jeu "${jeu.nom}" débloqué ! Cliquez pour participer.`,
      type: 'concours',
      expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    
    res.json({ success: true, jeu, wasNewlyActivated: oldStatut !== 'actif' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
