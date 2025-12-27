// controllers/configLivraisonController.js
import db from '../models/index.js';

export const getConfigLivraison = async (req, res) => {
  try {
    const config = await db.ConfigLivraison.findOne();
    res.json(config || null);
  } catch (err) {
    console.error('ConfigLivraison GET error', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateConfigLivraison = async (req, res) => {
  try {
    const { seuilMinimumLivraison, fraisBase, incrementPar, incrementFrais, active } = req.body;

    let config = await db.ConfigLivraison.findOne();
    if (!config) {
      config = await db.ConfigLivraison.create({
        seuilMinimumLivraison,
        fraisBase,
        incrementPar,
        incrementFrais,
        active,
      });
    } else {
      config = await config.update({
        seuilMinimumLivraison,
        fraisBase,
        incrementPar,
        incrementFrais,
        active,
      });
    }

    res.json({ config, message: 'Configuration mise à jour !' });
  } catch (err) {
    console.error('ConfigLivraison UPDATE error', err);
    res.status(500).json({ message: err.message });
  }
};
