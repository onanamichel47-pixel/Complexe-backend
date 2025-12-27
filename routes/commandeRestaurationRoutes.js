// routes/commandeRestaurationRoutes.js
import express from 'express';
import { getConfigLivraison, updateConfigLivraison } from '../controllers/configLivraisonController.js';
import {
  creerCommandeRestauration,
  listCommandes,
  getCommandePourLivreur,
  updateStatutLivraison,
  annulerCommande
} from '../controllers/commandeRestaurationController.js';
import { auth, superAdminOnly } from '../middlewares/auth.js';

const router = express.Router();

/**
 * CONFIG LIVRAISON (client + admin)
 */
router.get('/config-livraison', getConfigLivraison);
router.put('/config-livraison', auth, superAdminOnly, updateConfigLivraison);

/**
 * CREATION COMMANDE RESTAURATION (client)
 * URL finale : POST /api/commande-restau
 * (car dans routes/index.js tu as router.use('/commande-restau', commandeRestaurationRoutes);)
 */
router.post('/', creerCommandeRestauration);

/**
 * LISTE DES COMMANDES (admin dashboard)
 * URL finale : GET /api/commande-restau/commandes
 */
router.get('/commandes', auth, superAdminOnly, listCommandes);

/**
 * ANNULATION D’UNE COMMANDE (admin)
 * URL finale : PUT /api/commande-restau/commandes/:id/annuler
 */
router.put('/commandes/:id/annuler', auth, superAdminOnly, annulerCommande);

router.get('/pour-livreur/:livreurId', getCommandePourLivreur);
router.patch('/:id/livraison-statut', updateStatutLivraison);

export default router;
