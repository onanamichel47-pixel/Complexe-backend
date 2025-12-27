// utils/calculeFraisLivraison.js
import db from '../models/index.js';

export const calculerFraisLivraison = async (montantCommande) => {
  const config = await db.ConfigLivraison.findOne({ where: { active: true } });
  if (!config) return 0;

  const {
    seuilMinimumLivraison,
    fraisBase,
    incrementPar,
    incrementFrais
  } = config;

  if (montantCommande >= seuilMinimumLivraison) return 0;

  let frais = fraisBase;
  const manque = seuilMinimumLivraison - montantCommande;
  const steps = Math.ceil(manque / incrementPar);
  frais += steps * incrementFrais;

  return frais;
};
