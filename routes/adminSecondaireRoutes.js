import express from 'express';
import { auth, superAdminOnly } from '../middlewares/auth.js';
import {
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from '../controllers/adminSecondaireController.js';

const router = express.Router();

// Toutes ces routes sont protégées et réservées au Super Admin
router.get('/', auth, superAdminOnly, listAdmins);
router.post('/', auth, superAdminOnly, createAdmin);
router.put('/:id', auth, superAdminOnly, updateAdmin);
router.delete('/:id', auth, superAdminOnly, deleteAdmin);

export default router;