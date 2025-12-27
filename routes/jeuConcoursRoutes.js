// routes/jeuConcoursRoutes.js ✅ CORRIGÉ COMPLET
import express from 'express';
import { auth, superAdminOnly } from '../middlewares/auth.js';
import { 
  listJeux, 
  createJeu, 
  updateJeu, 
  deleteJeu, 
  getActiveJeuCount, 
  getActiveJeu, 
  notifyJeuEnded,
  notifyJeuActivated 
} from '../controllers/jeuConcoursController.js';

const router = express.Router();

// ✅ PUBLICS (client peut voir)
router.get('/', listJeux);                    // Liste tous les jeux
router.get('/active/count', getActiveJeuCount);     // Badge
router.get('/active', getActiveJeu);                // Détail jeu actif

// ✅ PROTÉGÉES (superadmin seulement)
router.post('/', auth, superAdminOnly, createJeu);
router.put('/:id', auth, superAdminOnly, updateJeu);
router.delete('/:id', auth, superAdminOnly, deleteJeu);
router.post('/:id/end', auth, superAdminOnly, notifyJeuEnded);
router.post('/:id/activate', auth, superAdminOnly, notifyJeuActivated);

export default router;
