// routes/configLivraisonRoutes.js → NOUVEAU FICHIER
import express from 'express';
import { getConfigLivraison, updateConfigLivraison } from '../controllers/configLivraisonController.js';

const router = express.Router();

router.get('/', getConfigLivraison);
router.put('/', updateConfigLivraison);

export default router;
