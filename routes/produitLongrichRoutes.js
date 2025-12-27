import express from 'express';
// --- AJOUT DE checkPrivilege ---
import { auth, checkPrivilege } from '../middlewares/auth.js'; 
import * as longrichController from '../controllers/produitLongrichController.js'; 

const router = express.Router();

const SECTION_KEY = 'longrich'; // La clé de la section pour ce module

// GET : Liste des produits (READ)
router.get('/', auth, checkPrivilege('READ', SECTION_KEY), longrichController.listProduits);

// POST : Créer un produit (WRITE)
router.post('/', auth, checkPrivilege('WRITE', SECTION_KEY), longrichController.createProduit);

// PUT : Modifier un produit (UPDATE)
router.put('/:id', auth, checkPrivilege('UPDATE', SECTION_KEY), longrichController.updateProduit);

// DELETE : Supprimer un produit (DELETE)
router.delete('/:id', auth, checkPrivilege('DELETE', SECTION_KEY), longrichController.deleteProduit);

export default router;