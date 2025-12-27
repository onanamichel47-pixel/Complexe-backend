import express from 'express';
// --- MISE À JOUR : Remplacer superAdminOnly par checkPrivilege ---
import { auth, checkPrivilege } from '../middlewares/auth.js'; 
import upload from '../middlewares/multer.js';
import {
  createAppartement,
  listAppartements,
  updateAppartement,
  deleteAppartement,
  addPhotosAppartement     
} from '../controllers/appartementController.js';

const router = express.Router();

const SECTION_KEY = 'apparts'; // Clé correspondante à l'onglet dans le Dashboard

// POST : Créer un appartement (WRITE)
router.post(
  '/', 
  auth, 
  checkPrivilege('WRITE', SECTION_KEY), 
  upload.array('photos', 20), 
  createAppartement
);

// GET : Lister les appartements (READ)
router.get(
  '/', 
  auth, 
  checkPrivilege('READ', SECTION_KEY), 
  listAppartements
);

// PUT : Modifier un appartement (UPDATE)
router.put(
  '/:id', 
  auth, 
  checkPrivilege('UPDATE', SECTION_KEY), 
  upload.array('photos', 20), 
  updateAppartement
);

// DELETE : Supprimer un appartement (DELETE)
router.delete(
  '/:id', 
  auth, 
  checkPrivilege('DELETE', SECTION_KEY), 
  deleteAppartement
);

// POST : Ajouter des photos supplémentaires (UPDATE ou WRITE, je choisis UPDATE car c'est une modification de l'entité existante)
router.post(
  "/add-photos",
  auth,
  checkPrivilege('UPDATE', SECTION_KEY), // Nécessite le privilège UPDATE sur la section 'apparts'
  upload.array("photos", 20),
  addPhotosAppartement
);

export default router;