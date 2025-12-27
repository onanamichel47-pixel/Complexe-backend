// routes/livreurRoutes.js
import express from 'express';
import {
  getLivreurs,
  createLivreur,
  updateLivreur,
  loginLivreur,
  toggleStatutLivreur,
  togglePouvoirDecision,
  updateLocalisationLivreur,
  getLivreursDisponibles,   // ✅ AJOUTER ICI
  deleteLivreur,   
} from '../controllers/livreurController.js';
import { auth, superAdminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Login livreur
router.post('/login', loginLivreur);

// ✅ Endpoint PUBLIC pour le client : liste des livreurs disponibles
router.get('/public/disponibles', getLivreursDisponibles);

// ✅ Endpoint ADMIN protégé : gestion complète
router.get('/', auth, superAdminOnly, getLivreurs);

// Création d'un livreur
router.post('/', auth, superAdminOnly, createLivreur);

// Mise à jour globale (nom, tel, email, etc.)
router.patch('/:id', auth, superAdminOnly, updateLivreur);

// Changer uniquement le statut
router.patch('/:id/statut', auth, superAdminOnly, toggleStatutLivreur);

// Activer / désactiver le pouvoir de décision
router.patch('/:id/pouvoir-decision', auth, superAdminOnly, togglePouvoirDecision);

// Mise à jour de la localisation (appelée par l’app livreur pour le tracking)
router.patch('/:id/localisation', updateLocalisationLivreur);

router.delete('/:id', auth, superAdminOnly, deleteLivreur);

export default router;
