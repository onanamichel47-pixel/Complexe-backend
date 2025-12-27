// routes/categorieAppartRoutes.js
import express from 'express';
import { auth, superAdminOnly } from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import {
  createCategorieAppart,
  listCategorieAppart,
  updateCategorieAppart,
  deleteCategorieAppart
} from '../controllers/categorieAppartController.js';

const router = express.Router();

router.post('/', auth, superAdminOnly, upload.single('photo'), createCategorieAppart);
router.get('/', auth, superAdminOnly, listCategorieAppart);
router.put('/:id', auth, superAdminOnly, upload.single('photo'), updateCategorieAppart);
router.delete('/:id', auth, superAdminOnly, deleteCategorieAppart);

export default router;
